'use client'

import { useState } from 'react'
import { ExternalLink, CheckCircle, XCircle } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatRelativeTime } from '@/lib/utils'

interface Submission {
  _id: { toString(): string }
  proofUrl: string
  status: string
  createdAt: string | Date
  userId: { discordUsername: string; discordAvatar?: string } | null
  taskId: { title: string; points: number } | null
}

export function SubmissionsClient({ initialSubmissions }: { initialSubmissions: Submission[] }) {
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [loading, setLoading] = useState<string | null>(null)

  async function handleReview(id: string, action: 'approve' | 'reject') {
    setLoading(id)
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s._id.toString() !== id))
      }
    } finally {
      setLoading(null)
    }
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-16 text-[#A09070]">
        <CheckCircle className="w-10 h-10 mx-auto mb-3 text-[#2A2A2A]" />
        <p className="font-serif text-xl text-[#F5F0E8] mb-1">All caught up</p>
        <p className="text-sm">No pending submissions.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {submissions.map((sub) => {
        const id = sub._id.toString()
        const isProcessing = loading === id
        return (
          <div
            key={id}
            className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-5 space-y-4"
          >
            <div className="flex items-center gap-3">
              <Avatar
                src={sub.userId?.discordAvatar}
                name={sub.userId?.discordUsername ?? '?'}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#F5F0E8] truncate">
                  {sub.userId?.discordUsername ?? 'Unknown user'}
                </p>
                <p className="text-xs text-[#5A5040]">{formatRelativeTime(sub.createdAt)}</p>
              </div>
              <Badge variant="points">+{sub.taskId?.points ?? 0} pts</Badge>
            </div>

            <div className="bg-[#0A0A0A] rounded-lg p-3">
              <p className="text-xs text-[#5A5040] mb-1">Task</p>
              <p className="text-sm text-[#F5F0E8] font-medium">{sub.taskId?.title ?? 'Task removed'}</p>
            </div>

            <div className="bg-[#0A0A0A] rounded-lg p-3">
              <p className="text-xs text-[#5A5040] mb-1">Proof link</p>
              <a
                href={sub.proofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#D4A017] hover:text-[#E8B94F] flex items-center gap-1.5 transition-colors truncate"
              >
                {sub.proofUrl} <ExternalLink size={12} className="shrink-0" />
              </a>
            </div>

            <div className="flex gap-3">
              <Button
                variant="danger"
                size="sm"
                disabled={isProcessing}
                onClick={() => handleReview(id, 'reject')}
                className="flex items-center gap-2"
              >
                <XCircle size={16} /> Reject
              </Button>
              <Button
                size="sm"
                disabled={isProcessing}
                onClick={() => handleReview(id, 'approve')}
                className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white"
              >
                <CheckCircle size={16} /> Approve
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
