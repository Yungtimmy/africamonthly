'use client'

import Link from 'next/link'
import { ArrowLeft, Trophy, TrendingUp, Hash, Zap, Gift } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { formatPoints, formatRelativeTimeLong } from '@/lib/utils'

interface HistoryItem {
  id: string
  label: string
  points: number
  awardedAt: string
  type: 'task' | 'grant'
}

interface PublicProfileClientProps {
  user: {
    id: string
    discordUsername: string
    discordAvatar?: string | null
    monthlyPoints: number
    totalPoints: number
    rank: number
  }
  history: HistoryItem[]
}

export function PublicProfileClient({ user, history }: PublicProfileClientProps) {
  return (
    <div className="relative min-h-screen pb-12">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[45vw] h-[45vw] rounded-full bg-[#00D4FF]/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] rounded-full bg-[#D4A017]/4 blur-[100px]" />
      </div>

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-[#00D4FF] transition-colors mb-8 min-h-[44px]"
        >
          <ArrowLeft size={16} /> Back to leaderboard
        </Link>

        <section className="rounded-2xl p-5 sm:p-6 bg-white/3 border border-white/8 backdrop-blur-sm mb-5">
          <div className="flex items-center gap-4">
            <Avatar src={user.discordAvatar ?? undefined} name={user.discordUsername} size="lg" />
            <div className="min-w-0">
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-white truncate">{user.discordUsername}</h1>
              <p className="text-sm text-white/40 mt-1">
                Rank <span className="text-[#00D4FF]">#{user.rank}</span> this month
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl p-4 bg-[#00D4FF]/8 border border-[#00D4FF]/20">
            <div className="flex items-center gap-1.5 text-[#00D4FF] mb-1">
              <TrendingUp size={14} />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Monthly</span>
            </div>
            <p className="font-serif font-bold text-2xl text-white">{formatPoints(user.monthlyPoints)}</p>
          </div>
          <div className="rounded-2xl p-4 bg-white/3 border border-white/8">
            <div className="flex items-center gap-1.5 text-[#D4A017] mb-1">
              <Trophy size={14} />
              <span className="text-[10px] font-semibold uppercase tracking-wider">All-time</span>
            </div>
            <p className="font-serif font-bold text-2xl text-white">{formatPoints(user.totalPoints)}</p>
          </div>
        </div>

        <h2 className="font-serif text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Hash size={18} className="text-[#00D4FF]" /> Points history
        </h2>

        {history.length === 0 ? (
          <p className="text-center text-white/30 text-sm py-12 rounded-2xl border border-white/6 border-dashed">
            No points awarded yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {history.map((item) => (
              <li
                key={`${item.type}-${item.id}`}
                className="flex items-start gap-3 rounded-xl px-4 py-3.5 bg-white/3 border border-white/6 min-h-[56px]"
              >
                <div className="mt-0.5 shrink-0 text-white/30">
                  {item.type === 'grant' ? <Gift size={15} /> : <Zap size={15} className="text-[#D4A017]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/90 leading-snug">{item.label}</p>
                  <p className="text-[10px] text-white/35 mt-1">{formatRelativeTimeLong(item.awardedAt)}</p>
                </div>
                <span className="text-sm font-bold text-[#D4A017] shrink-0">+{item.points}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}