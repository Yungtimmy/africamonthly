'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, ListTodo, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/submissions', label: 'Submissions', icon: CheckSquare },
  { href: '/admin/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/admin/users', label: 'Users', icon: Users },
]

export function AdminSidebar() {
  const pathname = usePathname()
  return (
    <nav className="w-52 shrink-0 space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/20 px-3 mb-5">Admin Panel</p>
      {adminLinks.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 shadow-[0_0_10px_rgba(0,212,255,0.1)]'
                : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
            )}
          >
            <Icon size={15} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
