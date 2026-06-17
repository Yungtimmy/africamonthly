import { Crown, Star, Trophy } from 'lucide-react'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models/User'
import { Avatar } from '@/components/ui/Avatar'
import { getDaysUntilEndOfMonth, getCurrentMonthLabel, formatPoints } from '@/lib/utils'

async function getLeaderboard() {
  try {
    await connectDB()
    return await User.find()
      .sort({ monthlyPoints: -1, totalPoints: -1 })
      .limit(50)
      .select('discordUsername discordAvatar monthlyPoints totalPoints')
      .lean()
  } catch {
    return []
  }
}

export const revalidate = 60

export default async function LeaderboardPage() {
  const users = await getLeaderboard()
  const daysLeft = getDaysUntilEndOfMonth()
  const monthLabel = getCurrentMonthLabel()
  const top3 = users.slice(0, 3)
  const rest = users.slice(3)

  const podiumOrder = [1, 0, 2] // silver, gold, bronze visual order
  const podiumHeights = ['h-28', 'h-36', 'h-24']
  const crownColors = ['text-[#C0C0C0]', 'text-[#D4A017]', 'text-[#CD7F32]']
  const borderColors = ['border-[#C0C0C0]/40', 'border-[#D4A017]/60', 'border-[#CD7F32]/40']

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#F5F0E8] mb-2">
          {monthLabel}
        </h1>
        <p className="text-[#A09070]">
          {daysLeft} days remaining · Top 5 earn rewards
        </p>
      </div>

      {/* Podium */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-4 mb-16">
          {podiumOrder.map((idx) => {
            const user = top3[idx] as {
              _id: { toString(): string }
              discordUsername: string
              discordAvatar?: string
              monthlyPoints: number
            } | undefined
            if (!user) return null
            const rank = idx + 1
            return (
              <div key={user._id.toString()} className="flex flex-col items-center gap-3 flex-1 max-w-[160px]">
                <Crown size={20} className={crownColors[idx]} fill="currentColor" />
                <Avatar src={user.discordAvatar} name={user.discordUsername} size="lg" />
                <div className="text-center">
                  <p className="font-medium text-[#F5F0E8] text-sm truncate max-w-[120px]">
                    {user.discordUsername}
                  </p>
                  <p className="text-[#D4A017] font-serif font-bold">{formatPoints(user.monthlyPoints)}</p>
                </div>
                <div
                  className={`w-full rounded-t-xl border-t-2 ${borderColors[idx]} bg-[#111111] flex items-center justify-center ${podiumHeights[idx]}`}
                >
                  <span className="font-serif text-4xl font-bold text-[#2A2A2A]">#{rank}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full table */}
      <div className="space-y-2">
        {users.map((user, i) => {
          const u = user as {
            _id: { toString(): string }
            discordUsername: string
            discordAvatar?: string
            monthlyPoints: number
            totalPoints: number
          }
          const rank = i + 1
          const isTop5 = rank <= 5
          const rankColors = ['text-[#D4A017]', 'text-[#C0C0C0]', 'text-[#CD7F32]']

          return (
            <div
              key={u._id.toString()}
              className={`flex items-center gap-4 rounded-xl px-5 py-4 transition-colors border ${
                isTop5
                  ? 'bg-[#D4A017]/5 border-[#D4A017]/20 hover:border-[#D4A017]/40'
                  : 'bg-[#111111] border-[#2A2A2A] hover:border-[#2A2A2A]'
              }`}
            >
              <span
                className={`font-serif font-bold text-lg w-7 text-center ${
                  rank <= 3 ? rankColors[rank - 1] : 'text-[#5A5040]'
                }`}
              >
                {rank}
              </span>
              {rank <= 3 && (
                <Star
                  size={12}
                  className={rankColors[rank - 1] ?? 'text-[#5A5040]'}
                  fill="currentColor"
                />
              )}
              <Avatar src={u.discordAvatar} name={u.discordUsername} size="sm" />
              <span className="flex-1 font-medium text-[#F5F0E8] truncate">{u.discordUsername}</span>
              <div className="text-right">
                <span className="font-serif font-bold text-[#D4A017] text-lg">
                  {formatPoints(u.monthlyPoints)}
                </span>
                <p className="text-xs text-[#5A5040]">{formatPoints(u.totalPoints)} all-time</p>
              </div>
            </div>
          )
        })}

        {users.length === 0 && (
          <div className="text-center py-20 text-[#A09070]">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-[#2A2A2A]" />
            <p className="font-serif text-xl text-[#F5F0E8] mb-2">No competitors yet</p>
            <p className="text-sm">Be the first to earn points this month.</p>
          </div>
        )}
      </div>

      {rest.length > 0 && (
        <p className="text-center text-xs text-[#5A5040] mt-8">
          Showing top {users.length} competitors · Resets {daysLeft} days
        </p>
      )}
    </div>
  )
}
