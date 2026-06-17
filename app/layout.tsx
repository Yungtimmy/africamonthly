import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Africa Monthly — Compete. Engage. Win.',
  description:
    'The premier monthly leaderboard competition for the African community. Complete tasks, earn points, and climb to the top.',
  openGraph: {
    title: 'Africa Monthly',
    description: 'Compete. Engage. Win.',
    type: 'website',
  },
}

export const viewport = {
  themeColor: '#0A0A0A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} dark`}>
      <body suppressHydrationWarning className="min-h-screen flex flex-col bg-[#0A0F1E] text-[#E8F0FE] antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
