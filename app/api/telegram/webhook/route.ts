import { NextResponse } from 'next/server'
import { processTelegramMessage } from '@/lib/telegram'

const ALLOWED_GROUP_ID = process.env.TELEGRAM_GROUP_ID

export async function POST(req: Request) {
  const secret = req.headers.get('x-telegram-bot-api-secret-token')
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const message = body?.message || body?.edited_message

    if (!message) return NextResponse.json({ ok: true })

    // Only track messages from the configured group
    const chatId = String(message.chat?.id ?? '')
    if (ALLOWED_GROUP_ID && chatId !== ALLOWED_GROUP_ID) {
      return NextResponse.json({ ok: true })
    }

    // Only track regular group messages (not bots, not commands)
    const from = message.from
    if (!from || from.is_bot) return NextResponse.json({ ok: true })

    const telegramId = String(from.id)
    const displayName = from.username
      ? `@${from.username}`
      : [from.first_name, from.last_name].filter(Boolean).join(' ')

    await processTelegramMessage(telegramId, displayName)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Telegram webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
