import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models/User'

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { telegram, twitter, wallet } = await req.json()

  await connectDB()
  await User.findOneAndUpdate(
    { discordId: session.user.discordId },
    {
      $set: {
        'telegram.username': telegram?.replace(/^@/, '') || undefined,
        twitter: twitter?.replace(/^@/, '') || undefined,
        walletAddress: wallet || undefined,
      },
    }
  )

  return NextResponse.json({ success: true })
}
