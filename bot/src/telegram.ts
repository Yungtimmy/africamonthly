import { supabase } from './supabase.js'

export async function processTelegramMessage(telegramId: string, displayName: string) {
  const { data: existing, error: selectErr } = await supabase
    .from('telegram_events')
    .select('*')
    .eq('telegram_id', telegramId)
    .maybeSingle()

  if (selectErr) {
    console.error('[supabase] select telegram_events failed:', selectErr.message)
  }

  let messageCount: number
  let previousPointsAwarded: number

  if (existing) {
    messageCount = existing.message_count + 1
    previousPointsAwarded = existing.points_awarded

    const { error } = await supabase.from('telegram_events').update({
      message_count: messageCount,
      display_name: displayName,
      synced_at: new Date().toISOString(),
    }).eq('telegram_id', telegramId)
    if (error) console.error('[supabase] update telegram_events failed:', error.message)
  } else {
    messageCount = 1
    previousPointsAwarded = 0

    const { error } = await supabase.from('telegram_events').insert({
      telegram_id: telegramId,
      display_name: displayName,
      message_count: 1,
      points_awarded: 0,
      synced_at: new Date().toISOString(),
    })
    if (error) console.error('[supabase] insert telegram_events failed:', error.message)
  }

  const newPointsTotal = Math.floor(messageCount / 10)

  if (newPointsTotal > previousPointsAwarded) {
    const delta = newPointsTotal - previousPointsAwarded

    const { error: ptsErr } = await supabase.from('telegram_events').update({
      points_awarded: newPointsTotal,
    }).eq('telegram_id', telegramId)
    if (ptsErr) console.error('[supabase] update points_awarded failed:', ptsErr.message)

    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('id, total_points, monthly_points')
      .eq('telegram_id', telegramId)
      .maybeSingle()
    if (userErr) console.error('[supabase] select user failed:', userErr.message)

    if (user) {
      const { error: updErr } = await supabase.from('users').update({
        total_points: user.total_points + delta,
        monthly_points: user.monthly_points + delta,
        telegram_chat_count: messageCount,
      }).eq('id', user.id)
      if (updErr) console.error('[supabase] update user points failed:', updErr.message)

      console.log(`[points] +${delta} pts → ${displayName} (${messageCount} msgs, ${newPointsTotal} pts total)`)
    }
  }
}
