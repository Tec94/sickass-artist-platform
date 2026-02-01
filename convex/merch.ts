import { query, mutation } from './_generated/server'
import type { QueryCtx } from './_generated/server'
import type { Doc } from './_generated/dataModel'
import { getCurrentUser, getOrCreateCurrentUser } from './helpers'
import { v, ConvexError } from 'convex/values'

type MerchCategory = 'apparel' | 'accessories' | 'vinyl' | 'limited' | 'other'
type MerchSort = 'newest' | 'price_low' | 'price_high' | 'popular' | 'stock'
type MerchStatus = 'active' | 'draft'

const MAX_PAGE_SIZE = 60
const MAX_PAGE_WINDOW = 500

function clampPageSize(pageSize: number) {
  if (!Number.isFinite(pageSize)) return MAX_PAGE_SIZE
  return Math.max(1, Math.min(Math.floor(pageSize), MAX_PAGE_SIZE))
}

function dedupeProducts(products: Doc<'merchProducts'>[]) {
  const byId = new Map<string, Doc<'merchProducts'>>()
  for (const product of products) {
    byId.set(String(product._id), product)
  }
  return Array.from(byId.values())
}

function applyFilters(
  products: Doc<'merchProducts'>[],
  statusSet: Set<string>,
  category?: MerchCategory,
  minPrice?: number,
  maxPrice?: number
) {
  return products.filter((product) => {
    if (!statusSet.has(product.status)) return false
    if (category && product.category !== category) return false
    if (minPrice !== undefined && product.price < minPrice) return false
    if (maxPrice !== undefined && product.price > maxPrice) return false
    return true
  })
}

function sortProducts(products: Doc<'merchProducts'>[], sortBy: MerchSort) {
  const sorted = [...products]
  switch (sortBy) {
    case 'price_low':
      sorted.sort((a, b) => a.price - b.price)
      break
    case 'price_high':
      sorted.sort((a, b) => b.price - a.price)
      break
    case 'stock':
      sorted.sort((a, b) => b.totalStock - a.totalStock)
      break
    case 'popular':
    case 'newest':
    default:
      sorted.sort((a, b) => b.createdAt - a.createdAt)
      break
  }
  return sorted
}

async function isAdmin(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) return false
  const user = await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
    .first()
  return user?.role === 'admin'
}

async function enrichProducts(ctx: QueryCtx, products: Doc<'merchProducts'>[]) {
  return await Promise.all(
    products.map(async (product) => {
      const variants = await ctx.db
        .query('merchVariants')
        .withIndex('by_product', (q) => q.eq('productId', product._id))
        .collect()

      const lowestPrice =
        variants.length > 0
          ? Math.min(...variants.map((variant) => variant.price || product.price))
          : product.price

      return {
        ...product,
        variants,
        inStock: variants.some((variant) => variant.stock > 0),
        lowestPrice,
      }
    })
  )
}

// Query: Get paginated products with filters & search
export const getProducts = query({
  args: {
    page: v.number(),
    pageSize: v.number(),
    category: v.optional(
      v.union(
        v.literal('apparel'),
        v.literal('accessories'),
        v.literal('vinyl'),
        v.literal('limited'),
        v.literal('other')
      )
    ),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    search: v.optional(v.string()),
    sortBy: v.optional(
      v.union(
        v.literal('newest'),
        v.literal('price_low'),
        v.literal('price_high'),
        v.literal('popular'),
        v.literal('stock')
      )
    ),
    includeDrafts: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.page < 0) {
      throw new ConvexError('Invalid pagination')
    }
    const pageSize = clampPageSize(args.pageSize)
    const start = args.page * pageSize
    if (start > MAX_PAGE_WINDOW) {
      throw new ConvexError('Page too large. Refine your filters to continue.')
    }

    const adminAllowed = args.includeDrafts ? await isAdmin(ctx) : false
    const statuses: MerchStatus[] = adminAllowed ? ['active', 'draft'] : ['active']
    const statusSet = new Set<string>(statuses)
    const sortBy = (args.sortBy ?? 'newest') as MerchSort

    const neededCount = start + pageSize + 1
    const needsOverscan =
      !!args.search ||
      args.minPrice !== undefined ||
      args.maxPrice !== undefined ||
      sortBy === 'stock'
    const overscanFactor = needsOverscan ? 3 : 2
    const candidateLimit = Math.min(
      Math.max(neededCount * overscanFactor, pageSize * 4),
      400
    )
    const perStatusLimit = Math.max(10, Math.ceil(candidateLimit / statuses.length))

    const searchQuery = args.search?.trim().toLowerCase() ?? ''
    const hasSearch = searchQuery.length >= 2

    const candidates: Doc<'merchProducts'>[] = []

    if (hasSearch) {
      for (const status of statuses) {
        const results = await ctx.db
          .query('merchProducts')
          .withSearchIndex('search_merchProducts', (q) => {
            const base = q.search('searchText', searchQuery).eq('status', status)
            return args.category ? base.eq('category', args.category) : base
          })
          .take(perStatusLimit)
        candidates.push(...results)
      }
    } else {
      for (const status of statuses) {
        const usePriceSort = sortBy === 'price_low' || sortBy === 'price_high'
        const order = sortBy === 'price_low' ? 'asc' : 'desc'

        if (args.category) {
          const results = await ctx.db
            .query('merchProducts')
            .withIndex(
              usePriceSort ? 'by_category_status_price' : 'by_category_status_created',
              (q) => q.eq('category', args.category!).eq('status', status)
            )
            .order(order as 'asc' | 'desc')
            .take(perStatusLimit)
          candidates.push(...results)
        } else {
          const results = await ctx.db
            .query('merchProducts')
            .withIndex(usePriceSort ? 'by_status_price' : 'by_status_created', (q) =>
              q.eq('status', status)
            )
            .order(order as 'asc' | 'desc')
            .take(perStatusLimit)
          candidates.push(...results)
        }
      }
    }

    const deduped = dedupeProducts(candidates)
    const filtered = sortProducts(
      applyFilters(deduped, statusSet, args.category as MerchCategory | undefined, args.minPrice, args.maxPrice),
      sortBy
    )

    const windowed = filtered.slice(start, start + pageSize + 1)
    const hasMore = windowed.length > pageSize || deduped.length >= perStatusLimit * statuses.length
    const pageItems = windowed.slice(0, pageSize)

    const enriched = await enrichProducts(ctx, pageItems)

    return {
      items: enriched,
      hasMore,
      page: args.page,
      pageSize,
      windowCount: filtered.length,
      timestamp: Date.now(),
    }
  },
})

// Query: Get single product with variants and related products
export const getProductDetail = query({
  args: { productId: v.id('merchProducts') },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId)
    if (!product) return null

    const admin = await isAdmin(ctx)
    if (product.status !== 'active' && !admin) {
      return null
    }

    const variants = await ctx.db
      .query('merchVariants')
      .withIndex('by_product', (q) => q.eq('productId', args.productId))
      .collect()

    const relatedCandidates = await ctx.db
      .query('merchProducts')
      .withIndex('by_category_status_created', (q) => q.eq('category', product.category).eq('status', 'active'))
      .order('desc')
      .take(12)

    const related = relatedCandidates.filter((item) => item._id !== args.productId).slice(0, 4)

    return {
      ...product,
      variants,
      relatedProducts: related,
      inStock: variants.some((variant) => variant.stock > 0),
      outOfStockVariants: variants.filter((variant) => variant.stock === 0),
      timestamp: Date.now(),
    }
  },
})

// Query: Get active drops
export const getActiveDrops = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000

    const candidates = await ctx.db
      .query('merchDrops')
      .withIndex('by_starts', (q) => q.gt('startsAt', oneYearAgo))
      .order('desc')
      .take(50)

    const drops = candidates
      .filter((drop) => drop.startsAt <= now && drop.endsAt >= now)
      .sort((a, b) => a.startsAt - b.startsAt)
      .slice(0, 10)

    const enrichedDrops = await Promise.all(
      drops.map(async (drop) => {
        const products = await Promise.all(drop.products.map((pid) => ctx.db.get(pid)))
        return {
          ...drop,
          products: products.filter(Boolean),
          productCount: products.filter(Boolean).length,
        }
      })
    )

    return enrichedDrops
  },
})

// Query: Get upcoming drops
export const getUpcomingDrops = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()

    const drops = await ctx.db
      .query('merchDrops')
      .withIndex('by_starts', (q) => q.gt('startsAt', now))
      .order('asc')
      .take(10)

    return drops.slice(0, 5)
  },
})

// Query: Get all drops (paginated)
export const getAllDrops = query({
  args: {
    page: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.page < 0) {
      throw new ConvexError('Invalid pagination')
    }
    const start = args.page * 20
    const neededCount = start + 21

    const drops = await ctx.db
      .query('merchDrops')
      .withIndex('by_starts')
      .order('desc')
      .take(Math.min(neededCount, 200))

    const pageDrops = drops.slice(start, start + 20)

    return {
      drops: pageDrops,
      hasMore: drops.length > start + 20,
      page: args.page,
    }
  },
})

// Query: Search products by SKU (for variants)
export const getVariantBySku = query({
  args: { sku: v.string() },
  handler: async (ctx, args) => {
    const variant = await ctx.db
      .query('merchVariants')
      .withIndex('by_sku', (q) => q.eq('sku', args.sku))
      .first()

    if (!variant) return null

    const product = await ctx.db.get(variant.productId)
    return { ...variant, product }
  },
})

// Mutation: Toggle product in wishlist
export const toggleWishlist = mutation({
  args: { productId: v.id('merchProducts') },
  handler: async (ctx, args) => {
    let user
    try {
      user = await getCurrentUser(ctx)
    } catch {
      try {
        user = await getOrCreateCurrentUser(ctx)
      } catch {
        throw new ConvexError('You must be logged in to manage your wishlist')
      }
    }

    const existing = await ctx.db
      .query('merchWishlist')
      .withIndex('by_user_product', (q) => q.eq('userId', user._id).eq('productId', args.productId))
      .first()

    if (existing) {
      await ctx.db.delete(existing._id)
      return { wishlisted: false }
    }

    await ctx.db.insert('merchWishlist', {
      userId: user._id,
      productId: args.productId,
      createdAt: Date.now(),
    })
    return { wishlisted: true }
  },
})

// Query: Get user's wishlist
export const getWishlist = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .first()
    if (!user) return []

    const wishlistItems = await ctx.db
      .query('merchWishlist')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect()

    const products = await Promise.all(
      wishlistItems.map(async (item) => {
        const product = await ctx.db.get(item.productId)
        if (!product || product.status === 'archived') return null

        const variants = await ctx.db
          .query('merchVariants')
          .withIndex('by_product', (q) => q.eq('productId', product._id))
          .collect()

        return {
          ...product,
          variants,
          inStock: variants.some((variant) => variant.stock > 0),
        }
      })
    )

    return products.filter((product): product is NonNullable<typeof product> => product !== null)
  },
})
