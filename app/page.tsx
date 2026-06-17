import Link from 'next/link'
import Image from 'next/image'
import { Trophy, CheckCircle, TrendingUp, DollarSign, ArrowRight, Zap, Users, Target, Calendar } from 'lucide-react'
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
    <div className="relative">

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative min-h-[94vh] flex items-center overflow-hidden">
        {/* Aurora background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-[#00D4FF]/6 blur-[140px]" />
          <div className="absolute top-[20%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-[#0057A8]/12 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[30%] w-[40vw] h-[40vw] rounded-full bg-[#D4A017]/5 blur-[100px]" />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
          {/* Radial vignette */}
          <div className="absolute inset-0 bg-radial-gradient" style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, #0A0F1E 100%)'
          }} />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* LEFT — Logo with cosmic rings */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-[380px] h-[380px] flex items-center justify-center">
                {/* Outer slow-pulse ring */}
                <div className="absolute inset-0 rounded-full border border-[#00D4FF]/10 animate-[pulse_4s_ease-in-out_infinite]" />
                {/* Mid ring */}
                <div className="absolute inset-[12%] rounded-full border border-[#00D4FF]/15 animate-[pulse_3s_ease-in-out_infinite_0.5s]" />
                {/* Inner ring */}
                <div className="absolute inset-[24%] rounded-full border border-[#D4A017]/20 animate-[pulse_5s_ease-in-out_infinite_1s]" />
                {/* Glow disc */}
                <div className="absolute inset-[30%] rounded-full bg-[#00D4FF]/6 blur-[24px]" />
                {/* Logo */}
                <Image
                  src="/logo.png"
                  alt="Africa Monthly"
                  width={220}
                  height={220}
                  className="relative z-10 rounded-full drop-shadow-[0_0_48px_rgba(0,212,255,0.5)] animate-[pulse_6s_ease-in-out_infinite]"
                  priority
                />
                {/* Orbiting dot — cyan */}
                <div
                  className="absolute w-3 h-3 rounded-full bg-[#00D4FF] shadow-[0_0_12px_#00D4FF]"
                  style={{
                    top: '10%', left: '50%',
                    animation: 'spin 8s linear infinite',
                    transformOrigin: '0 170px',
                  }}
                />
              </div>
            </div>

            {/* RIGHT — Content */}
            <div>
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-[#00D4FF]/8 border border-[#00D4FF]/20 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse shadow-[0_0_6px_#00D4FF]" />
                <Trophy className="w-3.5 h-3.5 text-[#00D4FF]" />
                <span className="text-xs font-semibold text-[#00D4FF] uppercase tracking-widest">
                  {monthLabel} Competition · Live
                </span>
              </div>

              {/* Headline */}
              <h1
                className="font-serif font-bold leading-[1.05]"
                style={{ fontSize: 'clamp(2.8rem, 5.5vw, 5rem)' }}
              >
                <span className="text-white">Compete.</span>{' '}
                <span
                  className="italic text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)' }}
                >
                  Engage.
                </span>{' '}
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg, #D4A017 0%, #E8B94F 100%)' }}
                >
                  Win.
                </span>
              </h1>

              <p className="mt-6 text-lg text-white/50 leading-relaxed max-w-lg">
                The African community&apos;s monthly leaderboard powered by{' '}
                <span className="text-[#00D4FF]/80">Injective Chain</span>. 
                </p>
                <p>
                Complete tasks, chat on
                Telegram, participate in events </p>
                <p>
                Top 5 win exclusive rewards every month.
                </p>

              {/* CTAs */}
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/tasks">
                  <Button size="lg">
                    Start Earning <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link href="/leaderboard">
                  <Button variant="ghost" size="lg">
                    View Leaderboard
                  </Button>
                </Link>
              </div>

              {/* Stat chips */}
              <div className="mt-12 flex flex-wrap gap-3">
                {[
                  { icon: <Calendar className="w-4 h-4 text-[#00D4FF]" />, value: daysLeft.toString(), label: 'days left', glow: 'inj' },
                  { icon: <Trophy className="w-4 h-4 text-[#D4A017]" />, value: 'Top 5', label: 'rewarded', glow: 'gold' },
                  { icon: <DollarSign className="w-4 h-4 text-[#00D4FF]" fill="currentColor" />, value: 'Earn', label: 'Usd', glow: 'inj' },
                ].map((s) => (
                  <div
                    key={s.value}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/4 border border-white/8 hover:border-[#00D4FF]/30 hover:bg-white/6 transition-all duration-200 backdrop-blur-sm"
                  >
                    {s.icon}
                    <div>
                      <span className={`font-serif font-bold text-xl block leading-none ${s.glow === 'gold' ? 'text-[#D4A017]' : 'text-[#00D4FF]'}`}>{s.value}</span>
                      <span className="text-white/30 text-xs">{s.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute right-0 top-0 w-[40vw] h-[40vw] rounded-full bg-[#00D4FF]/4 blur-[100px]" />
        </div>
        {/* Section divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#00D4FF]/20 to-transparent mb-24" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-[#00D4FF]/6 border border-[#00D4FF]/15 backdrop-blur-sm">
              <span className="text-xs font-semibold text-[#00D4FF] uppercase tracking-widest">How It Works</span>
            </div>
            <h2 className="font-serif text-4xl font-bold text-white mb-3">Three steps to the top</h2>
            <p className="text-white/40 max-w-md mx-auto">Join the competition, earn points across multiple activities, and claim your reward.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <CheckCircle className="text-[#00D4FF] w-6 h-6" />,
                iconBg: 'bg-[#00D4FF]/10 border border-[#00D4FF]/20',
                step: '01',
                title: 'Connect Discord',
                desc: 'Sign in with Discord, then link your Telegram, X account, and wallet on your profile page.',
                accentColor: '#00D4FF',
                glowClass: 'hover:shadow-[0_0_30px_rgba(0,212,255,0.08)] hover:border-[#00D4FF]/30',
              },
              {
                icon: <Target className="text-[#D4A017] w-6 h-6" />,
                iconBg: 'bg-[#D4A017]/10 border border-[#D4A017]/20',
                step: '02',
                title: 'Complete Tasks',
                desc: 'Tasks drop regularly. Submit your proof link, points land instantly.',
                accentColor: '#D4A017',
                glowClass: 'hover:shadow-[0_0_30px_rgba(212,160,23,0.08)] hover:border-[#D4A017]/30',
              },
              {
                icon: <Trophy className="text-[#00D4FF] w-6 h-6" />,
                iconBg: 'bg-[#00D4FF]/10 border border-[#00D4FF]/20',
                step: '03',
                title: 'Climb & Win',
                desc: 'Stack points from tasks, Telegram chats, spaces, and workshops. Top 5 win every month.',
                accentColor: '#00D4FF',
                glowClass: 'hover:shadow-[0_0_30px_rgba(0,212,255,0.08)] hover:border-[#00D4FF]/30',
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`relative rounded-2xl p-8 transition-all duration-300 cursor-default overflow-hidden ${item.glowClass} bg-white/3 border border-white/6 backdrop-blur-sm hover:-translate-y-1`}
              >
                {/* Top glow line */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px]"
                  style={{ background: `linear-gradient(90deg, transparent, ${item.accentColor}60, transparent)` }}
                />
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-11 h-11 rounded-xl ${item.iconBg} flex items-center justify-center`}>
                    {item.icon}
                  </div>
                  <span className="font-serif font-bold text-5xl leading-none" style={{ color: `${item.accentColor}18` }}>
                    {item.step}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MINI LEADERBOARD ───────────────────────────────────── */}
      {topUsers.length > 0 && (
        <section className="py-28 relative overflow-hidden">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4A017]/20 to-transparent mb-24" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-0 w-[35vw] h-[35vw] rounded-full bg-[#D4A017]/4 blur-[100px]" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full bg-[#D4A017]/8 border border-[#D4A017]/20 backdrop-blur-sm">
                  <Users className="w-3.5 h-3.5 text-[#D4A017]" />
                  <span className="text-xs font-semibold text-[#D4A017] uppercase tracking-widest">Live Rankings</span>
                </div>
                <h2 className="font-serif text-4xl font-bold text-white">{monthLabel}</h2>
                <p className="text-white/40 mt-1">Current standings — {daysLeft} days remaining</p>
              </div>
              <Link href="/leaderboard">
                <Button variant="ghost" size="sm">
                  Full board <ArrowRight size={16} />
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
                const configs = [
                  { bar: 'bg-[#D4A017]', border: 'border-[#D4A017]/25', rank: 'text-[#D4A017]', glow: 'hover:shadow-[0_0_20px_rgba(212,160,23,0.1)]' },
                  { bar: 'bg-[#00D4FF]', border: 'border-[#00D4FF]/20', rank: 'text-[#00D4FF]', glow: 'hover:shadow-[0_0_20px_rgba(0,212,255,0.1)]' },
                  { bar: 'bg-amber-700', border: 'border-amber-700/20', rank: 'text-amber-600', glow: '' },
                  { bar: 'bg-white/10', border: 'border-white/5', rank: 'text-white/30', glow: '' },
                  { bar: 'bg-white/10', border: 'border-white/5', rank: 'text-white/30', glow: '' },
                ]
                const c = configs[i] ?? configs[3]
                return (
                  <div
                    key={u._id.toString()}
                    className={`flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-200 bg-white/3 border backdrop-blur-sm ${c.border} ${c.glow}`}
                  >
                    <div className={`w-1 h-9 rounded-full shrink-0 ${c.bar}`} />
                    <span className={`font-serif font-bold text-xl w-5 ${c.rank}`}>{i + 1}</span>
                    <Avatar src={u.discordAvatar} name={u.discordUsername} size="sm" />
                    <span className="flex-1 font-medium text-white/80 truncate">{u.discordUsername}</span>
                    <span className={`font-serif font-bold text-lg ${i === 0 ? 'text-[#D4A017]' : 'text-[#00D4FF]'}`}>
                      {formatPoints(u.monthlyPoints)}
                    </span>
                    <span className="text-xs text-white/20">pts</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#00D4FF]/20 to-transparent mb-24" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.06)_0%,transparent_70%)]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-[#00D4FF]/6 border border-[#00D4FF]/15 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse shadow-[0_0_6px_#00D4FF]" />
            <span className="text-xs font-semibold text-[#00D4FF] uppercase tracking-widest">Resets Monthly</span>
          </div>
          <h2 className="font-serif text-5xl font-bold text-white mb-5 leading-tight">
            Ready to{' '}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #00D4FF, #D4A017)' }}>
              compete?
            </span>
          </h2>
          <p className="text-white/40 text-lg mb-10 max-w-xl mx-auto">
            Every month is a fresh start. Join with Discord, connect your accounts, and start stacking points from day one.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/tasks">
              <Button size="lg">
                Get Started <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="outline" size="lg">
                View Rankings
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
