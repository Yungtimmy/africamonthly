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

  // Safety: a task with submissions must be deactivated before deletion, so it
  // can't be removed while users are actively submitting to it.
  if ((submissionCount ?? 0) > 0 && task.is_active) {
    return NextResponse.json(
      { error: 'Deactivate this task before deleting it.' },
      { status: 409 }
    )
  }

  // Remove the task's submission records first (FK), then the task itself.
  // NOTE: points already awarded live on each user's row and are NOT affected —
  // this only clears the submission history for this task.
  if ((submissionCount ?? 0) > 0) {
    const { error: subErr } = await supabase.from('submissions').delete().eq('task_id', id)
    if (subErr) return NextResponse.json({ error: subErr.message }, { status: 500 })
  }

  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
