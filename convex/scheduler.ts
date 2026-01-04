import { internalMutation } from './_generated/server'
import type { Id } from './_generated/dataModel'

// Run every 6 hours to check inventory consistency
export const checkInventoryConsistency = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const issues: Array<{
      variantId: Id<'merchVariants'>
      sku: string
      type: 'negative_stock' | 'discrepancy'
      currentStock?: number
      expectedStock?: number
      severity: 'warning' | 'critical'
      timestamp: number
    }> = []

    // Get all variants
    const variants = await ctx.db.query('merchVariants').collect()

    for (const variant of variants) {
      // Sum all inventory deductions from log
      const logs = await ctx.db
        .query('merchInventoryLog')
        .withIndex('by_variant', (q) => q.eq('variantId', variant._id))
        .collect()

      const totalDeducted = logs
        .filter((log) => log.reason === 'purchase')
        .reduce((sum, log) => sum + Math.abs(log.change), 0)

      // Find original stock from oldest purchase
      const firstPurchase = logs
        .filter((log) => log.reason === 'purchase')
        .sort((a, b) => a.createdAt - b.createdAt)[0]

      // Check if stock is negative (oversold)
      if (variant.stock < 0) {
        issues.push({
          variantId: variant._id,
          sku: variant.sku,
          type: 'negative_stock' as const,
          currentStock: variant.stock,
          severity: 'critical' as const,
          timestamp: now,
        })
      }

      // Check for significant discrepancies
      const reconstructedStock = firstPurchase ? -totalDeducted : variant.stock
      const discrepancy = Math.abs(variant.stock - reconstructedStock)

      if (discrepancy > 10) {
        issues.push({
          variantId: variant._id,
          sku: variant.sku,
          type: 'discrepancy' as const,
          expectedStock: reconstructedStock,
          currentStock: variant.stock,
          severity: 'warning' as const,
          timestamp: now,
        })
      }
    }

    // Log issues
    if (issues.length > 0) {
      await ctx.db.insert('inventoryAuditLog', {
        timestamp: now,
        issues,
        resolvedAt: undefined,
        resolvedBy: undefined,
      })

      // Alert admin (could send email/notification here)
      console.error(`[Inventory Issues] ${issues.length} issues found`, issues)
    }

    return { checkedCount: variants.length, issuesFound: issues.length }
  },
})

// Automatic drop activation/deactivation
export const autoActivateDrops = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const changes = { activated: 0, deactivated: 0 }

    // Find drops that should start (should be active now and hasn't ended)
    const allDrops = await ctx.db.query('merchDrops').collect()
    const startsNow = allDrops.filter(
      (drop) => drop.startsAt <= now && drop.endsAt >= now
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

    // Find drops that should end (ended in the past)
    const hasEnded = allDrops.filter((drop) => drop.endsAt < now)

    for (const drop of hasEnded) {
      for (const productId of drop.products) {
        const product = await ctx.db.get(productId)
        if (product && product.status === 'active' && product.isDropProduct) {
          await ctx.db.patch(productId, {
            status: 'archived',
            updatedAt: now,
          })
          changes.deactivated++
        }
      }
    }

    return changes
  },
})

// Clean up expired pre-orders
export const cleanupExpiredPreOrders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    let cleanedCount = 0

    const preOrderProducts = await ctx.db
      .query('merchProducts')
      .filter((q) => q.eq(q.field('isPreOrder'), true))
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
  },
})