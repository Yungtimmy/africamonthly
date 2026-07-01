import { supabase } from './supabase.js'
import { telegramPointsFromMessages } from './constants.js'

export async function processTelegramMessage(telegramId: string, displayName: string, telegramUsername?: string) {
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
      telegram_username: telegramUsername ?? telegramId,
      display_name: displayName,
      message_count: 1,
      points_awarded: 0,
      synced_at: new Date().toISOString(),
    })
    if (error) console.error('[supabase] insert telegram_events failed:', error.message)
  }

  const newPointsTotal = telegramPointsFromMessages(messageCount)

  if (newPointsTotal > previousPointsAwarded) {
    const delta = newPointsTotal - previousPointsAwarded

    const { error: ptsErr } = await supabase.from('telegram_events').update({
      points_awarded: newPointsTotal,
    }).eq('telegram_id', telegramId)
    if (ptsErr) console.error('[supabase] update points_awarded failed:', ptsErr.message)

    // Award atomically by telegram_id (no-ops if no linked user). Avoids lost
    // updates when an admin awards points to the same user concurrently.
    const { error: rpcErr } = await supabase.rpc('apply_telegram_points', {
      p_telegram_id: telegramId,
      p_delta: delta,
      p_chat_count: messageCount,
    })
    if (rpcErr) console.error('[supabase] apply_telegram_points failed:', rpcErr.message)
    else console.log(`[points] +${delta} pts → ${displayName} (${messageCount} msgs, ${newPointsTotal} pts total)`)
  }
}
