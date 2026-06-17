import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models/User'
import { Submission } from '@/lib/models/Submission'
import { ProfileClient } from '@/components/profile/ProfileClient'

async function getUserData(discordId: string) {
  await connectDB()
  const user = await User.findOne({ discordId }).lean()
  if (!user) return null

  const u = user as {
    _id: { toString(): string }
    discordUsername: string
    discordAvatar?: string
    telegram?: { username: string; chatCount: number }
    twitter?: string
    walletAddress?: string
    totalPoints: number
    monthlyPoints: number
  }

  const submissions = await Submission.find({ userId: u._id })
    .populate('taskId', 'title points')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean()

  const rank = await User.countDocuments({ monthlyPoints: { $gt: u.monthlyPoints } })

  return { user: u, submissions, rank: rank + 1 }
}

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect('/')

  const data = await getUserData(session.user.discordId)
  if (!data) redirect('/')

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <ProfileClient
        user={data.user}
        submissions={data.submissions}
        rank={data.rank}
      />
    </div>
  )
}
