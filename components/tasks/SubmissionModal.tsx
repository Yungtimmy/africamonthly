'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ExternalLink } from 'lucide-react'

interface SubmissionModalProps {
  task: {
    id: string
    title: string
    points: number
    task_type?: string
    x_post_url?: string | null
    x_actions?: string[] | null
  }
  onClose: () => void
  onSubmitted: () => void
}

const ACTION_INSTRUCTIONS: Record<string, string> = {
  like: 'Take a screenshot of your like on the post',
  reply: 'Paste the link to your reply tweet',
  retweet: 'Take a screenshot of your retweet',
  quote: 'Paste the link to your quote tweet',
}

const ACTION_PLACEHOLDER: Record<string, string> = {
  like: 'https://imgur.com/... or any screenshot link',
  reply: 'https://x.com/yourname/status/...',
  retweet: 'https://imgur.com/... or any screenshot link',
  quote: 'https://x.com/yourname/status/...',
}

export function SubmissionModal({ task, onClose, onSubmitted }: SubmissionModalProps) {
  const [proofUrl, setProofUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isXPost = task.task_type === 'x_post'
  const actions = task.x_actions ?? []

  // Determine placeholder/instruction based on actions
  const hasLinkAction = actions.some((a) => a === 'reply' || a === 'quote')
  const hasScreenshotAction = actions.some((a) => a === 'like' || a === 'retweet')
  let proofLabel = 'Proof link'
  let proofPlaceholder = 'https://...'
  let proofHint = 'Submit a link as proof. An admin will review and award your points.'

  if (isXPost && actions.length > 0) {
    if (hasLinkAction && hasScreenshotAction) {
      proofLabel = 'Proof link (reply/quote URL or screenshot link)'
      proofPlaceholder = 'https://x.com/yourname/status/... or screenshot URL'
      proofHint = 'For replies/quotes paste the tweet URL. For likes/retweets paste a screenshot link (e.g. imgur.com).'
    } else if (hasLinkAction) {
      proofLabel = 'Your tweet link'
      proofPlaceholder = ACTION_PLACEHOLDER['reply']
      proofHint = 'Paste the direct link to your reply or quote tweet.'
    } else if (hasScreenshotAction) {
      proofLabel = 'Screenshot link'
      proofPlaceholder = ACTION_PLACEHOLDER['like']
      proofHint = 'Upload your screenshot to imgur.com (free, no account needed) and paste the link here.'
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try { new URL(proofUrl) } catch {
      setError('Please enter a valid URL (must start with http:// or https://)')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, proofUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit')
      onSubmitted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen title="Submit Proof" onClose={onClose}>
      <div className="space-y-5">
        {/* Task summary */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/4 border border-white/8">
          <p className="font-serif text-white font-semibold text-sm">
            {isXPost ? '𝕏 Twitter Task' : task.title}
          </p>
          <Badge variant="points">+{task.points} pts</Badge>
        </div>

        {/* X post actions + instructions */}
        {isXPost && actions.length > 0 && (
          <div className="rounded-xl bg-[#00D4FF]/5 border border-[#00D4FF]/15 p-4 space-y-3">
            <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Required actions</p>
            <div className="space-y-2">
              {actions.map((action) => (
                <div key={action} className="flex items-start gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-xs font-bold text-[#00D4FF] capitalize shrink-0">
                    {action}
                  </span>
                  <span className="text-xs text-white/50">{ACTION_INSTRUCTIONS[action]}</span>
                </div>
              ))}
            </div>
            {task.x_post_url && (
              <a
                href={task.x_post_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black border border-white/10 text-white text-xs font-medium hover:bg-white/5 transition-colors"
              >
                <span className="font-bold">𝕏</span> Open Post <ExternalLink size={10} />
              </a>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="proof-url" className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
              {proofLabel}
            </label>
            <input
              id="proof-url"
              type="url"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder={proofPlaceholder}
              required
              className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:border-[#00D4FF]/40 focus:outline-none focus:bg-white/6 transition-all"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <p className="text-xs text-white/30 leading-relaxed">{proofHint}</p>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !proofUrl} className="flex-1">
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
