import NextAuth from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import { supabase } from '@/lib/supabase'
import type { NextAuthOptions } from 'next-auth'

const adminIds = (process.env.ADMIN_DISCORD_IDS || '').split(',').map((s) => s.trim()).filter(Boolean)

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

      const discordProfile = profile as {
        id: string
        username: string
        global_name?: string
        avatar?: string
      }

      const discordId = discordProfile.id
      const isAdmin = adminIds.includes(discordId)

      await supabase.from('users').upsert(
        {
          discord_id: discordId,
          discord_username: discordProfile.global_name || discordProfile.username,
          discord_avatar: user.image,
          discord_email: user.email,
          is_admin: isAdmin,
        },
        { onConflict: 'discord_id' }
      )

      return true
    },

    async session({ session, token }) {
      if (token?.discordId) {
        try {
          const { data: dbUser } = await supabase
            .from('users')
            .select('id, is_admin, total_points, monthly_points')
            .eq('discord_id', token.discordId)
            .single()

          if (dbUser) {
            session.user.id = dbUser.id
            session.user.discordId = token.discordId as string
            session.user.isAdmin = dbUser.is_admin
            session.user.totalPoints = dbUser.total_points
            session.user.monthlyPoints = dbUser.monthly_points
          }
        } catch {
          // session still works without extra fields
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
  pages: { signIn: '/' },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
