import { NextResponse } from 'next/server'
import { processTelegramMessage } from '@/lib/telegram'
import { supabase } from '@/lib/supabase'

const ALLOWED_GROUP_ID = process.env.TELEGRAM_GROUP_ID
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

async function sendMessage(chatId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

async function isGroupAdmin(chatId: string, userId: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${chatId}&user_id=${userId}`
    )
    const data = await res.json() as { result?: { status: string } }
    const status = data.result?.status
    return status === 'administrator' || status === 'creator'
  } catch {
    return false
  }
}

async function handleStatsCommand(chatId: string, args: string) {
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
      await sendMessage(chatId, `❌ User <b>${target}</b> not found or hasn't signed up yet.`)
      return
    }

    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gt('monthly_points', user.monthly_points)

    const rank = (count ?? 0) + 1
    const telegramPts = Math.floor((user.telegram_chat_count ?? 0) / 10)

    await sendMessage(chatId,
      `👤 <b>${user.discord_username}</b>\n` +
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
      return `${medal} <b>${u.discord_username}</b> — ${u.monthly_points} pts`
    })

    await sendMessage(chatId,
      `🏆 <b>Africa Monthly Leaderboard</b>\n\n${lines.join('\n')}\n\n`
    )
  }
}

export async function POST(req: Request) {
  const secret = req.headers.get('x-telegram-bot-api-secret-token')
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const message = body?.message || body?.edited_message

    if (!message) return NextResponse.json({ ok: true })

    const chatId = String(message.chat?.id ?? '')
    const from = message.from
    if (!from || from.is_bot) return NextResponse.json({ ok: true })

    const telegramId = String(from.id)
    const text: string = message.text ?? ''

    // /ping — works anywhere, confirms bot is live
    if (text.startsWith('/ping')) {
      await sendMessage(chatId,
        `🟢 <b>Africa Monthly Bot is live!</b>\n` +
        `📡 Webhook active — messages are being tracked.\n` +
        `🔗 <a href="https://injectiveafrica.vercel.app">injectiveafrica.vercel.app</a>`
      )
      return NextResponse.json({ ok: true })
    }

    // /start — works in DMs and in the group
    if (text.startsWith('/start')) {
      await sendMessage(chatId,
        `👋 <b>Welcome to Africa Monthly!</b>\n\n` +
        `🏆 Compete monthly, earn points, and win rewards.\n\n` +
        `<b>How to participate:</b>\n` +
        `1️⃣ Sign in at <a href="https://injectiveafrica.vercel.app">injectiveafrica.vercel.app</a> with Discord\n` +
        `2️⃣ Connect your Telegram ID on your profile\n` +
        `3️⃣ Chat in this group to earn points (10 messages = 1 pt)\n` +
        `4️⃣ Complete tasks on the platform for bonus points\n\n` +
        `📊 Use /stats to see the leaderboard\n\n` +
        `Let's go! 🚀`
      )
      return NextResponse.json({ ok: true })
    }

    // All other commands and messages are group-only
    if (ALLOWED_GROUP_ID && chatId !== ALLOWED_GROUP_ID) {
      return NextResponse.json({ ok: true })
    }

    // /stats command (admin only)
    if (text.startsWith('/stats')) {
      const isAdmin = await isGroupAdmin(chatId, telegramId)
      if (!isAdmin) {
        await sendMessage(chatId, '⛔ Only group admins can use /stats.')
        return NextResponse.json({ ok: true })
      }
      const args = text.slice('/stats'.length).trim()
      await handleStatsCommand(chatId, args)
      return NextResponse.json({ ok: true })
    }

    // Skip other commands
    if (text.startsWith('/')) return NextResponse.json({ ok: true })

    // Track regular message
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
