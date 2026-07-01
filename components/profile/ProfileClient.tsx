'use client'

import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatPoints, formatRelativeTime } from '@/lib/utils'
import { ExternalLink, Wallet, Trophy, TrendingUp, Hash, Sparkles, Flame, Crown, CheckCircle2, Medal, Lock, Award } from 'lucide-react'
import { KeplrConnect } from './KeplrConnect'

interface Submission {
  id: string
  proofUrl: string
  status: string
  pointsAwarded?: number
  createdAt: string | Date
  taskId: { title: string; points: number } | null
}

interface ProfileClientProps {
  user: {
    id: string
    discordUsername: string
    discordAvatar?: string
    walletAddress?: string
    totalPoints: number
    monthlyPoints: number
  }
  submissions: Submission[]
  rank: number
}

export function ProfileClient({ user, submissions, rank }: ProfileClientProps) {
  const [wallet, setWallet] = useState(user.walletAddress ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        const data = await res.json()
        setError(data.error ?? 'Failed to save')
      }
    } finally {
      setSaving(false)
    }
  }

  const approvedCount = submissions.filter((s) => s.status === 'approved').length

  const achievements = [
    { icon: Sparkles, label: 'First Point', desc: 'Earn your first point', unlocked: user.totalPoints >= 1, color: 'text-[#00D4FF]' },
    { icon: TrendingUp, label: 'Rising Star', desc: 'Reach 50 all-time points', unlocked: user.totalPoints >= 50, color: 'text-[#00D4FF]' },
    { icon: Trophy, label: 'Centurion', desc: 'Reach 100 all-time points', unlocked: user.totalPoints >= 100, color: 'text-[#D4A017]' },
    { icon: Flame, label: 'High Roller', desc: 'Reach 500 all-time points', unlocked: user.totalPoints >= 500, color: 'text-orange-400' },
    { icon: Crown, label: 'Legend', desc: 'Reach 1,000 all-time points', unlocked: user.totalPoints >= 1000, color: 'text-[#D4A017]' },
    { icon: TrendingUp, label: 'Monthly Momentum', desc: 'Earn 25 points this month', unlocked: user.monthlyPoints >= 25, color: 'text-[#00D4FF]' },
    { icon: CheckCircle2, label: 'Task Master', desc: 'Get 5 tasks approved', unlocked: approvedCount >= 5, color: 'text-emerald-400' },
    { icon: Medal, label: 'Podium Finish', desc: 'Rank in the top 3', unlocked: rank <= 3, color: 'text-[#D4A017]' },
  ]
  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-[#00D4FF]/4 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] rounded-full bg-[#D4A017]/3 blur-[100px]" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-6 sm:space-y-8">
        {/* Profile header */}
        <div className="relative rounded-2xl p-5 sm:p-8 overflow-hidden bg-white/3 border border-white/8 backdrop-blur-sm">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#00D4FF]/50 to-transparent" />
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative shrink-0">
              <Avatar src={user.discordAvatar} name={user.discordUsername} size="lg" />
              <div className="absolute inset-0 rounded-full ring-2 ring-[#00D4FF]/20 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white truncate">{user.discordUsername}</h1>
              <p className="text-white/40 text-sm mt-1">Rank <span className="text-[#00D4FF]">#{rank}</span> this month</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: 'Monthly pts', value: formatPoints(user.monthlyPoints), icon: <TrendingUp className="w-4 h-4 text-[#00D4FF]" />, color: 'text-[#00D4FF]' },
            { label: 'All-time pts', value: formatPoints(user.totalPoints), icon: <Trophy className="w-4 h-4 text-[#D4A017]" />, color: 'text-[#D4A017]' },
            { label: 'Current rank', value: `#${rank}`, icon: <Hash className="w-4 h-4 text-[#00D4FF]" />, color: 'text-[#00D4FF]' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-3 sm:p-5 text-center bg-white/3 border border-white/8 backdrop-blur-sm">
              <div className="flex justify-center mb-2">{stat.icon}</div>
              <p className={`font-serif font-bold text-lg sm:text-2xl ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-white/30 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Wallet */}
        <div className="rounded-2xl p-7 bg-white/3 border border-white/8 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-[#00D4FF]/40 to-transparent" />
          <h2 className="font-serif text-xl font-semibold text-white mb-2">Wallet</h2>
          <p className="text-xs text-white/35 mb-6">Connect your Injective wallet to receive rewards.</p>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                <Wallet size={13} /> Wallet address
              </label>
              <KeplrConnect currentAddress={wallet} onConnect={(addr) => setWallet(addr)} />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" disabled={saving} variant={saved ? 'outline' : 'primary'} size="sm">
              {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save Wallet'}
            </Button>
          </form>
        </div>

        {/* Achievements */}
        <div className="rounded-2xl p-7 bg-white/3 border border-white/8 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-[#D4A017]/40 to-transparent" />
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl font-semibold text-white flex items-center gap-2">
              <Award size={18} className="text-[#D4A017]" /> Achievements
            </h2>
            <span className="text-xs font-semibold text-white/40">{unlockedCount}/{achievements.length} unlocked</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {achievements.map((a) => {
              const Icon = a.unlocked ? a.icon : Lock
              return (
                <div
                  key={a.label}
                  title={a.desc}
                  className={`relative rounded-xl p-4 flex flex-col items-center text-center gap-2 border transition-all ${
                    a.unlocked
                      ? 'bg-white/4 border-white/10'
                      : 'bg-white/[0.015] border-white/5 opacity-50'
                  }`}
                >
                  <Icon size={22} className={a.unlocked ? a.color : 'text-white/30'} />
                  <p className={`text-xs font-semibold ${a.unlocked ? 'text-white' : 'text-white/40'}`}>{a.label}</p>
                  <p className="text-[10px] text-white/30 leading-tight">{a.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Submission history */}
        <div>
          <h2 className="font-serif text-xl font-semibold text-white mb-5">Submission History</h2>
          {submissions.length === 0 ? (
            <p className="text-white/20 text-sm py-8 text-center">No submissions yet.</p>
          ) : (
            <div className="space-y-2">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-2xl p-4 flex items-center gap-4 bg-white/3 border border-white/6 backdrop-blur-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">
                      {sub.taskId?.title ?? 'Task removed'}
                    </p>
                    <p className="text-xs text-white/25 mt-0.5">{formatRelativeTime(sub.createdAt)}</p>
                  </div>
                  <a href={sub.proofUrl} target="_blank" rel="noopener noreferrer" className="text-white/25 hover:text-[#00D4FF] transition-colors" aria-label="View proof">
                    <ExternalLink size={14} />
                  </a>
                  <Badge variant={sub.status as 'pending' | 'approved' | 'rejected'}>{sub.status}</Badge>
                  {sub.status === 'approved' && sub.pointsAwarded && (
                    <Badge variant="points">+{sub.pointsAwarded}</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}