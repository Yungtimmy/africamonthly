'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface SubmissionModalProps {
  task: {
    _id: { toString(): string }
    title: string
    points: number
  }
  onClose: () => void
  onSubmitted: () => void
}

export function SubmissionModal({ task, onClose, onSubmitted }: SubmissionModalProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        body: JSON.stringify({ taskId: task._id.toString(), proofUrl: url }),
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
        <div className="flex items-center justify-between">
          <p className="font-serif text-[#F5F0E8] font-semibold">{task.title}</p>
          <Badge variant="points">+{task.points} pts</Badge>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="proof-url"
              className="block text-sm font-medium text-[#A09070] mb-2"
            >
              Proof link
            </label>
            <input
              id="proof-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              required
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-[#F5F0E8] text-sm placeholder:text-[#5A5040] focus:border-[#D4A017]/60 focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <p className="text-xs text-[#5A5040]">
            Submit a link as proof of completion (tweet, screenshot, video, etc.).
            An admin will review and approve your submission.
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
