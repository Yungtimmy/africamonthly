import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { calculateXPoints, isValidXAction, normalizeXActions } from '@/lib/points'

export async function GET() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, description, points, task_type, x_post_url, x_actions } = await req.json()

  const resolvedTaskType: string = task_type ?? 'other_event'

  let resolvedPoints: number
  let normalizedActions: string[] | undefined

  if (resolvedTaskType === 'x_post') {
    if (!x_post_url) {
      return NextResponse.json({ error: 'x_post_url is required for x_post tasks' }, { status: 400 })
    }
    if (!x_actions || !Array.isArray(x_actions) || x_actions.length === 0) {
      return NextResponse.json({ error: 'At least one action is required for X post tasks' }, { status: 400 })
    }
    const invalid = x_actions.filter((a: string) => !isValidXAction(a))
    if (invalid.length > 0) {
      return NextResponse.json({ error: `Invalid actions: ${invalid.join(', ')}` }, { status: 400 })
    }
    normalizedActions = normalizeXActions(x_actions)
    resolvedPoints = calculateXPoints(x_actions)
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
    insertPayload.x_actions = normalizedActions
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert(insertPayload)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}