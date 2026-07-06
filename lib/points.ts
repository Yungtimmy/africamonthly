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

/** Public label for a single X action (e.g. 'like' -> 'Like'). Falls back to the raw string. */
export function getXActionLabel(action: string): string {
  if (action in ACTION_LABELS) return ACTION_LABELS[action as XAction]
  return action
}

/** Points for a single X action; returns 0 for unknown actions. */
export function getXActionPoints(action: string): number {
  return X_ACTION_POINTS[action as XAction] ?? 0
}

export function formatXActionsLabel(actions: string[] | null | undefined): string {
  if (!actions?.length) return 'X Task'
  return normalizeXActions(actions).map((a) => ACTION_LABELS[a]).join(' + ')
}

export function isValidXAction(action: string): boolean {
  return action in X_ACTION_POINTS || REPOST_ALIASES.has(action)
}