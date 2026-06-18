import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { action } = await req.json()

  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const { data: submission } = await supabase
    .from('submissions')
    .select('*, tasks(points)')
    .eq('id', id)
    .single()

  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (submission.status !== 'pending') return NextResponse.json({ error: 'Already reviewed' }, { status: 409 })

  const { data: adminUser } = await supabase
    .from('users')
    .select('id')
    .eq('discord_id', session.user.discordId)
    .single()

  const now = new Date().toISOString()

  if (action === 'approve') {
    const points = submission.tasks?.points ?? 0

    await supabase.from('submissions').update({
      status: 'approved',
      points_awarded: points,
      reviewed_by: adminUser?.id,
      reviewed_at: now,
    }).eq('id', id)

    // Increment user points atomically (avoids lost updates under concurrency)
    await supabase.rpc('increment_user_points', {
      p_user_id: submission.user_id,
      p_delta: points,
    })
  } else {
    await supabase.from('submissions').update({
      status: 'rejected',
      reviewed_by: adminUser?.id,
      reviewed_at: now,
    }).eq('id', id)
  }

  return NextResponse.json({ success: true })
}
