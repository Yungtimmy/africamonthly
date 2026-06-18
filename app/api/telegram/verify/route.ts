import { NextResponse } from 'next/server'
import { createHash, createHmac } from 'crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { hash, ...data } = body

  // Verify with bot token — Login Widget uses secret = SHA256(bot_token),
  // NOT HMAC-SHA256(bot_token, "WebAppData") which is for Web App initData.
  const botToken = process.env.TELEGRAM_BOT_TOKEN!
  const secret = createHash('sha256').update(botToken).digest()
  const checkString = Object.keys(data).sort().map(k => `${k}=${data[k]}`).join('\n')
  const hmac = createHmac('sha256', secret).update(checkString).digest('hex')

  if (hmac !== hash) return NextResponse.json({ error: 'Invalid auth' }, { status: 400 })

  // Check not expired (1 day)
  if (Date.now() / 1000 - data.auth_date > 86400) {
    return NextResponse.json({ error: 'Auth expired' }, { status: 400 })
  }

  const telegramId = String(data.id)
  const displayName = data.username ? `@${data.username}` : data.first_name

  // Don't let one Telegram account be linked to two different profiles
  const { data: clash } = await supabase
    .from('users')
    .select('id')
    .eq('telegram_id', telegramId)
    .maybeSingle()

  if (clash && clash.id !== session.user.id) {
    return NextResponse.json(
      { error: 'This Telegram account is already linked to another profile.' },
      { status: 409 }
    )
  }

  await supabase.from('users').update({
    telegram_id: telegramId,
  }).eq('id', session.user.id)

  return NextResponse.json({ ok: true, telegramId, displayName })
}
