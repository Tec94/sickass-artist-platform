import { query, mutation } from './_generated/server'
import { v, ConvexError } from 'convex/values'
import { getCurrentUserOrNull, getOrCreateCurrentUser } from './helpers'

// Query: Get user's cart
export const getCart = query({
  args: {},
  handler: async (ctx) => {
    // Check if user is authenticated
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      // Return empty cart for unauthenticated users
      return {
        items: [],
        total: 0,
        itemCount: 0,
        subtotal: 0,
        tax: 0,
        shipping: 0,
        isEmpty: true,
        timestamp: Date.now(),
      }
    }

    // User row can lag behind auth (e.g. first login). Don't hard-fail the app shell.
    const user = await getCurrentUserOrNull(ctx)
    if (!user) {
      return {
        items: [],
        total: 0,
        itemCount: 0,
        subtotal: 0,
        tax: 0,
        shipping: 0,
        isEmpty: true,
        timestamp: Date.now(),
      }
    }

    const cart = await ctx.db
      .query('merchCart')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .first()

    if (!cart) {
      return {
        items: [],
        total: 0,
        itemCount: 0,
        subtotal: 0,
        tax: 0,
        shipping: 0
      }
    }

    // Enrich cart items with current product/variant info
    const enriched = await Promise.all(
      cart.items.map(async (item) => {
        const variant = await ctx.db.get(item.variantId)
        if (!variant) return null // Skip if variant deleted

        const product = await ctx.db.get(variant.productId)
        if (!product) return null // Skip if product deleted

        const currentPrice = variant.price || product.price

        return {
          ...item,
          variant,
          product,
          currentPrice,
          priceChanged: currentPrice !== item.priceAtAddTime,
          priceChangePercentage: Math.round(
            ((currentPrice - item.priceAtAddTime) / item.priceAtAddTime) * 100
          ),
          available: variant.stock > 0,
          availableQuantity: variant.stock,
        }
      })
    )

    // Filter out deleted items
    const validItems = enriched.filter((item): item is NonNullable<typeof item> => item !== null)

    const subtotal = validItems.reduce((sum, item) =>
      sum + (item.currentPrice * item.quantity), 0
    )
    const tax = Math.round(subtotal * 0.1)
    const shipping = 1000 // $10 in cents
    const total = subtotal + tax + shipping

    return {
      items: validItems,
      subtotal,
      tax,
      shipping,
      total,
      itemCount: validItems.reduce((sum, item) => sum + item.quantity, 0),
      isEmpty: validItems.length === 0,
      cartId: cart._id,
      timestamp: Date.now(),
    }
  }
})

// Mutation: Add item to cart
export const addToCart = mutation({
  args: {
    variantId: v.id('merchVariants'),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx)

    // Validate quantity
    if (args.quantity < 1 || args.quantity > 100 || !Number.isInteger(args.quantity)) {
      throw new ConvexError('Quantity must be between 1 and 100')
    }

    // Get variant
    const variant = await ctx.db.get(args.variantId)
    if (!variant) throw new ConvexError('Product not found')

    // Get product
    const product = await ctx.db.get(variant.productId)
    if (!product) throw new ConvexError('Product not found')

    // Check stock
    if (variant.stock < args.quantity) {
      throw new ConvexError(`Only ${variant.stock} items available`)
    }

    // Check product status
    if (product.status === 'archived' || product.status === 'discontinued') {
      throw new ConvexError('This product is no longer available')
    }

    const price = variant.price || product.price

    // Get or create cart
    const cart = await ctx.db
      .query('merchCart')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .first()

    if (!cart) {
      // Create new cart
      const cartId = await ctx.db.insert('merchCart', {
        userId: user._id,
        items: [
          {
            variantId: args.variantId,
            quantity: args.quantity,
            priceAtAddTime: price,
            addedAt: Date.now(),
          }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      return { success: true, cartId, itemCount: args.quantity }
    } else {
      // Check if item already in cart
      const existingIndex = cart.items.findIndex(
        item => item.variantId === args.variantId
      )

      let updatedItems
      if (existingIndex >= 0) {
        // Merge quantities
        const newQuantity = cart.items[existingIndex].quantity + args.quantity
        if (newQuantity > 100) {
          throw new ConvexError('Cannot add more than 100 of the same item')
        }
        if (variant.stock < newQuantity) {
          throw new ConvexError(`Only ${variant.stock} items available`)
        }

        updatedItems = cart.items.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: newQuantity }
            : item
        )
      } else {
        // Add new item
        updatedItems = [
          ...cart.items,
          {
            variantId: args.variantId,
            quantity: args.quantity,
            priceAtAddTime: price,
            addedAt: Date.now(),
          }
        ]
      }

      await ctx.db.patch(cart._id, {
        items: updatedItems,
        updatedAt: Date.now(),
      })

      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      return { success: true, cartId: cart._id, itemCount: totalItems }
    }
  }
})

// Mutation: Update cart item quantity
export const updateCartQuantity = mutation({
  args: {
    variantId: v.id('merchVariants'),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx)

    if (args.quantity < 0 || args.quantity > 100 || !Number.isInteger(args.quantity)) {
      throw new ConvexError('Invalid quantity')
    }

    const cart = await ctx.db
      .query('merchCart')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .first()

    if (!cart) throw new ConvexError('Cart not found')

    // Validate variant still exists
    const variant = await ctx.db.get(args.variantId)
    if (!variant) throw new ConvexError('Product not found')

    // Check stock if quantity > 0
    if (args.quantity > 0 && variant.stock < args.quantity) {
      throw new ConvexError(`Only ${variant.stock} items available`)
    }

    // Update items (remove if quantity = 0)
    const updatedItems = args.quantity === 0
      ? cart.items.filter(item => item.variantId !== args.variantId)
      : cart.items.map(item =>
          item.variantId === args.variantId
            ? { ...item, quantity: args.quantity }
            : item
        )

    await ctx.db.patch(cart._id, {
      items: updatedItems,
      updatedAt: Date.now(),
    })

    const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
    return { success: true, itemCount: totalItems }
  }
})

// Mutation: Remove item from cart
export const removeFromCart = mutation({
  args: { variantId: v.id('merchVariants') },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx)

    const cart = await ctx.db
      .query('merchCart')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .first()

    if (!cart) throw new ConvexError('Cart not found')

    const updatedItems = cart.items.filter(item => item.variantId !== args.variantId)

    await ctx.db.patch(cart._id, {
      items: updatedItems,
      updatedAt: Date.now(),
    })

    return { success: true, itemCount: updatedItems.length }
  }
})

// Mutation: Clear entire cart
export const clearCart = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getOrCreateCurrentUser(ctx)

    const cart = await ctx.db
      .query('merchCart')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .first()

    if (cart) {
      await ctx.db.patch(cart._id, {
        items: [],
        updatedAt: Date.now(),
      })
    }

    return { success: true }
  }
})
