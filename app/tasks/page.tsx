import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { TaskList } from '@/components/tasks/TaskList'

interface TaskWithStatus {
  id: string
  title: string
  description: string
  points: number
  task_type?: string
  x_post_url?: string | null
  x_actions?: string[] | null
  expires_at?: string | null
  submissionStatus: string | null
}

async function getTasksWithStatus(userId?: string): Promise<TaskWithStatus[]> {
  // Filter at the source: only return tasks that are active AND not expired.
  // (expires_at is nullable — null means no auto-expiry.)
  const cutoff = new Date().toISOString()
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('is_active', true)
    .or(`expires_at.is.null,expires_at.gt.${cutoff}`)
    .order('created_at', { ascending: false })

  if (!tasks) return []

  type RawTask = { id: string; title: string; description: string; points: number; task_type?: string; x_post_url?: string | null; x_actions?: string[] | null; expires_at?: string | null }
  const typedTasks = tasks as RawTask[]

  if (!userId) return typedTasks.map((t) => ({ ...t, submissionStatus: null }))

  const taskIds = typedTasks.map((t) => t.id)
  const { data: submissions } = await supabase
    .from('submissions')
    .select('task_id, status')
    .eq('user_id', userId)
    .in('task_id', taskIds)
    .neq('status', 'rejected')

  const submissionMap = new Map(
    (submissions ?? []).map((s: { task_id: string; status: string }) => [s.task_id, s.status])
  )

  return typedTasks
    .map((t) => ({
      ...t,
      submissionStatus: submissionMap.get(t.id) ?? null,
    }))
    .filter((t) => t.submissionStatus !== 'approved')
}

export default async function TasksPage() {
  const session = await auth()
  const userId = session?.user?.id

  const tasks = await getTasksWithStatus(userId)

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[45vw] h-[45vw] rounded-full bg-[#00D4FF]/5 blur-[130px]" />
        <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] rounded-full bg-[#D4A017]/4 blur-[100px]" />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-[#00D4FF]/6 border border-[#00D4FF]/15 backdrop-blur-sm">
            <span className="text-xs font-semibold text-[#00D4FF] uppercase tracking-widest">Monthly Tasks</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">Earn Points</h1>
          <p className="text-white/40">Complete tasks to earn points.</p>
        </div>
        <TaskList tasks={tasks} isLoggedIn={!!session?.user} />
      </div>
    </div>
  )
}
