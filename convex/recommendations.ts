import { query } from "./_generated/server"
import { v, ConvexError } from "convex/values"
import type { Doc, Id } from "./_generated/dataModel"
import { getCurrentUser, getTierLevel } from "./helpers"

type FanTier = 'bronze' | 'silver' | 'gold' | 'platinum'

// Combined trending item from gallery or UGC
type TrendingItem = {
  id: string
  contentId: string
  title: string
  thumbnailUrl: string
  type: 'gallery' | 'ugc'
  subType: 'show' | 'bts' | 'edit' | 'wip' | 'exclusive' | 'user-edit' | 'fan-art' | 'repost'
  creatorId: string
  creatorDisplayName: string
  creatorAvatar: string
  creatorTier: FanTier
  likeCount: number
  viewCount: number
  isLocked: boolean
  requiredFanTier?: FanTier
  createdAt: number
  trendingScore: number
}

type TrendingResult = {
  items: TrendingItem[]
  hasMore: boolean
  totalCount: number
  page: number
}

/**
 * Get trending content across gallery and UGC
 * Uses precomputed scores from trendingScores table for better performance
 */
export const getTrendingContent = query({
  args: {
    category: v.optional(v.string()),
    dateRange: v.optional(v.string()),
    tierFilter: v.optional(v.string()),
    sortBy: v.optional(
      v.union(
        v.literal('trending'),
        v.literal('newest'),
        v.literal('mostLiked'),
        v.literal('mostViewed')
      )
    ),
    page: v.number(),
    pageSize: v.number(),
  },
  handler: async (ctx, args): Promise<TrendingResult> => {
    const pageSize = Math.min(args.pageSize, 50)
    const skip = args.page * pageSize
    const sortBy = args.sortBy || 'trending'

    // Get current user for tier checks
    let currentUser: Doc<'users'> | null = null
    try {
      currentUser = await getCurrentUser(ctx)
    } catch {
      // User not authenticated
    }

    const userTierLevel = currentUser ? getTierLevel(currentUser.fanTier) : -1

    // Date range filter (in milliseconds)
    let dateCutoff: number | undefined
    if (args.dateRange && args.dateRange !== 'all') {
      const days = args.dateRange === '7d' ? 7 : args.dateRange === '30d' ? 30 : 90
      dateCutoff = Date.now() - days * 24 * 60 * 60 * 1000
    }

    // Tier filter
    const tierFilter = args.tierFilter === 'all' ? undefined : args.tierFilter as FanTier
    const requiredTierLevel = tierFilter ? getTierLevel(tierFilter) : 0

    // Fetch precomputed trending scores
    let trendingScores: Doc<'trendingScores'>[] = []

    if (!args.category || args.category === 'all') {
      // Get both gallery and UGC scores, sorted by trendingScore (descending)
      trendingScores = await ctx.db.query('trendingScores').collect()
    } else if (args.category === 'gallery') {
      trendingScores = await ctx.db
        .query('trendingScores')
        .withIndex('by_content_type', (q) => q.eq('contentType', 'gallery'))
        .collect()
    } else if (args.category === 'ugc') {
      trendingScores = await ctx.db
        .query('trendingScores')
        .withIndex('by_content_type', (q) => q.eq('contentType', 'ugc'))
        .collect()
    }

    // Filter by date range
    if (dateCutoff) {
      trendingScores = trendingScores.filter((score) => score.createdAt >= dateCutoff)
    }

    // Build list of content IDs to fetch
    const galleryContentIds = new Set<string>()
    const ugcContentIds = new Set<string>()

    trendingScores.forEach((score) => {
      if (score.contentType === 'gallery') {
        galleryContentIds.add(score.contentId)
      } else {
        ugcContentIds.add(score.contentId)
      }
    })

    // Fetch actual content in parallel
    const [allGallery, allUGC] = await Promise.all([
      galleryContentIds.size > 0
        ? ctx.db.query('galleryContent').collect()
        : [],
      ugcContentIds.size > 0
        ? ctx.db.query('ugcContent').withIndex('by_approved', (q) => q.eq('isApproved', true)).collect()
        : [],
    ])

    // Create content lookup maps
    const galleryMap = new Map(allGallery.map((g) => [g.contentId, g]))
    const ugcMap = new Map(allUGC.map((u) => [u.ugcId, u]))

    // Transform scores to trending items with content data
    const items: TrendingItem[] = []

    for (const score of trendingScores) {
      let item: TrendingItem | null = null

      if (score.contentType === 'gallery') {
        const content = galleryMap.get(score.contentId)
        if (!content) continue

        // Filter by tier requirement
        if (content.requiredFanTier) {
          const itemTierLevel = getTierLevel(content.requiredFanTier)
          if (userTierLevel < itemTierLevel) continue
        }
        // Filter by tier filter
        if (tierFilter && content.requiredFanTier) {
          const itemTierLevel = getTierLevel(content.requiredFanTier)
          if (itemTierLevel < requiredTierLevel) continue
        }

        // Filter by date range (already applied to scores, but verify content createdAt)
        if (dateCutoff && content.createdAt < dateCutoff) continue

        item = {
          id: content._id.toString(),
          contentId: content.contentId,
          title: content.title,
          thumbnailUrl: content.thumbnailUrl,
          type: 'gallery',
          subType: content.type,
          creatorId: content.creatorId.toString(),
          creatorDisplayName: '',
          creatorAvatar: '',
          creatorTier: 'bronze',
          likeCount: score.likeCount,
          viewCount: score.viewCount,
          isLocked: false,
          requiredFanTier: content.requiredFanTier,
          createdAt: content.createdAt,
          trendingScore: score.trendingScore,
        }
      } else {
        const content = ugcMap.get(score.contentId)
        if (!content) continue

        // Filter by date range (already applied to scores, but verify content createdAt)
        if (dateCutoff && content.createdAt < dateCutoff) continue

        item = {
          id: content._id.toString(),
          contentId: content.ugcId,
          title: content.title,
          thumbnailUrl: content.imageUrls[0] || '',
          type: 'ugc',
          subType: content.category,
          creatorId: content.creatorId.toString(),
          creatorDisplayName: content.creatorDisplayName,
          creatorAvatar: content.creatorAvatar,
          creatorTier: content.creatorTier,
          likeCount: score.likeCount,
          viewCount: score.viewCount,
          isLocked: false,
          createdAt: content.createdAt,
          trendingScore: score.trendingScore,
        }
      }

      if (item) {
        items.push(item)
      }
    }

    // Enrich gallery items with creator info
    for (const item of items) {
      if (item.type === 'gallery') {
        const creatorId = item.creatorId as Id<'users'>
        const creator = await ctx.db.get(creatorId)
        if (creator && 'displayName' in creator && 'avatar' in creator && 'fanTier' in creator) {
          const user = creator as Doc<'users'>
          item.creatorDisplayName = user.displayName
          item.creatorAvatar = user.avatar
          item.creatorTier = user.fanTier
        }
      }
    }

    // Sort based on sortBy
    if (sortBy === 'newest') {
      items.sort((a, b) => b.createdAt - a.createdAt)
    } else if (sortBy === 'mostLiked') {
      items.sort((a, b) => b.likeCount - a.likeCount)
    } else if (sortBy === 'mostViewed') {
      items.sort((a, b) => b.viewCount - a.viewCount)
    } else {
      // Trending (default) - already sorted by precomputed score
      items.sort((a, b) => b.trendingScore - a.trendingScore)
    }

    // Get total count
    const totalCount = items.length

    // Paginate
    const paginatedItems = items.slice(skip, skip + pageSize)
    const hasMore = skip + pageSize < totalCount

    return {
      items: paginatedItems,
      hasMore,
      totalCount,
      page: args.page,
    }
  },
})

/**
 * Get recommended creators based on various factors
 */
export const getRecommendedCreators = query({
  args: {
    limit: v.number(),
  },
  handler: async (ctx, args): Promise<Doc<'users'>[]> => {
    const limit = Math.min(args.limit, 50)

    // Get all artists (role = 'artist')
    const artists = await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'artist'))
      .collect()

    // Sort by level and XP (higher = more active/established)
    const sortedCreators = artists
      .sort((a, b) => {
        // First by level
        if (b.level !== a.level) return b.level - a.level
        // Then by XP
        return b.xp - a.xp
      })
      .slice(0, limit)

    return sortedCreators
  },
})

/**
 * Get trending content by category (gallery or UGC only)
 * Uses precomputed scores for efficient sorting
 */
export const getTrendingByCategory = query({
  args: {
    category: v.union(v.literal('gallery'), v.literal('ugc')),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 10, 50)

    try {
      // Fetch precomputed trending scores for the category
      const trendingScores = await ctx.db
        .query('trendingScores')
        .withIndex('by_content_type', (q) => q.eq('contentType', args.category))
        .collect()

      // Sort by trending score (descending)
      trendingScores.sort((a, b) => b.trendingScore - a.trendingScore)

      // Take the top N scores
      const topScores = trendingScores.slice(0, limit)

      // Fetch actual content
      type TrendingItemByCategory = {
        contentId: string
        title: string
        thumbnailUrl: string
        likeCount: number
        viewCount: number
        createdAt: number
        trendingScore: number
        type?: string
        category?: string
      }
      const items: TrendingItemByCategory[] = []

      for (const score of topScores) {
        if (args.category === 'gallery') {
          const content = await ctx.db
            .query('galleryContent')
            .filter((q) => q.eq(q.field('contentId'), score.contentId))
            .first()

          if (content) {
            items.push({
              contentId: content.contentId,
              title: content.title,
              thumbnailUrl: content.thumbnailUrl,
              likeCount: content.likeCount,
              viewCount: content.viewCount,
              type: content.type,
              createdAt: content.createdAt,
              trendingScore: score.trendingScore,
            })
          }
        } else {
          const content = await ctx.db
            .query('ugcContent')
            .filter((q) => q.eq(q.field('ugcId'), score.contentId))
            .first()

          if (content) {
            items.push({
              contentId: content.ugcId,
              title: content.title,
              thumbnailUrl: content.imageUrls[0] || '',
              likeCount: content.likeCount,
              viewCount: content.viewCount,
              category: content.category,
              createdAt: content.createdAt,
              trendingScore: score.trendingScore,
            })
          }
        }
      }

      return items
    } catch (err) {
      console.error('[Trending] Error fetching by category:', err)
      throw new ConvexError('Failed to fetch trending by category')
    }
  },
})
