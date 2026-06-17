import NextAuth from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models/User'
import type { NextAuthOptions } from 'next-auth'

const adminIds = (process.env.ADMIN_DISCORD_IDS || '').split(',').filter(Boolean)

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'discord') return false

      await connectDB()

      const discordProfile = profile as {
        id: string
        username: string
        global_name?: string
        avatar?: string
      }

      const discordId = discordProfile.id
      const isAdmin = adminIds.includes(discordId)

      await User.findOneAndUpdate(
        { discordId },
        {
          $set: {
            discordId,
            discordUsername: discordProfile.global_name || discordProfile.username,
            discordAvatar: user.image,
            discordEmail: user.email,
            isAdmin,
          },
        },
        { upsert: true, new: true }
      )

      return true
    },

    async session({ session, token }) {
      if (token?.discordId) {
        try {
          await connectDB()
          const dbUser = await User.findOne({ discordId: token.discordId }).lean()
          if (dbUser) {
            const u = dbUser as {
              _id: { toString(): string }
              isAdmin: boolean
              totalPoints: number
              monthlyPoints: number
            }
            session.user.id = u._id.toString()
            session.user.discordId = token.discordId as string
            session.user.isAdmin = u.isAdmin
            session.user.totalPoints = u.totalPoints
            session.user.monthlyPoints = u.monthlyPoints
          }
        } catch {
          // DB unavailable — session still works without extra fields
        }
      }
      return session
    },

    async jwt({ token, account, profile }) {
      if (account?.provider === 'discord' && profile) {
        token.discordId = (profile as { id: string }).id
      }
      return token
    },
  },
  pages: {
    signIn: '/',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
