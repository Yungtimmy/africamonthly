import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Submission } from '@/lib/models/Submission'
import { Task } from '@/lib/models/Task'
import { User } from '@/lib/models/User'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { action } = await req.json() // 'approve' | 'reject'

  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  await connectDB()
  const submission = await Submission.findById(id).populate('taskId')
  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (submission.status !== 'pending') {
    return NextResponse.json({ error: 'Already reviewed' }, { status: 409 })
  }

  const adminUser = await User.findOne({ discordId: session.user.discordId }).lean()
  if (!adminUser) return NextResponse.json({ error: 'Admin not found' }, { status: 404 })

  if (action === 'approve') {
    const task = await Task.findById(submission.taskId)
    const points = task?.points ?? 0

    submission.status = 'approved'
    submission.pointsAwarded = points
    submission.reviewedBy = (adminUser as { _id: unknown })._id as typeof submission.reviewedBy
    submission.reviewedAt = new Date()
    await submission.save()

    await User.findByIdAndUpdate(submission.userId, {
      $inc: { totalPoints: points, monthlyPoints: points },
    })
  } else {
    submission.status = 'rejected'
    submission.reviewedBy = (adminUser as { _id: unknown })._id as typeof submission.reviewedBy
    submission.reviewedAt = new Date()
    await submission.save()
  }

  return NextResponse.json(submission)
}
