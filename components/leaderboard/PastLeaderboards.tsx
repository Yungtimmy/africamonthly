'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Crown, Trophy } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import type { PastFinisher, PastMonth } from '@/lib/leaderboard-history'
import { shortLabelForMonthKey } from '@/lib/months'

const MEDAL: Record<number, { place: string; text: string; ring: string }> = {
  1: { place: '1st', text: 'text-[#D4A017]', ring: 'ring-[#D4A017]/55' },
  2: { place: '2nd', text: 'text-[#D9D9D9]', ring: 'ring-white/40' },
  3: { place: '3rd', text: 'text-[#E0A060]', ring: 'ring-[#CD7F32]/50' },
}

function sourceLine(month: PastMonth): string {
  if (month.source === 'reset') {
    return month.finishers.length > 0
      ? 'Archived when this month was reset'
      : 'Archived when this month was reset — nobody had points'
  }
  if (month.source === 'reconstructed') {
    return 'From approved tasks and manual point grants'
  }
  return 'No points were recorded this month'
}

function MonthPicker({ months, selectedKey }: { months: PastMonth[]; selectedKey: string }) {
  const router = useRouter()

  return (
    <form action="/leaderboard/history" className="mb-6">
      <label htmlFor="history-month" className="block text-sm font-medium text-white mb-2">
        Month
      </label>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <select
          id="history-month"
          name="month"
          value={selectedKey}
          onChange={(event) => {
            router.push(`/leaderboard/history?month=${event.target.value}`)
          }}
          className="glass-field rounded-xl px-4 min-h-[48px] text-base sm:max-w-xs"
        >
          {months.map((month) => (
            <option key={month.monthKey} value={month.monthKey}>
              {shortLabelForMonthKey(month.monthKey)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="glass-panel min-h-[48px] px-5 rounded-xl text-sm font-semibold text-white sm:w-auto"
        >
          Show month
        </button>
      </div>
    </form>
  )
}

function Podium({ month }: { month: PastMonth }) {
  const top = month.finishers.slice(0, 3)
  if (top.length === 0) return null

  return (
    <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      {top.map((finisher) => {
        const medal = MEDAL[finisher.rank] ?? MEDAL[3]
        const inner = (
          <>
            <div className="flex items-center justify-between gap-3">
              <span className={`font-serif font-bold text-lg ${medal.text}`}>{medal.place}</span>
              {finisher.rank === 1 && <Crown size={18} className="text-[#D4A017]" aria-hidden />}
            </div>
            <div className="flex items-center gap-3 min-w-0 mt-3">
              <span className={`rounded-full ring-2 ${medal.ring}`}>
                <Avatar src={finisher.avatarUrl} name={finisher.displayName} size="md" />
              </span>
              <div className="min-w-0">
                <p className="font-medium text-white truncate">{finisher.displayName}</p>
                <p className={`font-serif font-bold ${medal.text}`}>
                  {finisher.points.toLocaleString('en-GB')} pts
                </p>
              </div>
            </div>
          </>
        )
        const className = 'glass-panel rounded-2xl p-4 min-h-[112px] block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D4FF]'
        return (
          <li key={`${month.monthKey}-podium-${finisher.rank}`}>
            {finisher.userId ? (
              <Link href={`/users/${finisher.userId}`} className={className}>
                {inner}
              </Link>
            ) : (
              <div className={className}>{inner}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
}

function RankingRow({ finisher }: { finisher: PastFinisher }) {
  const medal = MEDAL[finisher.rank]
  const row = (
    <>
      <span className={`font-serif font-bold text-lg w-8 text-center shrink-0 ${medal?.text ?? 'text-white/70'}`}>
        {finisher.rank}
      </span>
      <Avatar src={finisher.avatarUrl} name={finisher.displayName} size="sm" />
      <span className="flex-1 min-w-0 font-medium text-white truncate">{finisher.displayName}</span>
      <span className={`font-serif font-bold shrink-0 ${medal?.text ?? 'text-[#7BE7FF]'}`}>
        {finisher.points.toLocaleString('en-GB')} pts
      </span>
    </>
  )
  const className = 'glass-panel rounded-2xl px-3 sm:px-4 min-h-[56px] flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D4FF]'
  return finisher.userId ? (
    <Link href={`/users/${finisher.userId}`} className={className}>
      {row}
    </Link>
  ) : (
    <div className={className}>{row}</div>
  )
}

export function PastLeaderboards({
  months,
  selectedKey,
}: {
  months: PastMonth[]
  selectedKey: string | null
}) {
  if (months.length === 0 || !selectedKey) {
    return (
      <div className="glass-panel rounded-3xl px-6 py-16 sm:px-10 text-center">
        <Trophy className="w-12 h-12 mx-auto mb-5 text-[#D4A017]" aria-hidden />
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3">No closed months yet</h2>
        <p className="text-white/75 text-base leading-relaxed max-w-lg mx-auto">
          Standings show up here after a month is closed. An admin archives everyone who had points
          when they reset the month. Earlier months are rebuilt from approved task awards and manual
          point grants when that history exists. Nobody is filled in.
        </p>
        <Link
          href="/leaderboard"
          className="inline-flex items-center justify-center mt-8 min-h-[44px] px-5 rounded-xl text-sm font-semibold text-[#00D4FF] glass-panel"
        >
          This month&apos;s leaderboard
        </Link>
      </div>
    )
  }

  const selected = months.find((month) => month.monthKey === selectedKey) ?? months[0]
  const countLabel = `${selected.finishers.length} finisher${selected.finishers.length === 1 ? '' : 's'}`

  return (
    <div>
      <MonthPicker months={months} selectedKey={selected.monthKey} />

      <section aria-labelledby="selected-month-heading" className="glass-panel rounded-3xl p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-5">
          <h2 id="selected-month-heading" className="font-serif text-2xl sm:text-3xl font-bold text-white">
            {selected.label}
          </h2>
          <p className="text-sm text-white/70">{sourceLine(selected)}</p>
        </div>

        {selected.finishers.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/20 px-4 py-8 text-center text-sm text-white/70">
            No scored finishers for this month.
          </p>
        ) : (
          <>
            <Podium month={selected} />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-3">
              Full ranking · {countLabel}
            </h3>
            <ol className="space-y-2" aria-label={`${selected.label} full ranking`}>
              {selected.finishers.map((finisher) => (
                <li key={`${selected.monthKey}-${finisher.rank}`}>
                  <RankingRow finisher={finisher} />
                </li>
              ))}
            </ol>
          </>
        )}
      </section>

      <p className="text-sm text-white/65 text-center mt-8 max-w-xl mx-auto leading-relaxed">
        Pick any closed month. The top 3 are highlighted, and the list under them is everyone who scored.
        The live month stays on the current leaderboard until an admin resets it.
      </p>
    </div>
  )
}
