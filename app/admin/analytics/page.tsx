import { supabase } from '@/lib/supabase'
import { Avatar } from '@/components/ui/Avatar'
import { CheckCircle2, Clock, Zap, ListChecks, Gift, MessageCircle } from 'lucide-react'

export const revalidate = 0

interface SubmissionRow { status: string; points_awarded: number | null; created_at: string }
interface GrantRow { points: number; reason: string; created_at: string }
interface UserRow { discord_username: string; discord_avatar: string | null; total_points: number; telegram_chat_count: number | null }

async function getData() {
  const [{ data: submissions }, { data: grants }, { data: users }] = await Promise.all([
    supabase.from('submissions').select('status, points_awarded, created_at'),
    supabase.from('point_grants').select('points, reason, created_at'),
    supabase.from('users').select('discord_username, discord_avatar, total_points, telegram_chat_count'),
  ])
  return {
    submissions: (submissions ?? []) as SubmissionRow[],
    grants: (grants ?? []) as GrantRow[],
    users: (users ?? []) as UserRow[],
  }
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export default async function AnalyticsPage() {
  const { submissions, grants, users } = await getData()

  const approved = submissions.filter((s) => s.status === 'approved').length
  const pending = submissions.filter((s) => s.status === 'pending').length
  const rejected = submissions.filter((s) => s.status === 'rejected').length
  const reviewed = approved + rejected
  const approvalRate = reviewed > 0 ? Math.round((approved / reviewed) * 100) : 0

  const taskPoints = submissions
    .filter((s) => s.status === 'approved')
    .reduce((sum, s) => sum + (s.points_awarded ?? 0), 0)
  const manualPoints = grants.reduce((sum, g) => sum + g.points, 0)
  const telegramPoints = users.reduce((sum, u) => sum + Math.floor((u.telegram_chat_count ?? 0) / 10), 0)
  const totalAwarded = taskPoints + manualPoints + telegramPoints

  // Submissions per day, last 14 days
  const days: { key: string; label: string; count: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({ key: dayKey(d), label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), count: 0 })
  }
  const dayMap = new Map(days.map((d) => [d.key, d]))
  for (const s of submissions) {
    const k = s.created_at.slice(0, 10)
    const bucket = dayMap.get(k)
    if (bucket) bucket.count++
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count))

  // Points by source
  const sources = [
    { label: 'Tasks', value: taskPoints, color: 'bg-[#00D4FF]', icon: <ListChecks size={14} className="text-[#00D4FF]" /> },
    { label: 'Manual grants', value: manualPoints, color: 'bg-[#D4A017]', icon: <Gift size={14} className="text-[#D4A017]" /> },
    { label: 'Telegram', value: telegramPoints, color: 'bg-emerald-400', icon: <MessageCircle size={14} className="text-emerald-400" /> },
  ]
  const maxSource = Math.max(1, ...sources.map((s) => s.value))

  // Top earners
  const topEarners = [...users].sort((a, b) => b.total_points - a.total_points).slice(0, 5)

  // Grant reasons (top 5 by total points)
  const reasonMap = new Map<string, number>()
  for (const g of grants) reasonMap.set(g.reason, (reasonMap.get(g.reason) ?? 0) + g.points)
  const topReasons = [...reasonMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)

  const statCards = [
    { label: 'Total submissions', value: submissions.length, icon: <ListChecks className="w-5 h-5 text-[#00D4FF]" /> },
    { label: 'Approval rate', value: `${approvalRate}%`, icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" /> },
    { label: 'Points awarded', value: totalAwarded.toLocaleString(), icon: <Zap className="w-5 h-5 text-[#D4A017]" /> },
    { label: 'Pending reviews', value: pending, icon: <Clock className="w-5 h-5 text-amber-400" /> },
  ]

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-white mb-2">Analytics</h1>
      <p className="text-white/30 text-sm mb-8">Engagement and points overview.</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((c) => (
          <div key={c.label} className="relative rounded-2xl p-6 overflow-hidden bg-white/3 border border-white/8 backdrop-blur-sm">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#00D4FF]/30 to-transparent" />
            <div className="mb-4">{c.icon}</div>
            <p className="font-serif font-bold text-3xl text-white">{c.value}</p>
            <p className="text-xs text-white/30 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Submissions per day */}
        <div className="rounded-2xl p-6 bg-white/3 border border-white/8 backdrop-blur-sm">
          <h2 className="font-serif text-lg font-semibold text-white mb-5">Submissions — last 14 days</h2>
          <div className="flex items-end gap-1.5 h-40">
            {days.map((d) => (
              <div key={d.key} className="flex-1 flex flex-col items-center justify-end gap-1.5 group">
                <span className="text-[10px] text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">{d.count}</span>
                <div
                  className="w-full rounded-t bg-gradient-to-t from-[#00D4FF]/40 to-[#00D4FF]/80 min-h-[2px] transition-all"
                  style={{ height: `${(d.count / maxDay) * 100}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-white/20">
            <span>{days[0]?.label}</span>
            <span>{days[days.length - 1]?.label}</span>
          </div>
        </div>

        {/* Points by source */}
        <div className="rounded-2xl p-6 bg-white/3 border border-white/8 backdrop-blur-sm">
          <h2 className="font-serif text-lg font-semibold text-white mb-5">Points by source</h2>
          <div className="space-y-4">
            {sources.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="flex items-center gap-2 text-white/60">{s.icon}{s.label}</span>
                  <span className="font-semibold text-white">{s.value.toLocaleString()}</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <div className={`h-full rounded-full ${s.color}`} style={{ width: `${(s.value / maxSource) * 100}%` }} />
                </div>
              </div>
            ))}
            <p className="text-xs text-white/30 pt-2 flex justify-between">
              <span>Approved: {approved}</span>
              <span>Rejected: {rejected}</span>
              <span>Pending: {pending}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top earners */}
        <div className="rounded-2xl p-6 bg-white/3 border border-white/8 backdrop-blur-sm">
          <h2 className="font-serif text-lg font-semibold text-white mb-5">Top earners (all-time)</h2>
          {topEarners.length === 0 ? (
            <p className="text-sm text-white/30 py-6 text-center">No users yet.</p>
          ) : (
            <div className="space-y-2">
              {topEarners.map((u, i) => (
                <div key={u.discord_username + i} className="flex items-center gap-3">
                  <span className="font-serif font-bold text-white/30 w-5 text-center">{i + 1}</span>
                  <Avatar src={u.discord_avatar ?? undefined} name={u.discord_username} size="sm" />
                  <span className="flex-1 text-sm text-white/80 truncate">{u.discord_username}</span>
                  <span className="text-sm font-bold text-[#D4A017]">{u.total_points.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top grant reasons */}
        <div className="rounded-2xl p-6 bg-white/3 border border-white/8 backdrop-blur-sm">
          <h2 className="font-serif text-lg font-semibold text-white mb-5">Manual grants by reason</h2>
          {topReasons.length === 0 ? (
            <p className="text-sm text-white/30 py-6 text-center">No manual grants yet.</p>
          ) : (
            <div className="space-y-2">
              {topReasons.map(([reason, pts]) => (
                <div key={reason} className="flex items-center justify-between text-sm">
                  <span className="text-white/60 truncate flex items-center gap-2"><Gift size={13} className="text-[#D4A017] shrink-0" />{reason}</span>
                  <span className="font-semibold text-[#D4A017] shrink-0">+{pts.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
