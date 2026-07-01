import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { wallet } = await req.json()

  await supabase.from('users').update({
    wallet_address: wallet || null,
  }).eq('id', session.user.id)

  return NextResponse.json({ success: true })
}
