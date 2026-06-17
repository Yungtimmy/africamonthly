import Link from 'next/link'
import { Trophy, XIcon, MessageCircle } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[#111111] border-t border-[#2A2A2A] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Trophy className="text-[#D4A017] w-5 h-5" />
              <span className="font-serif font-bold text-[#F5F0E8] text-lg">
                Africa<span className="text-[#D4A017]">Monthly</span>
              </span>
            </Link>
            <p className="text-sm text-[#A09070] leading-relaxed">
              Compete. Engage. Win. The premier monthly leaderboard for the African community.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://twitter.com"
                aria-label="Twitter"
                className="p-2 rounded-lg text-[#A09070] hover:text-[#D4A017] hover:bg-[#1A1A1A] transition-colors"
              >
                <XIcon size={18} />
              </a>
              <a
                href="https://t.me"
                aria-label="Telegram"
                className="p-2 rounded-lg text-[#A09070] hover:text-[#D4A017] hover:bg-[#1A1A1A] transition-colors"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-[#F5F0E8] uppercase tracking-wider mb-4">
              Navigation
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/leaderboard', label: 'Leaderboard' },
                { href: '/tasks', label: 'Tasks' },
                { href: '/profile', label: 'Profile' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#A09070] hover:text-[#D4A017] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Points info */}
          <div>
            <h3 className="text-sm font-semibold text-[#F5F0E8] uppercase tracking-wider mb-4">
              How to Earn Points
            </h3>
            <ul className="space-y-3 text-sm text-[#A09070]">
              <li className="flex items-start gap-2">
                <span className="text-[#D4A017] font-bold shrink-0">→</span>
                Complete tasks posted by the team
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4A017] font-bold shrink-0">→</span>
                Chat on Telegram (10 messages = 1 point)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4A017] font-bold shrink-0">→</span>
                Participate in spaces & workshops
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#2A2A2A] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#5A5040]">
          <p>© {new Date().getFullYear()} Africa Monthly. All rights reserved.</p>
          <p>Built for the African diaspora.</p>
        </div>
      </div>
    </footer>
  )
}
