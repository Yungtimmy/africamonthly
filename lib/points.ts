export const MESSAGES_PER_TELEGRAM_POINT = 10
export const TELEGRAM_MONTHLY_POINTS_CAP = 500

export const X_ACTION_POINTS = {
  like: 3,
  reply: 5,
  retweet: 10,
  quote: 10,
} as const

export type XAction = keyof typeof X_ACTION_POINTS

export function telegramPointsFromMessages(messageCount: number): number {
  return Math.min(
    Math.floor(messageCount / MESSAGES_PER_TELEGRAM_POINT),
    TELEGRAM_MONTHLY_POINTS_CAP
  )
}

export function isTelegramPointsCapped(messageCount: number): boolean {
  return telegramPointsFromMessages(messageCount) >= TELEGRAM_MONTHLY_POINTS_CAP
}