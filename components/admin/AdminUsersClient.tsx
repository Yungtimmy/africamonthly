'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Zap, Minus, X, Wallet, Copy, Check, AlertTriangle } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { formatPoints } from '@/lib/utils'

type Mode = 'grant' | 'deduct'

interface User {
  id: string
  discord_username: string
  discord_avatar?: string
  total_points: number
  monthly_points: number
  wallet_address?: string | null
}

function short(addr: string, head = 6, tail = 4): string {
  if (addr.length <= head + tail + 1) return addr
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`
}

function CopyChip({ icon, label, value, copyValue, accent }: { icon: React.ReactNode; label: string; value: string; copyValue?: string; accent: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        navigator.clipboard?.writeText(copyValue ?? value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      }}
      title={`${label}: ${copyValue ?? value} (click to copy)`}
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/4 border border-white/8 text-[11px] text-white/50 hover:text-white hover:border-white/20 transition-all max-w-[200px]"
    >
      <span className={accent}>{icon}</span>
      <span className="truncate">{value}</span>
      {copied ? <Check size={10} className="text-emerald-400 shrink-0" /> : <Copy size={10} className="opacity-0 group-hover:opacity-40 shrink-0" />}
    </button>
  )
}

function ConnectionChips({ user }: { user: User }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
      <CopyChip icon={<span className="text-[11px] font-bold leading-none">D</span>} label="Discord" value={user.discord_username} accent="text-[#5865F2]" />
      {user.wallet_address
        ? <CopyChip icon={<Wallet size={11} />} label="Wallet" value={short(user.wallet_address)} copyValue={user.wallet_address} accent="text-[#D4A017]" />
        : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/5 text-[11px] text-white/20"><Wallet size={11} /> —</span>}
    </div>
  )
}

export function AdminUsersClient({ initialUsers = [] }: { initialUsers?: User[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [searching, setSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [mode, setMode] = useState<Mode>('grant')
  const [points, setPoints] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSearch = useCallback(async () => {
    setSearching(true)
    try {
      const res = await fetch(`/api/users?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } finally {
      setSearching(false)
    }
  }, [query])

  function openModal(user: User, m: Mode) {
    setSelectedUser(user)
    setMode(m)
    setPoints('')
    setReason('')
    setError(null)
    setSuccess(null)
  }

  function closeModal() {
    setSelectedUser(null)
    setPoints('')
    setReason('')
    setError(null)
  }

  const maxDeduct = selectedUser
    ? Math.max(0, Math.min(selectedUser.monthly_points, selectedUser.total_points))
    : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUser) return
    const abs = Number(points)
    if (!Number.isFinite(abs) || abs <= 0) {
      setError('Enter a positive number of points.')
      return
    }
    if (mode === 'deduct' && abs > maxDeduct) {
      setError(
        maxDeduct === 0
          ? 'This user has no points left to deduct.'
          : `Cannot deduct ${abs} — maximum is ${maxDeduct} (${formatPoints(selectedUser.monthly_points)} monthly, ${formatPoints(selectedUser.total_points)} all-time).`
      )
      return
    }
    const signedDelta = mode === 'grant' ? abs : -abs
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/users/${selectedUser.id}/points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: signedDelta, reason }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        const verb = mode === 'grant' ? 'granted' : 'deducted'
        const sign = mode === 'grant' ? '+' : '−'
        setSuccess(`✓ ${abs} points ${verb} ${sign === '+' ? 'to' : 'from'} ${selectedUser.discord_username}`)
        setPoints('')
        setReason('')
        setUsers((prev) => prev.map((u) =>
          u.id === selectedUser.id
            ? {
                ...u,
                monthly_points: typeof data.monthly_points === 'number' ? data.monthly_points : u.monthly_points + signedDelta,
                total_points: typeof data.total_points === 'number' ? data.total_points : u.total_points + signedDelta,
              }
            : u
        ))
        setSelectedUser((prev) =>
          prev && prev.id === selectedUser.id
            ? {
                ...prev,
                monthly_points: typeof data.monthly_points === 'number' ? data.monthly_points : prev.monthly_points + signedDelta,
                total_points: typeof data.total_points === 'number' ? data.total_points : prev.total_points + signedDelta,
              }
            : prev
        )
        router.refresh()
      } else {
        setError(typeof data?.error === 'string' ? data.error : 'Request failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = 'w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:border-[#00D4FF]/40 focus:outline-none transition-all'

  const filteredUsers = query
    ? users.filter((u) => u.discord_username.toLowerCase().includes(query.toLowerCase()))
    : users

  const isDeduct = mode === 'deduct'

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by Discord username..."
            className="w-full bg-white/3 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:border-[#00D4FF]/40 focus:outline-none transition-all"
          />
        </div>
        <Button size="sm" onClick={handleSearch} disabled={searching}>
          {searching ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {/* User list */}
      <div className="space-y-2">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-start gap-2 sm:gap-4 bg-white/3 border border-white/8 rounded-xl px-3 sm:px-5 py-4 transition-all hover:border-[#00D4FF]/30 hover:bg-white/5"
          >
            <Avatar src={user.discord_avatar} name={user.discord_username} size="sm" />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-white">{user.discord_username}</span>
              <ConnectionChips user={user} />
            </div>
            <div className="text-right text-sm shrink-0">
              <p className="text-[#D4A017] font-bold">{formatPoints(user.monthly_points)} pts</p>
              <p className="text-white/30 text-xs">{formatPoints(user.total_points)} total</p>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0 self-center">
              <button
                onClick={() => openModal(user, 'grant')}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-[#D4A017]/10 border border-[#D4A017]/25 text-[11px] font-semibold text-[#D4A017] hover:bg-[#D4A017]/20 transition-colors cursor-pointer"
                title={`Grant points to ${user.discord_username}`}
              >
                <Zap size={11} /> Grant
              </button>
              <button
                onClick={() => openModal(user, 'deduct')}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/8 border border-red-500/25 text-[11px] font-semibold text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer"
                title={`Deduct points from ${user.discord_username}`}
              >
                <Minus size={11} /> Deduct
              </button>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <p className="text-center text-white/20 text-sm py-8">No users found.</p>
        )}
      </div>

      {/* Award Points Modal (Grant OR Deduct) */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-md rounded-2xl bg-[#0D1525] border border-white/10 p-5 sm:p-7 shadow-2xl">
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r ${
                isDeduct ? 'from-transparent via-red-500/60 to-transparent' : 'from-transparent via-[#D4A017]/60 to-transparent'
              }`}
            />

            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-start gap-3 min-w-0">
                <Avatar src={selectedUser.discord_avatar} name={selectedUser.discord_username} size="sm" />
                <div className="min-w-0">
                  <h3 className="font-serif text-lg font-semibold text-white truncate">{selectedUser.discord_username}</h3>
                  <p className="text-xs text-white/30">{formatPoints(selectedUser.monthly_points)} pts this month</p>
                  <ConnectionChips user={selectedUser} />
                </div>
              </div>
              <button onClick={closeModal} className="text-white/30 hover:text-white transition-colors p-1 shrink-0">
                <X size={18} />
              </button>
            </div>

            {/* Mode toggle */}
            {!success && (
              <div className="flex gap-1.5 mb-4 p-1 rounded-xl bg-white/3 border border-white/6">
                <button
                  type="button"
                  onClick={() => { setMode('grant'); setPoints(''); setError(null) }}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    !isDeduct
                      ? 'bg-[#D4A017]/20 text-[#D4A017] border border-[#D4A017]/30'
                      : 'text-white/40 hover:text-white/70 border border-transparent'
                  }`}
                >
                  <Zap size={12} /> Grant
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('deduct'); setPoints(''); setError(null) }}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isDeduct
                      ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                      : 'text-white/40 hover:text-white/70 border border-transparent'
                  }`}
                >
                  <Minus size={12} /> Deduct
                </button>
              </div>
            )}

            {success ? (
              <div className="text-center py-6 space-y-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                  isDeduct ? 'bg-red-500/10 border border-red-500/30' : 'bg-emerald-500/10 border border-emerald-500/30'
                }`}>
                  {isDeduct ? <Minus size={20} className="text-red-400" /> : <Zap size={20} className="text-emerald-400" />}
                </div>
                <p className={`font-medium ${isDeduct ? 'text-red-300' : 'text-emerald-400'}`}>{success}</p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="flex-1" onClick={closeModal}>Done</Button>
                  <Button size="sm" className="flex-1" onClick={() => setSuccess(null)}>
                    {isDeduct ? 'Deduct More' : 'Grant More'}
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                    isDeduct ? 'text-red-400' : 'text-[#D4A017]'
                  }`}>
                    {isDeduct ? 'Points to deduct' : 'Points to grant'}
                  </label>
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => { setPoints(e.target.value); setError(null) }}
                    placeholder={isDeduct ? 'e.g. 20' : 'e.g. 50'}
                    min={1}
                    max={isDeduct ? maxDeduct || undefined : undefined}
                    required
                    autoFocus
                    className={inputClass}
                  />
                  {isDeduct && (
                    <p className="text-[11px] text-white/30 mt-1.5">
                      Max deduction: <span className="text-red-300/90 font-semibold">{maxDeduct}</span>
                      {' '}(monthly {formatPoints(selectedUser.monthly_points)} · all-time {formatPoints(selectedUser.total_points)})
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                    Reason <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => { setReason(e.target.value); setError(null) }}
                    placeholder={isDeduct
                      ? 'e.g. Penalty: shared inappropriate content'
                      : 'e.g. Weekly community activity \u2014 42 messages'}
                    required
                    className={inputClass}
                  />
                  <p className="text-[11px] text-white/25 mt-1.5">
                    {'Required for accountability \u2014 visible on the public profile.'}
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25">
                    <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-300">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" size="sm" className="flex-1" onClick={closeModal}>Cancel</Button>
                  <Button
                    type="submit"
                    size="sm"
                    className={`flex-1 ${isDeduct ? '!bg-red-500/15 !border-red-500/40 !text-red-300 hover:!bg-red-500/25' : ''}`}
                    disabled={submitting || !points || !reason}
                  >
                    {submitting
                      ? (isDeduct ? 'Deducting...' : 'Granting...')
                      : (isDeduct
                          ? `Deduct ${points ? `−${points}` : ''} Points`
                          : `Grant ${points ? `+${points}` : ''} Points`)}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
