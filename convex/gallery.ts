import { query, mutation } from "./_generated/server"
import { v, ConvexError } from "convex/values"
import type { Doc, Id } from "./_generated/dataModel"
import { getCurrentUser, getTierLevel } from "./helpers"

type FanTier = 'bronze' | 'silver' | 'gold' | 'platinum'

type GalleryContentWithCreator = Doc<'galleryContent'> & {
  creator: {
    _id: Id<'users'>
    displayName: string
    avatar: string
    username: string
    fanTier: FanTier
  }
  isLiked: boolean
  isLocked: boolean
}

type GalleryContentDetail = Doc<'galleryContent'> & {
  creator: {
    _id: Id<'users'>
    displayName: string
    avatar: string
    username: string
    tier: FanTier
    role: 'artist' | 'admin' | 'mod' | 'crew' | 'fan'
  }
  isLiked: boolean
  isLocked: boolean
  relatedContent: GalleryContentWithCreator[]
}

type PaginatedResult<T> = {
  items: T[]
  hasMore: boolean
  totalCount: number
  page: number
}

type LikeResult = {
  contentId: string
  liked: boolean
  newCount: number
  timestamp: number
}

type ViewCountResult = {
  contentId: string
  newViewCount: number
}

/**
 * Get paginated gallery content with optional type filter
 */
export const getGalleryContent = query({
  args: {
    type: v.optional(v.string()),
    page: v.number(),
    pageSize: v.number(),
    sortBy: v.optional(
      v.union(
        v.literal('newest'),
        v.literal('oldest'),
        v.literal('mostLiked')
      )
    ),
    tier: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<PaginatedResult<GalleryContentWithCreator>> => {
    // Cap pageSize at 50 for performance
    const pageSize = Math.min(args.pageSize, 50)
    const skip = args.page * pageSize

    // Build query and get all matching content
    let allMatchingContent: Doc<'galleryContent'>[]
    
    if (args.type) {
      allMatchingContent = await ctx.db
        .query('galleryContent')
        .withIndex('by_type', (q) =>
          q.eq('type', args.type as 'show' | 'bts' | 'edit' | 'wip' | 'exclusive')
        )
        .collect()
    } else {
      allMatchingContent = await ctx.db
        .query('galleryContent')
        .collect()
    }

    // Filter by tier if provided
    if (args.tier && args.tier !== 'all') {
      const requiredTierLevel = getTierLevel(args.tier as FanTier)
      allMatchingContent = allMatchingContent.filter((item: Doc<'galleryContent'>) => {
        if (!item.requiredFanTier) return true // Public content is always included
        return getTierLevel(item.requiredFanTier) <= requiredTierLevel
      })
    }

    const totalCount = allMatchingContent.length

    // Apply sorting
    let sortedContent = allMatchingContent
    if (args.sortBy === 'oldest') {
      sortedContent = [...allMatchingContent].sort((a, b) => a.createdAt - b.createdAt)
    } else if (args.sortBy === 'mostLiked') {
      sortedContent = [...allMatchingContent].sort((a, b) => b.likeCount - a.likeCount)
    } else {
      // Default: newest
      sortedContent = [...allMatchingContent].sort((a, b) => b.createdAt - a.createdAt)
    }

    // Paginate
    const items = sortedContent.slice(skip, skip + pageSize)
    const hasMore = skip + pageSize < totalCount

    // Get current user for like status and tier check
    let currentUser: Doc<'users'> | null = null
    try {
      currentUser = await getCurrentUser(ctx)
    } catch {
      // User not authenticated, continue without like status
    }

    // Enrich items with creator info, like status, and locked status
    const enrichedItems: GalleryContentWithCreator[] = []
    for (const content of items) {
      const creatorDoc = await ctx.db.get(content.creatorId)
      
      // Since creatorId is Id<'users'>, this should be a user document
      // Check if it exists and has user properties
      if (!creatorDoc || !('displayName' in creatorDoc)) {
        continue // Skip if creator not found or not a user
      }
      
      const creator = creatorDoc as Doc<'users'>

      // Check if current user liked this content
      let isLiked = false
      if (currentUser) {
        const like = await ctx.db
          .query('galleryLikes')
          .withIndex('by_user_type', (q) => 
            q.eq('userId', currentUser._id).eq('type', 'gallery')
          )
          .collect()
        
        isLiked = like.some(l => l.contentId === content.contentId)
      }

      // Check if content is locked by tier
      let isLocked = false
      if (content.requiredFanTier) {
        if (currentUser) {
          const userTierLevel = getTierLevel(currentUser.fanTier)
          const requiredTierLevel = getTierLevel(content.requiredFanTier)
          isLocked = userTierLevel < requiredTierLevel
        } else {
          // Not logged in, treat as locked if tier requirement exists
          isLocked = true
        }
      }

      enrichedItems.push({
        ...content,
        creator: {
          _id: creator._id,
          displayName: creator.displayName,
          avatar: creator.avatar,
          username: creator.username,
          fanTier: creator.fanTier,
        },
        isLiked,
        isLocked,
      })
    }

    return {
      items: enrichedItems,
      hasMore,
      totalCount,
      page: args.page,
    }
  },
})

/**
 * Get full details for a single gallery content
 */
export const getGalleryContentDetail = query({
  args: {
    contentId: v.string(),
  },
  handler: async (ctx, args): Promise<GalleryContentDetail | null> => {
    // Find content by contentId
    const content = await ctx.db
      .query('galleryContent')
      .filter((q) => q.eq(q.field('contentId'), args.contentId))
      .first()

    if (!content) {
      return null
    }

    // Get creator info
    const creatorDoc = await ctx.db.get(content.creatorId)
    // Since creatorId is Id<'users'>, this should be a user document
    if (!creatorDoc || !('displayName' in creatorDoc)) {
      return null
    }
    const creator = creatorDoc as Doc<'users'>

    // Get current user for like status and tier check
    let currentUser: Doc<'users'> | null = null
    try {
      currentUser = await getCurrentUser(ctx)
    } catch {
      // User not authenticated, continue without like status
    }

    // Check if current user liked this content
    let isLiked = false
    if (currentUser) {
      const like = await ctx.db
        .query('galleryLikes')
        .withIndex('by_user_type', (q) => 
          q.eq('userId', currentUser._id).eq('type', 'gallery')
        )
        .collect()
      
      isLiked = like.some(l => l.contentId === content.contentId)
    }

    // Check if content is locked by tier
    let isLocked = false
    if (content.requiredFanTier) {
      if (currentUser) {
        const userTierLevel = getTierLevel(currentUser.fanTier)
        const requiredTierLevel = getTierLevel(content.requiredFanTier)
        isLocked = userTierLevel < requiredTierLevel
      } else {
        // Not logged in, treat as locked if tier requirement exists
        isLocked = true
      }
    }

    // Get related content (same type, exclude current, top 6)
    const relatedContentList = await ctx.db
      .query('galleryContent')
      .withIndex('by_type', (q) => q.eq('type', content.type))
      .filter((q) => q.neq(q.field('_id'), content._id))
      .order('desc')
      .take(6)

    // Enrich related content
    const relatedContent: GalleryContentWithCreator[] = []
    for (const related of relatedContentList) {
      const relatedCreatorDoc = await ctx.db.get(related.creatorId)
      
      // Since creatorId is Id<'users'>, this should be a user document
      if (!relatedCreatorDoc || !('displayName' in relatedCreatorDoc)) {
        continue
      }
      
      const relatedCreator = relatedCreatorDoc as Doc<'users'>

      // Check like status for related content
      let relatedIsLiked = false
      if (currentUser) {
        const like = await ctx.db
          .query('galleryLikes')
          .withIndex('by_user_type', (q) => 
            q.eq('userId', currentUser._id).eq('type', 'gallery')
          )
          .collect()
        
        relatedIsLiked = like.some(l => l.contentId === related.contentId)
      }

      // Check if related content is locked
      let relatedIsLocked = false
      if (related.requiredFanTier) {
        if (currentUser) {
          const userTierLevel = getTierLevel(currentUser.fanTier)
          const requiredTierLevel = getTierLevel(related.requiredFanTier)
          relatedIsLocked = userTierLevel < requiredTierLevel
        } else {
          relatedIsLocked = true
        }
      }

      relatedContent.push({
        ...related,
        creator: {
          _id: relatedCreator._id,
          displayName: relatedCreator.displayName,
          avatar: relatedCreator.avatar,
          username: relatedCreator.username,
          fanTier: relatedCreator.fanTier,
        },
        isLiked: relatedIsLiked,
        isLocked: relatedIsLocked,
      })
    }

    return {
      ...content,
      creator: {
        _id: creator._id,
        displayName: creator.displayName,
        avatar: creator.avatar,
        username: creator.username,
        tier: creator.fanTier,
        role: creator.role,
      },
      isLiked,
      isLocked,
      relatedContent,
    }
  },
})

/**
 * Get all gallery content by a specific creator
 */
export const getGalleryContentByCreator = query({
  args: {
    creatorId: v.id('users'),
    page: v.number(),
    pageSize: v.number(),
  },
  handler: async (ctx, args): Promise<PaginatedResult<GalleryContentWithCreator>> => {
    // Cap pageSize at 50 for performance
    const pageSize = Math.min(args.pageSize, 50)
    const skip = args.page * pageSize

    // Build query
    const allContent = await ctx.db
      .query('galleryContent')
      .withIndex('by_creator', (q) =>
        q.eq('creatorId', args.creatorId)
      )
      .order('desc')
      .collect()

    // Get total count
    const totalCount = allContent.length

    // Get paginated items with +1 to check hasMore
    const items = allContent.slice(skip, skip + pageSize + 1)

    const hasMore = items.length > pageSize
    if (hasMore) {
      items.pop() // Remove extra item
    }

    // Get current user for like status and tier check
    let currentUser: Doc<'users'> | null = null
    try {
      currentUser = await getCurrentUser(ctx)
    } catch {
      // User not authenticated, continue without like status
    }

    // Enrich items with creator info, like status, and locked status
    const enrichedItems: GalleryContentWithCreator[] = []
    for (const content of items) {
      const creatorDoc = await ctx.db.get(content.creatorId)
      
      // Since creatorId is Id<'users'>, this should be a user document
      // Check if it exists and has user properties
      if (!creatorDoc || !('displayName' in creatorDoc)) {
        continue // Skip if creator not found or not a user
      }
      
      const creator = creatorDoc as Doc<'users'>

      // Check if current user liked this content
      let isLiked = false
      if (currentUser) {
        const like = await ctx.db
          .query('galleryLikes')
          .withIndex('by_user_type', (q) => 
            q.eq('userId', currentUser._id).eq('type', 'gallery')
          )
          .collect()
        
        isLiked = like.some(l => l.contentId === content.contentId)
      }

      // Check if content is locked by tier
      let isLocked = false
      if (content.requiredFanTier) {
        if (currentUser) {
          const userTierLevel = getTierLevel(currentUser.fanTier)
          const requiredTierLevel = getTierLevel(content.requiredFanTier)
          isLocked = userTierLevel < requiredTierLevel
        } else {
          // Not logged in, treat as locked if tier requirement exists
          isLocked = true
        }
      }

      enrichedItems.push({
        ...content,
        creator: {
          _id: creator._id,
          displayName: creator.displayName,
          avatar: creator.avatar,
          username: creator.username,
          fanTier: creator.fanTier,
        },
        isLiked,
        isLocked,
      })
    }

    return {
      items: enrichedItems,
      hasMore,
      totalCount,
      page: args.page,
    }
  },
})

/**
 * Search gallery content by title and description
 */
export const searchGallery = query({
  args: {
    query: v.string(),
    type: v.optional(v.string()),
    limit: v.number(),
  },
  handler: async (ctx, args): Promise<GalleryContentWithCreator[]> => {
    // Cap limit at 100 for performance
    const limit = Math.min(args.limit, 100)
    const searchTerm = args.query.toLowerCase()

    // Get all gallery content (filter by type if provided)
    let allContent: Doc<'galleryContent'>[]
    
    if (args.type) {
      allContent = await ctx.db
        .query('galleryContent')
        .withIndex('by_type', (q) =>
          q.eq('type', args.type as 'show' | 'bts' | 'edit' | 'wip' | 'exclusive')
        )
        .collect()
    } else {
      allContent = await ctx.db
        .query('galleryContent')
        .collect()
    }

    // Filter by search term (case-insensitive)
    // Prioritize title matches over description matches
    const titleMatches = allContent.filter(content => 
      content.title.toLowerCase().includes(searchTerm)
    )
    
    const descriptionMatches = allContent.filter(content => 
      !content.title.toLowerCase().includes(searchTerm) &&
      content.description.toLowerCase().includes(searchTerm)
    )

    const matchedContent = [...titleMatches, ...descriptionMatches]

    // Get current user for like status and tier check
    let currentUser: Doc<'users'> | null = null
    try {
      currentUser = await getCurrentUser(ctx)
    } catch {
      // User not authenticated, continue without like status
    }

    // Enrich matched items with creator info, like status, and locked status
    const enrichedItems: GalleryContentWithCreator[] = []
    for (const content of matchedContent.slice(0, limit)) {
      const creatorDoc = await ctx.db.get(content.creatorId)
      
      // Since creatorId is Id<'users'>, this should be a user document
      // Check if it exists and has user properties
      if (!creatorDoc || !('displayName' in creatorDoc)) {
        continue // Skip if creator not found or not a user
      }
      
      const creator = creatorDoc as Doc<'users'>

      // Check if current user liked this content
      let isLiked = false
      if (currentUser) {
        const like = await ctx.db
          .query('galleryLikes')
          .withIndex('by_user_type', (q) => 
            q.eq('userId', currentUser._id).eq('type', 'gallery')
          )
          .collect()
        
        isLiked = like.some(l => l.contentId === content.contentId)
      }

      // Check if content is locked by tier
      let isLocked = false
      if (content.requiredFanTier) {
        if (currentUser) {
          const userTierLevel = getTierLevel(currentUser.fanTier)
          const requiredTierLevel = getTierLevel(content.requiredFanTier)
          isLocked = userTierLevel < requiredTierLevel
        } else {
          // Not logged in, treat as locked if tier requirement exists
          isLocked = true
        }
      }

      enrichedItems.push({
        ...content,
        creator: {
          _id: creator._id,
          displayName: creator.displayName,
          avatar: creator.avatar,
          username: creator.username,
          fanTier: creator.fanTier,
        },
        isLiked,
        isLocked,
      })
    }

    return enrichedItems
  },
})

/**
 * Like or unlike gallery content (toggle)
 */
export const likeGalleryContent = mutation({
  args: {
    contentId: v.string(),
  },
  handler: async (ctx, args): Promise<LikeResult> => {
    // Get current user (require auth)
    const user = await getCurrentUser(ctx)

    // Find the content
    const content = await ctx.db
      .query('galleryContent')
      .filter((q) => q.eq(q.field('contentId'), args.contentId))
      .first()

    if (!content) {
      throw new ConvexError('Content not found')
    }

    // Check if like already exists
    const existingLike = await ctx.db
      .query('galleryLikes')
      .withIndex('by_user_type', (q) =>
        q.eq('userId', user._id).eq('type', 'gallery')
      )
      .collect()

    const like = existingLike.find(l => l.contentId === args.contentId)

    const timestamp = Date.now()

    if (like) {
      // Unlike: delete the like and decrement count
      await ctx.db.delete(like._id)

      // Decrement like count (min 0)
      const newCount = Math.max(0, content.likeCount - 1)
      await ctx.db.patch(content._id, { likeCount: newCount })

      // Refresh trending score for this content
      const existingScore = await ctx.db
        .query('trendingScores')
        .withIndex('by_contentId', (q) =>
          q.eq('contentId', args.contentId).eq('contentType', 'gallery')
        )
        .first()

      if (existingScore) {
        const now = Date.now()
        const ageInDays = (now - content.createdAt) / (1000 * 60 * 60 * 24)
        const recencyFactor = 1 / (1 + ageInDays / 7)
        const engagementScore = newCount * 2 + content.viewCount * 0.5
        const trendingScore = engagementScore * recencyFactor

        await ctx.db.patch(existingScore._id, {
          trendingScore,
          engagementScore,
          likeCount: newCount,
          computedAt: now,
        })
      }

      return {
        contentId: args.contentId,
        liked: false,
        newCount,
        timestamp,
      }
    } else {
      // Like: create new like and increment count
      await ctx.db.insert('galleryLikes', {
        userId: user._id,
        contentId: args.contentId,
        type: 'gallery',
        createdAt: timestamp,
      })

      // Increment like count
      const newCount = content.likeCount + 1
      await ctx.db.patch(content._id, { likeCount: newCount })

      // Refresh trending score for this content
      const existingScore = await ctx.db
        .query('trendingScores')
        .withIndex('by_contentId', (q) =>
          q.eq('contentId', args.contentId).eq('contentType', 'gallery')
        )
        .first()

      if (existingScore) {
        const now = Date.now()
        const ageInDays = (now - content.createdAt) / (1000 * 60 * 60 * 24)
        const recencyFactor = 1 / (1 + ageInDays / 7)
        const engagementScore = newCount * 2 + content.viewCount * 0.5
        const trendingScore = engagementScore * recencyFactor

        await ctx.db.patch(existingScore._id, {
          trendingScore,
          engagementScore,
          likeCount: newCount,
          computedAt: now,
        })
      }

      return {
        contentId: args.contentId,
        liked: true,
        newCount,
        timestamp,
      }
    }
  },
})

/**
 * Explicitly unlike gallery content
 */
export const unlikeGalleryContent = mutation({
  args: {
    contentId: v.string(),
  },
  handler: async (ctx, args): Promise<LikeResult> => {
    // Get current user (require auth)
    const user = await getCurrentUser(ctx)

    // Find the content
    const content = await ctx.db
      .query('galleryContent')
      .filter((q) => q.eq(q.field('contentId'), args.contentId))
      .first()

    if (!content) {
      // Content not found, return current state
      return {
        contentId: args.contentId,
        liked: false,
        newCount: 0,
        timestamp: Date.now(),
      }
    }

    // Find existing like
    const existingLike = await ctx.db
      .query('galleryLikes')
      .withIndex('by_user_type', (q) => 
        q.eq('userId', user._id).eq('type', 'gallery')
      )
      .collect()

    const like = existingLike.find(l => l.contentId === args.contentId)

    const timestamp = Date.now()

    if (like) {
      // Delete the like and decrement count
      await ctx.db.delete(like._id)
      
      // Decrement like count (min 0)
      const newCount = Math.max(0, content.likeCount - 1)
      await ctx.db.patch(content._id, { likeCount: newCount })

      return {
        contentId: args.contentId,
        liked: false,
        newCount,
        timestamp,
      }
    }

    // Like doesn't exist, return current state (no-op)
    return {
      contentId: args.contentId,
      liked: false,
      newCount: content.likeCount,
      timestamp,
    }
  },
})

/**
 * Increment gallery content view count (public)
 */
export const incrementGalleryViewCount = mutation({
  args: {
    contentId: v.string(),
  },
  handler: async (ctx, args): Promise<ViewCountResult> => {
    // Find gallery content by contentId
    const content = await ctx.db
      .query('galleryContent')
      .filter((q) => q.eq(q.field('contentId'), args.contentId))
      .first()

    if (!content) {
      throw new ConvexError('Gallery content not found')
    }

    // Increment view count
    const newViewCount = content.viewCount + 1
    await ctx.db.patch(content._id, { viewCount: newViewCount })

    // Refresh trending score for this content
    const existingScore = await ctx.db
      .query('trendingScores')
      .withIndex('by_contentId', (q) =>
        q.eq('contentId', args.contentId).eq('contentType', 'gallery')
      )
      .first()

    if (existingScore) {
      const now = Date.now()
      const ageInDays = (now - content.createdAt) / (1000 * 60 * 60 * 24)
      const recencyFactor = 1 / (1 + ageInDays / 7)
      const engagementScore = content.likeCount * 2 + newViewCount * 0.5
      const trendingScore = engagementScore * recencyFactor

      await ctx.db.patch(existingScore._id, {
        trendingScore,
        engagementScore,
        viewCount: newViewCount,
        computedAt: now,
      })
    }

    return {
      contentId: args.contentId,
      newViewCount,
    }
  },
})

/**
 * Get all content IDs liked by current user
 */
export const getLikedContentIds = query({
  args: {},
  handler: async (ctx): Promise<string[]> => {
    // Get current user (require auth)
    const user = await getCurrentUser(ctx)

    // Query all likes for this user of type 'gallery'
    const likes = await ctx.db
      .query('galleryLikes')
      .withIndex('by_user_type', (q) =>
        q.eq('userId', user._id).eq('type', 'gallery')
      )
      .collect()

    // Return array of contentIds
    return likes.map(like => like.contentId)
  },
})

/**
 * Get filtered gallery content with multi-filter support
 */
export const getFilteredGallery = query({
  args: {
    types: v.optional(v.array(v.string())),
    dateRange: v.optional(v.string()),
    creatorId: v.optional(v.id('users')),
    fanTier: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    sortBy: v.optional(v.string()),
    page: v.number(),
    pageSize: v.number(),
  },
  handler: async (ctx, args): Promise<PaginatedResult<GalleryContentWithCreator>> => {
    try {
      // Get all content first
      let allContent = await ctx.db.query('galleryContent').collect()

      // Filter by type
      if (args.types && args.types.length > 0) {
        allContent = allContent.filter(item =>
          args.types!.includes(item.type)
        )
      }

      // Filter by creator
      if (args.creatorId) {
        allContent = allContent.filter(item =>
          item.creatorId === args.creatorId
        )
      }

      // Filter by fan tier
      if (args.fanTier && args.fanTier !== 'all') {
        const requiredTierLevel = getTierLevel(args.fanTier as FanTier)
        allContent = allContent.filter(item => {
          if (!item.requiredFanTier) return true // Public content is always included
          return getTierLevel(item.requiredFanTier) <= requiredTierLevel
        })
      }

      // Filter by date range
      if (args.dateRange && args.dateRange !== 'all') {
        const now = Date.now()
        const daysMap: Record<string, number> = {
          '7d': 7,
          '30d': 30,
          '90d': 90,
        }
        const days = daysMap[args.dateRange] || 0
        const cutoff = now - days * 24 * 60 * 60 * 1000

        allContent = allContent.filter(item =>
          item.createdAt >= cutoff
        )
      }

      // Filter by tags (all tags must match)
      if (args.tags && args.tags.length > 0) {
        allContent = allContent.filter(item =>
          args.tags!.every(tag => item.tags.includes(tag))
        )
      }

      // Get current user for like status and tier check
      let currentUser: Doc<'users'> | null = null
      try {
        currentUser = await getCurrentUser(ctx)
      } catch {
        // User not authenticated, continue without like status
      }

      // Sort
      let sortedContent = allContent
      switch (args.sortBy) {
        case 'mostLiked':
          sortedContent = [...allContent].sort((a, b) => b.likeCount - a.likeCount)
          break
        case 'mostViewed':
          sortedContent = [...allContent].sort((a, b) => b.viewCount - a.viewCount)
          break
        case 'oldest':
          sortedContent = [...allContent].sort((a, b) => a.createdAt - b.createdAt)
          break
        case 'trending':
          // Trending: combine likes, views, and recency
          sortedContent = [...allContent].sort((a, b) => {
            const now = Date.now()
            const ageInDaysA = (now - a.createdAt) / (1000 * 60 * 60 * 24)
            const ageInDaysB = (now - b.createdAt) / (1000 * 60 * 60 * 24)
            const recencyFactorA = 1 / (1 + ageInDaysA / 7)
            const recencyFactorB = 1 / (1 + ageInDaysB / 7)
            const scoreA = (a.likeCount * 2 + a.viewCount * 0.5) * recencyFactorA
            const scoreB = (b.likeCount * 2 + b.viewCount * 0.5) * recencyFactorB
            return scoreB - scoreA
          })
          break
        case 'newest':
        default:
          sortedContent = [...allContent].sort((a, b) => b.createdAt - a.createdAt)
          break
      }

      // Get total count
      const total = sortedContent.length

      // Paginate
      const pageSize = Math.min(args.pageSize, 50)
      const skip = args.page * pageSize
      const items = sortedContent.slice(skip, skip + pageSize)

      // Enrich items with creator info, like status, and locked status
      const enrichedItems: GalleryContentWithCreator[] = []
      for (const content of items) {
        const creatorDoc = await ctx.db.get(content.creatorId)
        
        if (!creatorDoc || !('displayName' in creatorDoc)) {
          continue
        }
        
        const creator = creatorDoc as Doc<'users'>

        // Check if current user liked this content
        let isLiked = false
        if (currentUser) {
          const like = await ctx.db
            .query('galleryLikes')
            .withIndex('by_user_type', (q) => 
              q.eq('userId', currentUser._id).eq('type', 'gallery')
            )
            .collect()
          
          isLiked = like.some(l => l.contentId === content.contentId)
        }

        // Check if content is locked by tier
        let isLocked = false
        if (content.requiredFanTier) {
          if (currentUser) {
            const userTierLevel = getTierLevel(currentUser.fanTier)
            const requiredTierLevel = getTierLevel(content.requiredFanTier)
            isLocked = userTierLevel < requiredTierLevel
          } else {
            isLocked = true
          }
        }

        enrichedItems.push({
          ...content,
          creator: {
            _id: creator._id,
            displayName: creator.displayName,
            avatar: creator.avatar,
            username: creator.username,
            fanTier: creator.fanTier,
          },
          isLiked,
          isLocked,
        })
      }

      return {
        items: enrichedItems,
        hasMore: skip + pageSize < total,
        totalCount: total,
        page: args.page,
      }
    } catch (error) {
      console.error('Gallery filter error:', error)
      throw error
    }
  },
})

/**
 * Get available creators (non-fan users who have gallery content)
 */
export const getAvailableCreators = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db
      .query('users')
      .filter(q => q.neq(q.field('role'), 'fan'))
      .collect()

    return users.map(user => ({
      _id: user._id,
      displayName: user.displayName,
      username: user.username,
      avatar: user.avatar,
    }))
  },
})

/**
 * Get available tags with search support
 */
export const getAvailableTags = query({
  args: {
    search: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db.query('galleryContent').collect()
    const tagSet = new Set<string>()

    items.forEach(item => {
      item.tags.forEach(tag => {
        if (tag.toLowerCase().includes(args.search.toLowerCase())) {
          tagSet.add(tag)
        }
      })
    })

    return Array.from(tagSet).slice(0, args.limit)
  },
})
