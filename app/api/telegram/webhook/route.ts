import { NextResponse } from 'next/server'
import { processTelegramMessage } from '@/lib/telegram'

export async function POST(req: Request) {
  const secret = req.headers.get('x-telegram-bot-api-secret-token')
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const message = body?.message || body?.edited_message

    if (!message?.from?.username) {
      return NextResponse.json({ ok: true })
    }

    await processTelegramMessage(message.from.username)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Telegram webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
