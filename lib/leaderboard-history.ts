import {
  isMonthKey,
  labelForMonthKey,
  monthKeyFromTimestampSafe,
  monthKeyUTC,
  monthKeysBetween,
  previousMonthKey,
} from '@/lib/months'

export type LeaderboardSource = 'reset' | 'reconstructed'

export type PastFinisher = {
  rank: number
  userId: string | null
  displayName: string
  avatarUrl: string | null
  points: number
}

export type PastMonth = {
  monthKey: string
  label: string
  /** `null` is a closed month in the span with no scored finishers and no archive row. */
  source: LeaderboardSource | null
  finishers: PastFinisher[]
}

export type PointEvent = {
  userId: string
  points: number
  at: string
}

export type HistoryUser = {
  id: string
  displayName: string
  avatarUrl: string | null
}

function compareNames(a: string, b: string): number {
  return a.localeCompare(b, 'en', { sensitivity: 'base' }) || (a < b ? -1 : a > b ? 1 : 0)
}

/**
 * Full standings per UTC month from real point events.
 * Approved submission awards and manual grants/deductions are summed.
 * The current month is left out — it is still in progress.
 * People with a zero or negative net, and anyone we cannot name, are omitted.
 */
export function aggregatePastMonths(
  events: PointEvent[],
  users: HistoryUser[],
  now = new Date(),
): PastMonth[] {
  const current = monthKeyUTC(now)
  const userById = new Map(users.map((user) => [user.id, user]))
  const totals = new Map<string, Map<string, number>>()

  for (const event of events) {
    if (!event.userId || !Number.isFinite(event.points) || event.points === 0) continue
    const monthKey = monthKeyFromTimestampSafe(event.at)
    if (!monthKey || monthKey >= current) continue
    if (!userById.has(event.userId)) continue

    let month = totals.get(monthKey)
    if (!month) {
      month = new Map()
      totals.set(monthKey, month)
    }
    month.set(event.userId, (month.get(event.userId) ?? 0) + event.points)
  }

  const months: PastMonth[] = []
  for (const [monthKey, scores] of totals) {
    const ranked = [...scores.entries()]
      .filter(([, points]) => points > 0)
      .sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1]
        const byName = compareNames(
          userById.get(a[0])?.displayName ?? '',
          userById.get(b[0])?.displayName ?? '',
        )
        if (byName !== 0) return byName
        return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0
      })

    if (ranked.length === 0) continue

    months.push({
      monthKey,
      label: labelForMonthKey(monthKey),
      source: 'reconstructed',
      finishers: ranked.map(([userId, points], index) => {
        const user = userById.get(userId)!
        return {
          rank: index + 1,
          userId,
          displayName: user.displayName.trim() || 'Unnamed',
          avatarUrl: user.avatarUrl,
          points,
        }
      }),
    })
  }

  return months
}

function normalizeFinishers(finishers: PastFinisher[]): PastFinisher[] {
  return [...finishers]
    .filter((finisher) => finisher.rank >= 1 && finisher.points > 0 && finisher.displayName.trim())
    .sort((a, b) => a.rank - b.rank || b.points - a.points)
    .map((finisher) => ({ ...finisher, displayName: finisher.displayName.trim() }))
}

/**
 * Merge archives and event history into one closed-month list, newest first.
 * A reset snapshot wins for its month, including a month that closed with nobody scoring.
 * Gaps from the earliest record (or an earlier signup month) through the last closed
 * month are included so the span can be browsed. With no scores and no archive, the
 * list is empty.
 */
export function buildPastLeaderboard(
  snapshots: PastMonth[],
  reconstructed: PastMonth[],
  now = new Date(),
  earliestMonthKey: string | null = null,
): PastMonth[] {
  const current = monthKeyUTC(now)
  const byKey = new Map<string, PastMonth>()

  for (const month of reconstructed) {
    if (!isMonthKey(month.monthKey) || month.monthKey >= current) continue
    const finishers = normalizeFinishers(month.finishers)
    if (finishers.length === 0) continue
    byKey.set(month.monthKey, {
      monthKey: month.monthKey,
      label: labelForMonthKey(month.monthKey),
      source: 'reconstructed',
      finishers,
    })
  }

  for (const month of snapshots) {
    if (!isMonthKey(month.monthKey)) continue
    if (month.monthKey > current) continue
    if (month.monthKey === current && month.source !== 'reset') continue

    if (month.source === 'reset') {
      byKey.set(month.monthKey, {
        monthKey: month.monthKey,
        label: labelForMonthKey(month.monthKey),
        source: 'reset',
        finishers: normalizeFinishers(month.finishers),
      })
      continue
    }

    if (!byKey.has(month.monthKey)) {
      const finishers = normalizeFinishers(month.finishers)
      if (finishers.length === 0) continue
      byKey.set(month.monthKey, {
        monthKey: month.monthKey,
        label: labelForMonthKey(month.monthKey),
        source: 'reconstructed',
        finishers,
      })
    }
  }

  const hasHistory = [...byKey.values()].some((month) => month.finishers.length > 0 || month.source === 'reset')
  if (!hasHistory) return []

  const anchors = [...byKey.keys()]
  if (earliestMonthKey && isMonthKey(earliestMonthKey) && earliestMonthKey < current) {
    anchors.push(earliestMonthKey)
  }

  const start = [...anchors].sort()[0]
  let end = previousMonthKey(now)
  const latest = [...byKey.keys()].sort().at(-1)
  if (latest && latest > end && latest <= current) end = latest
  if (!start || start > end) return []

  return monthKeysBetween(start, end)
    .map((monthKey) => byKey.get(monthKey) ?? {
      monthKey,
      label: labelForMonthKey(monthKey),
      source: null,
      finishers: [],
    })
    .reverse()
}
