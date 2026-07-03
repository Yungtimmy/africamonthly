'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatPoints, formatRelativeTime } from '@/lib/utils'
import {
  ExternalLink,
  Wallet,
  Trophy,
  TrendingUp,
  Hash,
  LogOut,
  ChevronRight,
  ListChecks,
} from 'lucide-react'

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

const inputClass =
  'w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3.5 text-white text-sm font-mono placeholder:text-white/25 placeholder:font-sans focus:border-[#00D4FF]/45 focus:outline-none focus:bg-white/6 transition-all min-h-[48px]'

export function ProfileClient({ user, submissions, rank }: ProfileClientProps) {
  const [wallet, setWallet] = useState(user.walletAddress ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSaveWallet(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const trimmed = wallet.trim()
    if (trimmed && !/^inj1[a-z0-9]{38,}$/i.test(trimmed)) {
      setError('Enter a valid Injective address (starts with inj1).')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: trimmed }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        const data = await res.json()
        setError(data.error ?? 'Failed to save wallet')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative min-h-screen pb-10">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] rounded-full bg-[#00D4FF]/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[35vw] h-[35vw] rounded-full bg-[#D4A017]/4 blur-[100px]" />
      </div>

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-5 sm:space-y-6">
        <div className="text-center sm:text-left">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#00D4FF]/70 mb-2">
            Your dashboard
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">Profile</h1>
        </div>

        {/* Identity */}
        <section className="rounded-2xl p-5 sm:p-6 bg-white/3 border border-white/8 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Avatar src={user.discordAvatar} name={user.discordUsername} size="lg" />
              <div className="min-w-0 text-left">
                <p className="font-semibold text-white text-lg truncate">{user.discordUsername}</p>
                <p className="text-sm text-white/40 mt-0.5">
                  Rank <span className="text-[#00D4FF] font-medium">#{rank}</span> this month
                </p>
              </div>
            </div>
            <Link
              href="/tasks"
              className="sm:ml-auto inline-flex items-center justify-center gap-1.5 text-sm text-white/50 hover:text-[#00D4FF] transition-colors min-h-[44px]"
            >
              <ListChecks size={16} /> View tasks <ChevronRight size={14} />
            </Link>
          </div>
        </section>

        {/* Points */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="col-span-2 sm:col-span-1 rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-[#00D4FF]/12 to-transparent border border-[#00D4FF]/25">
            <div className="flex items-center gap-2 text-[#00D4FF] mb-2">
              <TrendingUp size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">This month</span>
            </div>
            <p className="font-serif font-bold text-4xl sm:text-5xl text-white">{formatPoints(user.monthlyPoints)}</p>
            <p className="text-xs text-white/35 mt-1">Monthly points</p>
          </div>
          <div className="rounded-2xl p-5 sm:p-6 bg-white/3 border border-white/8">
            <div className="flex items-center gap-2 text-[#D4A017] mb-2">
              <Trophy size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">All-time</span>
            </div>
            <p className="font-serif font-bold text-2xl sm:text-3xl text-white">{formatPoints(user.totalPoints)}</p>
            <p className="text-xs text-white/35 mt-1">Total earned</p>
          </div>
          <div className="rounded-2xl p-5 sm:p-6 bg-white/3 border border-white/8">
            <div className="flex items-center gap-2 text-[#00D4FF] mb-2">
              <Hash size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Standing</span>
            </div>
            <p className="font-serif font-bold text-2xl sm:text-3xl text-white">#{rank}</p>
            <p className="text-xs text-white/35 mt-1">Current rank</p>
          </div>
        </section>

        {/* Wallet */}
        <section className="rounded-2xl p-5 sm:p-6 bg-white/3 border border-white/8 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={18} className="text-[#D4A017]" />
            <h2 className="font-serif text-lg font-semibold text-white">Injective wallet</h2>
          </div>
          <p className="text-sm text-white/40 mb-5">
            Paste your wallet address for monthly reward payouts.
          </p>
          <form onSubmit={handleSaveWallet} className="space-y-4">
            <div>
              <label htmlFor="wallet" className="sr-only">
                Injective wallet address
              </label>
              <input
                id="wallet"
                type="text"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder="inj1..."
                autoComplete="off"
                spellCheck={false}
                className={inputClass}
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" disabled={saving} variant={saved ? 'outline' : 'primary'} className="w-full sm:w-auto" size="md">
              {saved ? '✓ Wallet saved' : saving ? 'Saving...' : 'Save wallet'}
            </Button>
          </form>
        </section>

        {/* Sign out */}
        <section className="rounded-2xl p-5 sm:p-6 bg-white/[0.02] border border-white/6">
          <h2 className="font-serif text-lg font-semibold text-white mb-2">Discord account</h2>
          <p className="text-sm text-white/40 mb-4">
            Signed in as <span className="text-white/70">{user.discordUsername}</span>
          </p>
          <Button
            type="button"
            variant="outline"
            size="md"
            className="w-full sm:w-auto"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut size={16} /> Sign out of Discord
          </Button>
        </section>

        {/* Submissions */}
        <section>
          <h2 className="font-serif text-lg font-semibold text-white mb-4">Recent submissions</h2>
          {submissions.length === 0 ? (
            <div className="rounded-2xl py-10 px-4 text-center bg-white/2 border border-white/6 border-dashed">
              <p className="text-white/30 text-sm">No submissions yet.</p>
              <Link href="/tasks" className="inline-block mt-3 text-sm text-[#00D4FF] hover:underline">
                Browse tasks →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {submissions.slice(0, 8).map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-xl p-4 flex items-center gap-3 bg-white/3 border border-white/6 min-h-[56px]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/85 truncate">
                      {sub.taskId?.title ?? 'Task removed'}
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">{formatRelativeTime(sub.createdAt)}</p>
                  </div>
                  <a
                    href={sub.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-white/30 hover:text-[#00D4FF] transition-colors"
                    aria-label="View proof"
                  >
                    <ExternalLink size={15} />
                  </a>
                  <Badge variant={sub.status as 'pending' | 'approved' | 'rejected'}>{sub.status}</Badge>
                  {sub.status === 'approved' && sub.pointsAwarded != null && (
                    <Badge variant="points">+{sub.pointsAwarded}</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}