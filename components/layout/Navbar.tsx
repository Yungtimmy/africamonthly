'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { Menu, X } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home', hideWhenAuthed: true },
  { href: '/leaderboard', label: 'Leaderboard', hideWhenAuthed: false },
  { href: '/tasks', label: 'Tasks', hideWhenAuthed: false },
]

function ProfileLink({
  name,
  image,
  monthlyPoints,
  compact = false,
  active = false,
  onNavigate,
}: {
  name: string
  image?: string | null
  monthlyPoints?: number
  compact?: boolean
  active?: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      href="/profile"
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-2 min-w-0 rounded-xl border transition-all duration-200',
        compact ? 'px-2 py-1.5 max-w-[148px] sm:max-w-[180px]' : 'px-3 py-1.5 hover:bg-white/8',
        active
          ? 'border-[#00D4FF]/35 bg-[#00D4FF]/10 shadow-[0_0_12px_rgba(0,212,255,0.12)]'
          : 'border-white/8 bg-white/5 hover:border-[#00D4FF]/30'
      )}
      aria-label="Open your dashboard"
    >
      <Avatar src={image} name={name} size="sm" />
      <div className="min-w-0 text-left leading-tight">
        <p className="text-sm font-medium text-white truncate">{name}</p>
        {!compact && (
          <p className="text-[10px] text-[#00D4FF]/80 font-semibold">{monthlyPoints ?? 0} pts</p>
        )}
      </div>
    </Link>
  )
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const isProfile = pathname === '/profile'

  const visibleLinks = navLinks.filter((link) => !(link.hideWhenAuthed && session?.user))

  return (
    <>
      <nav className="sticky top-0 z-[30] bg-[#0A0F1E]/90 backdrop-blur-xl border-b border-white/5 pt-[env(safe-area-inset-top)]">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#00D4FF]/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center h-14 sm:h-16 gap-3 sm:gap-6">
          <Link href="/" className="flex items-center gap-2 shrink-0 group min-w-0">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-[#00D4FF]/20 group-hover:ring-[#00D4FF]/50 transition-all">
              <Image src="/logo.png" alt="Africa Monthly" fill className="object-cover" sizes="32px" />
            </div>
            <span className="font-serif font-bold text-white text-base sm:text-lg leading-none hidden sm:inline">
              Africa<span className="text-[#00D4FF]">Monthly</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 flex-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  pathname === link.href
                    ? 'text-[#00D4FF] bg-[#00D4FF]/10'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
            {session?.user?.isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  pathname.startsWith('/admin')
                    ? 'text-[#D4A017] bg-[#D4A017]/10'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                )}
              >
                Admin
              </Link>
            )}
          </div>

          <div className="flex-1" />

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {session?.user ? (
              <ProfileLink
                name={session.user.name ?? 'User'}
                image={session.user.image}
                monthlyPoints={session.user.monthlyPoints}
                active={isProfile}
              />
            ) : (
              <Button onClick={() => signIn('discord')} size="sm">
                Join with Discord
              </Button>
            )}
          </div>

          {/* Mobile: profile beside menu */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            {session?.user && (
              <ProfileLink
                name={session.user.name ?? 'User'}
                image={session.user.image}
                compact
                active={isProfile}
              />
            )}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-white/60 hover:text-white hover:bg-white/5 border border-white/8 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-[40] bg-[#0A0F1E]/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <div
        className={cn(
          'fixed top-0 right-0 h-full w-[min(88vw,320px)] z-[50] bg-[#0D1525]/98 border-l border-[#00D4FF]/15 backdrop-blur-2xl transition-transform duration-300 ease-out md:hidden',
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#00D4FF]/40 to-transparent" />
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <span className="font-serif font-bold text-white">Menu</span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/5"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'block px-4 py-3.5 min-h-[48px] rounded-xl text-sm font-medium transition-all',
                pathname === link.href
                  ? 'text-[#00D4FF] bg-[#00D4FF]/10'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              {link.label}
            </Link>
          ))}
          {session?.user?.isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'block px-4 py-3.5 min-h-[48px] rounded-xl text-sm font-medium transition-all',
                pathname.startsWith('/admin')
                  ? 'text-[#D4A017] bg-[#D4A017]/10'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              Admin
            </Link>
          )}
        </nav>

        {!session?.user && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button onClick={() => signIn('discord')} className="w-full" size="md">
              Join with Discord
            </Button>
          </div>
        )}
      </div>
    </>
  )
}