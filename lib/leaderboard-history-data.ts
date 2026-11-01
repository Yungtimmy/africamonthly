import { supabase } from '@/lib/supabase'
import {
  aggregatePastMonths,
  buildPastLeaderboard,
  type HistoryUser,
  type LeaderboardSource,
  type PastFinisher,
  type PastMonth,
  type PointEvent,
} from '@/lib/leaderboard-history'
import { isMonthKey, monthKeyFromTimestampSafe } from '@/lib/months'

const PAGE = 1000

type QueryError = { code?: string; message?: string }

function isMissingHistoryTable(error: QueryError | null | undefined): boolean {
  if (!error) return false
  const message = (error.message ?? '').toLowerCase()
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    message.includes('does not exist') ||
    message.includes('schema cache')
  )
}

async function fetchPages<T>(
  load: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: QueryError | null }>,
): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; from < 50_000; from += PAGE) {
    const { data, error } = await load(from, from + PAGE - 1)
    if (error) throw error
    const batch = data ?? []
    rows.push(...batch)
    if (batch.length < PAGE) break
  }
  return rows
}

async function readSnapshots(): Promise<PastMonth[] | null> {
  const { data: months, error } = await supabase
    .from('monthly_leaderboards')
    .select('month_key, source')
    .order('month_key', { ascending: true })

  if (error) {
    if (isMissingHistoryTable(error)) return null
    throw error
  }

  let entries: {
    month_key: string
    rank: number
    user_id: string | null
    display_name: string
    avatar_url: string | null
    points: number
  }[]
  try {
    entries = await fetchPages((from, to) =>
      supabase
        .from('monthly_leaderboard_entries')
        .select('month_key, rank, user_id, display_name, avatar_url, points')
        .order('month_key', { ascending: true })
        .order('rank', { ascending: true })
        .range(from, to),
    )
  } catch (error) {
    const queryError = error as QueryError
    if (isMissingHistoryTable(queryError)) return null
    throw error
  }

  const byMonth = new Map<string, PastFinisher[]>()
  for (const row of entries) {
    const rank = Number(row.rank)
    const points = Number(row.points)
    if (!isMonthKey(row.month_key) || rank < 1 || !Number.isFinite(points) || points <= 0) continue
    const list = byMonth.get(row.month_key) ?? []
    list.push({
      rank,
      userId: row.user_id,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      points,
    })
    byMonth.set(row.month_key, list)
  }

  return (months ?? []).flatMap((month) => {
    if (!isMonthKey(month.month_key)) return []
    if (month.source !== 'reset' && month.source !== 'reconstructed') return []
    const source = month.source as LeaderboardSource
    return [{
      monthKey: month.month_key,
      label: month.month_key,
      source,
      finishers: byMonth.get(month.month_key) ?? [],
    }]
  })
}

async function fetchUsers(ids: string[]): Promise<HistoryUser[]> {
  const unique = [...new Set(ids)]
  const users: HistoryUser[] = []
  for (let i = 0; i < unique.length; i += 100) {
    const chunk = unique.slice(i, i + 100)
    const { data, error } = await supabase
      .from('users')
      .select('id, discord_username, discord_avatar')
      .in('id', chunk)
    if (error) throw error
    for (const row of data ?? []) {
      users.push({
        id: row.id,
        displayName: row.discord_username ?? '',
        avatarUrl: row.discord_avatar,
      })
    }
  }
  return users
}

async function reconstructFromEvents(now: Date): Promise<PastMonth[]> {
  const [submissions, grants] = await Promise.all([
    fetchPages<{
      user_id: string
      points_awarded: number | null
      reviewed_at: string | null
      created_at: string
    }>((from, to) =>
      supabase
        .from('submissions')
        .select('user_id, points_awarded, reviewed_at, created_at')
        .eq('status', 'approved')
        .not('points_awarded', 'is', null)
        .order('id', { ascending: true })
        .range(from, to),
    ),
    fetchPages<{ user_id: string; points: number; created_at: string }>((from, to) =>
      supabase
        .from('point_grants')
        .select('user_id, points, created_at')
        .order('id', { ascending: true })
        .range(from, to),
    ),
  ])

  const events: PointEvent[] = []
  for (const row of submissions) {
    const points = Number(row.points_awarded)
    const at = row.reviewed_at ?? row.created_at
    if (!row.user_id || !at || !Number.isFinite(points) || points === 0) continue
    events.push({ userId: row.user_id, points, at })
  }
  for (const row of grants) {
    const points = Number(row.points)
    if (!row.user_id || !row.created_at || !Number.isFinite(points) || points === 0) continue
    events.push({ userId: row.user_id, points, at: row.created_at })
  }

  const users = await fetchUsers(events.map((event) => event.userId))
  return aggregatePastMonths(events, users, now)
}

async function earliestUserMonth(): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('created_at')
    .order('created_at', { ascending: true })
    .limit(1)

  if (error || !data?.[0]?.created_at) return null
  return monthKeyFromTimestampSafe(data[0].created_at)
}

/** Closed months, newest first. Never throws — a missing database yields an empty archive. */
export async function getPastLeaderboards(now = new Date()): Promise<PastMonth[]> {
  try {
    const [snapshots, reconstructed, earliestMonthKey] = await Promise.all([
      readSnapshots().catch((error: QueryError) => {
        if (isMissingHistoryTable(error)) return null
        console.error('[past-leaderboard] snapshots failed', error.message)
        return [] as PastMonth[]
      }),
      reconstructFromEvents(now).catch((error: QueryError) => {
        console.error('[past-leaderboard] event history failed', error.message)
        return [] as PastMonth[]
      }),
      earliestUserMonth().catch(() => null),
    ])

    return buildPastLeaderboard(snapshots ?? [], reconstructed, now, earliestMonthKey)
  } catch (error) {
    console.error('[past-leaderboard] failed', error instanceof Error ? error.message : error)
    return []
  }
}
