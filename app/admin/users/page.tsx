import { supabase } from '@/lib/supabase'
import { AdminUsersClient } from '@/components/admin/AdminUsersClient'

async function getAllUsers() {
  const { data } = await supabase
    .from('users')
    .select('id, discord_username, discord_avatar, monthly_points, total_points, twitter, wallet_address, telegram_id, telegram_username')
    .order('monthly_points', { ascending: false })
    .limit(200)
  return data ?? []
}

export default async function AdminUsersPage() {
  const users = await getAllUsers()
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <h1 className="font-serif text-3xl font-bold text-white">Users</h1>
        <span className="px-2.5 py-0.5 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-xs font-bold text-[#00D4FF]">
          {users.length}
        </span>
      </div>
      <p className="text-white/30 text-sm mb-8">Search users and grant manual points.</p>
      <AdminUsersClient initialUsers={users} />
    </div>
  )
}
