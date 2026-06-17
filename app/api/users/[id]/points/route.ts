import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models/User'
import { PointGrant } from '@/lib/models/PointGrant'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { points, reason } = await req.json()

  if (!points || !reason) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const pts = Number(points)
  if (isNaN(pts) || pts <= 0) {
    return NextResponse.json({ error: 'Invalid points value' }, { status: 400 })
  }

  await connectDB()
  const adminUser = await User.findOne({ discordId: session.user.discordId }).lean()
  if (!adminUser) return NextResponse.json({ error: 'Admin not found' }, { status: 404 })

  const targetUser = await User.findByIdAndUpdate(
    id,
    { $inc: { totalPoints: pts, monthlyPoints: pts } },
    { new: true }
  )
  if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  await PointGrant.create({
    userId: id,
    points: pts,
    reason,
    grantedBy: (adminUser as { _id: unknown })._id,
  })

  return NextResponse.json({ success: true, user: targetUser })
}
