import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  if (session.user.isAdmin) {
    let query = supabase
      .from('submissions')
      .select('*, users(discord_username, discord_avatar), tasks(title, points)')
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // Regular user — own submissions only
  const { data, error } = await supabase
    .from('submissions')
    .select('*, tasks(title, points)')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { taskId, proofUrl } = await req.json()
  if (!taskId || !proofUrl) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  try { new URL(proofUrl) } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  // Defense in depth: reject submissions on deactivated or expired tasks.
  // The public task list normally filters these out, but a stale read could
  // let one slip through.
  const { data: task } = await supabase
    .from('tasks')
    .select('is_active, expires_at')
    .eq('id', taskId)
    .single()

  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  if (!task.is_active) {
    return NextResponse.json({ error: 'This task is no longer accepting submissions' }, { status: 410 })
  }
  if (task.expires_at && new Date(task.expires_at) <= new Date()) {
    return NextResponse.json({ error: 'This task has expired' }, { status: 410 })
  }

  // Prevent duplicate non-rejected submissions
  const { data: existing } = await supabase
    .from('submissions')
    .select('id')
    .eq('user_id', session.user.id)
    .eq('task_id', taskId)
    .neq('status', 'rejected')
    .single()

  if (existing) return NextResponse.json({ error: 'Already submitted' }, { status: 409 })

  const { data, error } = await supabase
    .from('submissions')
    .insert({ user_id: session.user.id, task_id: taskId, proof_url: proofUrl })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
