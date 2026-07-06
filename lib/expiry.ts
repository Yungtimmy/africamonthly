'use client'

import { useEffect, useState } from 'react'

export type Urgency = 'safe' | 'soon' | 'urgent' | 'expired'

/** Format a remaining duration as a compact countdown string.
 *  Examples: "3d 0h", "1d 4h", "7h 23m", "43m", "5m", "<1m". */
export function formatRemaining(target: string | Date | null | undefined): string {
  if (!target) return ''
  const t = typeof target === 'string' ? new Date(target).getTime() : target.getTime()
  const diffMs = t - Date.now()
  if (diffMs <= 0) return 'Expired'
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return '<1m'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ${minutes % 60}m`
  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h`
}

/** Color tier used to drive urgency styling on countdown chips. */
export function getUrgency(target: string | Date | null | undefined): Urgency {
  if (!target) return 'safe'
  const t = typeof target === 'string' ? new Date(target).getTime() : target.getTime()
  const diffMs = t - Date.now()
  if (diffMs <= 0) return 'expired'
  const hours = diffMs / 3_600_000
  if (hours < 3) return 'urgent'
  if (hours < 24) return 'soon'
  return 'safe'
}

/** React hook that re-renders every minute to keep the countdown live. */
export function useCountdown(target: string | Date | null | undefined): {
  remaining: string
  urgency: Urgency
  isExpired: boolean
} {
  const [, force] = useState(0)
  useEffect(() => {
    if (!target) return
    // re-render roughly every 30s so the displayed minutes stay accurate
    const id = setInterval(() => force((n) => n + 1), 30_000)
    return () => clearInterval(id)
  }, [target])
  const remaining = formatRemaining(target)
  const urgency = getUrgency(target)
  return { remaining, urgency, isExpired: urgency === 'expired' }
}

/** Maps an urgency tier to inline-style colours for countdown chips. */
export function urgencyClasses(urgency: Urgency): string {
  switch (urgency) {
    case 'expired':
      return 'bg-red-500/10 border-red-500/30 text-red-300'
    case 'urgent':
      return 'bg-red-500/8 border-red-500/25 text-red-300'
    case 'soon':
      return 'bg-amber-500/8 border-amber-500/25 text-amber-300'
    default:
      return 'bg-[#00D4FF]/[0.06] border-[#00D4FF]/20 text-[#00D4FF]'
  }
}
