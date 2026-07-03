import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PublicProfileClient } from '@/components/users/PublicProfileClient'
import { formatXActionsLabel } from '@/lib/points'

async function getPublicProfile(userId: string) {
  const { data: user } = await supabase
    .from('users')
    .select('id, discord_username, discord_avatar, monthly_points, total_points')
    .eq('id', userId)
    .single()

  if (!user) return null

  const { count: rankAbove } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gt('monthly_points', user.monthly_points)

  const [{ data: submissions }, { data: grants }] = await Promise.all([
    supabase
      .from('submissions')
      .select('id, points_awarded, reviewed_at, created_at, tasks(title, task_type, x_actions)')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .order('reviewed_at', { ascending: false }),
    supabase
      .from('point_grants')
      .select('id, points, reason, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ])

  const history = [
    ...(submissions ?? []).map((s) => {
      const task = s.tasks as { title?: string; task_type?: string; x_actions?: string[] | null } | null
      let label = task?.title ?? 'Task'
      if (task?.task_type === 'x_post') label = formatXActionsLabel(task.x_actions)
      return {
        id: s.id,
        label,
        points: s.points_awarded ?? 0,
        awardedAt: s.reviewed_at ?? s.created_at,
        type: 'task' as const,
      }
    }),
    ...(grants ?? []).map((g) => ({
      id: g.id,
      label: g.reason,
      points: g.points,
      awardedAt: g.created_at,
      type: 'grant' as const,
    })),
  ].sort((a, b) => new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime())

  return {
    user: {
      id: user.id,
      discordUsername: user.discord_username,
      discordAvatar: user.discord_avatar,
      monthlyPoints: user.monthly_points,
      totalPoints: user.total_points,
      rank: (rankAbove ?? 0) + 1,
    },
    history,
  }
}

export default async function PublicUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getPublicProfile(id)
  if (!data) notFound()

  return <PublicProfileClient user={data.user} history={data.history} />
}