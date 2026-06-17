import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IPointGrant extends Document {
  userId: Types.ObjectId
  points: number
  reason: string
  grantedBy: Types.ObjectId
  createdAt: Date
}

const PointGrantSchema = new Schema<IPointGrant>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    points: { type: Number, required: true },
    reason: { type: String, required: true },
    grantedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

export const PointGrant =
  mongoose.models.PointGrant || mongoose.model<IPointGrant>('PointGrant', PointGrantSchema)
