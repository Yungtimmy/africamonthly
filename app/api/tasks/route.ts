import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { calculateXPoints, isValidXAction, normalizeXActions } from '@/lib/points'

export async function GET() {
  // Lazy auto-deactivation: any active task whose expires_at has passed
  // gets is_active flipped to false. Idempotent, no cron required.
  await supabase
    .from('tasks')
    .update({ is_active: false })
    .eq('is_active', true)
    .not('expires_at', 'is', null)
    .lt('expires_at', new Date().toISOString())

  const cutoff = new Date().toISOString()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('is_active', true)
    .or(`expires_at.is.null,expires_at.gt.${cutoff}`)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, description, points, task_type, x_post_url, x_actions, expiresAt } = await req.json()

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

  // Resolve expires_at — admins can override or pass null to disable expiry.
  // Default: 3 days from now.
  let resolvedExpiresAt: string | null
  if (expiresAt === null) {
    resolvedExpiresAt = null
  } else if (typeof expiresAt === 'string') {
    if (Number.isNaN(Date.parse(expiresAt))) {
      return NextResponse.json({ error: 'Invalid expiresAt value' }, { status: 400 })
    }
    resolvedExpiresAt = new Date(expiresAt).toISOString()
  } else {
    resolvedExpiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  }

  const insertPayload: Record<string, unknown> = {
    title: resolvedTaskType === 'x_post' ? (title || x_post_url) : title,
    description: description ?? '',
    points: resolvedPoints,
    task_type: resolvedTaskType,
    created_by: adminUser?.id,
    expires_at: resolvedExpiresAt,
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