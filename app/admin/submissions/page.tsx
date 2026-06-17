import { supabase } from '@/lib/supabase'
import { SubmissionsClient } from '@/components/admin/SubmissionsClient'

async function getSubmissions() {
  const { data } = await supabase
    .from('submissions')
    .select('*, users(discord_username, discord_avatar), tasks(title, points)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function AdminSubmissionsPage() {
  const submissions = await getSubmissions()
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-white mb-2">Submissions</h1>
      <p className="text-white/30 text-sm mb-8">Review and approve pending proof links.</p>
      <SubmissionsClient initialSubmissions={submissions} />
    </div>
  )
}
