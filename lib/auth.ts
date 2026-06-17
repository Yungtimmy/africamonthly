import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import type { Session } from 'next-auth'

export async function auth(): Promise<Session | null> {
  return getServerSession(authOptions)
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      discordId: string
      isAdmin: boolean
      totalPoints: number
      monthlyPoints: number
    }
  }
}
