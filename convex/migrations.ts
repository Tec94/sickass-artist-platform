import { mutation } from './_generated/server'

/**
 * Initialize gamification data for existing users
 * Run once: npx convex run migrations:initializeExistingUsers
 */
export const initializeExistingUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect()
    let initialized = 0
    let skipped = 0

    for (const user of users) {
      // Check if already initialized
      const existing = await ctx.db
        .query('userRewards')
        .filter(q => q.eq(q.field('userId'), user._id))
        .first()

      if (existing) {
        skipped++
        continue
      }

      // Initialize rewards for this user
      await ctx.db.insert('userRewards', {
        userId: user._id,
        totalPoints: 0,
        availablePoints: 0,
        redeemedPoints: 0,
        currentStreak: 0,
        maxStreak: 0,
        lastInteractionDate: 0,
        lastLoginDate: '',
        unseenMilestones: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      // Initialize streak
      await ctx.db.insert('streakBonus', {
        userId: user._id,
        currentStreak: 0,
        maxStreak: 0,
        lastInteractionDate: '',
        streakStartDate: '',
        lastBreakDate: undefined,
        breakReason: undefined,
        hasStreakFreeze: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      initialized++
    }

    return { initialized, skipped, total: users.length }
  }
})
