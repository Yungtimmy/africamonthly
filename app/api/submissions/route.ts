import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Submission } from '@/lib/models/Submission'
import { User } from '@/lib/models/User'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  if (session.user.isAdmin) {
    const query = status ? { status } : {}
    const submissions = await Submission.find(query)
      .populate('userId', 'discordUsername discordAvatar')
      .populate('taskId', 'title points')
      .sort({ createdAt: -1 })
      .lean()
    return NextResponse.json(submissions)
  }

  // Regular users see only their own
  const user = await User.findOne({ discordId: session.user.discordId }).lean()
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const submissions = await Submission.find({ userId: (user as { _id: unknown })._id })
    .populate('taskId', 'title points')
    .sort({ createdAt: -1 })
    .lean()
  return NextResponse.json(submissions)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { taskId, proofUrl } = await req.json()
  if (!taskId || !proofUrl) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Validate URL
  try { new URL(proofUrl) } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  await connectDB()
  const user = await User.findOne({ discordId: session.user.discordId }).lean()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const userId = (user as { _id: unknown })._id

  // Prevent duplicate submissions
  const existing = await Submission.findOne({ userId, taskId, status: { $ne: 'rejected' } })
  if (existing) {
    return NextResponse.json({ error: 'Already submitted' }, { status: 409 })
  }

  const submission = await Submission.create({ userId, taskId, proofUrl })
  return NextResponse.json(submission, { status: 201 })
}
