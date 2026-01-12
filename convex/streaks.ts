import { mutation, query } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { v, ConvexError } from 'convex/values'
import { api } from './_generated/api'

// ============ UTILITIES ============

/**
 * Get today's date in user's timezone as ISO string (YYYY-MM-DD)
 * For now, we'll use UTC. In production, pass user's timezone from profile.
 */
function getTodayISO(): string {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

/**
 * Get yesterday's date as ISO string
 */
function getYesterdayISO(): string {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
  return yesterday.toISOString().split('T')[0]
}

// ============ MUTATIONS ============

/**
 * Called on any user interaction (login, post, etc)
 * Updates streak automatically
 */
export const updateStreak = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const today = getTodayISO()

    // Get streak record
    const streak = await ctx.db
      .query('streakBonus')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first()

    if (!streak) {
      // Create new streak (first interaction)
      await ctx.db.insert('streakBonus', {
        userId: args.userId,
        currentStreak: 1,
        maxStreak: 1,
        lastInteractionDate: today,
        streakStartDate: today,
        hasStreakFreeze: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      return { streakDays: 1, isNewStreak: true }
    }

    // Already updated today
    if (streak.lastInteractionDate === today) {
      return { streakDays: streak.currentStreak, isNewStreak: false }
    }

    const yesterday = getYesterdayISO()

    // Check if streak continues (yesterday was last interaction)
    if (streak.lastInteractionDate === yesterday) {
      // Extend streak
      const newStreak = streak.currentStreak + 1
      const newMaxStreak = Math.max(newStreak, streak.maxStreak)

      await ctx.db.patch(streak._id, {
        currentStreak: newStreak,
        maxStreak: newMaxStreak,
        lastInteractionDate: today,
        updatedAt: Date.now(),
      })

      // Award bonus points based on streak length
      const bonusPoints = calculateStreakBonus(newStreak)
      if (bonusPoints > 0) {
        await ctx.runMutation(api.points.awardPoints, {
          userId: args.userId,
          type: 'streak_bonus',
          amount: bonusPoints,
          description: `${newStreak}-day streak bonus`,
          idempotencyKey: `streak-bonus-${args.userId}-${today}`,
          metadata: { streakMultiplier: 1 + newStreak * 0.1 },
        })
      }

      // Check for milestone
      await checkStreakMilestone(ctx, args.userId, newStreak)

      return { streakDays: newStreak, isNewStreak: false, bonusPoints }
    }

    // Streak broken (gap > 1 day)
    await ctx.db.patch(streak._id, {
      currentStreak: 1,
      lastInteractionDate: today,
      streakStartDate: today,
      lastBreakDate: streak.lastInteractionDate,
      breakReason: 'missed_day',
      updatedAt: Date.now(),
    })

    return { streakDays: 1, isNewStreak: true, streakBroken: true }
  },
})

/**
 * Award points at streak milestones
 */
async function checkStreakMilestone(
  ctx: MutationCtx,
  userId: Id<'users'>,
  days: number
) {
  const milestones = [7, 14, 30, 60, 90, 180, 365, 730]

  if (!milestones.includes(days)) return

  // Check if already awarded
  const existing = await ctx.db
    .query('userStreakMilestones')
    .withIndex('by_userId_day', (q) => q.eq('userId', userId).eq('day', days))
    .first()

  if (existing) return

  // Get milestone reward
  const milestone = await ctx.db
    .query('streakMilestones')
    .withIndex('by_day', (q) => q.eq('day', days))
    .first()

  if (!milestone) return

  // Award points
  await ctx.runMutation(api.points.awardPoints, {
    userId,
    type: 'quest_complete',
    amount: milestone.rewardPoints,
    description: `${days}-day streak milestone!`,
    idempotencyKey: `milestone-${userId}-${days}`,
  })

  // Record milestone
  await ctx.db.insert('userStreakMilestones', {
    userId,
    day: days,
    pointsAwarded: milestone.rewardPoints,
    badgeId: milestone.rewardBadgeId,
    awardedAt: Date.now(),
  })

  // Add to unseenMilestones
  if (milestone.rewardBadgeId) {
    const userRewards = await ctx.db
      .query('userRewards')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first()

    if (userRewards) {
      const updated = [...userRewards.unseenMilestones]
      if (!updated.includes(milestone.rewardBadgeId)) {
        updated.push(milestone.rewardBadgeId)
      }
      await ctx.db.patch(userRewards._id, { unseenMilestones: updated })
    }
  }
}

/**
 * Calculate bonus points based on streak length
 * Scales: 7d=50pts, 14d=100pts, 30d=200pts, 60d=400pts, etc
 */
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

  // Linear interpolation between milestones
  if (days > 30) return Math.floor(200 + (days - 30) * 5)
  if (days > 14) return Math.floor(100 + (days - 14) * 7)
  if (days > 7) return Math.floor(50 + (days - 7) * 7)
  return 0
}

/**
 * Admin: Reset user's streak (for testing or moderation)
 */
export const adminResetStreak = mutation({
  args: {
    userId: v.id('users'),
    adminId: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db.get(args.adminId)
    if (!admin || admin.role !== 'admin') {
      throw new ConvexError('Only admins can reset streaks')
    }

    const today = getTodayISO()
    const streak = await ctx.db
      .query('streakBonus')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first()

    if (!streak) return

    await ctx.db.patch(streak._id, {
      currentStreak: 0,
      lastBreakDate: today,
      breakReason: 'admin_reset',
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

// ============ QUERIES ============

/**
 * Get user's current streak info
 */
export const getUserStreak = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const streak = await ctx.db
      .query('streakBonus')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first()

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

/**
 * Get top streak users (for leaderboard)
 */
export const getStreakLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 50, 500)

    const streaks = await ctx.db.query('streakBonus').collect()

    // Sort by currentStreak descending and take top N
    const topStreaks = streaks
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, limit)

    // Join with user info
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

/**
 * Get user's streak milestones
 */
export const getUserMilestones = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('userStreakMilestones')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .collect()
  },
})
