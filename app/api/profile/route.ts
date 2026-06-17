import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { telegramId, twitter, wallet } = await req.json()

  // Validate telegram_id is numeric if provided
  if (telegramId && !/^\d+$/.test(telegramId)) {
    return NextResponse.json({ error: 'Telegram ID must be a number' }, { status: 400 })
  }

  await supabase.from('users').update({
    telegram_id: telegramId || null,
    twitter: twitter?.replace(/^@/, '') || null,
    wallet_address: wallet || null,
  }).eq('id', session.user.id)

  return NextResponse.json({ success: true })
}
