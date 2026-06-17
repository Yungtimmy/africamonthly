'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signIn, signOut, useSession } from 'next-auth/react'
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/tasks', label: 'Tasks' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <>
      <nav className="sticky top-0 z-[30] bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#2A2A2A] shadow-[0_1px_40px_#4B3DE8]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-16 gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/logo.png" alt="Africa Monthly" width={32} height={32} className="rounded-md" />
            <span className="font-serif font-bold text-[#F5F0E8] text-lg leading-none">
              Africa<span className="text-[#D4A017]">Monthly</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                  pathname === link.href
                    ? 'text-[#D4A017] bg-[#D4A017]/10'
                    : 'text-[#A09070] hover:text-[#F5F0E8] hover:bg-[#4B3DE8]/8'
                )}
              >
                {link.label}
              </Link>
            ))}
            {session?.user?.isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                  pathname.startsWith('/admin')
                    ? 'text-[#D4A017] bg-[#D4A017]/10'
                    : 'text-[#A09070] hover:text-[#F5F0E8]'
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
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#1A1A1A] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D4A017] focus-visible:outline-offset-2"
                  aria-label="User menu"
                >
                  <Avatar src={session.user.image} name={session.user.name ?? 'User'} size="sm" />
                  <span className="text-sm text-[#F5F0E8] font-medium hidden lg:block">
                    {session.user.name}
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-12 w-48 bg-[#111111] border border-[#2A2A2A] rounded-xl shadow-2xl overflow-hidden z-[50]">
                    <div className="p-3 border-b border-[#2A2A2A]">
                      <p className="text-xs text-[#A09070]">Monthly points</p>
                      <p className="text-[#D4A017] font-bold font-serif text-lg">
                        {session.user.monthlyPoints ?? 0}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-[#F5F0E8] hover:bg-[#1A1A1A] transition-colors"
                    >
                      <UserIcon size={16} /> Profile
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#A09070] hover:text-[#F5F0E8] hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                    >
                      <LogOut size={16} /> Sign out
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
            className="md:hidden p-2 rounded-lg text-[#A09070] hover:text-[#F5F0E8] hover:bg-[#1A1A1A] transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[40] bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-72 z-[50] bg-[#111111] border-l border-[#2A2A2A] transition-transform duration-300 md:hidden',
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
          <span className="font-serif font-bold text-[#F5F0E8]">Menu</span>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="p-2 text-[#A09070] hover:text-[#F5F0E8] cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'block px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'text-[#D4A017] bg-[#D4A017]/10'
                  : 'text-[#A09070] hover:text-[#F5F0E8] hover:bg-[#1A1A1A]'
              )}
            >
              {link.label}
            </Link>
          ))}
          {session?.user?.isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-medium text-[#A09070] hover:text-[#F5F0E8] hover:bg-[#1A1A1A] transition-colors"
            >
              Admin
            </Link>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#2A2A2A]">
          {session?.user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar src={session.user.image} name={session.user.name ?? 'User'} size="sm" />
                <div>
                  <p className="text-sm font-medium text-[#F5F0E8]">{session.user.name}</p>
                  <p className="text-xs text-[#D4A017]">{session.user.monthlyPoints ?? 0} pts this month</p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-[#A09070] hover:text-[#F5F0E8] hover:bg-[#1A1A1A] transition-colors cursor-pointer"
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
