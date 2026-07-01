import { createServer } from 'http'
import { supabase } from './supabase.js'

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const ALLOWED_GROUP_ID = process.env.TELEGRAM_GROUP_ID
const SITE_URL = process.env.SITE_URL ?? 'https://injectiveafrica.vercel.app'

if (!TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN is required when BOT_ENABLED=true')
  process.exit(1)
}

const API = `https://api.telegram.org/bot${TOKEN}`

async function api<T>(method: string, body?: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API}/${method}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json() as Promise<T>
}

async function sendMessage(chatId: number | string, text: string) {
  await api('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML' })
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function isGroupAdmin(chatId: number | string, userId: number | string): Promise<boolean> {
  try {
    const data = await api<{ result?: { status: string } }>('getChatMember', {
      chat_id: chatId,
      user_id: userId,
    })
    const status = data.result?.status
    return status === 'administrator' || status === 'creator'
  } catch {
    return false
  }
}

async function handleStatsCommand(chatId: number | string, args: string) {
  const target = args.trim()

  if (target) {
    const cleanTarget = target.replace(/^@/, '')
    let user = null

    if (/^\d+$/.test(cleanTarget)) {
      const { data } = await supabase
        .from('users')
        .select('discord_username, monthly_points, total_points, telegram_chat_count')
        .eq('telegram_id', cleanTarget)
        .single()
      user = data
    }
    if (!user) {
      const { data } = await supabase
        .from('users')
        .select('discord_username, monthly_points, total_points, telegram_chat_count')
        .ilike('discord_username', cleanTarget)
        .single()
      user = data
    }

    if (!user) {
      await sendMessage(chatId, `❌ User <b>${esc(target)}</b> not found or hasn't signed up yet.`)
      return
    }

    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gt('monthly_points', user.monthly_points)

    const rank = (count ?? 0) + 1

    await sendMessage(chatId,
      `👤 <b>${esc(user.discord_username)}</b>\n` +
      `🏆 Rank: <b>#${rank}</b>\n` +
      `⚡ Monthly Points: <b>${user.monthly_points}</b>\n` +
      `📊 All-time Points: <b>${user.total_points}</b>`
    )
  } else {
    const { data: users } = await supabase
      .from('users')
      .select('discord_username, monthly_points')
      .order('monthly_points', { ascending: false })
      .limit(10)

    if (!users || users.length === 0) {
      await sendMessage(chatId, '📊 No users on the leaderboard yet.')
      return
    }

    const medals = ['🥇', '🥈', '🥉']
    const lines = users.map((u, i) => {
      const medal = medals[i] ?? `${i + 1}.`
      return `${medal} <b>${esc(u.discord_username)}</b> — ${u.monthly_points} pts`
    })

    await sendMessage(chatId,
      `🏆 <b>Africa Monthly Leaderboard</b>\n\n${lines.join('\n')}\n\n` +
      `🔗 <a href="${SITE_URL}">${SITE_URL}</a>`
    )
  }
}

interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  edited_message?: TelegramMessage
}

interface TelegramMessage {
  message_id: number
  from?: { id: number; is_bot?: boolean; first_name?: string; last_name?: string; username?: string }
  chat: { id: number; type: string }
  text?: string
}

async function handleMessage(message: TelegramMessage) {
  const chatId = message.chat.id
  const from = message.from
  if (!from || from.is_bot) return

  const text = message.text ?? ''

  if (text.startsWith('/ping')) {
    await sendMessage(chatId,
      `🟢 <b>Africa Monthly Bot is live!</b>\n` +
      `🔗 <a href="${SITE_URL}">${SITE_URL}</a>`
    )
    return
  }

  if (text.startsWith('/start')) {
    await sendMessage(chatId,
      `👋 <b>Welcome to Africa Monthly!</b>\n\n` +
      `🏆 Compete monthly, earn points, and win rewards.\n\n` +
      `<b>How to participate:</b>\n` +
      `1️⃣ Sign in at <a href="${SITE_URL}">${SITE_URL}</a> with Discord\n` +
      `2️⃣ Complete tasks on the platform for points\n` +
      `3️⃣ Stay active in the community — admins award weekly activity points\n\n` +
      `📊 Use /leaderboard to see rankings\n\n` +
      `Let's go! 🚀`
    )
    return
  }

  if (text.startsWith('/leaderboard')) {
    await handleStatsCommand(chatId, '')
    return
  }

  if (ALLOWED_GROUP_ID && String(chatId) !== ALLOWED_GROUP_ID) return

  if (text.startsWith('/stats')) {
    const isAdmin = await isGroupAdmin(chatId, from.id)
    if (!isAdmin) {
      await sendMessage(chatId, '⛔ Only group admins can use /stats.')
      return
    }
    const args = text.slice('/stats'.length).trim()
    await handleStatsCommand(chatId, args)
    return
  }

  // Regular messages are not tracked — admins award weekly activity points manually.
}

async function poll(getLastPollAt: () => number, setLastPollAt: (t: number) => void) {
  let offset = 0
  console.log('🤖 Africa Monthly Bot starting (long-polling)...')

  await api('deleteWebhook', { drop_pending_updates: false })
  console.log('✅ Webhook cleared — long-polling active')

  while (true) {
    try {
      const res = await api<{ ok: boolean; result: TelegramUpdate[] }>('getUpdates', {
        offset,
        timeout: 30,
        allowed_updates: ['message'],
      })

      setLastPollAt(Date.now())

      if (res.ok && res.result.length > 0) {
        for (const update of res.result) {
          offset = update.update_id + 1
          const message = update.message
          if (message) {
            try {
              await handleMessage(message)
            } catch (err) {
              console.error('Error handling message:', err)
            }
          }
        }
      }
    } catch (err) {
      console.error('Poll error (will retry in 5s):', err)
      await new Promise((r) => setTimeout(r, 5000))
    }
  }
}

export async function startBot() {
  let lastPollAt = Date.now()
  const PORT = Number(process.env.PORT ?? 8080)

  createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
      const sinceLastPoll = Date.now() - lastPollAt
      const healthy = sinceLastPoll < 90_000
      res.writeHead(healthy ? 200 : 503, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        status: healthy ? 'ok' : 'stalled',
        botEnabled: true,
        uptimeSeconds: Math.round(process.uptime()),
        sinceLastPollMs: sinceLastPoll,
      }))
    } else {
      res.writeHead(404)
      res.end()
    }
  }).listen(PORT, () => console.log(`🩺 Health server listening on :${PORT}`))

  setInterval(() => {
    console.log(`[heartbeat] alive — uptime ${Math.round(process.uptime())}s`)
  }, 5 * 60 * 1000)

  await poll(() => lastPollAt, (t) => { lastPollAt = t })
}