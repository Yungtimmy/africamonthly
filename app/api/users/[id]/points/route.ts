import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { points, reason } = await req.json()

  if (!points || !reason) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const pts = Number(points)
  if (isNaN(pts) || pts <= 0) return NextResponse.json({ error: 'Invalid points' }, { status: 400 })

  const { data: adminUser } = await supabase
    .from('users')
    .select('id')
    .eq('discord_id', session.user.discordId)
    .single()

  const { data: targetUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', id)
    .single()

  if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Increment atomically to avoid lost updates under concurrent awards
  await supabase.rpc('increment_user_points', { p_user_id: id, p_delta: pts })

  await supabase.from('point_grants').insert({
    user_id: id,
    points: pts,
    reason,
    granted_by: adminUser?.id,
  })

  return NextResponse.json({ success: true })
}
