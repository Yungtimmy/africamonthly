import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabase } from '@/lib/supabase'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('users')
    .update({ monthly_points: 0 })
    .neq('id', '00000000-0000-0000-0000-000000000000') // match all rows

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/leaderboard')
  revalidatePath('/admin')

  return NextResponse.json({ ok: true })
}
