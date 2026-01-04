import { mutation, internalMutation, query } from './_generated/server'
import type { QueryCtx, MutationCtx } from './_generated/server'
import { v, ConvexError } from 'convex/values'

async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) return null
  
  return await ctx.db
    .query('users')
    .withIndex('by_clerkId', q => q.eq('clerkId', identity.subject))
    .first()
}

// Query: Get active and past drops
export const getActiveDrops = query({
  args: {},
  handler: async (ctx) => {
    const drops = await ctx.db
      .query('merchDrops')
      .collect()
    
    const enrichedDrops = drops.map(drop => ({
      ...drop,
      productCount: drop.products.length
    }))

    // Sort by startsAt descending (newest first)
    return enrichedDrops.sort((a, b) => b.startsAt - a.startsAt)
  }
})

// Query: Get upcoming drops
export const getUpcomingDrops = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const drops = await ctx.db
      .query('merchDrops')
      .filter(q => q.gt(q.field('startsAt'), now))
      .collect()
    
    const enrichedDrops = drops.map(drop => ({
      ...drop,
      productCount: drop.products.length
    }))

    return enrichedDrops.sort((a, b) => a.startsAt - b.startsAt)
  }
})

// Admin: Create a drop
export const createDrop = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    startsAt: v.number(),
    endsAt: v.number(),
    products: v.array(v.id('merchProducts')),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user || user.role !== 'admin') {
      throw new ConvexError('Admin only')
    }

    // Validate dates
    if (args.endsAt <= args.startsAt) {
      throw new ConvexError('End date must be after start date')
    }

    // Validate products exist
    for (const productId of args.products) {
      const product = await ctx.db.get(productId)
      if (!product) {
        throw new ConvexError(`Product ${productId} not found`)
      }
    }

    const dropId = await ctx.db.insert('merchDrops', {
      name: args.name,
      description: args.description,
      imageUrl: args.imageUrl,
      startsAt: args.startsAt,
      endsAt: args.endsAt,
      products: args.products,
      priority: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: user._id,
    })

    return { dropId, success: true }
  }
})

// Scheduler: Auto-activate/deactivate drops
export const autoActivateDrops = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const changes = { activated: 0, deactivated: 0 }

    // Find drops that should start NOW
    // Note: In a real production app, we'd use indexes better or a more efficient way to find active drops
    const drops = await ctx.db.query('merchDrops').collect()
    
    const startsNow = drops.filter(drop => 
      drop.startsAt <= now && drop.endsAt >= now
    )

    for (const drop of startsNow) {
      for (const productId of drop.products) {
        const product = await ctx.db.get(productId)
        if (product && product.status !== 'active') {
          await ctx.db.patch(productId, {
            status: 'active',
            updatedAt: now,
          })
          changes.activated++
        }
      }
    }

    // Find drops that should end (past endTime)
    const hasEnded = drops.filter(drop => drop.endsAt < now)

    for (const drop of hasEnded) {
      for (const productId of drop.products) {
        const product = await ctx.db.get(productId)
        if (product && product.status === 'active' && product.isDropProduct) {
          // Only archive if it's specifically marked as drop product
          await ctx.db.patch(productId, {
            status: 'archived',
            updatedAt: now,
          })
          changes.deactivated++
        }
      }
    }

    return changes
  }
})

// Clean up expired pre-orders
export const cleanupExpiredPreOrders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    let cleanedCount = 0

    const preOrderProducts = await ctx.db
      .query('merchProducts')
      .filter(q => q.eq(q.field('isPreOrder'), true))
      .collect()

    for (const product of preOrderProducts) {
      if (product.preOrderDeadline && product.preOrderDeadline < now) {
        await ctx.db.patch(product._id, {
          status: 'archived',
          updatedAt: now,
        })
        cleanedCount++
      }
    }

    return { cleanedCount }
  }
})
