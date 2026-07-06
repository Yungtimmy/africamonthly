import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { calculateXPoints, normalizeXActions } from '@/lib/points'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { action, points: overridePoints, awardedActions } = await req.json()

  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const { data: submission } = await supabase
    .from('submissions')
    .select('*, tasks(points, x_actions, task_type)')
    .eq('id', id)
    .single()

  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (submission.status !== 'pending') {
    return NextResponse.json({ error: 'Already reviewed' }, { status: 409 })
  }

  const { data: adminUser } = await supabase
    .from('users')
    .select('id')
    .eq('discord_id', session.user.discordId)
    .single()

  const now = new Date().toISOString()

  if (action === 'approve') {
    const taskMax = submission.tasks?.points ?? 0
    const isXPost = submission.tasks?.task_type === 'x_post'

    // Default points: for X-post, sum the awarded actions; for other tasks, the
    // full task points. Admins can override either way.
    let points: number
    let normalizedAwarded: string[] | null

    if (isXPost && Array.isArray(awardedActions) && awardedActions.length > 0) {
      const normalized = normalizeXActions(awardedActions)
      const fromActions = calculateXPoints(normalized)
      points = typeof overridePoints === 'number' ? overridePoints : fromActions
      normalizedAwarded = normalized
    } else {
      points = typeof overridePoints === 'number' ? overridePoints : taskMax
      normalizedAwarded = null
    }

    if (!Number.isFinite(points) || points <= 0) {
      return NextResponse.json({ error: 'Points must be a positive number' }, { status: 400 })
    }
    // Sanity cap: don't allow absurd awards (e.g. 1000 for a 10-pt task).
    if (points > taskMax * 2) {
      return NextResponse.json(
        { error: `Points cannot exceed ${taskMax * 2} (2× task max)` },
        { status: 400 }
      )
    }

    const { data: updated, error: updateError } = await supabase
      .from('submissions')
      .update({
        status: 'approved',
        points_awarded: points,
        awarded_actions: normalizedAwarded,
        reviewed_by: adminUser?.id,
        reviewed_at: now,
      })
      .eq('id', id)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle()

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
    if (!updated) return NextResponse.json({ error: 'Already reviewed' }, { status: 409 })

    await supabase.rpc('increment_user_points', {
      p_user_id: submission.user_id,
      p_delta: points,
    })
  } else {
    const { data: updated, error: updateError } = await supabase
      .from('submissions')
      .update({
        status: 'rejected',
        points_awarded: null,
        awarded_actions: null,
        reviewed_by: adminUser?.id,
        reviewed_at: now,
      })
      .eq('id', id)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle()

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
    if (!updated) return NextResponse.json({ error: 'Already reviewed' }, { status: 409 })
  }

  return NextResponse.json({ success: true })
}