import { mutation, query } from './_generated/server'
import { v, ConvexError } from 'convex/values'

// ============ TYPES ============
export type PointTransactionType =
  | 'thread_post'
  | 'forum_reply'
  | 'chat_message'
  | 'gallery_like'
  | 'ugc_like'
  | 'event_checkin'
  | 'ticket_purchase'
  | 'livestream_join'
  | 'quest_complete'
  | 'daily_bonus'
  | 'streak_bonus'
  | 'redemption'
  | 'admin_adjust'
  | 'refund'

export const POINT_VALUES: Record<PointTransactionType, number> = {
  thread_post: 20,
  forum_reply: 10,
  chat_message: 3,
  gallery_like: 1,
  ugc_like: 1,
  event_checkin: 75,
  ticket_purchase: 0, // Calculated as 10% of ticket price
  livestream_join: 25,
  quest_complete: 0, // Varies by quest
  daily_bonus: 10,
  streak_bonus: 0, // Varies by streak multiplier
  redemption: 0, // Variable
  admin_adjust: 0, // Variable
  refund: 0, // Variable
}

// ============ MUTATIONS ============

/**
 * Award points to a user with full validation & idempotency
 * All point changes must go through this function
 */
export const awardPoints = mutation({
  args: {
    userId: v.id('users'),
    type: v.union(
      v.literal('thread_post'),
      v.literal('forum_reply'),
      v.literal('chat_message'),
      v.literal('gallery_like'),
      v.literal('ugc_like'),
      v.literal('event_checkin'),
      v.literal('ticket_purchase'),
      v.literal('livestream_join'),
      v.literal('quest_complete'),
      v.literal('daily_bonus'),
      v.literal('streak_bonus'),
      v.literal('admin_adjust'),
      v.literal('refund')
    ),
    amount: v.number(), // Explicit amount (don't auto-calculate)
    description: v.string(),
    idempotencyKey: v.string(), // Unique per award
    metadata: v.optional(v.object({
      streakMultiplier: v.optional(v.number()),
      questId: v.optional(v.id('quests')),
      eventId: v.optional(v.id('events')),
      ticketPrice: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    // ===== VALIDATION =====
    if (args.amount <= 0 || !Number.isInteger(args.amount)) {
      throw new ConvexError('Point amount must be positive integer')
    }

    if (args.amount > 10000) {
      throw new ConvexError('Suspiciously high point award, check calculation')
    }

    // ===== IDEMPOTENCY CHECK =====
    const existingTx = await ctx.db
      .query('pointTransactions')
      .withIndex('by_idempotency', (q) => 
        q.eq('userId', args.userId).eq('idempotencyKey', args.idempotencyKey)
      )
      .first()

    if (existingTx) {
      // Return existing transaction (don't create duplicate)
      return { transactionId: existingTx._id, success: true }
    }

    // ===== USER VALIDATION =====
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new ConvexError('User not found')
    }

    // ===== CREATE TRANSACTION =====
    const txId = await ctx.db.insert('pointTransactions', {
      userId: args.userId,
      amount: args.amount,
      type: args.type,
      description: args.description,
      metadata: args.metadata,
      idempotencyKey: args.idempotencyKey,
      createdAt: Date.now(),
    })

    // ===== UPDATE USER REWARDS =====
    // Get or create user rewards
    const rewards = await ctx.db
      .query('userRewards')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first()

    if (!rewards) {
      // Create if missing (shouldn't happen after migration)
      await ctx.db.insert('userRewards', {
        userId: args.userId,
        totalPoints: args.amount,
        availablePoints: args.amount,
        redeemedPoints: 0,
        currentStreak: 0,
        maxStreak: 0,
        lastInteractionDate: Date.now(),
        lastLoginDate: new Date().toISOString().split('T')[0],
        unseenMilestones: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    } else {
      // Update existing
      const newTotal = Math.min(rewards.totalPoints + args.amount, Number.MAX_SAFE_INTEGER / 2)
      const newAvailable = Math.min(
        rewards.availablePoints + args.amount,
        Number.MAX_SAFE_INTEGER / 2
      )

      await ctx.db.patch(rewards._id, {
        totalPoints: newTotal,
        availablePoints: newAvailable,
        lastInteractionDate: Date.now(),
        updatedAt: Date.now(),
      })
    }

    return { transactionId: txId, success: true }
  },
})

/**
 * Spend points on a redemption
 * Decrements availablePoints, adds to redeemedPoints
 */
export const spendPoints = mutation({
  args: {
    userId: v.id('users'),
    amount: v.number(),
    reason: v.string(), // "Redeemed 10% off coupon"
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    // Idempotency check
    const existing = await ctx.db
      .query('pointTransactions')
      .withIndex('by_idempotency', (q) => 
        q.eq('userId', args.userId).eq('idempotencyKey', args.idempotencyKey)
      )
      .first()

    if (existing) {
      return { success: false, error: 'Already processed' }
    }

    // Get user rewards
    const rewards = await ctx.db
      .query('userRewards')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first()

    if (!rewards) {
      throw new ConvexError('User rewards not found')
    }

    // Check sufficient balance
    if (rewards.availablePoints < args.amount) {
      throw new ConvexError(
        `Insufficient points: have ${rewards.availablePoints}, need ${args.amount}`
      )
    }

    // Log transaction (negative amount)
    await ctx.db.insert('pointTransactions', {
      userId: args.userId,
      amount: -args.amount,
      type: 'redemption',
      description: args.reason,
      idempotencyKey: args.idempotencyKey,
      createdAt: Date.now(),
    })

    // Update user rewards
    await ctx.db.patch(rewards._id, {
      availablePoints: rewards.availablePoints - args.amount,
      redeemedPoints: rewards.redeemedPoints + args.amount,
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

/**
 * Get user's current point balance
 */
export const getUserBalance = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const rewards = await ctx.db
      .query('userRewards')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first()

    if (!rewards) {
      return {
        availablePoints: 0,
        totalPoints: 0,
        redeemedPoints: 0,
      }
    }

    return {
      availablePoints: rewards.availablePoints,
      totalPoints: rewards.totalPoints,
      redeemedPoints: rewards.redeemedPoints,
    }
  },
})

/**
 * Get user's transaction history (for debugging & audits)
 */
export const getUserTransactionHistory = query({
  args: {
    userId: v.id('users'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 50, 1000)

    return await ctx.db
      .query('pointTransactions')
      .withIndex('by_userId_createdAt', (q) => q.eq('userId', args.userId))
      .order('desc')
      .take(limit)
  },
})

/**
 * Get points leaderboard (top 100 users)
 */
export const getPointsLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    // Get all user rewards and sort by totalPoints in descending order
    const allRewards = await ctx.db.query('userRewards').collect()
    
    // Sort by totalPoints descending and take top 100
    return allRewards
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 100)
  },
})

/**
 * Admin function: adjust points manually (with reason)
 */
export const adminAdjustPoints = mutation({
  args: {
    userId: v.id('users'),
    amount: v.number(), // Can be negative
    reason: v.string(),
    adminId: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db.get(args.adminId)
    if (!admin || admin.role !== 'admin') {
      throw new ConvexError('Only admins can adjust points')
    }

    const idempotencyKey = `admin-${args.adminId}-${Date.now()}-${Math.random()}`

    // For negative adjustments, deduct points; for positive, add points
    if (args.amount < 0) {
      // Negative adjustment - deduct points directly
      const rewards = await ctx.db
        .query('userRewards')
        .withIndex('by_userId', (q) => q.eq('userId', args.userId))
        .first()

      if (!rewards) {
        throw new ConvexError('User rewards not found')
      }

      // Log transaction (negative amount)
      await ctx.db.insert('pointTransactions', {
        userId: args.userId,
        amount: args.amount,
        type: 'admin_adjust',
        description: `[ADMIN] ${args.reason}`,
        idempotencyKey,
        createdAt: Date.now(),
      })

      // Update user rewards (deduct from available)
      const newAvailable = Math.max(0, rewards.availablePoints + args.amount) // amount is negative
      await ctx.db.patch(rewards._id, {
        availablePoints: newAvailable,
        updatedAt: Date.now(),
      })

      return { success: true }
    } else {
      // Positive adjustment - award points
      const user = await ctx.db.get(args.userId)
      if (!user) {
        throw new ConvexError('User not found')
      }

      // Create transaction
      const txId = await ctx.db.insert('pointTransactions', {
        userId: args.userId,
        amount: args.amount,
        type: 'admin_adjust',
        description: `[ADMIN] ${args.reason}`,
        idempotencyKey,
        createdAt: Date.now(),
      })

      // Update user rewards
      const rewards = await ctx.db
        .query('userRewards')
        .withIndex('by_userId', (q) => q.eq('userId', args.userId))
        .first()

      if (!rewards) {
        // Create if missing
        await ctx.db.insert('userRewards', {
          userId: args.userId,
          totalPoints: args.amount,
          availablePoints: args.amount,
          redeemedPoints: 0,
          currentStreak: 0,
          maxStreak: 0,
          lastInteractionDate: Date.now(),
          lastLoginDate: new Date().toISOString().split('T')[0],
          unseenMilestones: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      } else {
        // Update existing
        await ctx.db.patch(rewards._id, {
          totalPoints: rewards.totalPoints + args.amount,
          availablePoints: rewards.availablePoints + args.amount,
          lastInteractionDate: Date.now(),
          updatedAt: Date.now(),
        })
      }

      return { transactionId: txId, success: true }
    }
  },
})
