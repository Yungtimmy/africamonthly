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
    <div className="relative min-h-screen">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[45vw] h-[45vw] rounded-full bg-[#00D4FF]/5 blur-[130px]" />
        <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] rounded-full bg-[#D4A017]/4 blur-[100px]" />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-[#00D4FF]/6 border border-[#00D4FF]/15 backdrop-blur-sm">
            <span className="text-xs font-semibold text-[#00D4FF] uppercase tracking-widest">Monthly Tasks</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-3">Earn Points</h1>
          <p className="text-white/40">Complete tasks to earn points. Submit a proof link and an admin will review it.</p>
        </div>
        <TaskList tasks={tasks} isLoggedIn={!!session?.user} />
      </div>
    </div>
  )
}
