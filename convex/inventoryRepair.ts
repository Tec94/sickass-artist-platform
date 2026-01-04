import { mutation } from './_generated/server'
import { v } from 'convex/values'
import { ConvexError } from 'convex/values'
import type { MutationCtx } from './_generated/server'

async function getCurrentUser(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) return null

  return await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
    .first()
}

// Admin: Manually fix inventory
export const manualInventoryCorrection = mutation({
  args: {
    variantId: v.id('merchVariants'),
    newStock: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user || user.role !== 'admin') {
      throw new ConvexError('Admin only')
    }

    const variant = await ctx.db.get(args.variantId)
    if (!variant) throw new ConvexError('Variant not found')

    const oldStock = variant.stock
    const change = args.newStock - oldStock

    // Update variant
    const newStatus =
      args.newStock === 0
        ? 'out_of_stock'
        : args.newStock < 10
          ? 'low_stock'
          : 'available'

    await ctx.db.patch(args.variantId, {
      stock: args.newStock,
      status: newStatus,
      updatedAt: Date.now(),
    })

    // Log the correction
    await ctx.db.insert('merchInventoryLog', {
      variantId: args.variantId,
      change,
      reason: 'manual_correction',
      notes: args.reason,
      createdBy: user._id,
      createdAt: Date.now(),
    })

    return {
      success: true,
      oldStock,
      newStock: args.newStock,
      change,
    }
  },
})

// Admin: Detect oversold variants
export const detectOversoldVariants = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)
    if (!user || user.role !== 'admin') {
      throw new ConvexError('Admin only')
    }

    const variants = await ctx.db.query('merchVariants').collect()
    const oversold = []

    for (const variant of variants) {
      if (variant.stock < 0) {
        oversold.push({
          variantId: variant._id,
          sku: variant.sku,
          stock: variant.stock,
          deficit: Math.abs(variant.stock),
        })
      }
    }

    return { oversoldCount: oversold.length, variants: oversold }
  },
})

// Admin: Recover oversold order
export const recoverOversoldOrder = mutation({
  args: {
    orderId: v.id('merchOrders'),
    action: v.union(v.literal('cancel'), v.literal('backorder')),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user || user.role !== 'admin') {
      throw new ConvexError('Admin only')
    }

    const order = await ctx.db.get(args.orderId)
    if (!order) throw new ConvexError('Order not found')

    if (args.action === 'cancel') {
      // Refund inventory
      for (const item of order.items) {
        const variant = await ctx.db.get(item.variantId)
        if (variant) {
          const newStock = variant.stock + item.quantity

          const newStatus =
            newStock === 0
              ? 'out_of_stock'
              : newStock < 10
                ? 'low_stock'
                : 'available'

          await ctx.db.patch(item.variantId, {
            stock: newStock,
            status: newStatus,
            updatedAt: Date.now(),
          })

          // Log refund
          await ctx.db.insert('merchInventoryLog', {
            variantId: item.variantId,
            change: item.quantity,
            reason: 'return',
            orderId: args.orderId,
            notes: 'Oversold recovery - order cancelled',
            createdAt: Date.now(),
          })
        }
      }

      // Update order status
      await ctx.db.patch(args.orderId, {
        status: 'cancelled',
        updatedAt: Date.now(),
      })

      return {
        success: true,
        action: 'cancelled',
        refundedItems: order.items.length,
      }
    } else {
      // Mark as backorder
      await ctx.db.patch(args.orderId, {
        status: 'pending',
        updatedAt: Date.now(),
      })

      return { success: true, action: 'backorder' }
    }
  },
})