import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { wallet } = await req.json()
  const trimmed = typeof wallet === 'string' ? wallet.trim() : ''

  if (trimmed && !/^inj1[a-z0-9]{38,}$/i.test(trimmed)) {
    return NextResponse.json({ error: 'Invalid Injective wallet address' }, { status: 400 })
  }

  await supabase.from('users').update({
    wallet_address: trimmed || null,
  }).eq('id', session.user.id)

  return NextResponse.json({ success: true })
}
