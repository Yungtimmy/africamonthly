import { connectDB } from '@/lib/db'
import { User } from '@/lib/models/User'
import { Submission } from '@/lib/models/Submission'
import { Task } from '@/lib/models/Task'

async function getStats() {
  await connectDB()
  const [totalUsers, pendingSubmissions, activeTasks, totalPointsResult] = await Promise.all([
    User.countDocuments(),
    Submission.countDocuments({ status: 'pending' }),
    Task.countDocuments({ isActive: true }),
    User.aggregate([{ $group: { _id: null, total: { $sum: '$monthlyPoints' } } }]),
  ])
  return {
    totalUsers,
    pendingSubmissions,
    activeTasks,
    totalMonthlyPoints: totalPointsResult[0]?.total ?? 0,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-[#F5F0E8] mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers, accent: false },
          { label: 'Pending Submissions', value: stats.pendingSubmissions, accent: stats.pendingSubmissions > 0 },
          { label: 'Active Tasks', value: stats.activeTasks, accent: false },
          { label: 'Points Awarded', value: stats.totalMonthlyPoints, accent: false },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-[#111111] border rounded-xl p-5 ${
              stat.accent ? 'border-[#D4A017]/40' : 'border-[#2A2A2A]'
            }`}
          >
            <p className={`font-serif font-bold text-3xl ${stat.accent ? 'text-[#D4A017]' : 'text-[#F5F0E8]'}`}>
              {stat.value}
            </p>
            <p className="text-xs text-[#A09070] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
