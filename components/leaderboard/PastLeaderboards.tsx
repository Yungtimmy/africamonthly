import Link from 'next/link'
import { ChevronDown, Crown, Trophy } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import type { PastFinisher, PastMonth } from '@/lib/leaderboard-history'

const MEDAL: Record<number, { place: string; text: string; ring: string }> = {
  1: { place: '1st', text: 'text-[#D4A017]', ring: 'ring-[#D4A017]/55' },
  2: { place: '2nd', text: 'text-[#D9D9D9]', ring: 'ring-white/40' },
  3: { place: '3rd', text: 'text-[#E0A060]', ring: 'ring-[#CD7F32]/50' },
}

function FullStandings({ monthKey, finishers }: { monthKey: string; finishers: PastFinisher[] }) {
  const countLabel = `${finishers.length} finisher${finishers.length === 1 ? '' : 's'}`
  return (
    <details className="group mt-5">
      <summary className="glass-panel rounded-2xl px-4 min-h-[48px] flex items-center justify-between gap-3 cursor-pointer list-none marker:content-none [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D4FF]">
        <span className="font-medium text-white">Full standings</span>
        <span className="text-sm text-white/75 inline-flex items-center gap-2">
          {countLabel}
          <ChevronDown size={16} className="transition-transform group-open:rotate-180" aria-hidden />
        </span>
      </summary>
      <ol className="mt-3 space-y-2 max-h-[70vh] overflow-y-auto pr-1" aria-label={`${countLabel} for this month`}>
        {finishers.map((finisher) => {
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
          return (
            <li key={`${monthKey}-full-${finisher.rank}`}>
              {finisher.userId ? (
                <Link href={`/users/${finisher.userId}`} className={className}>
                  {row}
                </Link>
              ) : (
                <div className={className}>{row}</div>
              )}
            </li>
          )
        })}
      </ol>
    </details>
  )
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

export function PastLeaderboards({ months }: { months: PastMonth[] }) {
  if (months.length === 0) {
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

  return (
    <div>
      {months.length > 1 && (
        <nav
          aria-label="Closed months"
          className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] sm:top-[calc(4rem+env(safe-area-inset-top))] z-20 -mx-4 px-4 py-3 mb-8"
        >
          <div className="glass-panel rounded-2xl p-2 flex gap-2 overflow-x-auto snap-x">
            {months.map((month) => (
              <a
                key={month.monthKey}
                href={`#month-${month.monthKey}`}
                className="snap-start shrink-0 inline-flex items-center min-h-[44px] px-4 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D4FF]"
              >
                {month.label}
              </a>
            ))}
          </div>
        </nav>
      )}

      <div className="space-y-6">
        {months.map((month) => (
          <section
            key={month.monthKey}
            id={`month-${month.monthKey}`}
            aria-labelledby={`month-heading-${month.monthKey}`}
            className="glass-panel rounded-3xl p-5 sm:p-7 scroll-mt-40"
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-5">
              <h2 id={`month-heading-${month.monthKey}`} className="font-serif text-2xl sm:text-3xl font-bold text-white">
                {month.label}
              </h2>
              <p className="text-sm text-white/70">{sourceLine(month)}</p>
            </div>

            {month.finishers.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/20 px-4 py-8 text-center text-sm text-white/70">
                No scored finishers for this month.
              </p>
            ) : (
              <>
                <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {month.finishers.slice(0, 3).map((finisher) => {
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
                <FullStandings monthKey={month.monthKey} finishers={month.finishers} />
              </>
            )}
          </section>
        ))}
      </div>

      <p className="text-sm text-white/65 text-center mt-8 max-w-xl mx-auto leading-relaxed">
        The live month stays on the current leaderboard until an admin resets it. That reset saves
        everyone who had points. The top 3 stay on the podium, and the full ranking opens underneath.
        Months before archives began are rebuilt only from points that were actually awarded.
      </p>
    </div>
  )
}
