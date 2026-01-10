import { query, mutation } from './_generated/server'
import { getCurrentUser } from './helpers'
import { v, ConvexError } from 'convex/values'

// Query: Get paginated products with filters & search
export const getProducts = query({
  args: {
    page: v.number(),
    pageSize: v.number(),
    category: v.optional(v.union(
      v.literal('apparel'),
      v.literal('accessories'),
      v.literal('vinyl'),
      v.literal('limited'),
      v.literal('other')
    )),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    search: v.optional(v.string()),
    sortBy: v.optional(v.union(
      v.literal('newest'),
      v.literal('price_low'),
      v.literal('price_high'),
      v.literal('popular'),
      v.literal('stock')
    )),
  },
  handler: async (ctx, args) => {
    // Validate pagination
    if (args.page < 0 || args.pageSize < 1 || args.pageSize > 100) {
      throw new ConvexError('Invalid pagination')
    }

    // Get all products and filter in memory
    let products = await ctx.db.query('merchProducts').collect()

    // Status filter: always show active/pre-order (not archived)
    products = products.filter(p =>
      p.status === 'active' || p.status === 'draft'
    )

    // Category filter
    if (args.category) {
      products = products.filter(p => p.category === args.category)
    }

    // Price filters
    if (args.minPrice !== undefined) {
      products = products.filter(p => p.price >= args.minPrice!)
    }

    if (args.maxPrice !== undefined) {
      products = products.filter(p => p.price <= args.maxPrice!)
    }

    // Search filter
    if (args.search) {
      const searchLower = args.search.toLowerCase().trim()
      if (searchLower.length > 0 && searchLower.length < 100) {
        products = products.filter(p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.tags.some(t => t.toLowerCase().includes(searchLower))
        )
      }
    }

    // Apply sorting
    switch (args.sortBy) {
      case 'price_low':
        products.sort((a, b) => a.price - b.price)
        break
      case 'price_high':
        products.sort((a, b) => b.price - a.price)
        break
      case 'stock':
        products.sort((a, b) => b.totalStock - a.totalStock)
        break
      case 'newest':
      default:
        products.sort((a, b) => b.createdAt - a.createdAt)
        break
    }

    // Pagination
    const totalCount = products.length
    const skip = args.page * args.pageSize
    const paginatedProducts = products.slice(skip, skip + args.pageSize + 1)
    const hasMore = totalCount > skip + args.pageSize

    // Fetch variants for each product
    const enriched = await Promise.all(
      paginatedProducts.slice(0, args.pageSize).map(async (product) => {
        const variants = await ctx.db
          .query('merchVariants')
          .withIndex('by_product', q => q.eq('productId', product._id))
          .collect()

        return {
          ...product,
          variants,
          inStock: variants.some(v => v.stock > 0),
          lowestPrice: variants.length > 0
            ? Math.min(...variants.map(v => v.price || product.price))
            : product.price
        }
      })
    )

    return {
      items: enriched,
      hasMore,
      page: args.page,
      pageSize: args.pageSize,
      timestamp: Date.now(),
    }
  }
})

// Query: Get single product with variants and related products
export const getProductDetail = query({
  args: { productId: v.id('merchProducts') },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId)
    if (!product || product.status === 'archived') {
      return null
    }

    const variants = await ctx.db
      .query('merchVariants')
      .withIndex('by_product', q => q.eq('productId', args.productId))
      .collect()

    // Get related products (same category, limit 4)
    const allRelated = await ctx.db
      .query('merchProducts')
      .withIndex('by_category', q => q.eq('category', product.category))
      .collect()

    const related = allRelated
      .filter(p =>
        p._id !== args.productId &&
        (p.status === 'active' || p.status === 'draft')
      )
      .slice(0, 4)

    return {
      ...product,
      variants,
      relatedProducts: related,
      inStock: variants.some(v => v.stock > 0),
      outOfStockVariants: variants.filter(v => v.stock === 0),
      timestamp: Date.now(),
    }
  }
})

// Query: Get active drops
export const getActiveDrops = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()

    const allDrops = await ctx.db.query('merchDrops').collect()

    // Filter active drops
    const drops = allDrops
      .filter(d => d.startsAt <= now && d.endsAt >= now)
      .sort((a, b) => a.startsAt - b.startsAt)
      .slice(0, 10)

    // Enrich with product details
    const enrichedDrops = await Promise.all(
      drops.map(async (drop) => {
        const products = await Promise.all(
          drop.products.map((pid) => ctx.db.get(pid))
        )
        return {
          ...drop,
          products: products.filter(Boolean),
          productCount: products.filter(Boolean).length
        }
      })
    )

    return enrichedDrops
  }
})

// Query: Get upcoming drops
export const getUpcomingDrops = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()

    const allDrops = await ctx.db.query('merchDrops').collect()

    // Filter and sort upcoming drops
    const drops = allDrops
      .filter(d => d.startsAt > now)
      .sort((a, b) => a.startsAt - b.startsAt)
      .slice(0, 5)

    return drops
  }
})

// Query: Get all drops (paginated)
export const getAllDrops = query({
  args: {
    page: v.number(),
  },
  handler: async (ctx, args) => {
    const allDrops = await ctx.db.query('merchDrops').collect()

    // Sort and paginate
    const drops = allDrops
      .sort((a, b) => b.startsAt - a.startsAt)
      .slice(args.page * 20, (args.page + 1) * 20)

    return {
      drops,
      hasMore: allDrops.length > (args.page + 1) * 20,
      page: args.page,
    }
  }
})

// Query: Search products by SKU (for variants)
export const getVariantBySku = query({
  args: { sku: v.string() },
  handler: async (ctx, args) => {
    const variant = await ctx.db
      .query('merchVariants')
      .withIndex('by_sku', q => q.eq('sku', args.sku))
      .first()

    if (!variant) return null

    const product = await ctx.db.get(variant.productId)
    return { ...variant, product }
  }
})

// Mutation: Toggle product in wishlist
export const toggleWishlist = mutation({
  args: { productId: v.id('merchProducts') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)

    const existing = await ctx.db
      .query('merchWishlist')
      .withIndex('by_user_product', q => q.eq('userId', user._id).eq('productId', args.productId))
      .first()

    if (existing) {
      await ctx.db.delete(existing._id)
      return { wishlisted: false }
    } else {
      await ctx.db.insert('merchWishlist', {
        userId: user._id,
        productId: args.productId,
        createdAt: Date.now(),
      })
      return { wishlisted: true }
    }
  }
})

// Query: Get user's wishlist
export const getWishlist = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)
    if (!user) return []

    const wishlistItems = await ctx.db
      .query('merchWishlist')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .collect()

    const products = await Promise.all(
      wishlistItems.map(async (item) => {
        const product = await ctx.db.get(item.productId)
        if (!product || product.status === 'archived') return null

        const variants = await ctx.db
          .query('merchVariants')
          .withIndex('by_product', q => q.eq('productId', product._id))
          .collect()

        return {
          ...product,
          variants,
          inStock: variants.some(v => v.stock > 0),
        }
      })
    )

    return products.filter((p): p is NonNullable<typeof p> => p !== null)
  }
})
