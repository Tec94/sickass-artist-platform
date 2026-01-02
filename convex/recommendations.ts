import { query } from "./_generated/server"
import { v } from "convex/values"
import type { Doc } from "./_generated/dataModel"
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

    // Collect gallery content based on category filter
    let galleryContent: Doc<'galleryContent'>[] = []
    
    if (!args.category || args.category === 'all' || args.category === 'gallery') {
      if (args.category === 'gallery') {
        galleryContent = await ctx.db.query('galleryContent').collect()
      } else {
        galleryContent = await ctx.db.query('galleryContent').collect()
      }
    }

    // Collect UGC content (only approved) based on category filter
    let ugcContent: Doc<'ugcContent'>[] = []
    
    if (!args.category || args.category === 'all' || args.category === 'ugc') {
      const allUGC = await ctx.db
        .query('ugcContent')
        .withIndex('by_approved', (q) => q.eq('isApproved', true))
        .collect()
      ugcContent = allUGC
    }

    // Transform gallery content to trending items
    const galleryItems: TrendingItem[] = galleryContent
      .filter(item => {
        // Filter by tier requirement (user must meet requirement)
        if (item.requiredFanTier) {
          const itemTierLevel = getTierLevel(item.requiredFanTier)
          if (userTierLevel < itemTierLevel) return false
        }
        // Filter by tier filter (show only content at or above this tier)
        if (tierFilter && item.requiredFanTier) {
          const itemTierLevel = getTierLevel(item.requiredFanTier)
          if (itemTierLevel < requiredTierLevel) return false
        }
        // Filter by date range
        if (dateCutoff && item.createdAt < dateCutoff) return false
        return true
      })
      .map(item => {
        const now = Date.now()
        const daysOld = (now - item.createdAt) / (1000 * 60 * 60 * 24)
        const recencyFactor = args.sortBy === 'newest' ? 1 : 1 / (1 + daysOld / 7)
        const trendingScore = (item.likeCount + (item.viewCount * 0.1)) * recencyFactor

        return {
          id: item._id.toString(),
          contentId: item.contentId,
          title: item.title,
          thumbnailUrl: item.thumbnailUrl,
          type: 'gallery' as const,
          subType: item.type,
          creatorId: item.creatorId.toString(),
          creatorDisplayName: '',
          creatorAvatar: '',
          creatorTier: 'bronze' as FanTier,
          likeCount: item.likeCount,
          viewCount: item.viewCount,
          isLocked: false,
          requiredFanTier: item.requiredFanTier,
          createdAt: item.createdAt,
          trendingScore,
        }
      })

    // Transform UGC content to trending items
    const ugcItems: TrendingItem[] = ugcContent
      .filter(item => {
        // Filter by date range
        if (dateCutoff && item.createdAt < dateCutoff) return false
        return true
      })
      .map(item => {
        const now = Date.now()
        const daysOld = (now - item.createdAt) / (1000 * 60 * 60 * 24)
        const recencyFactor = args.sortBy === 'newest' ? 1 : 1 / (1 + daysOld / 7)
        const trendingScore = (item.likeCount + (item.viewCount * 0.1)) * recencyFactor

        return {
          id: item._id.toString(),
          contentId: item.ugcId,
          title: item.title,
          thumbnailUrl: item.imageUrls[0] || '',
          type: 'ugc' as const,
          subType: item.category,
          creatorId: item.creatorId.toString(),
          creatorDisplayName: item.creatorDisplayName,
          creatorAvatar: item.creatorAvatar,
          creatorTier: item.creatorTier,
          likeCount: item.likeCount,
          viewCount: item.viewCount,
          isLocked: false,
          createdAt: item.createdAt,
          trendingScore,
        }
      })

    // Enrich gallery items with creator info
    for (const item of galleryItems) {
      const creator = await ctx.db.get(item.creatorId as any)
      if (creator && 'displayName' in creator) {
        item.creatorDisplayName = creator.displayName
        item.creatorAvatar = creator.avatar
        item.creatorTier = creator.fanTier
      }
    }

    // Combine and sort
    let allItems = [...galleryItems, ...ugcItems]

    // Sort based on sortBy
    if (args.sortBy === 'newest') {
      allItems.sort((a, b) => b.createdAt - a.createdAt)
    } else if (args.sortBy === 'mostLiked') {
      allItems.sort((a, b) => b.likeCount - a.likeCount)
    } else if (args.sortBy === 'mostViewed') {
      allItems.sort((a, b) => b.viewCount - a.viewCount)
    } else {
      // Trending (default)
      allItems.sort((a, b) => b.trendingScore - a.trendingScore)
    }

    // Get total count
    const totalCount = allItems.length

    // Paginate
    const items = allItems.slice(skip, skip + pageSize)
    const hasMore = skip + pageSize < totalCount

    return {
      items,
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
