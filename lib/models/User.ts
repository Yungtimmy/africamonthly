import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  discordId: string
  discordUsername: string
  discordAvatar?: string
  discordEmail?: string
  telegram?: { username: string; chatCount: number }
  twitter?: string
  walletAddress?: string
  totalPoints: number
  monthlyPoints: number
  isAdmin: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    discordId: { type: String, required: true, unique: true, index: true },
    discordUsername: { type: String, required: true },
    discordAvatar: String,
    discordEmail: String,
    telegram: {
      username: String,
      chatCount: { type: Number, default: 0 },
    },
    twitter: String,
    walletAddress: String,
    totalPoints: { type: Number, default: 0 },
    monthlyPoints: { type: Number, default: 0 },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
