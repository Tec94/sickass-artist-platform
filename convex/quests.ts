import { mutation, query, internalMutation } from './_generated/server'
import { v, ConvexError } from 'convex/values'
import { api } from './_generated/api'

// ============ TYPES ============
type QuestType = 'daily' | 'weekly' | 'milestone' | 'seasonal' | 'challenge'

// ============ MUTATIONS ============

/**
 * Create or update a quest (admin only)
 */
export const createQuest = mutation({
  args: {
    questId: v.string(), // e.g., "daily_login_001"
    type: v.union(
      v.literal('daily'),
      v.literal('weekly'),
      v.literal('milestone'),
      v.literal('seasonal'),
      v.literal('challenge')
    ),
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    rewardPoints: v.number(),
    targetValue: v.number(),
    progressType: v.union(v.literal('single'), v.literal('cumulative')),
    category: v.union(
      v.literal('social'),
      v.literal('creation'),
      v.literal('commerce'),
      v.literal('events'),
      v.literal('engagement'),
      v.literal('streak')
    ),
    isActive: v.boolean(),
    startsAt: v.number(),
    endsAt: v.number(),
    priority: v.number(),
    adminId: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db.get(args.adminId)
    if (!admin || admin.role !== 'admin') {
      throw new ConvexError('Only admins can create quests')
    }

    // Check if quest exists
    const existing = await ctx.db
      .query('quests')
      .filter(q => q.eq(q.field('questId'), args.questId))
      .first()

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        name: args.name,
        description: args.description,
        icon: args.icon,
        rewardPoints: args.rewardPoints,
        targetValue: args.targetValue,
        progressType: args.progressType,
        category: args.category,
        isActive: args.isActive,
        startsAt: args.startsAt,
        endsAt: args.endsAt,
        priority: args.priority,
      })
      return { questId: existing._id, updated: true }
    }

    // Create new
    const questDocId = await ctx.db.insert('quests', {
      questId: args.questId,
      type: args.type,
      name: args.name,
      description: args.description,
      icon: args.icon,
      rewardPoints: args.rewardPoints,
      targetValue: args.targetValue,
      progressType: args.progressType,
      category: args.category,
      isActive: args.isActive,
      startsAt: args.startsAt,
      endsAt: args.endsAt,
      priority: args.priority,
      createdAt: Date.now(),
    })

    return { questId: questDocId, updated: false }
  },
})

/**
 * Assign quest to user (called on signup or via cron)
 */
export const assignQuestToUser = mutation({
  args: {
    userId: v.id('users'),
    questId: v.id('quests'),
  },
  handler: async (ctx, args) => {
    // Check if already assigned
    const existing = await ctx.db
      .query('questProgress')
      .filter(q => q.eq(q.field('userId'), args.userId))
      .filter(q => q.eq(q.field('questId'), args.questId))
      .first()

    if (existing) {
      return { alreadyAssigned: true }
    }

    // Get quest
    const quest = await ctx.db.get(args.questId)
    if (!quest) {
      throw new ConvexError('Quest not found')
    }

    // Calculate expiry based on quest type
    let expiresAt = Date.now()
    if (quest.type === 'daily') {
      // Tomorrow at midnight UTC
      const tomorrow = new Date()
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
      tomorrow.setUTCHours(0, 0, 0, 0)
      expiresAt = tomorrow.getTime()
    } else if (quest.type === 'weekly') {
      // Next Sunday midnight UTC
      const nextSunday = new Date()
      nextSunday.setUTCDate(nextSunday.getUTCDate() + (7 - nextSunday.getUTCDay()))
      nextSunday.setUTCHours(0, 0, 0, 0)
      expiresAt = nextSunday.getTime()
    } else {
      // Milestone/seasonal: use quest endsAt
      expiresAt = quest.endsAt
    }

    // Create progress record
    const progressId = await ctx.db.insert('questProgress', {
      userId: args.userId,
      questId: args.questId,
      currentProgress: 0,
      isCompleted: false,
      pointsClaimed: false,
      createdAt: Date.now(),
      expiresAt,
    })

    return { progressId, expiresAt }
  },
})

/**
 * Increment user's quest progress
 * Called whenever user performs a relevant action
 */
export const incrementQuestProgress = mutation({
  args: {
    userId: v.id('users'),
    questType: v.string(), // "thread_post", "forum_reply", etc
    amount: v.number(), // How much to increment by
  },
  handler: async (ctx, args) => {
    // Get all active quest progress for this user
    const allProgress = await ctx.db
      .query('questProgress')
      .filter(q => q.eq(q.field('userId'), args.userId))
      .filter(q => q.eq(q.field('isCompleted'), false))
      .collect()

    const now = Date.now()
    const updates = []

    for (const progress of allProgress) {
      // Skip expired quests
      if (progress.expiresAt < now) {
        continue
      }

      const quest = await ctx.db.get(progress.questId)
      if (!quest) continue

      // Check if quest matches this action type
      if (!doesQuestMatchAction(quest.category, args.questType)) {
        continue
      }

      // Increment progress
      const newProgress = Math.min(
        progress.currentProgress + args.amount,
        quest.targetValue
      )

      const isNowComplete = newProgress >= quest.targetValue

      await ctx.db.patch(progress._id, {
        currentProgress: newProgress,
        isCompleted: isNowComplete,
        completedAt: isNowComplete ? Date.now() : undefined,
      })

      updates.push({
        questId: quest.questId,
        isComplete: isNowComplete,
        rewardPoints: isNowComplete ? quest.rewardPoints : 0,
      })
    }

    return updates
  },
})

/**
 * Claim rewards for completed quest
 */
export const claimQuestReward = mutation({
  args: {
    userId: v.id('users'),
    progressId: v.id('questProgress'),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db.get(args.progressId)
    if (!progress) {
      throw new ConvexError('Quest progress not found')
    }

    if (progress.userId.toString() !== args.userId.toString()) {
      throw new ConvexError('Unauthorized')
    }

    if (!progress.isCompleted) {
      throw new ConvexError('Quest not completed yet')
    }

    if (progress.pointsClaimed) {
      return { alreadyClaimed: true }
    }

    const quest = await ctx.db.get(progress.questId)
    if (!quest) {
      throw new ConvexError('Quest not found')
    }

    // Award points
    const idempotencyKey = `quest-${progress._id}`
    await ctx.runMutation(api.points.awardPoints, {
      userId: args.userId,
      type: 'quest_complete',
      amount: quest.rewardPoints,
      description: `Completed: ${quest.name}`,
      idempotencyKey,
      metadata: { questId: progress.questId },
    })

    // Mark as claimed
    await ctx.db.patch(progress._id, {
      pointsClaimed: true,
      claimedAt: Date.now(),
    })

    return { success: true, pointsAwarded: quest.rewardPoints }
  },
})

// ============ HELPERS ============

/**
 * Map quest category to action types
 */
function doesQuestMatchAction(category: string, actionType: string): boolean {
  const mapping: Record<string, string[]> = {
    social: ['chat_message', 'gallery_like', 'ugc_like'],
    creation: ['thread_post', 'forum_reply', 'ugc_upload'],
    commerce: ['ticket_purchase', 'merch_purchase'],
    events: ['event_checkin', 'livestream_join'],
    engagement: ['gallery_like', 'ugc_like', 'thread_vote'],
    streak: ['login'], // Internal only
  }
  return mapping[category]?.includes(actionType) || false
}

// ============ QUERIES ============

/**
 * Get all active quests for user
 */
export const getUserQuests = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query('questProgress')
      .filter(q => q.eq(q.field('userId'), args.userId))
      .collect()

    const now = Date.now()
    const quests = []

    for (const p of progress) {
      if (p.expiresAt < now) continue // Skip expired

      const quest = await ctx.db.get(p.questId)
      if (!quest) continue

      quests.push({
        progressId: p._id,
        questId: quest.questId,
        name: quest.name,
        description: quest.description,
        icon: quest.icon,
        category: quest.category,
        progress: p.currentProgress,
        target: quest.targetValue,
        progressPercent: Math.round((p.currentProgress / quest.targetValue) * 100),
        isCompleted: p.isCompleted,
        pointsClaimed: p.pointsClaimed,
        rewardPoints: quest.rewardPoints,
        expiresAt: p.expiresAt,
        type: quest.type,
      })
    }

    return quests.sort((a, b) => b.expiresAt - a.expiresAt)
  },
})

/**
 * Get all available quests (for admin)
 */
export const getAvailableQuests = query({
  args: { type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const quests = await ctx.db
      .query('quests')
      .filter(q => q.eq(q.field('isActive'), true))
      .collect()

    const filtered = args.type
      ? quests.filter(q => q.type === (args.type as QuestType))
      : quests

    return filtered.sort((a, b) => a.priority - b.priority)
  },
})

// ============ CRON HELPERS (INTERNAL) ============

/**
 * Run daily at midnight UTC.
 * Assign daily quests to all users.
 */
export const dailyQuestAssignment = internalMutation({
  args: {},
  handler: async (ctx) => {
    const dailyQuests = await ctx.db
      .query('quests')
      .filter(q => q.eq(q.field('type'), 'daily'))
      .filter(q => q.eq(q.field('isActive'), true))
      .collect()

    const users = await ctx.db.query('users').collect()

    let assigned = 0

    for (const user of users) {
      for (const quest of dailyQuests) {
        try {
          const result = await ctx.runMutation(api.quests.assignQuestToUser, {
            userId: user._id,
            questId: quest._id,
          })

          if (!result.alreadyAssigned) {
            assigned++
          }
        } catch (error) {
          console.error('Failed to assign daily quest to user:', error)
        }
      }
    }

    return {
      assigned,
      totalUsers: users.length,
      totalQuests: dailyQuests.length,
    }
  },
})

/**
 * Run weekly every Sunday at midnight UTC.
 * Assign weekly quests to all users.
 */
export const weeklyQuestAssignment = internalMutation({
  args: {},
  handler: async (ctx) => {
    const weeklyQuests = await ctx.db
      .query('quests')
      .filter(q => q.eq(q.field('type'), 'weekly'))
      .filter(q => q.eq(q.field('isActive'), true))
      .collect()

    const users = await ctx.db.query('users').collect()
    let assigned = 0

    for (const user of users) {
      for (const quest of weeklyQuests) {
        try {
          const result = await ctx.runMutation(api.quests.assignQuestToUser, {
            userId: user._id,
            questId: quest._id,
          })

          if (!result.alreadyAssigned) {
            assigned++
          }
        } catch (error) {
          console.error('Failed to assign weekly quest:', error)
        }
      }
    }

    return { assigned, totalUsers: users.length, totalQuests: weeklyQuests.length }
  },
})

/**
 * Run hourly.
 * Clean up expired quest progress.
 */
export const cleanupExpiredQuests = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const expired = await ctx.db
      .query('questProgress')
      .filter(q => q.lt(q.field('expiresAt'), now))
      .filter(q => q.eq(q.field('isCompleted'), false))
      .filter(q => q.eq(q.field('pointsClaimed'), false))
      .collect()

    let cleaned = 0

    for (const progress of expired) {
      await ctx.db.delete(progress._id)
      cleaned++
    }

    return { cleaned }
  },
})
