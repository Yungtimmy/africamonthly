import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect('/')

  const { count: userCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-0 w-[35vw] h-[35vw] rounded-full bg-[#00D4FF]/4 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[25vw] h-[25vw] rounded-full bg-[#D4A017]/3 blur-[100px]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex gap-8">
          <AdminSidebar userCount={userCount ?? 0} />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}
