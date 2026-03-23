import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import { v } from 'convex/values'
import { api } from './_generated/api'
import { requireAdmin } from './helpers'

type ReadCtx = QueryCtx | MutationCtx

type CanonicalStreakState = {
  currentStreak: number
  maxStreak: number
  lastInteractionDate: string
  streakStartDate: string
  lastBreakDate?: string
  breakReason?: 'missed_day' | 'manual_reset' | 'admin_reset' | 'seasonal_reset'
  hasStreakFreeze: boolean
  unseenMilestones: string[]
  lastLoginDate?: string
}

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function getYesterdayISO(): string {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
}

async function readCanonicalStreakState(
  ctx: ReadCtx,
  userId: Id<'users'>,
): Promise<CanonicalStreakState | null> {
  const canonical = await ctx.db
    .query('userStreaks')
    .withIndex('by_userId', (q) => q.eq('userId', userId))
    .first()

  if (!canonical) return null

  return {
    currentStreak: canonical.currentStreak,
    maxStreak: canonical.maxStreak,
    lastInteractionDate: canonical.lastInteractionDate,
    streakStartDate: canonical.streakStartDate,
    lastBreakDate: canonical.lastBreakDate,
    breakReason: canonical.breakReason,
    hasStreakFreeze: canonical.hasStreakFreeze,
    unseenMilestones: canonical.unseenMilestones,
    lastLoginDate: canonical.lastLoginDate,
  }
}

async function upsertCanonicalStreak(
  ctx: MutationCtx,
  userId: Id<'users'>,
  streak: CanonicalStreakState,
) {
  const existing = await ctx.db
    .query('userStreaks')
    .withIndex('by_userId', (q) => q.eq('userId', userId))
    .first()

  const payload = {
    userId,
    currentStreak: streak.currentStreak,
    maxStreak: streak.maxStreak,
    lastInteractionDate: streak.lastInteractionDate,
    streakStartDate: streak.streakStartDate,
    lastBreakDate: streak.lastBreakDate,
    breakReason: streak.breakReason,
    hasStreakFreeze: streak.hasStreakFreeze,
    unseenMilestones: streak.unseenMilestones,
    lastLoginDate: streak.lastLoginDate ?? streak.lastInteractionDate,
    updatedAt: Date.now(),
  }

  if (existing) {
    await ctx.db.patch(existing._id, payload)
  } else {
    await ctx.db.insert('userStreaks', {
      ...payload,
      createdAt: Date.now(),
    })
  }
}

async function checkStreakMilestone(
  ctx: MutationCtx,
  userId: Id<'users'>,
  days: number
) {
  const milestones = [7, 14, 30, 60, 90, 180, 365, 730]

  if (!milestones.includes(days)) return

  const existing = await ctx.db
    .query('userStreakMilestones')
    .withIndex('by_userId_day', (q) => q.eq('userId', userId).eq('day', days))
    .first()

  if (existing) return

  const milestone = await ctx.db
    .query('streakMilestones')
    .withIndex('by_day', (q) => q.eq('day', days))
    .first()

  if (!milestone) return

  await ctx.runMutation(api.points.awardPoints, {
    userId,
    type: 'quest_complete',
    amount: milestone.rewardPoints,
    description: `${days}-day streak milestone!`,
    idempotencyKey: `milestone-${userId}-${days}`,
  })

  await ctx.db.insert('userStreakMilestones', {
    userId,
    day: days,
    pointsAwarded: milestone.rewardPoints,
    badgeId: milestone.rewardBadgeId,
    awardedAt: Date.now(),
  })

  if (milestone.rewardBadgeId) {
    const streak = (await readCanonicalStreakState(ctx, userId)) ?? {
      currentStreak: days,
      maxStreak: days,
      lastInteractionDate: getTodayISO(),
      streakStartDate: getTodayISO(),
      hasStreakFreeze: false,
      unseenMilestones: [],
    }

    const unseenMilestones = streak.unseenMilestones.includes(milestone.rewardBadgeId)
      ? streak.unseenMilestones
      : [...streak.unseenMilestones, milestone.rewardBadgeId]

    await upsertCanonicalStreak(ctx, userId, {
      ...streak,
      unseenMilestones,
    })
  }
}

function calculateStreakBonus(days: number): number {
  if (days < 7) return 0
  if (days === 7) return 50
  if (days === 14) return 100
  if (days === 30) return 200
  if (days === 60) return 400
  if (days === 90) return 500
  if (days === 180) return 1000
  if (days === 365) return 2000
  if (days > 365) return 5000

  if (days > 30) return Math.floor(200 + (days - 30) * 5)
  if (days > 14) return Math.floor(100 + (days - 14) * 7)
  if (days > 7) return Math.floor(50 + (days - 7) * 7)
  return 0
}

export const updateStreak = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const today = getTodayISO()
    const yesterday = getYesterdayISO()
    const existing = await readCanonicalStreakState(ctx, args.userId)

    if (!existing) {
      const created: CanonicalStreakState = {
        currentStreak: 1,
        maxStreak: 1,
        lastInteractionDate: today,
        streakStartDate: today,
        hasStreakFreeze: false,
        unseenMilestones: [],
        lastLoginDate: today,
      }

      await upsertCanonicalStreak(ctx, args.userId, created)
      return { streakDays: 1, isNewStreak: true }
    }

    if (existing.lastInteractionDate === today) {
      return { streakDays: existing.currentStreak, isNewStreak: false }
    }

    if (existing.lastInteractionDate === yesterday) {
      const nextStreak = existing.currentStreak + 1
      const nextState: CanonicalStreakState = {
        ...existing,
        currentStreak: nextStreak,
        maxStreak: Math.max(nextStreak, existing.maxStreak),
        lastInteractionDate: today,
        lastLoginDate: today,
      }

      await upsertCanonicalStreak(ctx, args.userId, nextState)

      const bonusPoints = calculateStreakBonus(nextStreak)
      if (bonusPoints > 0) {
        await ctx.runMutation(api.points.awardPoints, {
          userId: args.userId,
          type: 'streak_bonus',
          amount: bonusPoints,
          description: `${nextStreak}-day streak bonus`,
          idempotencyKey: `streak-bonus-${args.userId}-${today}`,
          metadata: { streakMultiplier: 1 + nextStreak * 0.1 },
        })
      }

      await checkStreakMilestone(ctx, args.userId, nextStreak)
      return { streakDays: nextStreak, isNewStreak: false, bonusPoints }
    }

    const resetState: CanonicalStreakState = {
      ...existing,
      currentStreak: 1,
      lastInteractionDate: today,
      streakStartDate: today,
      lastBreakDate: existing.lastInteractionDate,
      breakReason: 'missed_day',
      lastLoginDate: today,
    }

    await upsertCanonicalStreak(ctx, args.userId, resetState)
    return { streakDays: 1, isNewStreak: true, streakBroken: true }
  },
})

export const adminResetStreak = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, ['admin'])

    const today = getTodayISO()
    const streak = await readCanonicalStreakState(ctx, args.userId)
    if (!streak) return

    await upsertCanonicalStreak(ctx, args.userId, {
      ...streak,
      currentStreak: 0,
      lastBreakDate: today,
      breakReason: 'admin_reset',
      lastLoginDate: today,
    })

    return { success: true }
  },
})

export const getUserStreak = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const streak = await readCanonicalStreakState(ctx, args.userId)

    if (!streak) {
      return {
        currentStreak: 0,
        maxStreak: 0,
        lastInteractionDate: null,
        hasStreakFreeze: false,
      }
    }

    return {
      currentStreak: streak.currentStreak,
      maxStreak: streak.maxStreak,
      lastInteractionDate: streak.lastInteractionDate,
      hasStreakFreeze: streak.hasStreakFreeze,
    }
  },
})

export const getStreakLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 50, 500)

    const topStreaks = await ctx.db
      .query('userStreaks')
      .withIndex('by_currentStreak')
      .order('desc')
      .take(limit)

    const results = await Promise.all(
      topStreaks.map(async (streak) => {
        const user = await ctx.db.get(streak.userId)
        return {
          userId: streak.userId,
          username: user?.username || 'Unknown',
          avatar: user?.avatar,
          currentStreak: streak.currentStreak,
          maxStreak: streak.maxStreak,
        }
      })
    )

    return results
  },
})

export const getUserMilestones = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('userStreakMilestones')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .collect()
  },
})
