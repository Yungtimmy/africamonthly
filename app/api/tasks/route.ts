import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

const X_ACTION_POINTS: Record<string, number> = { like: 20, reply: 30, retweet: 50, quote: 50 }

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, description, points, task_type, x_post_url, x_action } = await req.json()

  const resolvedTaskType: string = task_type ?? 'other_event'

  let resolvedPoints: number
  if (resolvedTaskType === 'x_post') {
    if (!x_post_url) {
      return NextResponse.json({ error: 'x_post_url is required for x_post tasks' }, { status: 400 })
    }
    if (!x_action || !(x_action in X_ACTION_POINTS)) {
      return NextResponse.json({ error: 'Invalid x_action' }, { status: 400 })
    }
    resolvedPoints = X_ACTION_POINTS[x_action]
  } else {
    if (!title || !description || !points) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    resolvedPoints = Number(points)
  }

  const { data: adminUser } = await supabase
    .from('users')
    .select('id')
    .eq('discord_id', session.user.discordId)
    .single()

  const insertPayload: Record<string, unknown> = {
    title: resolvedTaskType === 'x_post' ? (title || x_post_url) : title,
    description: description ?? '',
    points: resolvedPoints,
    task_type: resolvedTaskType,
    created_by: adminUser?.id,
  }
  if (resolvedTaskType === 'x_post') {
    insertPayload.x_post_url = x_post_url
    insertPayload.x_action = x_action
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert(insertPayload)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
