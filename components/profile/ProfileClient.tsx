'use client'

import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatPoints, formatRelativeTime } from '@/lib/utils'
import { ExternalLink, MessageCircle, Wallet, XIcon } from 'lucide-react'

interface Submission {
  _id: { toString(): string }
  proofUrl: string
  status: string
  pointsAwarded?: number
  createdAt: string | Date
  taskId: { title: string; points: number } | null
}

interface ProfileClientProps {
  user: {
    _id: { toString(): string }
    discordUsername: string
    discordAvatar?: string
    telegram?: { username: string; chatCount: number }
    twitter?: string
    walletAddress?: string
    totalPoints: number
    monthlyPoints: number
  }
  submissions: Submission[]
  rank: number
}

export function ProfileClient({ user, submissions, rank }: ProfileClientProps) {
  const [telegram, setTelegram] = useState(user.telegram?.username ?? '')
  const [twitter, setTwitter] = useState(user.twitter ?? '')
  const [wallet, setWallet] = useState(user.walletAddress ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram, twitter, wallet }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const chatCount = user.telegram?.chatCount ?? 0
  const telegramPoints = Math.floor(chatCount / 10)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-5">
        <Avatar src={user.discordAvatar} name={user.discordUsername} size="lg" />
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#F5F0E8]">{user.discordUsername}</h1>
          <p className="text-[#A09070] text-sm">Rank #{rank} this month</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Monthly points', value: formatPoints(user.monthlyPoints) },
          { label: 'All-time points', value: formatPoints(user.totalPoints) },
          { label: 'Current rank', value: `#${rank}` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 text-center"
          >
            <p className="font-serif font-bold text-[#D4A017] text-2xl">{stat.value}</p>
            <p className="text-xs text-[#A09070] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Telegram points tracker */}
      {user.telegram?.username && (
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#D4A017]/10 flex items-center justify-center shrink-0">
            <MessageCircle className="text-[#D4A017] w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#F5F0E8]">Telegram Activity</p>
            <p className="text-xs text-[#A09070] mt-0.5">
              {chatCount} messages tracked → {telegramPoints} points earned
            </p>
            <div className="mt-2 h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D4A017] rounded-full transition-all"
                style={{ width: `${Math.min(100, (chatCount % 10) * 10)}%` }}
              />
            </div>
            <p className="text-xs text-[#5A5040] mt-1">{10 - (chatCount % 10)} more chats until next point</p>
          </div>
        </div>
      )}

      {/* Connect socials */}
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
        <h2 className="font-serif text-xl font-semibold text-[#F5F0E8] mb-5">Connect Accounts</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#A09070] mb-2">
              <MessageCircle size={14} /> Telegram username
            </label>
            <input
              type="text"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="@yourname"
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-[#F5F0E8] text-sm placeholder:text-[#5A5040] focus:border-[#D4A017]/60 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#A09070] mb-2">
              <XIcon size={14} /> X (Twitter) handle
            </label>
            <input
              type="text"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="@yourhandle"
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-[#F5F0E8] text-sm placeholder:text-[#5A5040] focus:border-[#D4A017]/60 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#A09070] mb-2">
              <Wallet size={14} /> Wallet address
            </label>
            <input
              type="text"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="0x..."
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-[#F5F0E8] text-sm placeholder:text-[#5A5040] focus:border-[#D4A017]/60 focus:outline-none transition-colors font-mono text-xs"
            />
          </div>
          <Button type="submit" disabled={saving} size="sm">
            {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save Accounts'}
          </Button>
        </form>
      </div>

      {/* Submission history */}
      <div>
        <h2 className="font-serif text-xl font-semibold text-[#F5F0E8] mb-4">Submission History</h2>
        {submissions.length === 0 ? (
          <p className="text-[#5A5040] text-sm">No submissions yet.</p>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => (
              <div
                key={sub._id.toString()}
                className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#F5F0E8] truncate">
                    {sub.taskId?.title ?? 'Task removed'}
                  </p>
                  <p className="text-xs text-[#5A5040] mt-0.5">
                    {formatRelativeTime(sub.createdAt)}
                  </p>
                </div>
                <a
                  href={sub.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#A09070] hover:text-[#D4A017] transition-colors"
                  aria-label="View proof"
                >
                  <ExternalLink size={14} />
                </a>
                <Badge
                  variant={sub.status as 'pending' | 'approved' | 'rejected'}
                >
                  {sub.status}
                </Badge>
                {sub.status === 'approved' && sub.pointsAwarded && (
                  <Badge variant="points">+{sub.pointsAwarded}</Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
