import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

function maxDeductible(monthly: number, total: number): number {
  return Math.max(0, Math.min(monthly, total))
}

function deductionError(amount: number, monthly: number, total: number): string {
  const max = maxDeductible(monthly, total)
  if (max === 0) {
    return 'User has 0 points available to deduct (monthly and all-time are already at zero).'
  }
  return `Cannot deduct ${amount} points. User has ${monthly} monthly and ${total} all-time — maximum deduction is ${max}.`
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { points, reason } = await req.json()

  if (points == null || !reason) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const reasonText = typeof reason === 'string' ? reason.trim() : ''
  if (!reasonText) return NextResponse.json({ error: 'Reason is required' }, { status: 400 })

  const pts = Number(points)
  if (!Number.isFinite(pts) || pts === 0) {
    return NextResponse.json({ error: 'Points must be a non-zero number' }, { status: 400 })
  }

  const grantedBy = session.user.id

  const { data: targetUser } = await supabase
    .from('users')
    .select('id, monthly_points, total_points')
    .eq('id', id)
    .single()

  if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (pts < 0) {
    const deductAmount = Math.abs(pts)
    const max = maxDeductible(targetUser.monthly_points, targetUser.total_points)
    if (deductAmount > max) {
      return NextResponse.json(
        { error: deductionError(deductAmount, targetUser.monthly_points, targetUser.total_points) },
        { status: 422 }
      )
    }
  }

  const { data: affected, error: rpcErr } = await supabase.rpc('increment_user_points', {
    p_user_id: id,
    p_delta: pts,
  })

  if (rpcErr) {
    return NextResponse.json({ error: rpcErr.message }, { status: 500 })
  }

  const { data: updatedUser, error: refetchErr } = await supabase
    .from('users')
    .select('monthly_points, total_points')
    .eq('id', id)
    .single()

  if (refetchErr || !updatedUser) {
    return NextResponse.json({ error: 'Points updated but failed to read new balance' }, { status: 500 })
  }

  const expectedMonthly = targetUser.monthly_points + pts
  const expectedTotal = targetUser.total_points + pts
  const balanceApplied =
    updatedUser.monthly_points === expectedMonthly && updatedUser.total_points === expectedTotal

  // RPC returns 1 on success, 0 on floor violation. Void-returning RPCs return null even
  // on success — verify by comparing balances instead of trusting the return value alone.
  if (affected === 0 || !balanceApplied) {
    return NextResponse.json(
      pts < 0
        ? { error: deductionError(Math.abs(pts), targetUser.monthly_points, targetUser.total_points) }
        : { error: 'User not found' },
      { status: pts < 0 ? 422 : 404 }
    )
  }

  if (!grantedBy) {
    return NextResponse.json({ error: 'Admin session missing user id — sign in again' }, { status: 401 })
  }

  const { error: insertErr } = await supabase.from('point_grants').insert({
    user_id: id,
    points: pts,
    reason: reasonText,
    granted_by: grantedBy,
  })

  if (insertErr) {
    const { error: compErr } = await supabase.rpc('increment_user_points', {
      p_user_id: id,
      p_delta: -pts,
    })
    const detail = compErr
      ? `${insertErr.message}; compensating rollback also failed: ${compErr.message}`
      : insertErr.message
    console.error('[points-award] failed and rollback may have failed', {
      userId: id,
      points: pts,
      insertErr,
      compErr,
    })
    return NextResponse.json({ error: detail }, { status: 500 })
  }

  revalidatePath('/leaderboard')
  revalidatePath(`/users/${id}`)

  return NextResponse.json({
    success: true,
    delta: pts,
    monthly_points: updatedUser.monthly_points,
    total_points: updatedUser.total_points,
  })
}