'use client'

import { useState } from 'react'
import { Crown, Trophy } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { formatPoints } from '@/lib/utils'

interface LeaderboardUser {
  id: string
  discord_username: string
  discord_avatar?: string
  monthly_points: number
  total_points: number
}

type Mode = 'monthly' | 'alltime'

export function LeaderboardClient({ users, daysLeft }: { users: LeaderboardUser[]; daysLeft: number }) {
  const [mode, setMode] = useState<Mode>('monthly')

  const metric = (u: LeaderboardUser) => (mode === 'monthly' ? u.monthly_points : u.total_points)
  const secondary = (u: LeaderboardUser) =>
    mode === 'monthly' ? `${formatPoints(u.total_points)} total` : `${formatPoints(u.monthly_points)} this month`

  const sorted = [...users].sort((a, b) => metric(b) - metric(a) || b.total_points - a.total_points)
  const top3 = sorted.slice(0, 3)

  const podiumOrder = [1, 0, 2]
  const podiumConfig = [
    { height: 'h-28', crown: 'text-[#C0C0C0]', glow: 'rgba(192,192,192,0.3)', border: 'border-white/20', rank: '#C0C0C0' },
    { height: 'h-40', crown: 'text-[#D4A017]', glow: 'rgba(212,160,23,0.4)', border: 'border-[#D4A017]/40', rank: '#D4A017' },
    { height: 'h-20', crown: 'text-amber-700', glow: 'rgba(180,100,30,0.3)', border: 'border-amber-700/30', rank: '#CD7F32' },
  ]

  const rowConfig = [
    { bar: 'bg-[#D4A017]', pt: 'text-[#D4A017]', bg: 'bg-[#D4A017]/5 border-[#D4A017]/20', hover: 'hover:border-[#D4A017]/40' },
    { bar: 'bg-[#00D4FF]', pt: 'text-[#00D4FF]', bg: 'bg-[#00D4FF]/4 border-[#00D4FF]/15', hover: 'hover:border-[#00D4FF]/35' },
    { bar: 'bg-amber-700', pt: 'text-amber-600', bg: 'bg-amber-900/10 border-amber-800/20', hover: 'hover:border-amber-700/30' },
    { bar: 'bg-white/10', pt: 'text-[#00D4FF]', bg: 'bg-white/2 border-white/5', hover: 'hover:border-white/10' },
  ]

  return (
    <>
      {/* Mode toggle */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex p-1 rounded-full bg-white/4 border border-white/8 backdrop-blur-sm">
          {([['monthly', 'This Month'], ['alltime', 'All-Time']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`px-5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                mode === key ? 'bg-[#D4A017]/20 text-[#D4A017] border border-[#D4A017]/30' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Podium */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-2 sm:gap-4 mb-10 sm:mb-20">
          {podiumOrder.map((idx) => {
            const user = top3[idx]
            if (!user) return null
            const cfg = podiumConfig[idx]
            const rank = idx + 1
            return (
              <div key={user.id} className="flex flex-col items-center gap-2 sm:gap-3 flex-1 max-w-[100px] sm:max-w-[160px]">
                <Crown size={22} className={cfg.crown} fill="currentColor" style={{ filter: `drop-shadow(0 0 8px ${cfg.glow})` }} />
                <div className="relative">
                  <Avatar src={user.discord_avatar} name={user.discord_username} size="lg" />
                  {rank === 1 && (
                    <div className="absolute inset-0 rounded-full animate-pulse" style={{ boxShadow: `0 0 20px ${cfg.glow}` }} />
                  )}
                </div>
                <div className="text-center">
                  <p className="font-medium text-white text-sm truncate max-w-[120px]">{user.discord_username}</p>
                  <p className="font-serif font-bold text-sm mt-0.5" style={{ color: cfg.rank }}>{formatPoints(metric(user))}</p>
                </div>
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
        {sorted.map((u, i) => {
          const rank = i + 1
          const c = rowConfig[i] ?? rowConfig[3]
          return (
            <div
              key={u.id}
              className={`flex items-center gap-2 sm:gap-4 rounded-2xl px-3 sm:px-5 py-3 sm:py-4 border transition-all duration-200 backdrop-blur-sm ${c.bg} ${c.hover}`}
            >
              <div className={`w-1 h-9 rounded-full shrink-0 ${c.bar}`} />
              <span className={`font-serif font-bold text-lg w-6 text-center ${rank <= 3 ? c.pt : 'text-white/25'}`}>{rank}</span>
              <Avatar src={u.discord_avatar} name={u.discord_username} size="sm" />
              <span className="flex-1 font-medium text-white/80 truncate">{u.discord_username}</span>
              <div className="text-right">
                <span className={`font-serif font-bold text-lg ${c.pt}`}>{formatPoints(metric(u))}</span>
                <p className="text-xs text-white/20">{secondary(u)}</p>
              </div>
            </div>
          )
        })}

        {sorted.length === 0 && (
          <div className="text-center py-24 text-white/30">
            <Trophy className="w-14 h-14 mx-auto mb-4 text-white/10" />
            <p className="font-serif text-2xl text-white/60 mb-2">No competitors yet</p>
            <p className="text-sm">Be the first to earn points this month.</p>
          </div>
        )}
      </div>

      {sorted.length > 3 && (
        <p className="text-center text-xs text-white/20 mt-10">
          Top {sorted.length} competitors &middot; Resets in {daysLeft} days
        </p>
      )}
    </>
  )
}
