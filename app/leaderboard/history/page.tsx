import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { History } from 'lucide-react'
import { PastLeaderboards } from '@/components/leaderboard/PastLeaderboards'
import { getPastLeaderboards } from '@/lib/leaderboard-history-data'
import { isMonthKey } from '@/lib/months'

export const metadata: Metadata = {
  title: 'Past leaderboards — Africa Monthly',
  description: 'Pick a closed month and see its full ranking, with the top 3 highlighted.',
}

export const dynamic = 'force-dynamic'

export default async function PastLeaderboardsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>
}) {
  const params = await searchParams
  const raw = Array.isArray(params.month) ? params.month[0] : params.month
  const months = await getPastLeaderboards()
  const selected = (raw && isMonthKey(raw) ? months.find((month) => month.monthKey === raw) : undefined) ?? months[0]

  if (selected && raw !== selected.monthKey) {
    redirect(`/leaderboard/history?month=${selected.monthKey}`)
  }

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
            Choose a month, such as Oct 2026. Only that month’s ranking is shown.
          </p>
          <Link
            href="/leaderboard"
            className="inline-flex items-center min-h-[44px] mt-3 text-sm font-semibold text-[#00D4FF] hover:text-white"
          >
            Back to this month
          </Link>
        </div>

        <PastLeaderboards months={months} selectedKey={selected?.monthKey ?? null} />
      </div>
    </div>
  )
}
