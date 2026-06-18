'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signIn, signOut, useSession } from 'next-auth/react'
import { Menu, X, LogOut, User as UserIcon, ChevronDown } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home', authOnly: false, hideWhenAuthed: true },
  { href: '/leaderboard', label: 'Leaderboard', authOnly: false, hideWhenAuthed: false },
  { href: '/tasks', label: 'Tasks', authOnly: false, hideWhenAuthed: false },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <>
      <nav className="sticky top-0 z-[30] bg-[#0A0F1E]/80 backdrop-blur-xl border-b border-white/5">
        {/* Top cyan line */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#00D4FF]/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-16 gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-[#00D4FF]/20 group-hover:ring-[#00D4FF]/50 transition-all duration-300 group-hover:shadow-[0_0_12px_rgba(0,212,255,0.3)]">
              <Image src="/logo.png" alt="Africa Monthly" fill className="object-cover" />
            </div>
            <span className="font-serif font-bold text-white text-lg leading-none">
              Africa<span className="text-[#00D4FF]">Monthly</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.filter(link => !(link.hideWhenAuthed && session?.user)).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === link.href
                    ? 'text-[#00D4FF] bg-[#00D4FF]/10 shadow-[0_0_10px_rgba(0,212,255,0.15)]'
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
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname.startsWith('/admin')
                    ? 'text-[#D4A017] bg-[#D4A017]/10'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                )}
              >
                Admin
              </Link>
            )}
          </div>

          <div className="flex-1 md:flex-none" />

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8 hover:border-[#00D4FF]/30 hover:bg-white/8 transition-all cursor-pointer"
                  aria-label="User menu"
                >
                  <Avatar src={session.user.image} name={session.user.name ?? 'User'} size="sm" />
                  <span className="text-sm text-white font-medium hidden lg:block">
                    {session.user.name}
                  </span>
                  <ChevronDown size={14} className="text-white/40" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-12 w-52 bg-[#0D1525]/95 border border-[#00D4FF]/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_20px_rgba(0,212,255,0.1)] overflow-hidden backdrop-blur-xl z-[50]">
                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#00D4FF]/40 to-transparent" />
                    <div className="p-4 border-b border-white/5">
                      <p className="text-xs text-white/40">Monthly points</p>
                      <p className="text-[#00D4FF] font-bold font-serif text-xl text-glow-inj">
                        {session.user.monthlyPoints ?? 0}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <UserIcon size={15} /> Profile
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button onClick={() => signIn('discord')} size="sm">
                Join with Discord
              </Button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[40] bg-[#0A0F1E]/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-72 z-[50] bg-[#0D1525]/98 border-l border-[#00D4FF]/15 backdrop-blur-2xl transition-transform duration-300 md:hidden',
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#00D4FF]/40 to-transparent" />
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <span className="font-serif font-bold text-white">Menu</span>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="p-2 text-white/40 hover:text-white cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-1">
          {navLinks.filter(link => !(link.hideWhenAuthed && session?.user)).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'block px-4 py-3 rounded-xl text-sm font-medium transition-all',
                pathname === link.href
                  ? 'text-[#00D4FF] bg-[#00D4FF]/10 shadow-[0_0_10px_rgba(0,212,255,0.1)]'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              )}
            >
              {link.label}
            </Link>
          ))}
          {session?.user?.isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
              Admin
            </Link>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          {session?.user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar src={session.user.image} name={session.user.name ?? 'User'} size="sm" />
                <div>
                  <p className="text-sm font-medium text-white">{session.user.name}</p>
                  <p className="text-xs text-[#00D4FF]">{session.user.monthlyPoints ?? 0} pts</p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          ) : (
            <Button onClick={() => signIn('discord')} className="w-full">
              Join with Discord
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
