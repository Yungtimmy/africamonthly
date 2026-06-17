import { AdminUsersClient } from '@/components/admin/AdminUsersClient'

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-white mb-2">Users</h1>
      <p className="text-white/30 text-sm mb-8">Search users and grant manual points.</p>
      <AdminUsersClient />
    </div>
  )
}
