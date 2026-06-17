import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models/User'

export async function GET() {
  await connectDB()
  const users = await User.find()
    .sort({ monthlyPoints: -1, totalPoints: -1 })
    .limit(50)
    .select('discordUsername discordAvatar monthlyPoints totalPoints')
    .lean()

  return NextResponse.json(users, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
  })
}
