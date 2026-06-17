import mongoose, { Schema, Document } from 'mongoose'

export interface ITelegramEvent extends Document {
  telegramUsername: string
  messageCount: number
  pointsAwarded: number
  syncedAt: Date
}

const TelegramEventSchema = new Schema<ITelegramEvent>({
  telegramUsername: { type: String, required: true, unique: true, index: true },
  messageCount: { type: Number, default: 0 },
  pointsAwarded: { type: Number, default: 0 },
  syncedAt: { type: Date, default: Date.now },
})

export const TelegramEvent =
  mongoose.models.TelegramEvent ||
  mongoose.model<ITelegramEvent>('TelegramEvent', TelegramEventSchema)
