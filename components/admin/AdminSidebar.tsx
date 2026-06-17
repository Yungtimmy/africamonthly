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
    <nav className="w-48 shrink-0 space-y-1">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#5A5040] px-3 mb-4">
        Admin
      </p>
      {adminLinks.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-[#D4A017]/10 text-[#D4A017]'
                : 'text-[#A09070] hover:text-[#F5F0E8] hover:bg-[#1A1A1A]'
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
