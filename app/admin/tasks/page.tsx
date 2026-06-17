import { supabase } from '@/lib/supabase'
import { AdminTasksClient } from '@/components/admin/AdminTasksClient'

async function getTasks() {
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function AdminTasksPage() {
  const tasks = await getTasks()
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-white mb-2">Tasks</h1>
      <p className="text-white/30 text-sm mb-8">Create and manage monthly tasks.</p>
      <AdminTasksClient initialTasks={tasks} />
    </div>
  )
}
