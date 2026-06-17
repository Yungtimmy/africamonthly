import { AdminUsersClient } from '@/components/admin/AdminUsersClient'

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-[#F5F0E8] mb-8">Users</h1>
      <AdminUsersClient />
    </div>
  )
}
