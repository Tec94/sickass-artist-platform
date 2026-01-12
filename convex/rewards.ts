import { mutation, query } from './_generated/server'
import { v, ConvexError } from 'convex/values'
import { api } from './_generated/api'

// ============ UTILITIES ============

/**
 * Generate unique coupon code
 * Format: REWARD-XXXXX-XXXXX (alphanumeric, easily readable)
 */
function generateCouponCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'REWARD'

  for (let i = 0; i < 2; i++) {
    code += '-'
    for (let j = 0; j < 5; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
  }

  return code
}

// ============ MUTATIONS ============

/**
 * Create reward in catalog (admin only)
 */
export const createReward = mutation({
  args: {
    rewardId: v.string(),
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal('discount'),
      v.literal('physical'),
      v.literal('digital'),
      v.literal('experience'),
      v.literal('feature')
    ),
    pointCost: v.number(),
    stock: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    metadata: v.optional(v.object({
      discountPercent: v.optional(v.number()),
      discountAmount: v.optional(v.number()),
      merchantUrl: v.optional(v.string()),
      shippingRequired: v.optional(v.boolean()),
      estimatedDeliveryDays: v.optional(v.number()),
    })),
    imageUrl: v.optional(v.string()),
    adminId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminId)
    if (!admin || admin.role !== 'admin') {
      throw new ConvexError('Only admins can create rewards')
    }

    const existing = await ctx.db
      .query('rewards')
      .filter((q) => q.eq(q.field('rewardId'), args.rewardId))
      .first()

    if (existing) {
      throw new ConvexError('Reward ID already exists')
    }

    const rewardDocId = await ctx.db.insert('rewards', {
      rewardId: args.rewardId,
      name: args.name,
      description: args.description,
      category: args.category,
      pointCost: args.pointCost,
      stock: args.stock,
      stockUsed: 0,
      expiresAt: args.expiresAt,
      metadata: args.metadata,
      imageUrl: args.imageUrl,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return { rewardDocId, success: true }
  },
})

/**
 * Redeem reward (main user-facing flow)
 */
export const redeemReward = mutation({
  args: {
    userId: v.id('users'),
    rewardId: v.id('rewards'),
    idempotencyKey: v.string(),
    deliveryAddress: v.optional(v.object({
      name: v.string(),
      address: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
      country: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    const existingRedemption = await ctx.db
      .query('userRedemptions')
      .withIndex('by_idempotency', (q) =>
        q.eq('userId', args.userId).eq('idempotencyKey', args.idempotencyKey)
      )
      .first()

    if (existingRedemption) {
      const reward = await ctx.db.get(existingRedemption.rewardId)
      return {
        redemptionId: existingRedemption._id,
        couponCode: existingRedemption.redeemCode,
        rewardName: reward?.name || 'Unknown Reward',
        pointsSpent: existingRedemption.pointsSpent,
      }
    }

    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new ConvexError('User not found')
    }

    const reward = await ctx.db.get(args.rewardId)
    if (!reward) {
      throw new ConvexError('Reward not found')
    }

    if (!reward.isActive) {
      throw new ConvexError('Reward is no longer available')
    }

    if (reward.expiresAt && reward.expiresAt < now) {
      throw new ConvexError('Reward has expired')
    }

    const stockUsed = reward.stockUsed ?? 0
    if (typeof reward.stock === 'number' && stockUsed >= reward.stock) {
      throw new ConvexError('Reward out of stock')
    }

    if (reward.metadata?.shippingRequired && !args.deliveryAddress) {
      throw new ConvexError('Delivery address required for this reward')
    }

    const userRewards = await ctx.db
      .query('userRewards')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first()

    if (!userRewards || userRewards.availablePoints < reward.pointCost) {
      throw new ConvexError(
        `Insufficient points. You have ${userRewards?.availablePoints || 0}, need ${reward.pointCost}`
      )
    }

    let couponCode: string | undefined
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = generateCouponCode()
      const existingCode = await ctx.db
        .query('userRedemptions')
        .filter((q) => q.eq(q.field('redeemCode'), candidate))
        .first()
      if (!existingCode) {
        couponCode = candidate
        break
      }
    }

    if (!couponCode) {
      throw new ConvexError('Failed to generate coupon code')
    }

    const redemptionId = await ctx.db.insert('userRedemptions', {
      userId: args.userId,
      rewardId: args.rewardId,
      pointsSpent: reward.pointCost,
      redeemCode: couponCode,
      status: 'pending',
      deliveryAddress: args.deliveryAddress,
      expiresAt: now + 30 * 24 * 60 * 60 * 1000,
      idempotencyKey: args.idempotencyKey,
      createdAt: now,
    })

    await ctx.runMutation(api.points.spendPoints, {
      userId: args.userId,
      amount: reward.pointCost,
      reason: `Redeemed: ${reward.name}`,
      idempotencyKey: args.idempotencyKey,
    })

    await ctx.db.patch(reward._id, {
      stockUsed: stockUsed + 1,
      updatedAt: now,
    })

    return {
      redemptionId,
      couponCode,
      rewardName: reward.name,
      pointsSpent: reward.pointCost,
    }
  },
})

/**
 * Admin: Approve pending redemption
 */
export const adminApproveRedemption = mutation({
  args: {
    redemptionId: v.id('userRedemptions'),
    adminId: v.id('users'),
    trackingId: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminId)
    if (!admin || admin.role !== 'admin') {
      throw new ConvexError('Only admins can approve')
    }

    const redemption = await ctx.db.get(args.redemptionId)
    if (!redemption) {
      throw new ConvexError('Redemption not found')
    }

    await ctx.db.patch(redemption._id, {
      status: 'completed',
      shipmentTrackingId: args.trackingId,
      notes: args.notes,
      approvedAt: Date.now(),
      completedAt: Date.now(),
    })

    return { success: true }
  },
})

/**
 * Admin: Refund redemption (if failed)
 */
export const adminRefundRedemption = mutation({
  args: {
    redemptionId: v.id('userRedemptions'),
    adminId: v.id('users'),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminId)
    if (!admin || admin.role !== 'admin') {
      throw new ConvexError('Only admins can refund')
    }

    const redemption = await ctx.db.get(args.redemptionId)
    if (!redemption) {
      throw new ConvexError('Redemption not found')
    }

    const idempotencyKey = `refund-${redemption._id}`
    await ctx.runMutation(api.points.awardPoints, {
      userId: redemption.userId,
      type: 'refund',
      amount: redemption.pointsSpent,
      description: `Refund: ${args.reason}`,
      idempotencyKey,
    })

    await ctx.db.patch(redemption._id, {
      status: 'refunded',
      notes: args.reason,
    })

    const reward = await ctx.db.get(redemption.rewardId)
    if (reward && reward.stockUsed && reward.stockUsed > 0) {
      await ctx.db.patch(reward._id, {
        stockUsed: reward.stockUsed - 1,
      })
    }

    return { success: true, pointsRefunded: redemption.pointsSpent }
  },
})

// ============ QUERIES ============

/**
 * Get all active rewards (user-facing)
 */
export const getAvailableRewards = query({
  args: {
    category: v.optional(v.string()),
    sortBy: v.optional(v.union(
      v.literal('price_low'),
      v.literal('price_high'),
      v.literal('newest')
    )),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    let rewards = await ctx.db
      .query('rewards')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect()

    rewards = rewards.filter(r => {
      if (r.expiresAt && r.expiresAt < now) return false
      if (r.stock && r.stockUsed && r.stockUsed >= r.stock) return false
      if (args.category && r.category !== args.category) return false
      return true
    })

    if (args.sortBy === 'price_low') {
      rewards.sort((a, b) => a.pointCost - b.pointCost)
    } else if (args.sortBy === 'price_high') {
      rewards.sort((a, b) => b.pointCost - a.pointCost)
    } else {
      rewards.sort((a, b) => b.createdAt - a.createdAt)
    }

    return rewards
  },
})

/**
 * Get user's redemption history
 */
export const getUserRedemptions = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const redemptions = await ctx.db
      .query('userRedemptions')
      .withIndex('by_userId_status', (q) => q.eq('userId', args.userId))
      .collect()

    const sorted = redemptions.sort((a, b) => b.createdAt - a.createdAt)

    const enriched = await Promise.all(
      sorted.map(async (r) => {
        const reward = await ctx.db.get(r.rewardId)
        return {
          ...r,
          rewardName: reward?.name || 'Unknown Reward',
          rewardImage: reward?.imageUrl,
        }
      })
    )

    return enriched
  },
})

/**
 * Admin: Get all pending redemptions
 */
export const getPendingRedemptions = query({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db
      .query('userRedemptions')
      .withIndex('by_status', (q) => q.eq('status', 'pending'))
      .collect()

    const sorted = pending.sort((a, b) => a.createdAt - b.createdAt)

    const enriched = await Promise.all(
      sorted.map(async (r) => {
        const user = await ctx.db.get(r.userId)
        const reward = await ctx.db.get(r.rewardId)
        return {
          ...r,
          userName: user?.displayName || 'Unknown User',
          userEmail: user?.email,
          rewardName: reward?.name || 'Unknown Reward',
        }
      })
    )

    return enriched
  },
})
