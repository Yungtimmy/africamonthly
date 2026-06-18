import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

const X_ACTION_POINTS: Record<string, number> = { like: 20, reply: 30, retweet: 50, quote: 50 }

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
    const invalid = body.x_actions.filter((a: string) => !(a in X_ACTION_POINTS))
    if (invalid.length > 0) {
      return NextResponse.json({ error: `Invalid actions: ${invalid.join(', ')}` }, { status: 400 })
    }
    update.x_actions = body.x_actions
    // Keep points in sync with selected actions, matching task creation
    update.points = body.x_actions.reduce((sum: number, a: string) => sum + X_ACTION_POINTS[a], 0)
  } else if ('points' in body) {
    const pts = Number(body.points)
    if (isNaN(pts) || pts < 0) return NextResponse.json({ error: 'Invalid points' }, { status: 400 })
    update.points = pts
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

  const { error } = await supabase.from('tasks').delete().eq('id', id)

  if (error) {
    // Most likely a foreign-key violation: submissions still reference this task.
    return NextResponse.json(
      { error: 'Cannot delete a task that has submissions. Deactivate it instead.' },
      { status: 409 }
    )
  }
  return NextResponse.json({ success: true })
}
