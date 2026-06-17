import { connectDB } from '@/lib/db'
import { TelegramEvent } from '@/lib/models/TelegramEvent'
import { User } from '@/lib/models/User'

export async function processTelegramMessage(telegramUsername: string) {
  await connectDB()

  const event = await TelegramEvent.findOneAndUpdate(
    { telegramUsername },
    { $inc: { messageCount: 1 }, syncedAt: new Date() },
    { upsert: true, new: true }
  )

  const totalMessages = event.messageCount
  const newPointsTotal = Math.floor(totalMessages / 10)
  const previousPoints = event.pointsAwarded

  if (newPointsTotal > previousPoints) {
    const delta = newPointsTotal - previousPoints

    await TelegramEvent.updateOne({ telegramUsername }, { $set: { pointsAwarded: newPointsTotal } })

    await User.updateOne(
      { 'telegram.username': telegramUsername },
      {
        $inc: { totalPoints: delta, monthlyPoints: delta },
        $set: { 'telegram.chatCount': totalMessages },
      }
    )
  }
}
