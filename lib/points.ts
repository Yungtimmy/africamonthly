export const X_ACTION_POINTS = {
  like: 3,
  reply: 5,
  repost: 10,
} as const

export type XAction = keyof typeof X_ACTION_POINTS

const REPOST_ALIASES = new Set(['retweet', 'quote', 'repost'])

/** Collapse legacy retweet/quote into a single repost action (one +10, not two). */
export function normalizeXActions(actions: string[]): XAction[] {
  const out: XAction[] = []
  let hasRepost = false
  for (const raw of actions) {
    if (raw === 'like' || raw === 'reply') {
      if (!out.includes(raw)) out.push(raw)
    } else if (REPOST_ALIASES.has(raw)) {
      hasRepost = true
    }
  }
  if (hasRepost) out.push('repost')
  return out
}

export function calculateXPoints(actions: string[]): number {
  return normalizeXActions(actions).reduce((sum, a) => sum + X_ACTION_POINTS[a], 0)
}

const ACTION_LABELS: Record<XAction, string> = {
  like: 'Like',
  reply: 'Reply',
  repost: 'Repost / Quote',
}

export function formatXActionsLabel(actions: string[] | null | undefined): string {
  if (!actions?.length) return 'X Task'
  return normalizeXActions(actions).map((a) => ACTION_LABELS[a]).join(' + ')
}

export function isValidXAction(action: string): boolean {
  return action in X_ACTION_POINTS || REPOST_ALIASES.has(action)
}