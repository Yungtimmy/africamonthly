'use client'

import { useState, useCallback } from 'react'
import { Search, Zap, X } from 'lucide-react'
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

export function AdminUsersClient({ initialUsers = [] }: { initialUsers?: User[] }) {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [searching, setSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [points, setPoints] = useState('')
  const [reason, setReason] = useState('')
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

  function openModal(user: User) {
    setSelectedUser(user)
    setPoints('')
    setReason('')
    setGrantSuccess(null)
  }

  function closeModal() {
    setSelectedUser(null)
    setPoints('')
    setReason('')
  }

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUser) return
    setGranting(true)
    try {
      const res = await fetch(`/api/users/${selectedUser.id}/points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: Number(points), reason }),
      })
      if (res.ok) {
        setGrantSuccess(`✓ ${points} points granted to ${selectedUser.discord_username}`)
        setPoints('')
        setReason('')
        // Update the user's points in the list
        setUsers((prev) => prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, monthly_points: u.monthly_points + Number(points), total_points: u.total_points + Number(points) }
            : u
        ))
      }
    } finally {
      setGranting(false)
    }
  }

  const inputClass = 'w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:border-[#00D4FF]/40 focus:outline-none transition-all'

  const filteredUsers = query
    ? users.filter((u) => u.discord_username.toLowerCase().includes(query.toLowerCase()))
    : users

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
            onClick={() => openModal(user)}
            className="flex items-center gap-4 bg-white/3 border border-white/8 rounded-xl px-5 py-4 cursor-pointer transition-all hover:border-[#D4A017]/40 hover:bg-[#D4A017]/5 group"
          >
            <Avatar src={user.discord_avatar} name={user.discord_username} size="sm" />
            <span className="flex-1 font-medium text-white">{user.discord_username}</span>
            <div className="text-right text-sm">
              <p className="text-[#D4A017] font-bold">{formatPoints(user.monthly_points)} pts</p>
              <p className="text-white/30 text-xs">{formatPoints(user.total_points)} total</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4A017]/10 border border-[#D4A017]/20 text-xs font-semibold text-[#D4A017] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <Zap size={12} /> Grant Points
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <p className="text-center text-white/20 text-sm py-8">No users found.</p>
        )}
      </div>

      {/* Grant Points Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-md rounded-2xl bg-[#0D1525] border border-white/10 p-7 shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#D4A017]/50 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Avatar src={selectedUser.discord_avatar} name={selectedUser.discord_username} size="sm" />
                <div>
                  <h3 className="font-serif text-lg font-semibold text-white">{selectedUser.discord_username}</h3>
                  <p className="text-xs text-white/30">{formatPoints(selectedUser.monthly_points)} pts this month</p>
                </div>
              </div>
              <button onClick={closeModal} className="text-white/30 hover:text-white transition-colors p-1">
                <X size={18} />
              </button>
            </div>

            {grantSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <Zap size={20} className="text-emerald-400" />
                </div>
                <p className="text-emerald-400 font-medium">{grantSuccess}</p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="flex-1" onClick={closeModal}>Done</Button>
                  <Button size="sm" className="flex-1" onClick={() => setGrantSuccess(null)}>Grant More</Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGrant} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Points to grant</label>
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    placeholder="e.g. 50"
                    min={1}
                    required
                    autoFocus
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Reason</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Twitter Space participation"
                    required
                    className={inputClass}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" size="sm" className="flex-1" onClick={closeModal}>Cancel</Button>
                  <Button type="submit" size="sm" className="flex-1" disabled={granting || !points || !reason}>
                    {granting ? 'Granting...' : `Grant ${points ? `+${points}` : ''} Points`}
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
