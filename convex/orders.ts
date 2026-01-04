import { query, mutation } from './_generated/server'
import { v, ConvexError } from 'convex/values'
import { getCurrentUser } from './helpers'

// Helper: Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

// Helper: Validate email format
function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// Helper: Validate zip code (international)
function isValidZipCode(zipCode: string): boolean {
  return zipCode.length >= 3 && zipCode.length <= 20 && /^[a-z0-9\s-]+$/i.test(zipCode)
}

// Mutation: Create order (demo checkout - no real payment)
export const createOrder = mutation({
  args: {
    shippingAddress: v.object({
      name: v.string(),
      email: v.string(),
      addressLine1: v.string(),
      addressLine2: v.optional(v.string()),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
    }),
    cartChecksum: v.optional(v.string()), // For idempotency
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)

    // Validate shipping address
    if (args.shippingAddress.name.trim().length === 0) {
      throw new ConvexError('Name is required')
    }
    if (!isValidEmail(args.shippingAddress.email)) {
      throw new ConvexError('Please enter a valid email address')
    }
    if (args.shippingAddress.addressLine1.trim().length === 0) {
      throw new ConvexError('Address is required')
    }
    if (args.shippingAddress.city.trim().length === 0) {
      throw new ConvexError('City is required')
    }
    if (args.shippingAddress.state.trim().length === 0) {
      throw new ConvexError('State/Province is required')
    }
    if (!isValidZipCode(args.shippingAddress.zipCode)) {
      throw new ConvexError('Please enter a valid postal code (3-20 characters)')
    }
    if (args.shippingAddress.country.trim().length === 0) {
      throw new ConvexError('Country is required')
    }

    // Get cart
    const cart = await ctx.db
      .query('merchCart')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .first()

    if (!cart || cart.items.length === 0) {
      throw new ConvexError('Your cart is empty')
    }

    // Validate inventory for ALL items (atomic check)
    const orderItems = []
    let subtotal = 0

    for (const cartItem of cart.items) {
      const variant = await ctx.db.get(cartItem.variantId)
      if (!variant) {
        throw new ConvexError(`Product no longer available: ${cartItem.variantId}`)
      }

      // Critical: Check stock before deducting
      if (variant.stock < cartItem.quantity) {
        throw new ConvexError(
          `"${variant.sku}" only has ${variant.stock} in stock, but you requested ${cartItem.quantity}`
        )
      }

      const product = await ctx.db.get(variant.productId)
      if (!product) {
        throw new ConvexError(`Product not found: ${variant.productId}`)
      }

      const price = variant.price || product.price

      orderItems.push({
        variantId: cartItem.variantId,
        productName: product.name,
        variantName: `${variant.size || ''} ${variant.color || ''}`.trim() || 'Default',
        quantity: cartItem.quantity,
        pricePerUnit: price,
        totalPrice: price * cartItem.quantity,
      })

      subtotal += price * cartItem.quantity
    }

    // Calculate totals
    const tax = Math.round(subtotal * 0.1)
    const shipping = 1000 // $10 flat rate
    const total = subtotal + tax + shipping

    // Generate order number
    const orderNumber = generateOrderNumber()

    // Create order (demo: mark as paid immediately)
    const orderId = await ctx.db.insert('merchOrders', {
      userId: user._id,
      orderNumber,
      items: orderItems,
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress: {
        ...args.shippingAddress,
        name: args.shippingAddress.name.trim(),
        email: args.shippingAddress.email.trim().toLowerCase(),
      },
      status: 'paid', // Demo: immediately paid
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // NOW deduct from inventory (atomic transaction)
    for (const item of orderItems) {
      const variant = await ctx.db.get(item.variantId)
      if (variant) {
        const newStock = variant.stock - item.quantity

        await ctx.db.patch(item.variantId, {
          stock: newStock,
          status: newStock === 0
            ? 'out_of_stock'
            : newStock <= (variant.stock * 0.2)
              ? 'low_stock'
              : 'available',
          updatedAt: Date.now(),
        })

        // Log inventory change
        await ctx.db.insert('merchInventoryLog', {
          variantId: item.variantId,
          change: -item.quantity,
          reason: 'purchase',
          orderId,
          createdAt: Date.now(),
        })
      }
    }

    // Clear cart (last step, won't cause issues if fails)
    if (cart) {
      await ctx.db.patch(cart._id, {
        items: [],
        updatedAt: Date.now(),
      })
    }

    return {
      orderId,
      orderNumber,
      total,
      confirmationCode: `CONF-${orderNumber.split('-')[1]}`,
      estimatedDeliveryDays: 5 + Math.floor(Math.random() * 5), // 5-10 days
    }
  }
})

// Query: Get user's orders
export const getUserOrders = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)

    const orders = await ctx.db
      .query('merchOrders')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .collect()

    // Sort by createdAt desc and limit
    const sortedOrders = orders
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, args?.limit || 50)

    return sortedOrders
  }
})

// Query: Get single order
export const getOrder = query({
  args: { orderNumber: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)

    const order = await ctx.db
      .query('merchOrders')
      .withIndex('by_order_number', q => q.eq('orderNumber', args.orderNumber))
      .first()

    // Only return if belongs to current user
    if (!order || order.userId !== user._id) {
      return null
    }

    return order
  }
})

// Query: Get order by ID
export const getOrderById = query({
  args: { orderId: v.id('merchOrders') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)

    const order = await ctx.db.get(args.orderId)
    if (!order || order.userId !== user._id) {
      return null
    }

    return order
  }
})

// Query: Get order stats for admin
export const getOrderStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)
    if (user.role !== 'admin') {
      throw new ConvexError('Admin only')
    }

    const orders = await ctx.db.query('merchOrders').collect()

    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
      ordersByStatus: orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      averageOrderValue: Math.round(
        orders.reduce((sum, o) => sum + o.total, 0) / Math.max(orders.length, 1)
      ),
    }

    return stats
  }
})
