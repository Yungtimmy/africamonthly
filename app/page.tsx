import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Trophy, CheckCircle, DollarSign, ArrowRight, Users, Target, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { Avatar } from '@/components/ui/Avatar'
import { getDaysUntilEndOfMonth, getCurrentMonthLabel, formatPoints } from '@/lib/utils'
import { auth } from '@/lib/auth'

async function getTopUsers() {
  try {
    const { data } = await supabase
      .from('users')
      .select('id, discord_username, discord_avatar, monthly_points')
      .order('monthly_points', { ascending: false })
      .limit(5)
    return data ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const session = await auth()
  if (session?.user) redirect('/tasks')

  const topUsers = await getTopUsers()
  const daysLeft = getDaysUntilEndOfMonth()
  const monthLabel = getCurrentMonthLabel()

  return (
    <div className="relative">

      {/* ── CINEMATIC HERO ─────────────────────────────────────── */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden hero-cinematic">
        {/* Letterbox bars */}
        <div className="absolute top-0 inset-x-0 z-20 hero-letterbox-top" />
        <div className="absolute bottom-0 inset-x-0 z-20 hero-letterbox-bottom" />

        {/* Atmospheric layers */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 hero-spotlight" />
          <div className="absolute inset-0 hero-film-grain" />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 28%, rgba(10,15,30,0.55) 65%, #050810 100%)',
            }}
          />
          {/* Light sweep */}
          <div
            className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[55vw] h-[65vh] hero-light-sweep pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 35%, rgba(0,212,255,0.07) 50%, transparent 65%)',
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center pt-16 pb-24 sm:pb-28">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 mb-8 sm:mb-10 px-4 py-2 rounded-full bg-black/30 border border-white/10 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse shadow-[0_0_6px_#00D4FF]" />
            <Trophy className="w-3.5 h-3.5 text-[#00D4FF]" />
            <span className="text-[10px] sm:text-xs font-semibold text-white/60 uppercase tracking-[0.2em]">
              {monthLabel} · Live
            </span>
          </div>

          {/* Logo — cinematic centerpiece */}
          <div className="relative w-full flex justify-center mb-10 sm:mb-14">
            {/* Stage pedestal */}
            <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2 w-[min(90vw,520px)] h-24 hero-stage-glow" />
            <div
              className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-[min(72vw,400px)] h-[1px]"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5), rgba(212,160,23,0.35), transparent)' }}
            />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[min(60vw,340px)] h-16 rounded-[100%] bg-[#00D4FF]/[0.04] blur-2xl" />

            <div className="relative hero-logo-float">
              {/* Halo rings */}
              <div className="absolute inset-[-18%] rounded-full border border-[#00D4FF]/10" />
              <div className="absolute inset-[-10%] rounded-full border border-white/[0.06]" />
              {/* Pulsing glow behind logo */}
              <div className="absolute inset-[-5%] rounded-full bg-[#00D4FF]/20 blur-[60px] hero-logo-glow" />
              <div className="absolute inset-[5%] rounded-full bg-[#D4A017]/10 blur-[40px]" />

              <Image
                src="/logo.png"
                alt="Africa Monthly"
                width={480}
                height={480}
                className="relative z-10 w-[min(68vw,280px)] sm:w-[min(52vw,360px)] lg:w-[420px] h-auto rounded-full drop-shadow-[0_0_80px_rgba(0,212,255,0.45),0_24px_80px_rgba(0,0,0,0.6)]"
                priority
              />

              {/* Floor reflection */}
              <div
                className="absolute top-full left-1/2 mt-2 w-[min(68vw,280px)] sm:w-[min(52vw,360px)] lg:w-[420px] h-16 overflow-hidden opacity-25 pointer-events-none"
                style={{
                  transform: 'translateX(-50%) scaleY(-1)',
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.35), transparent)',
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.35), transparent)',
                }}
                aria-hidden
              >
                <Image
                  src="/logo.png"
                  alt=""
                  width={480}
                  height={480}
                  className="w-full h-auto rounded-full blur-[2px]"
                />
              </div>
            </div>
          </div>

          {/* Product title */}
          <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.35em] text-white/35 mb-4">
            Africa Monthly
          </p>

          <h1
            className="font-serif font-bold leading-[1.08] max-w-3xl"
            style={{ fontSize: 'clamp(2.2rem, 6vw, 4.25rem)' }}
          >
            <span className="text-white/95">Compete.</span>{' '}
            <span
              className="italic text-transparent bg-clip-text text-glow-inj"
              style={{ backgroundImage: 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)' }}
            >
              Engage.
            </span>{' '}
            <span
              className="text-transparent bg-clip-text text-glow-gold"
              style={{ backgroundImage: 'linear-gradient(135deg, #D4A017 0%, #E8B94F 100%)' }}
            >
              Win.
            </span>
          </h1>

          <p className="mt-5 sm:mt-6 text-sm sm:text-lg text-white/45 leading-relaxed max-w-xl mx-auto">
            The African community&apos;s monthly leaderboard on{' '}
            <span className="text-[#00D4FF]/75">Injective</span>.
            Complete tasks, stay active in the community, climb the ranks — top 5 win every month.
          </p>

          {/* CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-wrap gap-3 sm:gap-4 justify-center">
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
          <div className="mt-10 sm:mt-14 flex flex-wrap gap-3 justify-center">
            {[
              { icon: <Calendar className="w-4 h-4 text-[#00D4FF]" />, value: daysLeft.toString(), label: 'days left', glow: 'inj' },
              { icon: <Trophy className="w-4 h-4 text-[#D4A017]" />, value: 'Top 5', label: 'rewarded', glow: 'gold' },
              { icon: <DollarSign className="w-4 h-4 text-[#00D4FF]" fill="currentColor" />, value: 'Earn', label: 'USD', glow: 'inj' },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-black/25 border border-white/[0.08] hover:border-[#00D4FF]/25 transition-all duration-300 backdrop-blur-md"
              >
                {s.icon}
                <div className="text-left">
                  <span className={`font-serif font-bold text-lg sm:text-xl block leading-none ${s.glow === 'gold' ? 'text-[#D4A017]' : 'text-[#00D4FF]'}`}>
                    {s.value}
                  </span>
                  <span className="text-white/30 text-[10px] sm:text-xs uppercase tracking-wider">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-30">
          <span className="text-[10px] uppercase tracking-[0.25em] text-white/50">Scroll</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────── */}
      <section className="py-16 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute right-0 top-0 w-[40vw] h-[40vw] rounded-full bg-[#00D4FF]/4 blur-[100px]" />
        </div>
        {/* Section divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#00D4FF]/20 to-transparent mb-24" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10 sm:mb-16 text-center">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-[#00D4FF]/6 border border-[#00D4FF]/15 backdrop-blur-sm">
              <span className="text-xs font-semibold text-[#00D4FF] uppercase tracking-widest">How It Works</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white mb-3">Three steps to the top</h2>
            <p className="text-white/40 max-w-md mx-auto">Join the competition, earn points across multiple activities, and claim your reward.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <CheckCircle className="text-[#00D4FF] w-6 h-6" />,
                iconBg: 'bg-[#00D4FF]/10 border border-[#00D4FF]/20',
                step: '01',
                title: 'Connect Discord',
                desc: 'Sign in with Discord, then add your Injective wallet on your profile page.',
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
                desc: 'Stack points from tasks, weekly community activity, spaces, and workshops. Top 5 win every month.',
                accentColor: '#00D4FF',
                glowClass: 'hover:shadow-[0_0_30px_rgba(0,212,255,0.08)] hover:border-[#00D4FF]/30',
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`relative rounded-2xl p-5 sm:p-8 transition-all duration-300 cursor-default overflow-hidden ${item.glowClass} bg-white/3 border border-white/6 backdrop-blur-sm hover:-translate-y-1`}
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
        <section className="py-16 sm:py-28 relative overflow-hidden">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4A017]/20 to-transparent mb-24" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-0 w-[35vw] h-[35vw] rounded-full bg-[#D4A017]/4 blur-[100px]" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between gap-4 mb-8 sm:mb-12">
              <div>
                <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full bg-[#D4A017]/8 border border-[#D4A017]/20 backdrop-blur-sm">
                  <Users className="w-3.5 h-3.5 text-[#D4A017]" />
                  <span className="text-xs font-semibold text-[#D4A017] uppercase tracking-widest">Live Rankings</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white">{monthLabel}</h2>
                <p className="text-white/40 mt-1">Current standings — {daysLeft} days remaining</p>
              </div>
              <Link href="/leaderboard">
                <Button variant="ghost" size="sm">
                  Full board <ArrowRight size={16} />
                </Button>
              </Link>
            </div>

            <div className="space-y-3 max-w-2xl">
              {topUsers.map((u: { id: string; discord_username: string; discord_avatar: string; monthly_points: number }, i: number) => {
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
                    key={u.id}
                    className={`flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-200 bg-white/3 border backdrop-blur-sm ${c.border} ${c.glow}`}
                  >
                    <div className={`w-1 h-9 rounded-full shrink-0 ${c.bar}`} />
                    <span className={`font-serif font-bold text-xl w-5 ${c.rank}`}>{i + 1}</span>
                    <Avatar src={u.discord_avatar} name={u.discord_username} size="sm" />
                    <span className="flex-1 font-medium text-white/80 truncate">{u.discord_username}</span>
                    <span className={`font-serif font-bold text-lg ${i === 0 ? 'text-[#D4A017]' : 'text-[#00D4FF]'}`}>
                      {formatPoints(u.monthly_points)}
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
      <section className="py-16 sm:py-28 relative overflow-hidden">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#00D4FF]/20 to-transparent mb-24" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.06)_0%,transparent_70%)]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-[#00D4FF]/6 border border-[#00D4FF]/15 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse shadow-[0_0_6px_#00D4FF]" />
            <span className="text-xs font-semibold text-[#00D4FF] uppercase tracking-widest">Resets Monthly</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-5 leading-tight">
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
