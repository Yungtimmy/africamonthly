import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''

  const { data, error } = await supabase
    .from('users')
    .select('id, discord_username, discord_avatar, monthly_points, total_points, twitter, wallet_address, telegram_id, telegram_username')
    .ilike('discord_username', `%${q}%`)
    .order('monthly_points', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
