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

export function AdminSidebar({ userCount }: { userCount?: number }) {
  const pathname = usePathname()
  return (
    <nav className="md:w-52 md:shrink-0 md:space-y-1">
      <p className="hidden md:block text-[10px] font-semibold uppercase tracking-[0.15em] text-white/20 px-3 mb-5">Admin Panel</p>
      <div className="flex md:flex-col gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        {adminLinks.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0',
                isActive
                  ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 shadow-[0_0_10px_rgba(0,212,255,0.1)]'
                  : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
              )}
            >
              <Icon size={15} />
              <span className="flex-1">{label}</span>
              {label === 'Users' && userCount !== undefined && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#00D4FF]/15 text-[#00D4FF]">
                  {userCount}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
