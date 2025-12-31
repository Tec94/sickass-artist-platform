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

/**
 * Get paginated gallery content with optional type filter
 */
export const getGalleryContent = query({
  args: {
    type: v.optional(v.string()),
    page: v.number(),
    pageSize: v.number(),
  },
  handler: async (ctx, args): Promise<PaginatedResult<GalleryContentWithCreator>> => {
    // Cap pageSize at 50 for performance
    const pageSize = Math.min(args.pageSize, 50)
    const skip = args.page * pageSize

    // Build query
    let contentQuery = ctx.db.query('galleryContent')

    if (args.type) {
      contentQuery = contentQuery.withIndex('by_type', (q) =>
        q.eq('type', args.type as 'show' | 'bts' | 'edit' | 'wip' | 'exclusive')
      )
    }

    // Get total count (can be expensive, consider caching)
    let totalCount = 0
    if (args.type) {
      const allContent = await contentQuery.collect()
      totalCount = allContent.length
    } else {
      const allContent = await ctx.db.query('galleryContent').collect()
      totalCount = allContent.length
    }

    // Get paginated items with +1 to check hasMore
    const items = await contentQuery
      .order('desc')
      .skip(skip)
      .take(pageSize + 1)

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
      const creator = await ctx.db.get(content.creatorId)
      
      if (!creator) {
        continue // Skip if creator not found
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

      enrichedItems.push({
        ...content,
        creator: {
          _id: creator._id,
          displayName: creator.displayName,
          avatar: creator.avatar,
          username: creator.username,
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
    const creator = await ctx.db.get(content.creatorId)
    if (!creator) {
      return null
    }

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
      const relatedCreator = await ctx.db.get(related.creatorId)
      
      if (!relatedCreator) {
        continue
      }

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
    const contentQuery = ctx.db.query('galleryContent').withIndex('by_creator', (q) =>
      q.eq('creatorId', args.creatorId)
    )

    // Get total count
    const allContent = await contentQuery.collect()
    const totalCount = allContent.length

    // Get paginated items with +1 to check hasMore
    const items = await contentQuery
      .order('desc')
      .skip(skip)
      .take(pageSize + 1)

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
      const creator = await ctx.db.get(content.creatorId)
      
      if (!creator) {
        continue // Skip if creator not found
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

      enrichedItems.push({
        ...content,
        creator: {
          _id: creator._id,
          displayName: creator.displayName,
          avatar: creator.avatar,
          username: creator.username,
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
    let contentQuery = ctx.db.query('galleryContent')

    if (args.type) {
      contentQuery = contentQuery.withIndex('by_type', (q) =>
        q.eq('type', args.type as 'show' | 'bts' | 'edit' | 'wip' | 'exclusive')
      )
    }

    const allContent = await contentQuery.collect()

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
      const creator = await ctx.db.get(content.creatorId)
      
      if (!creator) {
        continue // Skip if creator not found
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

      enrichedItems.push({
        ...content,
        creator: {
          _id: creator._id,
          displayName: creator.displayName,
          avatar: creator.avatar,
          username: creator.username,
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
