'use client'

import { useState } from 'react'
import { ExternalLink, CheckCircle, XCircle, Image as ImageIcon, Link2 } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatRelativeTime } from '@/lib/utils'

interface Submission {
  id: string
  proof_url: string
  proof_note?: string | null
  status: string
  created_at: string
  users: { discord_username: string; discord_avatar?: string } | null
  tasks: { title: string; points: number; task_type?: string; x_post_url?: string | null; x_actions?: string[] | null } | null
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
        setSubmissions((prev) => prev.filter((s) => s.id !== id))
      }
    } finally {
      setLoading(null)
    }
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-16 text-white/30">
        <CheckCircle className="w-10 h-10 mx-auto mb-3 text-white/10" />
        <p className="font-serif text-xl text-white/60 mb-1">All caught up</p>
        <p className="text-sm">No pending submissions.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {submissions.map((sub) => {
        const isProcessing = loading === sub.id
        const isXPost = sub.tasks?.task_type === 'x_post'
        return (
          <div
            key={sub.id}
            className="bg-white/3 border border-white/8 rounded-2xl p-5 space-y-4 backdrop-blur-sm"
          >
            {/* User + time */}
            <div className="flex items-center gap-3">
              <Avatar
                src={sub.users?.discord_avatar}
                name={sub.users?.discord_username ?? '?'}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {sub.users?.discord_username ?? 'Unknown user'}
                </p>
                <p className="text-xs text-white/30">{formatRelativeTime(sub.created_at)}</p>
              </div>
              <Badge variant="points">+{sub.tasks?.points ?? 0} pts</Badge>
            </div>

            {/* Task info */}
            <div className="bg-white/4 rounded-xl p-3">
              <p className="text-xs text-white/30 mb-1">Task</p>
              {isXPost ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">𝕏</span>
                    <span className="text-sm text-white font-medium">X / Twitter Task</span>
                  </div>
                  {sub.tasks?.x_actions && sub.tasks.x_actions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {sub.tasks.x_actions.map((a) => (
                        <span key={a} className="text-xs text-[#00D4FF] capitalize px-2 py-0.5 rounded bg-[#00D4FF]/10 border border-[#00D4FF]/20">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                  {sub.tasks?.x_post_url && (
                    <a
                      href={sub.tasks.x_post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#D4A017] hover:text-[#E8B94F] mt-1"
                    >
                      View original post <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-sm text-white font-medium">{sub.tasks?.title ?? 'Task removed'}</p>
              )}
            </div>

            {/* Proof */}
            <div className="bg-white/4 rounded-xl p-3 space-y-2">
              <p className="text-xs text-white/30 flex items-center gap-1.5">
                <Link2 size={11} /> Proof submitted
              </p>
              <a
                href={sub.proof_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#00D4FF] hover:text-[#00D4FF]/80 flex items-center gap-1.5 transition-colors break-all"
              >
                {sub.proof_url} <ExternalLink size={12} className="shrink-0" />
              </a>
              {sub.proof_note && (
                <div className="flex items-start gap-1.5 mt-1 pt-2 border-t border-white/5">
                  <ImageIcon size={11} className="text-white/30 mt-0.5 shrink-0" />
                  <p className="text-xs text-white/40">{sub.proof_note}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="danger"
                size="sm"
                disabled={isProcessing}
                onClick={() => handleReview(sub.id, 'reject')}
                className="flex items-center gap-2"
              >
                <XCircle size={16} /> Reject
              </Button>
              <Button
                size="sm"
                disabled={isProcessing}
                onClick={() => handleReview(sub.id, 'approve')}
                className="flex items-center gap-2 !bg-emerald-700 hover:!bg-emerald-600"
              >
                <CheckCircle size={16} /> {isProcessing ? 'Processing...' : 'Approve'}
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
