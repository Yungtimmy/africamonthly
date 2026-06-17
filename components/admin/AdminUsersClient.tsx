'use client'

import { useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { formatPoints } from '@/lib/utils'

interface User {
  _id: { toString(): string }
  discordUsername: string
  discordAvatar?: string
  totalPoints: number
  monthlyPoints: number
}

interface GrantForm {
  points: string
  reason: string
}

export function AdminUsersClient() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [grant, setGrant] = useState<GrantForm>({ points: '', reason: '' })
  const [granting, setGranting] = useState(false)
  const [grantSuccess, setGrantSuccess] = useState<string | null>(null)

  const handleSearch = useCallback(async () => {
    setSearching(true)
    try {
      const res = await fetch(`/api/users?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setUsers(data)
    } finally {
      setSearching(false)
    }
  }, [query])

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUser) return
    setGranting(true)
    try {
      const res = await fetch(`/api/users/${selectedUser._id.toString()}/points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: Number(grant.points), reason: grant.reason }),
      })
      if (res.ok) {
        setGrantSuccess(`${grant.points} points granted to ${selectedUser.discordUsername}`)
        setGrant({ points: '', reason: '' })
        setSelectedUser(null)
        setTimeout(() => setGrantSuccess(null), 4000)
      }
    } finally {
      setGranting(false)
    }
  }

  return (
    <div className="space-y-6">
      {grantSuccess && (
        <div className="bg-emerald-900/30 border border-emerald-700/50 text-emerald-300 rounded-xl px-4 py-3 text-sm">
          ✓ {grantSuccess}
        </div>
      )}

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A5040]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by Discord username..."
            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg pl-9 pr-4 py-2.5 text-[#F5F0E8] text-sm placeholder:text-[#5A5040] focus:border-[#D4A017]/60 focus:outline-none"
          />
        </div>
        <Button size="sm" onClick={handleSearch} disabled={searching}>
          {searching ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {/* User list */}
      {users.length > 0 && (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user._id.toString()}
              className={`flex items-center gap-4 bg-[#111111] border rounded-xl px-5 py-4 cursor-pointer transition-colors ${
                selectedUser?._id.toString() === user._id.toString()
                  ? 'border-[#D4A017]/50 bg-[#D4A017]/5'
                  : 'border-[#2A2A2A] hover:border-[#D4A017]/30'
              }`}
              onClick={() => setSelectedUser(selectedUser?._id.toString() === user._id.toString() ? null : user)}
            >
              <Avatar src={user.discordAvatar} name={user.discordUsername} size="sm" />
              <span className="flex-1 font-medium text-[#F5F0E8]">{user.discordUsername}</span>
              <div className="text-right text-sm">
                <p className="text-[#D4A017] font-bold">{formatPoints(user.monthlyPoints)} pts</p>
                <p className="text-[#5A5040] text-xs">{formatPoints(user.totalPoints)} total</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grant form */}
      {selectedUser && (
        <form
          onSubmit={handleGrant}
          className="bg-[#111111] border border-[#D4A017]/30 rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <Avatar src={selectedUser.discordAvatar} name={selectedUser.discordUsername} size="sm" />
            <h3 className="font-serif text-lg font-semibold text-[#F5F0E8]">
              Grant Points to {selectedUser.discordUsername}
            </h3>
          </div>
          <div>
            <label htmlFor="grant-points" className="block text-sm text-[#A09070] mb-1.5">
              Points to grant
            </label>
            <input
              id="grant-points"
              type="number"
              value={grant.points}
              onChange={(e) => setGrant((f) => ({ ...f, points: e.target.value }))}
              placeholder="50"
              min={1}
              required
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-[#F5F0E8] text-sm placeholder:text-[#5A5040] focus:border-[#D4A017]/60 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="grant-reason" className="block text-sm text-[#A09070] mb-1.5">
              Reason
            </label>
            <input
              id="grant-reason"
              type="text"
              value={grant.reason}
              onChange={(e) => setGrant((f) => ({ ...f, reason: e.target.value }))}
              placeholder="e.g. Twitter Space participation"
              required
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-[#F5F0E8] text-sm placeholder:text-[#5A5040] focus:border-[#D4A017]/60 focus:outline-none"
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={granting}>
              {granting ? 'Granting...' : 'Grant Points'}
            </Button>
          </div>
        </form>
      )}

      {users.length === 0 && !searching && (
        <p className="text-center text-[#5A5040] text-sm py-8">
          Search for a user by Discord username to grant points.
        </p>
      )}
    </div>
  )
}
