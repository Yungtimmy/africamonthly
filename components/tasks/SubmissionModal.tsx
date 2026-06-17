'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

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

const ACTION_LABELS: Record<string, string> = {
  like: 'Like',
  reply: 'Reply',
  retweet: 'Retweet',
  quote: 'Quote',
}

export function SubmissionModal({ task, onClose, onSubmitted }: SubmissionModalProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isXPost = task.task_type === 'x_post'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try { new URL(url) } catch {
      setError('Please enter a valid URL (must start with http:// or https://)')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, proofUrl: url }),
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
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/4 border border-white/8">
          <p className="font-serif text-white font-semibold text-sm">
            {isXPost ? '𝕏 Twitter Task' : task.title}
          </p>
          <Badge variant="points">+{task.points} pts</Badge>
        </div>

        {isXPost && task.x_actions && task.x_actions.length > 0 && (
          <div className="p-3 rounded-xl bg-[#00D4FF]/5 border border-[#00D4FF]/15">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Required actions</p>
            <div className="flex flex-wrap gap-2">
              {task.x_actions.map((action) => (
                <span key={action} className="px-2.5 py-1 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-xs font-semibold text-[#00D4FF]">
                  {ACTION_LABELS[action] ?? action}
                </span>
              ))}
            </div>
            {task.x_post_url && (
              <a
                href={task.x_post_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-lg bg-black border border-white/10 text-white text-xs font-medium hover:bg-white/5 transition-colors"
              >
                <span className="font-bold">𝕏</span> Open Post
              </a>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="proof-url" className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
              Proof link (screenshot or post link)
            </label>
            <input
              id="proof-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              required
              className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:border-[#00D4FF]/40 focus:outline-none focus:bg-white/6 transition-all"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <p className="text-xs text-white/20">
            Submit a link as proof of completion. An admin will review and award your points.
          </p>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !url} className="flex-1">
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
