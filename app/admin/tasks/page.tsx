import { connectDB } from '@/lib/db'
import { Task } from '@/lib/models/Task'
import { AdminTasksClient } from '@/components/admin/AdminTasksClient'

async function getTasks() {
  await connectDB()
  return await Task.find().sort({ createdAt: -1 }).lean()
}

export default async function AdminTasksPage() {
  const tasks = await getTasks()
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-[#F5F0E8] mb-8">Tasks</h1>
      <AdminTasksClient initialTasks={tasks} />
    </div>
  )
}
