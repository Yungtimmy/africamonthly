const MONTH_KEY = /^(\d{4})-(0[1-9]|1[0-2])$/

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export function isMonthKey(value: string): boolean {
  return MONTH_KEY.test(value)
}

/** Calendar month in UTC, `YYYY-MM`. Competition months follow UTC, same as the server. */
export function monthKeyUTC(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function monthKeyFromTimestampSafe(iso: string): string | null {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return monthKeyUTC(date)
}

export function shiftMonthKey(key: string, delta: number): string {
  const match = MONTH_KEY.exec(key)
  if (!match) throw new Error(`Invalid month key: ${key}`)
  const shifted = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1 + delta, 1))
  return monthKeyUTC(shifted)
}

export function previousMonthKey(now = new Date()): string {
  return shiftMonthKey(monthKeyUTC(now), -1)
}

export function labelForMonthKey(key: string): string {
  const match = MONTH_KEY.exec(key)
  if (!match) return key
  const name = MONTH_NAMES[Number(match[2]) - 1]
  return `${name} ${match[1]}`
}

/** Inclusive range. Empty when `start` is after `end` or either key is invalid. */
export function monthKeysBetween(start: string, end: string): string[] {
  if (!isMonthKey(start) || !isMonthKey(end) || start > end) return []
  const keys: string[] = []
  let cursor = start
  for (let i = 0; i < 240 && cursor <= end; i++) {
    keys.push(cursor)
    cursor = shiftMonthKey(cursor, 1)
  }
  return keys
}

export type CloseMonthChoice = {
  key: string
  label: string
  recommended: boolean
}

/**
 * The live counter can be closed as either this UTC month or the previous one.
 * The first week defaults to the previous month, because reset is meant to run
 * as a new month starts and the points on the board still belong to last month.
 */
export function closeMonthChoices(now = new Date()): CloseMonthChoice[] {
  const current = monthKeyUTC(now)
  const previous = previousMonthKey(now)
  const recommendPrevious = now.getUTCDate() <= 7
  return [
    { key: previous, label: labelForMonthKey(previous), recommended: recommendPrevious },
    { key: current, label: labelForMonthKey(current), recommended: !recommendPrevious },
  ]
}

export function isCloseableMonth(key: string, now = new Date()): boolean {
  return closeMonthChoices(now).some((choice) => choice.key === key)
}
