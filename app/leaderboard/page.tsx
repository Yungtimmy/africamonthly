import { Trophy } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getDaysUntilEndOfMonth, getCurrentMonthLabel } from '@/lib/utils'
import { LeaderboardClient } from '@/components/leaderboard/LeaderboardClient'

async function getLeaderboard() {
  try {
    const { data } = await supabase
      .from('users')
      .select('id, discord_username, discord_avatar, monthly_points, total_points')
      .order('monthly_points', { ascending: false })
      .order('total_points', { ascending: false })
      .limit(100)
    return data ?? []
  } catch {
    return []
  }
}

export const revalidate = 0

export default async function LeaderboardPage() {
  const users = await getLeaderboard()
  const daysLeft = getDaysUntilEndOfMonth()
  const monthLabel = getCurrentMonthLabel()

  return (
    <div className="relative min-h-screen">
      {/* Aurora bg */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[50vw] h-[50vw] rounded-full bg-[#00D4FF]/5 blur-[130px]" />
        <div className="absolute top-40 right-0 w-[30vw] h-[30vw] rounded-full bg-[#D4A017]/4 blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-[#D4A017]/8 border border-[#D4A017]/20 backdrop-blur-sm">
            <Trophy className="w-3.5 h-3.5 text-[#D4A017]" />
            <span className="text-xs font-semibold text-[#D4A017] uppercase tracking-widest">Rankings</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-3">{monthLabel}</h1>
          <p className="text-white/40 text-base sm:text-lg">
            {daysLeft} days remaining &middot; Top 5 earn rewards
          </p>
        </div>

        <LeaderboardClient users={users} daysLeft={daysLeft} />
      </div>
    </div>
  )
}
