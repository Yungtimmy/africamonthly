import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { formatXActionsLabel } from '@/lib/points'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, discord_username, discord_avatar, monthly_points, total_points')
    .eq('id', id)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { count: rankAbove } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gt('monthly_points', user.monthly_points)

  const [{ data: submissions }, { data: grants }] = await Promise.all([
    supabase
      .from('submissions')
      .select('id, points_awarded, awarded_actions, reviewed_at, created_at, tasks(title, task_type, x_actions)')
      .eq('user_id', id)
      .eq('status', 'approved')
      .order('reviewed_at', { ascending: false }),
    supabase
      .from('point_grants')
      .select('id, points, reason, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false }),
  ])

  type HistoryItem = {
    id: string
    label: string
    points: number
    awardedAt: string
    type: 'task' | 'grant'
  }

  const history: HistoryItem[] = []

  for (const s of submissions ?? []) {
    const task = s.tasks as {
      title?: string
      task_type?: string
      x_actions?: string[] | null
    } | null

    let label = task?.title ?? 'Task'
    // For X-post, show exactly what the admin awarded (per-action partial),
    // falling back to the task's full required actions for legacy rows.
    if (task?.task_type === 'x_post') {
      label = formatXActionsLabel(s.awarded_actions ?? task.x_actions)
    }

    history.push({
      id: s.id,
      label,
      points: s.points_awarded ?? 0,
      awardedAt: s.reviewed_at ?? s.created_at,
      type: 'task',
    })
  }

  for (const g of grants ?? []) {
    history.push({
      id: g.id,
      label: g.reason,
      points: g.points,
      awardedAt: g.created_at,
      type: 'grant',
    })
  }

  history.sort((a, b) => new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime())

  return NextResponse.json({
    user: {
      id: user.id,
      discordUsername: user.discord_username,
      discordAvatar: user.discord_avatar,
      monthlyPoints: user.monthly_points,
      totalPoints: user.total_points,
      rank: (rankAbove ?? 0) + 1,
    },
    history,
  })
}