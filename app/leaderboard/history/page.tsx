import type { Metadata } from 'next'
import Link from 'next/link'
import { History } from 'lucide-react'
import { PastLeaderboards } from '@/components/leaderboard/PastLeaderboards'
import { getPastLeaderboards } from '@/lib/leaderboard-history-data'

export const metadata: Metadata = {
  title: 'Past leaderboards — Africa Monthly',
  description: 'Full standings from each closed Africa Monthly competition, with the top 3 highlighted.',
}

export const dynamic = 'force-dynamic'

export default async function PastLeaderboardsPage() {
  const months = await getPastLeaderboards()

  return (
    <div className="relative min-h-screen">
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full glass-chip text-[#D4A017]">
            <History className="w-3.5 h-3.5" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-widest">Archive</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-3">Past leaderboards</h1>
          <p className="text-white/75 text-base sm:text-lg max-w-2xl">
            Closed months, newest first. The podium is the top 3. Open a month for everyone who scored.
          </p>
          <Link
            href="/leaderboard"
            className="inline-flex items-center min-h-[44px] mt-3 text-sm font-semibold text-[#00D4FF] hover:text-white"
          >
            Back to this month
          </Link>
        </div>

        <PastLeaderboards months={months} />
      </div>
    </div>
  )
}
