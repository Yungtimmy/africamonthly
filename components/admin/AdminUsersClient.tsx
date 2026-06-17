'use client'

import { useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { formatPoints } from '@/lib/utils'

interface User {
  id: string
  discord_username: string
  discord_avatar?: string
  total_points: number
  monthly_points: number
}

interface GrantForm {
  points: string
  reason: string
}

export function AdminUsersClient({ initialUsers = [] }: { initialUsers?: User[] }) {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<User[]>(initialUsers)
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
      setUsers(Array.isArray(data) ? data : [])
    } finally {
      setSearching(false)
    }
  }, [query])

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUser) return
    setGranting(true)
    try {
      const res = await fetch(`/api/users/${selectedUser.id}/points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: Number(grant.points), reason: grant.reason }),
      })
      if (res.ok) {
        setGrantSuccess(`${grant.points} points granted to ${selectedUser.discord_username}`)
        setGrant({ points: '', reason: '' })
        setSelectedUser(null)
        setTimeout(() => setGrantSuccess(null), 4000)
      }
    } finally {
      setGranting(false)
    }
  }

  const inputClass = 'w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:border-[#00D4FF]/40 focus:outline-none transition-all'

  return (
    <div className="space-y-6">
      {grantSuccess && (
        <div className="bg-emerald-900/30 border border-emerald-700/50 text-emerald-300 rounded-xl px-4 py-3 text-sm">
          ✓ {grantSuccess}
        </div>
      )}

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

      {users.length > 0 && (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className={`flex items-center gap-4 bg-white/3 border rounded-xl px-5 py-4 cursor-pointer transition-all ${
                selectedUser?.id === user.id
                  ? 'border-[#D4A017]/50 bg-[#D4A017]/5'
                  : 'border-white/8 hover:border-[#D4A017]/30'
              }`}
              onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
            >
              <Avatar src={user.discord_avatar} name={user.discord_username} size="sm" />
              <span className="flex-1 font-medium text-white">{user.discord_username}</span>
              <div className="text-right text-sm">
                <p className="text-[#D4A017] font-bold">{formatPoints(user.monthly_points)} pts</p>
                <p className="text-white/30 text-xs">{formatPoints(user.total_points)} total</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedUser && (
        <form
          onSubmit={handleGrant}
          className="bg-white/3 border border-[#D4A017]/30 rounded-2xl p-6 space-y-4 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <Avatar src={selectedUser.discord_avatar} name={selectedUser.discord_username} size="sm" />
            <h3 className="font-serif text-lg font-semibold text-white">
              Grant Points to {selectedUser.discord_username}
            </h3>
          </div>
          <div>
            <label htmlFor="grant-points" className="block text-sm text-white/40 mb-1.5">Points to grant</label>
            <input
              id="grant-points"
              type="number"
              value={grant.points}
              onChange={(e) => setGrant((f) => ({ ...f, points: e.target.value }))}
              placeholder="50"
              min={1}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="grant-reason" className="block text-sm text-white/40 mb-1.5">Reason</label>
            <input
              id="grant-reason"
              type="text"
              value={grant.reason}
              onChange={(e) => setGrant((f) => ({ ...f, reason: e.target.value }))}
              placeholder="e.g. Twitter Space participation"
              required
              className={inputClass}
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setSelectedUser(null)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={granting}>
              {granting ? 'Granting...' : 'Grant Points'}
            </Button>
          </div>
        </form>
      )}

      {users.length === 0 && !searching && query && (
        <p className="text-center text-white/20 text-sm py-8">
          No users found for &quot;{query}&quot;.
        </p>
      )}
    </div>
  )
}
