export const MESSAGES_PER_TELEGRAM_POINT = 10
export const TELEGRAM_MONTHLY_POINTS_CAP = 500

export function telegramPointsFromMessages(messageCount: number): number {
  return Math.min(
    Math.floor(messageCount / MESSAGES_PER_TELEGRAM_POINT),
    TELEGRAM_MONTHLY_POINTS_CAP
  )
}