import { supabase } from '@/lib/supabase'

export async function processTelegramMessage(telegramUsername: string) {
  // Upsert telegram_events row
  const { data: existing } = await supabase
    .from('telegram_events')
    .select('*')
    .eq('telegram_username', telegramUsername)
    .single()

  let messageCount: number
  let previousPointsAwarded: number

  if (existing) {
    messageCount = existing.message_count + 1
    previousPointsAwarded = existing.points_awarded

    await supabase.from('telegram_events').update({
      message_count: messageCount,
      synced_at: new Date().toISOString(),
    }).eq('telegram_username', telegramUsername)
  } else {
    messageCount = 1
    previousPointsAwarded = 0

    await supabase.from('telegram_events').insert({
      telegram_username: telegramUsername,
      message_count: 1,
      points_awarded: 0,
    })
  }

  const newPointsTotal = Math.floor(messageCount / 10)

  if (newPointsTotal > previousPointsAwarded) {
    const delta = newPointsTotal - previousPointsAwarded

    await supabase.from('telegram_events').update({
      points_awarded: newPointsTotal,
    }).eq('telegram_username', telegramUsername)

    const { data: user } = await supabase
      .from('users')
      .select('id, total_points, monthly_points')
      .eq('telegram_username', telegramUsername)
      .single()

    if (user) {
      await supabase.from('users').update({
        total_points: user.total_points + delta,
        monthly_points: user.monthly_points + delta,
        telegram_chat_count: messageCount,
      }).eq('id', user.id)
    }
  }
}
