import { Crown, Trophy } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Avatar } from '@/components/ui/Avatar'
import { getDaysUntilEndOfMonth, getCurrentMonthLabel, formatPoints } from '@/lib/utils'

async function getLeaderboard() {
  try {
    const { data } = await supabase
      .from('users')
      .select('id, discord_username, discord_avatar, monthly_points, total_points')
      .order('monthly_points', { ascending: false })
      .order('total_points', { ascending: false })
      .limit(70)
    return data ?? []
  } catch {
    return []
  }
}

export const revalidate = 60

export default async function LeaderboardPage() {
  const users = await getLeaderboard()
  const daysLeft = getDaysUntilEndOfMonth()
  const monthLabel = getCurrentMonthLabel()
  const top3 = users.slice(0, 3)
  const rest = users.slice(3)

  // visual order: silver(1), gold(0), bronze(2)
  const podiumOrder = [1, 0, 2]
  const podiumConfig = [
    { height: 'h-28', crown: 'text-[#C0C0C0]', glow: 'rgba(192,192,192,0.3)', border: 'border-white/20', rank: '#C0C0C0', label: '2nd' },
    { height: 'h-40', crown: 'text-[#D4A017]', glow: 'rgba(212,160,23,0.4)', border: 'border-[#D4A017]/40', rank: '#D4A017', label: '1st' },
    { height: 'h-20', crown: 'text-amber-700', glow: 'rgba(180,100,30,0.3)', border: 'border-amber-700/30', rank: '#CD7F32', label: '3rd' },
  ]

  const rowConfig = [
    { bar: 'bg-[#D4A017]', pt: 'text-[#D4A017]', bg: 'bg-[#D4A017]/5 border-[#D4A017]/20', hover: 'hover:border-[#D4A017]/40' },
    { bar: 'bg-[#00D4FF]', pt: 'text-[#00D4FF]', bg: 'bg-[#00D4FF]/4 border-[#00D4FF]/15', hover: 'hover:border-[#00D4FF]/35' },
    { bar: 'bg-amber-700', pt: 'text-amber-600', bg: 'bg-amber-900/10 border-amber-800/20', hover: 'hover:border-amber-700/30' },
    { bar: 'bg-white/10', pt: 'text-[#00D4FF]', bg: 'bg-white/2 border-white/5', hover: 'hover:border-white/10' },
    { bar: 'bg-white/10', pt: 'text-[#00D4FF]', bg: 'bg-white/2 border-white/5', hover: 'hover:border-white/10' },
  ]

  return (
    <div className="relative min-h-screen">
      {/* Aurora bg */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[50vw] h-[50vw] rounded-full bg-[#00D4FF]/5 blur-[130px]" />
        <div className="absolute top-40 right-0 w-[30vw] h-[30vw] rounded-full bg-[#D4A017]/4 blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-[#D4A017]/8 border border-[#D4A017]/20 backdrop-blur-sm">
            <Trophy className="w-3.5 h-3.5 text-[#D4A017]" />
            <span className="text-xs font-semibold text-[#D4A017] uppercase tracking-widest">Monthly Rankings</span>
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white mb-3">{monthLabel}</h1>
          <p className="text-white/40 text-lg">
            {daysLeft} days remaining &middot; Top 5 earn rewards
          </p>
        </div>

        {/* Podium */}
        {top3.length > 0 && (
          <div className="flex items-end justify-center gap-4 mb-20">
            {podiumOrder.map((idx) => {
              const user = top3[idx]
              if (!user) return null
              const cfg = podiumConfig[idx]
              const rank = idx + 1
              return (
                <div key={user.id} className="flex flex-col items-center gap-3 flex-1 max-w-[160px]">
                  <Crown size={22} className={cfg.crown} fill="currentColor" style={{ filter: `drop-shadow(0 0 8px ${cfg.glow})` }} />
                  <div className="relative">
                    <Avatar src={user.discord_avatar} name={user.discord_username} size="lg" />
                    {rank === 1 && (
                      <div className="absolute inset-0 rounded-full animate-pulse" style={{ boxShadow: `0 0 20px ${cfg.glow}` }} />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-white text-sm truncate max-w-[120px]">{user.discord_username}</p>
                    <p className="font-serif font-bold text-sm mt-0.5" style={{ color: cfg.rank }}>{formatPoints(user.monthly_points)}</p>
                  </div>
                  {/* Podium block */}
                  <div
                    className={`w-full rounded-t-xl border-t-2 ${cfg.border} flex items-end justify-center pb-3 ${cfg.height} backdrop-blur-sm`}
                    style={{ background: `linear-gradient(to top, rgba(255,255,255,0.04), transparent)` }}
                  >
                    <span className="font-serif text-3xl font-bold text-white/10">#{rank}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Full table */}
        <div className="space-y-2">
          {users.map((u, i) => {
            const rank = i + 1
            const c = rowConfig[i] ?? rowConfig[3]
            return (
              <div
                key={u.id}
                className={`flex items-center gap-4 rounded-2xl px-5 py-4 border transition-all duration-200 backdrop-blur-sm ${c.bg} ${c.hover}`}
              >
                <div className={`w-1 h-9 rounded-full shrink-0 ${c.bar}`} />
                <span className={`font-serif font-bold text-lg w-6 text-center ${rank <= 3 ? c.pt : 'text-white/25'}`}>{rank}</span>
                <Avatar src={u.discord_avatar} name={u.discord_username} size="sm" />
                <span className="flex-1 font-medium text-white/80 truncate">{u.discord_username}</span>
                <div className="text-right">
                  <span className={`font-serif font-bold text-lg ${c.pt}`}>{formatPoints(u.monthly_points)}</span>
                  <p className="text-xs text-white/20">{formatPoints(u.total_points)} total</p>
                </div>
              </div>
            )
          })}

          {users.length === 0 && (
            <div className="text-center py-24 text-white/30">
              <Trophy className="w-14 h-14 mx-auto mb-4 text-white/10" />
              <p className="font-serif text-2xl text-white/60 mb-2">No competitors yet</p>
              <p className="text-sm">Be the first to earn points this month.</p>
            </div>
          )}
        </div>

        {rest.length > 0 && (
          <p className="text-center text-xs text-white/20 mt-10">
            Top {users.length} competitors &middot; Resets in {daysLeft} days
          </p>
        )}
      </div>
    </div>
  )
}
