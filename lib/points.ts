export const X_ACTION_POINTS = {
  like: 3,
  reply: 5,
  retweet: 10,
  quote: 10,
} as const

export type XAction = keyof typeof X_ACTION_POINTS