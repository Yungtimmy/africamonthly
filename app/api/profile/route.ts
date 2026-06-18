import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { twitter, wallet } = await req.json()

  // telegram_id is intentionally NOT settable here. It can only be set via
  // /api/telegram/verify, which cryptographically proves ownership of the
  // Telegram account (Login Widget hash). Accepting an arbitrary telegram_id
  // here would let a user claim someone else's Telegram and siphon their points.
  await supabase.from('users').update({
    twitter: twitter?.replace(/^@/, '') || null,
    wallet_address: wallet || null,
  }).eq('id', session.user.id)

  return NextResponse.json({ success: true })
}
