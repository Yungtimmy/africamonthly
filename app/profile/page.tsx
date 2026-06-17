import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ProfileClient } from '@/components/profile/ProfileClient'

async function getUserData(userId: string) {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (!user) return null

  const { data: submissions } = await supabase
    .from('submissions')
    .select('*, tasks(title, points)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gt('monthly_points', user.monthly_points)

  return {
    user: {
      id: user.id,
      discordUsername: user.discord_username,
      discordAvatar: user.discord_avatar,
      telegramId: user.telegram_id ?? undefined,
      telegramChatCount: user.telegram_chat_count ?? 0,
      twitter: user.twitter,
      walletAddress: user.wallet_address,
      totalPoints: user.total_points,
      monthlyPoints: user.monthly_points,
    },
    submissions: (submissions ?? []).map((s) => ({
      id: s.id,
      proofUrl: s.proof_url,
      status: s.status,
      pointsAwarded: s.points_awarded,
      createdAt: s.created_at,
      taskId: s.tasks ? { title: s.tasks.title, points: s.tasks.points } : null,
    })),
    rank: (count ?? 0) + 1,
  }
}

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const data = await getUserData(session.user.id)
  if (!data) redirect('/')

  return <ProfileClient user={data.user} submissions={data.submissions} rank={data.rank} />
}
