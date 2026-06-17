import { connectDB } from '@/lib/db'
import { Submission } from '@/lib/models/Submission'
import { SubmissionsClient } from '@/components/admin/SubmissionsClient'

async function getSubmissions() {
  await connectDB()
  const submissions = await Submission.find({ status: 'pending' })
    .populate('userId', 'discordUsername discordAvatar')
    .populate('taskId', 'title points')
    .sort({ createdAt: -1 })
    .lean()
  return submissions
}

export default async function AdminSubmissionsPage() {
  const submissions = await getSubmissions()
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-[#F5F0E8] mb-8">Submissions</h1>
      <SubmissionsClient initialSubmissions={submissions} />
    </div>
  )
}
