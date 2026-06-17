import { connectDB } from '@/lib/db'
import { User } from '@/lib/models/User'
import { Submission } from '@/lib/models/Submission'
import { Task } from '@/lib/models/Task'
import { Users, Clock, ListTodo, Zap } from 'lucide-react'

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

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: <Users className="w-5 h-5 text-[#00D4FF]" />, accent: false },
    { label: 'Pending Reviews', value: stats.pendingSubmissions, icon: <Clock className="w-5 h-5 text-amber-400" />, accent: stats.pendingSubmissions > 0 },
    { label: 'Active Tasks', value: stats.activeTasks, icon: <ListTodo className="w-5 h-5 text-[#00D4FF]" />, accent: false },
    { label: 'Points This Month', value: stats.totalMonthlyPoints.toLocaleString(), icon: <Zap className="w-5 h-5 text-[#D4A017]" />, accent: false },
  ]

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-white/30 text-sm mb-10">Overview of this month&apos;s activity.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`relative rounded-2xl p-6 overflow-hidden backdrop-blur-sm transition-all ${
              card.accent
                ? 'bg-amber-500/5 border border-amber-500/25'
                : 'bg-white/3 border border-white/8 hover:border-[#00D4FF]/20'
            }`}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#00D4FF]/30 to-transparent" />
            <div className="mb-4">{card.icon}</div>
            <p className={`font-serif font-bold text-3xl ${card.accent ? 'text-amber-400' : 'text-white'}`}>
              {card.value}
            </p>
            <p className="text-xs text-white/30 mt-1">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
