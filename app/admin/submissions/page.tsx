import { supabase } from '@/lib/supabase'
import { SubmissionsClient } from '@/components/admin/SubmissionsClient'

async function getSubmissions() {
  const { data } = await supabase
    .from('submissions')
    .select('*, users!submissions_user_id_fkey(discord_username, discord_avatar), tasks!submissions_task_id_fkey(title, points, task_type, x_post_url, x_actions)')
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
