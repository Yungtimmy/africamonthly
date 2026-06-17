import Link from 'next/link'
import { Trophy, CheckCircle, TrendingUp, Star, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models/User'
import { Avatar } from '@/components/ui/Avatar'
import { getDaysUntilEndOfMonth, getCurrentMonthLabel, formatPoints } from '@/lib/utils'

async function getTopUsers() {
  try {
    await connectDB()
    return await User.find()
      .sort({ monthlyPoints: -1 })
      .limit(5)
      .select('discordUsername discordAvatar monthlyPoints')
      .lean()
  } catch {
    return []
  }
}

export default async function HomePage() {
  const topUsers = await getTopUsers()
  const daysLeft = getDaysUntilEndOfMonth()
  const monthLabel = getCurrentMonthLabel()

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[60vw] h-[60vw] rounded-full bg-[#D4A017]/5 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] rounded-full bg-[#D4A017]/3 blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="text-[#D4A017] w-5 h-5" />
            <span className="text-sm font-semibold text-[#A09070] uppercase tracking-widest">
              {monthLabel} Competition
            </span>
          </div>

          <h1
            className="font-serif font-bold text-[#F5F0E8] leading-[1.05]"
            style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)' }}
          >
            Compete.{' '}
            <span
              className="italic text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #D4A017 0%, #E8B94F 100%)' }}
            >
              Engage.
            </span>{' '}
            Win.
          </h1>

          <p className="mt-6 text-lg text-[#A09070] max-w-2xl leading-relaxed">
            Join the African community&apos;s monthly leaderboard. Complete tasks, chat on Telegram,
            and participate in events to earn points. Top 5 win exclusive rewards.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/tasks">
              <Button size="lg">
                Start Earning Points <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="ghost" size="lg">
                View Leaderboard
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap gap-8 text-sm">
            <div>
              <span className="text-[#D4A017] font-serif font-bold text-2xl">{daysLeft}</span>
              <span className="text-[#A09070] ml-2">days left</span>
            </div>
            <div>
              <span className="text-[#D4A017] font-serif font-bold text-2xl">Top 5</span>
              <span className="text-[#A09070] ml-2">get rewarded</span>
            </div>
            <div>
              <span className="text-[#D4A017] font-serif font-bold text-2xl">10:1</span>
              <span className="text-[#A09070] ml-2">Telegram chats to points</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-t border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-3xl font-bold text-[#F5F0E8] mb-2">How It Works</h2>
          <p className="text-[#A09070] mb-12">Three steps to climb the leaderboard.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <CheckCircle className="text-[#D4A017] w-6 h-6" />,
                step: '01',
                title: 'Connect Discord',
                desc: 'Sign in with Discord, then link your Telegram, X account, and wallet on your profile.',
              },
              {
                icon: <TrendingUp className="text-[#D4A017] w-6 h-6" />,
                step: '02',
                title: 'Complete Tasks',
                desc: 'Tasks are posted regularly. Submit proof links and earn points when admin approves.',
              },
              {
                icon: <Trophy className="text-[#D4A017] w-6 h-6" />,
                step: '03',
                title: 'Climb & Win',
                desc: 'Earn points from tasks, Telegram chats, and special events. Top 5 win monthly rewards.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-8 hover:border-[#D4A017]/30 transition-colors duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#D4A017]/10 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="font-serif text-[#D4A017]/40 text-4xl font-bold leading-none">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#F5F0E8] mb-2">{item.title}</h3>
                <p className="text-[#A09070] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mini Leaderboard */}
      {topUsers.length > 0 && (
        <section className="py-24 border-t border-[#2A2A2A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-serif text-3xl font-bold text-[#F5F0E8]">{monthLabel}</h2>
                <p className="text-[#A09070] mt-1">Current standings — {daysLeft} days remaining</p>
              </div>
              <Link href="/leaderboard">
                <Button variant="ghost" size="sm">
                  Full leaderboard <ArrowRight size={16} />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {topUsers.map((user, i) => {
                const u = user as {
                  _id: { toString(): string }
                  discordUsername: string
                  discordAvatar?: string
                  monthlyPoints: number
                }
                const rankColors = ['text-[#D4A017]', 'text-[#C0C0C0]', 'text-[#CD7F32]']
                return (
                  <div
                    key={u._id.toString()}
                    className="flex items-center gap-4 bg-[#111111] border border-[#2A2A2A] rounded-xl px-5 py-4 hover:border-[#D4A017]/30 transition-colors"
                  >
                    <span
                      className={`font-serif font-bold text-xl w-6 ${rankColors[i] ?? 'text-[#5A5040]'}`}
                    >
                      {i + 1}
                    </span>
                    {i < 3 && (
                      <Star size={14} className={rankColors[i] ?? 'text-[#5A5040]'} fill="currentColor" />
                    )}
                    <Avatar src={u.discordAvatar} name={u.discordUsername} size="sm" />
                    <span className="flex-1 font-medium text-[#F5F0E8]">{u.discordUsername}</span>
                    <span className="font-serif font-bold text-[#D4A017] text-lg">
                      {formatPoints(u.monthlyPoints)}
                    </span>
                    <span className="text-xs text-[#5A5040]">pts</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 border-t border-[#2A2A2A]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-serif text-4xl font-bold text-[#F5F0E8] mb-4">Ready to compete?</h2>
          <p className="text-[#A09070] text-lg mb-8">
            Join with Discord and start earning points today. The leaderboard resets monthly — every
            competition is a fresh start.
          </p>
          <Link href="/tasks">
            <Button size="lg">
              Get Started <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
