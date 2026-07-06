import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { calculateXPoints, isValidXAction, normalizeXActions } from '@/lib/points'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json()

  const update: Record<string, unknown> = {}
  if ('isActive' in body) update.is_active = body.isActive
  if ('title' in body) update.title = body.title
  if ('description' in body) update.description = body.description
  if ('x_post_url' in body) update.x_post_url = body.x_post_url

  if (Array.isArray(body.x_actions)) {
    const invalid = body.x_actions.filter((a: string) => !isValidXAction(a))
    if (invalid.length > 0) {
      return NextResponse.json({ error: `Invalid actions: ${invalid.join(', ')}` }, { status: 400 })
    }
    const normalized = normalizeXActions(body.x_actions)
    update.x_actions = normalized
    update.points = calculateXPoints(body.x_actions)
  } else if ('points' in body) {
    const pts = Number(body.points)
    if (isNaN(pts) || pts < 0) return NextResponse.json({ error: 'Invalid points' }, { status: 400 })
    update.points = pts
  }

  // Admins can explicitly set / clear the expiry. null clears it (no auto-deactivate).
  if ('expiresAt' in body) {
    if (body.expiresAt === null) {
      update.expires_at = null
    } else if (typeof body.expiresAt === 'string') {
      if (Number.isNaN(Date.parse(body.expiresAt))) {
        return NextResponse.json({ error: 'Invalid expiresAt value' }, { status: 400 })
      }
      update.expires_at = new Date(body.expiresAt).toISOString()
    }
  }

  // Reactivating a task extends it to a fresh +3-day window IFF the current
  // expires_at is missing or already in the past. If the admin previously set
  // a future expiry (or passes `expiresAt` in this call), we preserve their
  // intent. This enforces the default 3-day competition window without
  // silently stomping on a custom duration.
  if (update.is_active === true && !('expiresAt' in body)) {
    const { data: current } = await supabase
      .from('tasks')
      .select('expires_at')
      .eq('id', id)
      .single()
    const stillFuture = current?.expires_at && new Date(current.expires_at) > new Date()
    if (!stillFuture) {
      update.expires_at = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  const { data: task } = await supabase
    .from('tasks')
    .select('is_active')
    .eq('id', id)
    .single()

  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  const { count: submissionCount } = await supabase
    .from('submissions')
    .select('id', { count: 'exact', head: true })
    .eq('task_id', id)

  if ((submissionCount ?? 0) > 0 && task.is_active) {
    return NextResponse.json(
      { error: 'Deactivate this task before deleting it.' },
      { status: 409 }
    )
  }

  if ((submissionCount ?? 0) > 0) {
    const { error: subErr } = await supabase.from('submissions').delete().eq('task_id', id)
    if (subErr) return NextResponse.json({ error: subErr.message }, { status: 500 })
  }

  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}