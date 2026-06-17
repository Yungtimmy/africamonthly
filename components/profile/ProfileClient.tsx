'use client'

import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatPoints, formatRelativeTime } from '@/lib/utils'
import { ExternalLink, MessageCircle, Wallet, XIcon, Trophy, TrendingUp, Hash } from 'lucide-react'
import { KeplrConnect } from './KeplrConnect'
import { TelegramLogin } from './TelegramLogin'

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
    telegramId?: string
    telegramChatCount: number
    twitter?: string
    walletAddress?: string
    totalPoints: number
    monthlyPoints: number
  }
  submissions: Submission[]
  rank: number
}

const inputClass = 'w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:border-[#00D4FF]/40 focus:outline-none focus:bg-white/6 transition-all duration-200'

export function ProfileClient({ user, submissions, rank }: ProfileClientProps) {
  const [telegramId, setTelegramId] = useState(user.telegramId ?? '')
  const [telegramConnected, setTelegramConnected] = useState(!!user.telegramId)
  const [telegramName, setTelegramName] = useState<string | undefined>(undefined)
  const [twitter, setTwitter] = useState(user.twitter ?? '')
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
        body: JSON.stringify({ telegramId, twitter, wallet }),
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

  const chatCount = user.telegramChatCount ?? 0
  const telegramPoints = Math.floor(chatCount / 10)
  const nextPointIn = 10 - (chatCount % 10)

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

        {/* Telegram tracker */}
        {user.telegramId && (
          <div className="rounded-2xl p-5 flex items-center gap-4 bg-white/3 border border-white/8 backdrop-blur-sm">
            <div className="w-11 h-11 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center shrink-0">
              <MessageCircle className="text-[#00D4FF] w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Telegram Activity</p>
              <p className="text-xs text-white/30 mt-0.5">
                {chatCount} messages → <span className="text-[#00D4FF]">{telegramPoints} points earned</span>
              </p>
              <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00D4FF] rounded-full transition-all shadow-[0_0_6px_rgba(0,212,255,0.6)]"
                  style={{ width: `${Math.min(100, (chatCount % 10) * 10)}%` }}
                />
              </div>
              <p className="text-xs text-white/20 mt-1">{nextPointIn} more message{nextPointIn !== 1 ? 's' : ''} until next point</p>
            </div>
          </div>
        )}

        {/* Connect socials */}
        <div className="rounded-2xl p-7 bg-white/3 border border-white/8 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-[#00D4FF]/40 to-transparent" />
          <h2 className="font-serif text-xl font-semibold text-white mb-6">Connect Accounts</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                <MessageCircle size={13} /> Telegram
              </label>
              <TelegramLogin
                botName={process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME ?? 'YourBotName'}
                connected={telegramConnected}
                connectedName={telegramName}
                onAuth={async (tgUser) => {
                  const res = await fetch('/api/telegram/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(tgUser),
                  })
                  if (res.ok) {
                    const data = await res.json()
                    setTelegramId(data.telegramId)
                    setTelegramConnected(true)
                    setTelegramName(data.displayName)
                  }
                }}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                <XIcon size={13} /> X handle
              </label>
              <input type="text" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="@yourhandle" className={inputClass} />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                <Wallet size={13} /> Wallet address
              </label>
              <KeplrConnect currentAddress={wallet} onConnect={(addr) => setWallet(addr)} />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" disabled={saving} variant={saved ? 'outline' : 'primary'} size="sm">
              {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save Accounts'}
            </Button>
          </form>
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
