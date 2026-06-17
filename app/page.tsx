import Link from 'next/link'
import Image from 'next/image'
import { Trophy, CheckCircle, TrendingUp, Star, ArrowRight, Zap } from 'lucide-react'
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
      {/* Hero — split layout: left = logo zone, right = content */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background atmosphere */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Blue glow — left/center */}
          <div className="absolute top-[-10%] left-[5%] w-[55vw] h-[55vw] rounded-full bg-[#4B3DE8]/10 blur-[130px]" />
          {/* Gold glow — right */}
          <div className="absolute top-[10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-[#D4A017]/8 blur-[110px]" />
          {/* Deep blue bottom accent */}
          <div className="absolute bottom-0 left-[20%] w-[30vw] h-[30vw] rounded-full bg-[#4B3DE8]/6 blur-[100px]" />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(#4B3DE8 1px, transparent 1px), linear-gradient(90deg, #4B3DE8 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* LEFT HALF — logo */}
            <div className="hidden lg:flex items-center justify-center min-h-[420px]">
              <div className="relative w-[340px] h-[340px] flex items-center justify-center">
                {/* Pulsing rings */}
                <div className="absolute inset-0 rounded-full border border-[#4B3DE8]/20 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-[15%] rounded-full border border-[#D4A017]/15 animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                <Image
                  src="/logo.png"
                  alt="Africa Monthly"
                  width={260}
                  height={260}
                  className="relative z-10 drop-shadow-[0_0_40px_rgba(75,61,232,0.4)]"
                  priority
                />
              </div>
            </div>

            {/* RIGHT HALF — hero text content */}
            <div className="lg:pl-8">
              {/* Month badge */}
              <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-[#4B3DE8]/30 bg-[#4B3DE8]/8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4B3DE8] animate-pulse" />
                <Trophy className="text-[#D4A017] w-4 h-4" />
                <span className="text-xs font-semibold text-[#A09070] uppercase tracking-widest">
                  {monthLabel} Competition
                </span>
              </div>

              <h1
                className="font-serif font-bold text-[#F5F0E8] leading-[1.05]"
                style={{ fontSize: 'clamp(2.6rem, 6vw, 5rem)' }}
              >
                Compete.{' '}
                <span
                  className="italic text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg, #D4A017 0%, #E8B94F 100%)' }}
                >
                  Engage.
                </span>{' '}
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg, #7B6FF0 0%, #4B3DE8 100%)' }}
                >
                  Win.
                </span>
              </h1>

              <p className="mt-6 text-lg text-[#A09070] leading-relaxed max-w-lg">
                Join the African community&apos;s monthly leaderboard. Complete tasks, chat on
                Telegram, and participate in events to earn points. Top&nbsp;5 win exclusive rewards.
              </p>

              {/* CTA buttons */}
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

              {/* Stats strip */}
              <div className="mt-12 flex flex-wrap gap-6">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#111111] border border-[#2A2A2A] hover:border-[#4B3DE8]/40 transition-colors">
                  <Zap className="w-4 h-4 text-[#4B3DE8]" />
                  <div>
                    <span className="text-[#D4A017] font-serif font-bold text-xl block leading-none">{daysLeft}</span>
                    <span className="text-[#A09070] text-xs">days left</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#111111] border border-[#2A2A2A] hover:border-[#D4A017]/40 transition-colors">
                  <Trophy className="w-4 h-4 text-[#D4A017]" />
                  <div>
                    <span className="text-[#D4A017] font-serif font-bold text-xl block leading-none">Top 5</span>
                    <span className="text-[#A09070] text-xs">get rewarded</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#111111] border border-[#2A2A2A] hover:border-[#4B3DE8]/40 transition-colors">
                  <Star className="w-4 h-4 text-[#4B3DE8]" fill="currentColor" />
                  <div>
                    <span className="text-[#D4A017] font-serif font-bold text-xl block leading-none">10:1</span>
                    <span className="text-[#A09070] text-xs">chats to points</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-t border-[#2A2A2A] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-[#4B3DE8]/5 blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border border-[#4B3DE8]/25 bg-[#4B3DE8]/6">
              <span className="text-xs font-semibold text-[#7B6FF0] uppercase tracking-widest">Simple Process</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#F5F0E8] mb-2">How It Works</h2>
            <p className="text-[#A09070]">Three steps to climb the leaderboard.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <CheckCircle className="text-[#4B3DE8] w-6 h-6" />,
                iconBg: 'bg-[#4B3DE8]/10',
                step: '01',
                stepColor: 'text-[#4B3DE8]/30',
                hoverBorder: 'hover:border-[#4B3DE8]/40',
                accentLine: 'bg-[#4B3DE8]',
                title: 'Connect Discord',
                desc: 'Sign in with Discord, then link your Telegram, X account, and wallet on your profile.',
              },
              {
                icon: <TrendingUp className="text-[#D4A017] w-6 h-6" />,
                iconBg: 'bg-[#D4A017]/10',
                step: '02',
                stepColor: 'text-[#D4A017]/30',
                hoverBorder: 'hover:border-[#D4A017]/40',
                accentLine: 'bg-[#D4A017]',
                title: 'Complete Tasks',
                desc: 'Tasks are posted regularly. Submit proof links and earn points when admin approves.',
              },
              {
                icon: <Trophy className="text-[#4B3DE8] w-6 h-6" />,
                iconBg: 'bg-[#4B3DE8]/10',
                step: '03',
                stepColor: 'text-[#4B3DE8]/30',
                hoverBorder: 'hover:border-[#4B3DE8]/40',
                accentLine: 'bg-gradient-to-r from-[#4B3DE8] to-[#D4A017]',
                title: 'Climb & Win',
                desc: 'Earn points from tasks, Telegram chats, and special events. Top 5 win monthly rewards.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`relative bg-[#111111] border border-[#2A2A2A] rounded-2xl p-8 ${item.hoverBorder} transition-all duration-300 hover:translate-y-[-2px] cursor-default overflow-hidden`}
              >
                {/* Top accent line */}
                <div className={`absolute top-0 left-8 right-8 h-[2px] ${item.accentLine} rounded-b-full opacity-60`} />
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-lg ${item.iconBg} flex items-center justify-center`}>
                    {item.icon}
                  </div>
                  <span className={`font-serif ${item.stepColor} text-4xl font-bold leading-none`}>
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
        <section className="py-24 border-t border-[#2A2A2A] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-0 w-[35vw] h-[35vw] rounded-full bg-[#D4A017]/4 blur-[100px]" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full border border-[#D4A017]/25 bg-[#D4A017]/6">
                  <span className="text-xs font-semibold text-[#D4A017] uppercase tracking-widest">Live Rankings</span>
                </div>
                <h2 className="font-serif text-3xl font-bold text-[#F5F0E8]">{monthLabel}</h2>
                <p className="text-[#A09070] mt-1">Current standings — {daysLeft} days remaining</p>
              </div>
              <Link href="/leaderboard">
                <Button variant="ghost" size="sm">
                  Full leaderboard <ArrowRight size={16} />
                </Button>
              </Link>
            </div>

            <div className="space-y-3 max-w-2xl">
              {topUsers.map((user, i) => {
                const u = user as {
                  _id: { toString(): string }
                  discordUsername: string
                  discordAvatar?: string
                  monthlyPoints: number
                }
                const rankColors = ['text-[#D4A017]', 'text-[#C0C0C0]', 'text-[#CD7F32]']
                const rowGlow = i === 0 ? 'hover:border-[#D4A017]/40 hover:shadow-[0_0_20px_#D4A017]/10' : i === 1 ? 'hover:border-[#4B3DE8]/40' : 'hover:border-[#2A2A2A]/60'
                return (
                  <div
                    key={u._id.toString()}
                    className={`flex items-center gap-4 bg-[#111111] border border-[#2A2A2A] rounded-xl px-5 py-4 transition-all duration-200 ${rowGlow} ${i === 0 ? 'border-[#D4A017]/20' : ''}`}
                  >
                    {/* Rank indicator bar */}
                    <div className={`w-1 h-8 rounded-full ${i === 0 ? 'bg-[#D4A017]' : i === 1 ? 'bg-[#4B3DE8]' : i === 2 ? 'bg-[#CD7F32]' : 'bg-[#2A2A2A]'}`} />
                    <span className={`font-serif font-bold text-xl w-6 ${rankColors[i] ?? 'text-[#5A5040]'}`}>
                      {i + 1}
                    </span>
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
      <section className="py-24 border-t border-[#2A2A2A] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#4B3DE8]/4 to-[#D4A017]/4" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[30vw] rounded-full bg-[#4B3DE8]/8 blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-[#4B3DE8]/30 bg-[#4B3DE8]/8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4B3DE8] animate-pulse" />
            <span className="text-xs font-semibold text-[#7B6FF0] uppercase tracking-widest">Monthly Reset Active</span>
          </div>
          <h2 className="font-serif text-4xl font-bold text-[#F5F0E8] mb-4">Ready to compete?</h2>
          <p className="text-[#A09070] text-lg mb-8">
            Join with Discord and start earning points today. The leaderboard resets monthly —
            every competition is a fresh start.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/tasks">
              <Button size="lg">
                Get Started <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="ghost" size="lg">
                View Rankings
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
