import { createServer } from 'http'
import { processTelegramMessage } from './telegram.js'
import { supabase } from './supabase.js'
import { telegramPointsFromMessages } from './constants.js'

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const ALLOWED_GROUP_ID = process.env.TELEGRAM_GROUP_ID
const SITE_URL = process.env.SITE_URL ?? 'https://injectiveafrica.vercel.app'

if (!TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN is required')
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

// Escape user-controlled text before interpolating into parse_mode: 'HTML'
// messages, so names containing <, > or & can't break or distort the output.
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
    const telegramPts = telegramPointsFromMessages(user.telegram_chat_count ?? 0)

    await sendMessage(chatId,
      `👤 <b>${esc(user.discord_username)}</b>\n` +
      `🏆 Rank: <b>#${rank}</b>\n` +
      `⚡ Monthly Points: <b>${user.monthly_points}</b>\n` +
      `📊 All-time Points: <b>${user.total_points}</b>\n` +
      `💬 Telegram chats: <b>${user.telegram_chat_count ?? 0}</b> (+${telegramPts} pts)`
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

  const telegramId = String(from.id)
  const text = message.text ?? ''

  console.log(`[recv] chat=${chatId} type=${message.chat.type} from=${telegramId} text=${JSON.stringify(text.slice(0, 40))}`)

  // /ping — works anywhere
  if (text.startsWith('/ping')) {
    await sendMessage(chatId,
      `🟢 <b>Africa Monthly Bot is live!</b>\n` +
      `🔁 Running 24/7 on Fly.io\n` +
      `🔗 <a href="${SITE_URL}">${SITE_URL}</a>`
    )
    return
  }

  // /start — works in DMs and groups
  if (text.startsWith('/start')) {
    await sendMessage(chatId,
      `👋 <b>Welcome to Africa Monthly!</b>\n\n` +
      `🏆 Compete monthly, earn points, and win rewards.\n\n` +
      `<b>How to participate:</b>\n` +
      `1️⃣ Sign in at <a href="${SITE_URL}">${SITE_URL}</a> with Discord\n` +
      `2️⃣ Connect your Telegram ID on your profile\n` +
      `3️⃣ Chat in the group to earn points (10 messages = 1 pt, max 500 pts/month)\n` +
      `4️⃣ Complete tasks on the platform for bonus points\n\n` +
      `📊 Use /stats to see the leaderboard\n\n` +
      `Let's go! 🚀`
    )
    return
  }

  // /leaderboard — public, shows the top 10 (works in DMs and groups)
  if (text.startsWith('/leaderboard')) {
    await handleStatsCommand(chatId, '')
    return
  }

  // All other commands and messages: group-only
  if (ALLOWED_GROUP_ID && String(chatId) !== ALLOWED_GROUP_ID) {
    console.log(`[skip] chat ${chatId} does not match TELEGRAM_GROUP_ID ${ALLOWED_GROUP_ID}`)
    return
  }

  // /stats (admin only)
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

  // Skip other commands
  if (text.startsWith('/')) return

  // Track regular message
  const displayName = from.username
    ? `@${from.username}`
    : [from.first_name, from.last_name].filter(Boolean).join(' ')

  console.log(`[track] ${displayName} (${telegramId})`)
  await processTelegramMessage(telegramId, displayName, from.username)
}

async function poll() {
  let offset = 0
  console.log('🤖 Africa Monthly Bot starting (long-polling)...')

  // Remove any existing webhook so long-polling works
  await api('deleteWebhook', { drop_pending_updates: false })
  console.log('✅ Webhook cleared — long-polling active')

  while (true) {
    try {
      const res = await api<{ ok: boolean; result: TelegramUpdate[] }>('getUpdates', {
        offset,
        timeout: 30,
        // Only real new messages count toward chats — not edits
        allowed_updates: ['message'],
      })

      lastPollAt = Date.now()

      if (res.ok && res.result.length > 0) {
        for (const update of res.result) {
          offset = update.update_id + 1
          const message = update.message
          if (message) {
            // Process serially: the message-count read/increment is not
            // atomic, so concurrent handling of two messages from the same
            // user would lose an increment (undercount). Awaiting avoids that.
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

// Track when the last successful Telegram poll completed, so the health
// endpoint can report whether the bot is actually polling (not just running).
let lastPollAt = Date.now()

// Lightweight HTTP server for uptime monitoring. An external monitor
// (e.g. UptimeRobot) pings /health; if the bot crashes the check fails and
// Fly restarts the machine. Healthy only if a poll completed recently.
const PORT = Number(process.env.PORT ?? 8080)
createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    const sinceLastPoll = Date.now() - lastPollAt
    const healthy = sinceLastPoll < 90_000 // long-poll is 30s; 90s = stalled
    res.writeHead(healthy ? 200 : 503, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      status: healthy ? 'ok' : 'stalled',
      uptimeSeconds: Math.round(process.uptime()),
      sinceLastPollMs: sinceLastPoll,
    }))
  } else {
    res.writeHead(404)
    res.end()
  }
}).listen(PORT, () => console.log(`🩺 Health server listening on :${PORT}`))

// Heartbeat so logs confirm the process is alive even when the group is quiet.
setInterval(() => {
  console.log(`[heartbeat] alive — uptime ${Math.round(process.uptime())}s`)
}, 5 * 60 * 1000)

poll()
