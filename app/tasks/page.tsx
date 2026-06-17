import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { TaskList } from '@/components/tasks/TaskList'

async function getTasksWithStatus(userId?: string) {
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (!tasks) return []

  if (!userId) return tasks.map((t: Record<string, unknown>) => ({ ...t, submissionStatus: null }))

  const taskIds = tasks.map((t: Record<string, unknown>) => t.id as string)
  const { data: submissions } = await supabase
    .from('submissions')
    .select('task_id, status')
    .eq('user_id', userId)
    .in('task_id', taskIds)
    .neq('status', 'rejected')

  const submissionMap = new Map(
    (submissions ?? []).map((s: { task_id: string; status: string }) => [s.task_id, s.status])
  )

  return tasks
    .map((t: Record<string, unknown>) => ({
      ...t,
      submissionStatus: submissionMap.get(t.id as string) ?? null,
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-[#00D4FF]/6 border border-[#00D4FF]/15 backdrop-blur-sm">
            <span className="text-xs font-semibold text-[#00D4FF] uppercase tracking-widest">Monthly Tasks</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-3">Earn Points</h1>
          <p className="text-white/40">Complete tasks to earn points.</p>
        </div>
        <TaskList tasks={tasks} isLoggedIn={!!session?.user} />
      </div>
    </div>
  )
}
