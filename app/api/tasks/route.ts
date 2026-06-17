import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Task } from '@/lib/models/Task'
import { User } from '@/lib/models/User'

export async function GET() {
  await connectDB()
  const tasks = await Task.find({ isActive: true }).sort({ createdAt: -1 }).lean()
  return NextResponse.json(tasks)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, description, points } = await req.json()
  if (!title || !description || !points) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  await connectDB()
  const adminUser = await User.findOne({ discordId: session.user.discordId }).lean()
  if (!adminUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const task = await Task.create({
    title,
    description,
    points: Number(points),
    createdBy: (adminUser as { _id: unknown })._id,
  })

  return NextResponse.json(task, { status: 201 })
}
