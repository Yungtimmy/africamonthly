import mongoose, { Schema, Document, Types } from 'mongoose'

export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

export interface ISubmission extends Document {
  userId: Types.ObjectId
  taskId: Types.ObjectId
  proofUrl: string
  status: SubmissionStatus
  reviewedBy?: Types.ObjectId
  reviewedAt?: Date
  pointsAwarded?: number
  createdAt: Date
  updatedAt: Date
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    proofUrl: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    pointsAwarded: Number,
  },
  { timestamps: true }
)

SubmissionSchema.index({ userId: 1, taskId: 1 })
SubmissionSchema.index({ status: 1 })

export const Submission =
  mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema)
