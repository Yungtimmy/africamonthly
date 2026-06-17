import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models/User'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')

  await connectDB()
  const query = q
    ? { discordUsername: { $regex: q, $options: 'i' } }
    : {}

  const users = await User.find(query)
    .sort({ monthlyPoints: -1 })
    .limit(20)
    .select('discordUsername discordAvatar totalPoints monthlyPoints')
    .lean()

  return NextResponse.json(users)
}
