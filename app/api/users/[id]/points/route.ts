import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

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

  const { data: adminUser } = await supabase
    .from('users')
    .select('id')
    .eq('discord_id', session.user.discordId)
    .single()

  // Read the user's current balances so we can echo accurate state back to the
  // caller in the response. Floor enforcement itself happens atomically inside
  // the RPC (see supabase/migration_floor_check.sql).
  const { data: targetUser } = await supabase
    .from('users')
    .select('id, monthly_points, total_points')
    .eq('id', id)
    .single()

  if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Atomic increment + floor check. Surface DB errors and floor violations
  // explicitly so a silent RPC failure can never produce a recorded grant
  // without moving the user's points.
  const { data: affected, error: rpcErr } = await supabase.rpc('increment_user_points', {
    p_user_id: id,
    p_delta: pts,
  })
  if (rpcErr) {
    return NextResponse.json({ error: rpcErr.message }, { status: 500 })
  }
  if (!affected) {
    // For grants (pts > 0) a 0 row count means the user vanished between the
    // SELECT and the RPC update — surface as 404. For deductions (pts < 0) it
    // means the atomic floor check rejected the adjustment.
    return NextResponse.json(
      pts < 0
        ? { error: 'Deduction would push points below zero' }
        : { error: 'User not found' },
      { status: pts < 0 ? 422 : 404 }
    )
  }

  // Record the signed value so history shows direction.
  const { error: insertErr } = await supabase.from('point_grants').insert({
    user_id: id,
    points: pts,
    reason: reasonText,
    granted_by: adminUser?.id,
  })
  if (insertErr) {
    // Compensate the point change so history and balance stay in sync.
    // If compensation itself fails (network blip), the balance stays
    // inflated but the grants row is missing \u2014 surface both errors so
    // the admin knows to reconcile manually.
    const { error: compErr } = await supabase.rpc('increment_user_points', {
      p_user_id: id,
      p_delta: -pts,
    })
    const detail = compErr
      ? `${insertErr.message}; compensating rollback also failed: ${compErr.message}`
      : insertErr.message
    // Server-side log for postmortem: if both the insert and rollback fail,
    // admin can't reproduce, but the log lets ops see the divergent state.
    console.error('[points-award] failed and rollback may have failed', {
      userId: id,
      points: pts,
      insertErr,
      compErr,
    })
    return NextResponse.json({ error: detail }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    delta: pts,
    monthly_points: targetUser.monthly_points + pts,
    total_points: targetUser.total_points + pts,
  })
}
