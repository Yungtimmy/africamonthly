import { NextResponse } from 'next/server'

// Vercel Cron pings this endpoint on a schedule (see vercel.json).
// It checks the registered Telegram webhook and re-registers it if it has
// dropped, gone stale, or points at the wrong URL — keeping the bot online 24/7.

function getBaseUrl(req: Request): string {
  const host = req.headers.get('host')
  const proto = req.headers.get('x-forwarded-proto') ?? 'https'
  if (host) return `${proto}://${host}`
  return (process.env.NEXTAUTH_URL ?? '').replace(/\/+$/, '')
}

export async function GET(req: Request) {
  // Vercel Cron sends an Authorization: Bearer <CRON_SECRET> header.
  // Allow the request if CRON_SECRET is unset (local) or the header matches.
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (!token || !secret) {
    return NextResponse.json({ error: 'Missing bot token or webhook secret' }, { status: 500 })
  }

  const baseUrl = getBaseUrl(req)
  const desiredUrl = `${baseUrl}/api/telegram/webhook`

  // Check the current webhook
  const infoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`)
  const info = await infoRes.json() as {
    ok: boolean
    result?: { url?: string; last_error_message?: string; last_error_date?: number }
  }

  const current = info.result
  const needsReset =
    !current?.url ||
    current.url !== desiredUrl ||
    Boolean(current.last_error_message)

  if (!needsReset) {
    return NextResponse.json({ status: 'healthy', url: current?.url })
  }

  // Re-register the webhook
  const setRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: desiredUrl,
      secret_token: secret,
      allowed_updates: ['message', 'edited_message'],
    }),
  })
  const setData = await setRes.json()

  return NextResponse.json({
    status: 're-registered',
    reason: current?.last_error_message ?? (current?.url ? 'url mismatch' : 'no webhook'),
    url: desiredUrl,
    telegram: setData,
  })
}
