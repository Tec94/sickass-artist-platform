import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

type ReadCtx = QueryCtx | MutationCtx

export type FanProgressionPoints = {
  totalPoints: number
  availablePoints: number
  redeemedPoints: number
  currentStreak: number
  maxStreak: number
  lastInteractionDate: number | null
  lastLoginDate: string | null
}

export type FanLeaderboardRewardSnapshot = {
  userId: Id<'users'>
  totalPoints: number
  availablePoints: number
  currentStreak: number
  maxStreak: number
  lastInteractionDate: number | null
}

export const emptyFanProgressionPoints = (): FanProgressionPoints => ({
  totalPoints: 0,
  availablePoints: 0,
  redeemedPoints: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastInteractionDate: null,
  lastLoginDate: null,
})

const toTimestamp = (value?: string | null): number | null => {
  if (!value) return null
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : null
}

export async function getFanProgressionPoints(
  ctx: ReadCtx,
  userId: Id<'users'>,
): Promise<FanProgressionPoints> {
  const [rewards, streak] = await Promise.all([
    ctx.db
      .query('userRewards')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first(),
    ctx.db
      .query('userStreaks')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first(),
  ])

  return {
    totalPoints: rewards?.totalPoints ?? 0,
    availablePoints: rewards?.availablePoints ?? 0,
    redeemedPoints: rewards?.redeemedPoints ?? 0,
    currentStreak: streak?.currentStreak ?? 0,
    maxStreak: streak?.maxStreak ?? 0,
    lastInteractionDate: toTimestamp(streak?.lastInteractionDate),
    lastLoginDate: streak?.lastLoginDate ?? null,
  }
}

export async function hydrateFanLeaderboardRewards(
  ctx: ReadCtx,
  rewards: Array<Pick<Doc<'userRewards'>, 'userId' | 'totalPoints' | 'availablePoints'>>,
): Promise<FanLeaderboardRewardSnapshot[]> {
  const streaks = await Promise.all(
    rewards.map((reward) =>
      ctx.db
        .query('userStreaks')
        .withIndex('by_userId', (q) => q.eq('userId', reward.userId))
        .first(),
    ),
  )

  return rewards.map((reward, index) => ({
    userId: reward.userId,
    totalPoints: reward.totalPoints,
    availablePoints: reward.availablePoints,
    currentStreak: streaks[index]?.currentStreak ?? 0,
    maxStreak: streaks[index]?.maxStreak ?? 0,
    lastInteractionDate: toTimestamp(streaks[index]?.lastInteractionDate),
  }))
}
