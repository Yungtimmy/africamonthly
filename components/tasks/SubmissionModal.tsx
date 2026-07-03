'use client'

import { useState, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ExternalLink, Upload, ImageIcon, X } from 'lucide-react'
import { OEmbedPreview } from '@/components/ui/OEmbedPreview'
import { formatXActionsLabel, normalizeXActions } from '@/lib/points'

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
  like: 'Upload a screenshot of your like on the post',
  reply: 'Paste the link to your reply tweet',
  repost: 'Upload a screenshot of your repost, or paste your quote tweet link',
}

export function SubmissionModal({ task, onClose, onSubmitted }: SubmissionModalProps) {
  const [proofUrl, setProofUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const isXPost = task.task_type === 'x_post'
  const actions = normalizeXActions(task.x_actions ?? [])
  const hasLinkAction = actions.some((a) => a === 'reply' || a === 'repost')
  const hasScreenshotAction = actions.some((a) => a === 'like' || a === 'repost')

  // For non-X tasks or tasks needing screenshots: show file upload
  // For link-only actions: show URL input
  const needsFile = !isXPost || hasScreenshotAction
  const needsUrl = isXPost && hasLinkAction

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError(null)
  }

  function clearFile() {
    setFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    let finalUrl = proofUrl

    // Upload file if provided
    if (file) {
      setUploading(true)
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')
        finalUrl = data.url
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
        setUploading(false)
        return
      } finally {
        setUploading(false)
      }
    }

    if (!finalUrl) {
      setError('Please upload a screenshot or paste a link.')
      return
    }

    if (proofUrl && !file) {
      try { new URL(proofUrl) } catch {
        setError('Please enter a valid URL (must start with https://)')
        return
      }
    }

    setLoading(true)
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, proofUrl: finalUrl }),
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

  const isSubmitting = uploading || loading

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

        {/* X post actions */}
        {isXPost && actions.length > 0 && (
          <div className="rounded-xl bg-[#00D4FF]/5 border border-[#00D4FF]/15 p-4 space-y-3">
            <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">
              Required: {formatXActionsLabel(actions)}
            </p>
            <div className="space-y-2">
              {actions.map((action) => (
                <p key={action} className="text-xs text-white/50">
                  <span className="text-[#00D4FF] font-semibold">{action === 'repost' ? 'Repost / Quote' : action}</span>
                  {' — '}{ACTION_INSTRUCTIONS[action]}
                </p>
              ))}
            </div>
            {task.x_post_url && (
              <>
                <OEmbedPreview url={task.x_post_url} />
                <a
                  href={task.x_post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-[#00D4FF] transition-colors"
                >
                  Open on X <ExternalLink size={10} />
                </a>
              </>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Screenshot upload */}
          {needsFile && (
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                {needsUrl ? 'Screenshot (for like/repost)' : 'Screenshot'}
              </label>
              {preview ? (
                <div className="relative rounded-xl overflow-hidden border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Preview" className="w-full max-h-48 object-cover" />
                  <button
                    type="button"
                    onClick={clearFile}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex flex-col items-center gap-3 py-8 rounded-xl border-2 border-dashed border-white/10 hover:border-[#00D4FF]/30 hover:bg-[#00D4FF]/3 transition-all text-white/30 hover:text-white/50"
                >
                  <Upload size={24} />
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to upload screenshot</p>
                    <p className="text-xs mt-0.5">JPG, PNG, GIF, WEBP up to 10MB</p>
                  </div>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* URL input for reply/quote */}
          {needsUrl && (
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                <div className="flex items-center gap-1.5">
                  <ImageIcon size={11} />
                  {hasScreenshotAction ? 'Tweet link (for reply/repost)' : 'Your tweet link'}
                </div>
              </label>
              <input
                type="url"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://x.com/yourname/status/..."
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:border-[#00D4FF]/40 focus:outline-none focus:bg-white/6 transition-all"
              />
            </div>
          )}

          {/* For non-X tasks: also allow URL fallback */}
          {!isXPost && !file && (
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                Or paste a link
              </label>
              <input
                type="url"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:border-[#00D4FF]/40 focus:outline-none focus:bg-white/6 transition-all"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || (!file && !proofUrl)} className="flex-1">
              {uploading ? 'Uploading...' : loading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
