import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Task } from '@/lib/models/Task'
import { Submission } from '@/lib/models/Submission'
import { User } from '@/lib/models/User'
import { TaskList } from '@/components/tasks/TaskList'

async function getTasksWithStatus(userId?: string) {
  await connectDB()
  const tasks = await Task.find({ isActive: true }).sort({ createdAt: -1 }).lean()

  if (!userId) return tasks.map((t) => ({ ...t, submissionStatus: null }))

  const taskIds = tasks.map((t) => t._id)
  const submissions = await Submission.find({
    userId,
    taskId: { $in: taskIds },
    status: { $ne: 'rejected' },
  })
    .select('taskId status')
    .lean()

  const submissionMap = new Map(
    submissions.map((s) => [s.taskId.toString(), s.status])
  )

  return tasks.map((t) => ({
    ...t,
    submissionStatus: submissionMap.get(t._id.toString()) ?? null,
  }))
}

export default async function TasksPage() {
  const session = await auth()

  let dbUserId: string | undefined
  if (session?.user?.discordId) {
    await connectDB()
    const dbUser = await User.findOne({ discordId: session.user.discordId }).lean()
    dbUserId = dbUser ? (dbUser as { _id: { toString(): string } })._id.toString() : undefined
  }

  const tasks = await getTasksWithStatus(dbUserId)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-10">
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#F5F0E8] mb-2">Tasks</h1>
        <p className="text-[#A09070]">
          Complete tasks to earn points. Submit a proof link and an admin will review it.
        </p>
      </div>
      <TaskList tasks={tasks} isLoggedIn={!!session?.user} />
    </div>
  )
}
