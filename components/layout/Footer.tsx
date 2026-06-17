import Link from 'next/link'
import Image from 'next/image'
import { XIcon, MessageCircle } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden">
      {/* Top divider */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#00D4FF]/20 to-transparent" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[30vw] h-[20vw] rounded-full bg-[#00D4FF]/4 blur-[80px]" />
        <div className="absolute top-0 left-0 w-[20vw] h-[15vw] rounded-full bg-[#D4A017]/3 blur-[80px]" />
      </div>

      <div className="relative bg-[#080D18]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Brand */}
            <div>
              <Link href="/" className="flex items-center gap-2.5 mb-4 group">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-[#00D4FF]/20 group-hover:ring-[#00D4FF]/40 transition-all">
                  <Image src="/logo.png" alt="Africa Monthly" fill className="object-cover" />
                </div>
                <span className="font-serif font-bold text-white text-lg">
                  Africa<span className="text-[#00D4FF]">Monthly</span>
                </span>
              </Link>
              <p className="text-sm text-white/30 leading-relaxed">
                Compete. Engage. Win. The premier monthly leaderboard for the African community, powered by Injective Chain.
              </p>
              <div className="flex gap-2 mt-5">
                <a
                  href="https://twitter.com"
                  aria-label="Twitter"
                  className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <XIcon size={17} />
                </a>
                <a
                  href="https://t.me"
                  aria-label="Telegram"
                  className="p-2 rounded-lg text-white/30 hover:text-[#00D4FF] hover:bg-[#00D4FF]/8 transition-colors"
                >
                  <MessageCircle size={17} />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-5">Navigation</h3>
              <ul className="space-y-2.5">
                {[
                  { href: '/', label: 'Home' },
                  { href: '/leaderboard', label: 'Leaderboard' },
                  { href: '/tasks', label: 'Tasks' },
                  { href: '/profile', label: 'Profile' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-white/30 hover:text-[#00D4FF] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Earn info */}
            <div>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-5">How to Earn</h3>
              <ul className="space-y-3 text-sm text-white/30">
                <li className="flex items-start gap-2">
                  <span className="text-[#00D4FF] font-bold shrink-0 leading-snug">→</span>
                  Complete tasks posted by the team
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00D4FF] font-bold shrink-0 leading-snug">→</span>
                  Chat on Telegram (10 msgs = 1 pt)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4A017] font-bold shrink-0 leading-snug">→</span>
                  Join spaces, workshops & events
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/20">
            <p>© {new Date().getFullYear()} Africa Monthly. All rights reserved.</p>
            <p>Built for the African diaspora · Powered by Injective</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
