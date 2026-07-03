'use client'

import { useState, useEffect } from 'react'

export function OEmbedPreview({ url, className }: { url: string; className?: string }) {
  const [html, setHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!url) {
      setHtml(null)
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`
        )
        if (res.ok) {
          const data = (await res.json()) as { html: string }
          setHtml(data.html)
        } else {
          setHtml(null)
        }
      } catch {
        setHtml(null)
      } finally {
        setLoading(false)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [url])

  if (!url) return null
  if (loading) return <p className="text-xs text-white/30 italic">Loading preview...</p>
  if (!html) return <p className="text-xs text-red-400/70">Could not load preview for this URL.</p>

  return (
    <div
      className={className ?? 'rounded-xl overflow-hidden bg-black/30 border border-white/10 p-3 text-sm max-w-full [&_blockquote]:!m-0'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}