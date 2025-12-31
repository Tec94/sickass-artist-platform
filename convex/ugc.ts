import { query, mutation } from "./_generated/server"
import { v, ConvexError } from "convex/values"
import type { Doc } from "./_generated/dataModel"
import { getCurrentUser, isModerator } from "./helpers"

type FanTier = 'bronze' | 'silver' | 'gold' | 'platinum'
type UGCCategory = 'user-edit' | 'fan-art' | 'repost'

type UGCItem = Doc<'ugcContent'> & {
  isLiked: boolean
}

type UGCDetail = Doc<'ugcContent'> & {
  creatorInfo: {
    displayName: string
    avatar: string
    tier: FanTier
    role: 'artist' | 'admin' | 'mod' | 'crew' | 'fan'
  }
  isLiked: boolean
  relatedContent: UGCItem[]
}

type PaginatedUGCResult = {
  items: UGCItem[]
  hasMore: boolean
  totalCount: number
  page: number
}

type LikeResult = {
  ugcId: string
  liked: boolean
  newCount: number
  timestamp: number
}

type UploadUGCResult = {
  ugcId: string
  status: 'pending'
  createdAt: number
  message: string
}

type ViewCountResult = {
  ugcId: string
  newViewCount: number
}

/**
 * Get paginated feed of approved UGC content
 */
export const getUGCFeed = query({
  args: {
    page: v.number(),
    pageSize: v.number(),
    sortBy: v.optional(
      v.union(
        v.literal('newest'),
        v.literal('trending'),
        v.literal('mostLiked'),
        v.literal('mostViewed')
      )
    ),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<PaginatedUGCResult> => {
    // Cap pageSize at 50 for performance
    const pageSize = Math.min(args.pageSize, 50)
    const skip = args.page * pageSize

    // Build query for approved UGC content
    let allUGC: Doc<'ugcContent'>[]
    
    if (args.category) {
      // Filter by both approved and category
      const categoryUGC = await ctx.db
        .query('ugcContent')
        .withIndex('by_category', (q) =>
          q.eq('category', args.category as UGCCategory)
        )
        .collect()
      
      allUGC = categoryUGC.filter(ugc => ugc.isApproved === true)
    } else {
      allUGC = await ctx.db
        .query('ugcContent')
        .withIndex('by_approved', (q) =>
          q.eq('isApproved', true)
        )
        .collect()
    }

    // Get total count
    const totalCount = allUGC.length

    // Apply sorting
    let sortedUGC = allUGC
    if (args.sortBy) {
      if (args.sortBy === 'newest') {
        sortedUGC = allUGC.sort((a, b) => b.createdAt - a.createdAt)
      } else if (args.sortBy === 'mostLiked') {
        sortedUGC = allUGC.sort((a, b) => b.likeCount - a.likeCount)
      } else if (args.sortBy === 'mostViewed') {
        sortedUGC = allUGC.sort((a, b) => b.viewCount - a.viewCount)
      } else if (args.sortBy === 'trending') {
        // Calculate trending score with recency factor
        const now = Date.now()
        sortedUGC = allUGC.map(item => {
          const daysOld = (now - item.createdAt) / (1000 * 60 * 60 * 24)
          const recencyFactor = 1 / (1 + daysOld / 7) // half-life: 7 days
          const trendingScore = (item.likeCount + (item.viewCount * 0.1)) * recencyFactor
          return { ...item, trendingScore }
        }).sort((a, b) => b.trendingScore - a.trendingScore)
      }
    } else {
      // Default sort by newest
      sortedUGC = allUGC.sort((a, b) => b.createdAt - a.createdAt)
    }

    // Paginate
    const items = sortedUGC.slice(skip, skip + pageSize)

    const hasMore = skip + pageSize < totalCount

    // Get current user for like status
    let currentUser: Doc<'users'> | null = null
    try {
      currentUser = await getCurrentUser(ctx)
    } catch {
      // User not authenticated, continue without like status
    }

    // Enrich items with like status
    const enrichedItems: UGCItem[] = []
    if (currentUser) {
      // Get all likes for current user
      const userLikes = await ctx.db
        .query('galleryLikes')
        .withIndex('by_user_type', (q) => 
          q.eq('userId', currentUser._id).eq('type', 'ugc')
        )
        .collect()

      const likedIds = new Set(userLikes.map(like => like.contentId))

      for (const item of items) {
        enrichedItems.push({
          ...item,
          isLiked: likedIds.has(item.ugcId),
        })
      }
    } else {
      // No user, all items are not liked
      for (const item of items) {
        enrichedItems.push({
          ...item,
          isLiked: false,
        })
      }
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
 * Get all UGC by a specific creator (public portfolio)
 */
export const getUGCByCreator = query({
  args: {
    creatorId: v.id('users'),
    page: v.number(),
    pageSize: v.number(),
  },
  handler: async (ctx, args): Promise<PaginatedUGCResult> => {
    // Cap pageSize at 50 for performance
    const pageSize = Math.min(args.pageSize, 50)
    const skip = args.page * pageSize

    // Build query for approved UGC by creator
    const allUGC = await ctx.db
      .query('ugcContent')
      .withIndex('by_creator', (q) => q.eq('creatorId', args.creatorId))
      .collect()
    
    // Filter approved and sort
    const approvedUGC = allUGC
      .filter(ugc => ugc.isApproved === true)
      .sort((a, b) => b.createdAt - a.createdAt)

    // Get total count
    const totalCount = approvedUGC.length

    // Get paginated items with +1 to check hasMore
    const items = approvedUGC.slice(skip, skip + pageSize + 1)

    const hasMore = items.length > pageSize
    if (hasMore) {
      items.pop() // Remove extra item
    }

    // Get current user for like status
    let currentUser: Doc<'users'> | null = null
    try {
      currentUser = await getCurrentUser(ctx)
    } catch {
      // User not authenticated, continue without like status
    }

    // Enrich items with like status
    const enrichedItems: UGCItem[] = []
    if (currentUser) {
      // Get all likes for current user
      const userLikes = await ctx.db
        .query('galleryLikes')
        .withIndex('by_user_type', (q) => 
          q.eq('userId', currentUser._id).eq('type', 'ugc')
        )
        .collect()

      const likedIds = new Set(userLikes.map(like => like.contentId))

      for (const item of items) {
        enrichedItems.push({
          ...item,
          isLiked: likedIds.has(item.ugcId),
        })
      }
    } else {
      // No user, all items are not liked
      for (const item of items) {
        enrichedItems.push({
          ...item,
          isLiked: false,
        })
      }
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
 * Get full UGC details for detail page/lightbox
 */
export const getUGCDetail = query({
  args: {
    ugcId: v.string(),
  },
  handler: async (ctx, args): Promise<UGCDetail | null> => {
    // Find UGC by ugcId
    const ugc = await ctx.db
      .query('ugcContent')
      .filter((q) => q.eq(q.field('ugcId'), args.ugcId))
      .first()

    if (!ugc) {
      return null
    }

    // Only return if approved
    if (!ugc.isApproved) {
      return null
    }

    // Get creator info (from users table for role)
    const creator = await ctx.db.get(ugc.creatorId)
    if (!creator) {
      return null
    }

    // Get current user for like status
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
        .withIndex('by_content_type', (q) => 
          q.eq('contentId', ugc.ugcId).eq('type', 'ugc')
        )
        .filter((q) => q.eq(q.field('userId'), currentUser._id))
        .first()
      
      isLiked = !!like
    }

    // Get related content (same category, exclude current, top 6)
    const relatedContentList = await ctx.db
      .query('ugcContent')
      .withIndex('by_category', (q) => q.eq('category', ugc.category))
      .filter((q) => 
        q.and(
          q.neq(q.field('ugcId'), ugc.ugcId),
          q.eq(q.field('isApproved'), true)
        )
      )
      .order('desc')
      .take(6)

    // Enrich related content
    const relatedContent: UGCItem[] = []
    if (currentUser) {
      // Get all likes for current user
      const userLikes = await ctx.db
        .query('galleryLikes')
        .withIndex('by_user_type', (q) => 
          q.eq('userId', currentUser._id).eq('type', 'ugc')
        )
        .collect()

      const likedIds = new Set(userLikes.map(like => like.contentId))

      for (const related of relatedContentList) {
        relatedContent.push({
          ...related,
          isLiked: likedIds.has(related.ugcId),
        })
      }
    } else {
      // No user, all items are not liked
      for (const related of relatedContentList) {
        relatedContent.push({
          ...related,
          isLiked: false,
        })
      }
    }

    return {
      ...ugc,
      creatorInfo: {
        displayName: creator.displayName,
        avatar: creator.avatar,
        tier: creator.fanTier,
        role: creator.role,
      },
      isLiked,
      relatedContent,
    }
  },
})

/**
 * Get count of pending UGC approvals (admin only)
 */
export const getUGCPendingCount = query({
  args: {},
  handler: async (ctx): Promise<number> => {
    // Get current user and check if mod/admin
    const user = await getCurrentUser(ctx)
    
    if (!isModerator(user)) {
      throw new ConvexError("Permission denied")
    }

    // Count pending UGC
    const pendingUGC = await ctx.db
      .query('ugcContent')
      .withIndex('by_approved', (q) => q.eq('isApproved', false))
      .collect()

    return pendingUGC.length
  },
})

/**
 * Search UGC by title and description
 */
export const searchUGC = query({
  args: {
    query: v.string(),
    category: v.optional(v.string()),
    limit: v.number(),
  },
  handler: async (ctx, args): Promise<UGCItem[]> => {
    // Cap limit at 100 for performance
    const limit = Math.min(args.limit, 100)
    const searchTerm = args.query.toLowerCase()

    // Get all approved UGC content (filter by category if provided)
    let allUGC: Doc<'ugcContent'>[]
    
    if (args.category) {
      // Filter by both approved and category
      const categoryUGC = await ctx.db
        .query('ugcContent')
        .withIndex('by_category', (q) =>
          q.eq('category', args.category as UGCCategory)
        )
        .collect()
      
      allUGC = categoryUGC.filter(ugc => ugc.isApproved === true)
    } else {
      allUGC = await ctx.db
        .query('ugcContent')
        .withIndex('by_approved', (q) => q.eq('isApproved', true))
        .collect()
    }

    // Filter by search term (case-insensitive)
    // Prioritize title matches over description matches
    const titleMatches = allUGC.filter(ugc => 
      ugc.title.toLowerCase().includes(searchTerm)
    )
    
    const descriptionMatches = allUGC.filter(ugc => 
      !ugc.title.toLowerCase().includes(searchTerm) &&
      ugc.description.toLowerCase().includes(searchTerm)
    )

    const matchedUGC = [...titleMatches, ...descriptionMatches]

    // Get current user for like status
    let currentUser: Doc<'users'> | null = null
    try {
      currentUser = await getCurrentUser(ctx)
    } catch {
      // User not authenticated, continue without like status
    }

    // Enrich matched items with like status
    const enrichedItems: UGCItem[] = []
    if (currentUser) {
      // Get all likes for current user
      const userLikes = await ctx.db
        .query('galleryLikes')
        .withIndex('by_user_type', (q) => 
          q.eq('userId', currentUser._id).eq('type', 'ugc')
        )
        .collect()

      const likedIds = new Set(userLikes.map(like => like.contentId))

      for (const ugc of matchedUGC.slice(0, limit)) {
        enrichedItems.push({
          ...ugc,
          isLiked: likedIds.has(ugc.ugcId),
        })
      }
    } else {
      // No user, all items are not liked
      for (const ugc of matchedUGC.slice(0, limit)) {
        enrichedItems.push({
          ...ugc,
          isLiked: false,
        })
      }
    }

    return enrichedItems
  },
})

/**
 * Upload UGC content
 */
export const uploadUGC = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    imageUrls: v.array(v.string()),
  },
  handler: async (ctx, args): Promise<UploadUGCResult> => {
    // Get current user (require auth)
    const user = await getCurrentUser(ctx)

    // Validate inputs
    if (args.title.length < 1 || args.title.length > 200) {
      throw new ConvexError("Title must be between 1 and 200 characters")
    }

    if (args.description.length > 1000) {
      throw new ConvexError("Description must be less than 1000 characters")
    }

    const validCategories: UGCCategory[] = ['user-edit', 'fan-art', 'repost']
    if (!validCategories.includes(args.category as UGCCategory)) {
      throw new ConvexError("Invalid category")
    }

    if (args.imageUrls.length < 1) {
      throw new ConvexError("At least 1 image required")
    }

    if (args.imageUrls.length > 10) {
      throw new ConvexError("Maximum 10 images allowed")
    }

    if (args.tags.length > 10) {
      throw new ConvexError("Maximum 10 tags allowed")
    }

    for (const tag of args.tags) {
      if (tag.length > 50) {
        throw new ConvexError("Tags must be less than 50 characters")
      }
    }

    // Generate unique ugcId
    const ugcId = `ugc_${user._id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create UGC content record
    const ugcRecord = {
      ugcId,
      creatorId: user._id,
      creatorDisplayName: user.displayName,
      creatorAvatar: user.avatar,
      creatorTier: user.fanTier,
      title: args.title,
      description: args.description,
      imageUrls: args.imageUrls,
      uploadedFile: undefined, // Could be used for file storage if needed
      category: args.category as UGCCategory,
      tags: args.tags,
      likeCount: 0,
      viewCount: 0,
      downloadCount: 0,
      isApproved: false, // Requires moderator approval
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    await ctx.db.insert('ugcContent', ugcRecord)

    return {
      ugcId,
      status: 'pending',
      createdAt: ugcRecord.createdAt,
      message: 'Content submitted! Awaiting moderator approval.',
    }
  },
})

/**
 * Like UGC content (toggle)
 */
export const likeUGC = mutation({
  args: {
    ugcId: v.string(),
  },
  handler: async (ctx, args): Promise<LikeResult> => {
    // Get current user (require auth)
    const user = await getCurrentUser(ctx)

    // Check if like already exists
    const existingLike = await ctx.db
      .query('galleryLikes')
      .withIndex('by_content_type', (q) => 
        q.eq('contentId', args.ugcId).eq('type', 'ugc')
      )
      .filter((q) => q.eq(q.field('userId'), user._id))
      .first()

    let liked: boolean
    let newCount: number

    if (existingLike) {
      // Unlike: remove the like and decrement count
      await ctx.db.delete(existingLike._id)
      
      const ugc = await ctx.db
        .query('ugcContent')
        .filter((q) => q.eq(q.field('ugcId'), args.ugcId))
        .first()
      
      if (ugc) {
        newCount = Math.max(0, ugc.likeCount - 1)
        await ctx.db.patch(ugc._id, { likeCount: newCount })
      } else {
        newCount = 0
      }
      
      liked = false
    } else {
      // Like: create the like and increment count
      await ctx.db.insert('galleryLikes', {
        userId: user._id,
        contentId: args.ugcId,
        type: 'ugc',
        createdAt: Date.now(),
      })

      const ugc = await ctx.db
        .query('ugcContent')
        .filter((q) => q.eq(q.field('ugcId'), args.ugcId))
        .first()
      
      if (ugc) {
        newCount = ugc.likeCount + 1
        await ctx.db.patch(ugc._id, { likeCount: newCount })
      } else {
        newCount = 1
      }
      
      liked = true
    }

    return {
      ugcId: args.ugcId,
      liked,
      newCount,
      timestamp: Date.now(),
    }
  },
})

/**
 * Explicitly unlike UGC
 */
export const unlikeUGC = mutation({
  args: {
    ugcId: v.string(),
  },
  handler: async (ctx, args): Promise<LikeResult> => {
    // Get current user (require auth)
    const user = await getCurrentUser(ctx)

    // Check if like exists
    const existingLike = await ctx.db
      .query('galleryLikes')
      .withIndex('by_content_type', (q) => 
        q.eq('contentId', args.ugcId).eq('type', 'ugc')
      )
      .filter((q) => q.eq(q.field('userId'), user._id))
      .first()

    let newCount: number

    if (existingLike) {
      // Remove the like and decrement count
      await ctx.db.delete(existingLike._id)
      
      const ugc = await ctx.db
        .query('ugcContent')
        .filter((q) => q.eq(q.field('ugcId'), args.ugcId))
        .first()
      
      if (ugc) {
        newCount = Math.max(0, ugc.likeCount - 1)
        await ctx.db.patch(ugc._id, { likeCount: newCount })
      } else {
        newCount = 0
      }
    } else {
      // No like to remove, count stays the same
      const ugc = await ctx.db
        .query('ugcContent')
        .filter((q) => q.eq(q.field('ugcId'), args.ugcId))
        .first()
      
      newCount = ugc ? ugc.likeCount : 0
    }

    return {
      ugcId: args.ugcId,
      liked: false,
      newCount,
      timestamp: Date.now(),
    }
  },
})

/**
 * Increment UGC view count (public)
 */
export const incrementUGCViewCount = mutation({
  args: {
    ugcId: v.string(),
  },
  handler: async (ctx, args): Promise<ViewCountResult> => {
    // Find UGC by ugcId
    const ugc = await ctx.db
      .query('ugcContent')
      .filter((q) => q.eq(q.field('ugcId'), args.ugcId))
      .first()

    if (!ugc) {
      throw new ConvexError("UGC not found")
    }

    // Increment view count
    const newViewCount = ugc.viewCount + 1
    await ctx.db.patch(ugc._id, { viewCount: newViewCount })

    return {
      ugcId: args.ugcId,
      newViewCount,
    }
  },
})

/**
 * Get all UGC IDs liked by current user
 */
export const getLikedUGCIds = query({
  args: {},
  handler: async (ctx): Promise<string[]> => {
    // Get current user (require auth)
    const user = await getCurrentUser(ctx)

    // Get all likes for current user of type 'ugc'
    const userLikes = await ctx.db
      .query('galleryLikes')
      .withIndex('by_user_type', (q) => 
        q.eq('userId', user._id).eq('type', 'ugc')
      )
      .collect()

    return userLikes.map(like => like.contentId)
  },
})