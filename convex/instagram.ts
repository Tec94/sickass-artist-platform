import { mutation, query, internalMutation } from './_generated/server'
import { v, ConvexError } from 'convex/values'
import { internal } from './_generated/api'

// ============ INTERNAL MUTATION FOR SYNCING =====

/**
 * Internal mutation called by cron job
 * Fetches latest posts from Instagram Business Account
 */
export const syncInstagramPostsInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    try {
      const igAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
      const igAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN

      if (!igAccountId || !igAccessToken) {
        console.error('Missing Instagram credentials')
        return { error: 'Missing Instagram credentials', newPosts: 0, updated: 0 }
      }

      // Fetch latest 50 posts
      const response = await fetch(
        `https://graph.instagram.com/${igAccountId}/media?fields=id,media_type,media_url,thumbnail_url,caption,timestamp,like_count,comments_count&access_token=${igAccessToken}`
      )

      if (!response.ok) {
        console.error(`Instagram API error: ${response.statusText}`)
        return { error: `Instagram API: ${response.statusText}`, newPosts: 0, updated: 0 }
      }

      const data = await response.json() as { data?: Array<{
        id: string
        media_type?: string
        media_url?: string
        thumbnail_url?: string
        caption?: string
        timestamp: string
        like_count?: number
        comments_count?: number
        views?: number
      }> }

      // Process and store posts
      let newPosts = 0
      let updated = 0

      for (const post of data.data || []) {
        const postDoc = await ctx.db
          .query('instagramPosts')
          .withIndex('by_igPostId', (q) => q.eq('igPostId', post.id))
          .first()

        const postData = {
          igPostId: post.id,
          igAccountId,
          mediaUrl: post.media_url || '',
          thumbnailUrl: post.thumbnail_url || post.media_url || '',
          caption: post.caption || '',
          mediaType: (post.media_type || 'IMAGE').toLowerCase(),
          likeCount: post.like_count || 0,
          commentCount: post.comments_count || 0,
          viewCount: post.views || undefined,
          igLink: `https://instagram.com/p/${post.id}`,
          syncedAt: Date.now(),
          igSourceCreatedAt: new Date(post.timestamp).getTime(),
          cacheExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h cache
          isFeatured: postDoc?.isFeatured || false,
          displayOrder: postDoc?.displayOrder,
          isActive: true,
          createdAt: postDoc?.createdAt || Date.now(),
        }

        if (postDoc) {
          await ctx.db.patch(postDoc._id, {
            ...postData,
            updatedAt: Date.now(),
          })
          updated++
        } else {
          await ctx.db.insert('instagramPosts', postData)
          newPosts++
        }
      }

      return { success: true, newPosts, updated, total: data.data?.length || 0 }
    } catch (error) {
      console.error('Instagram sync error:', error)
      return { error: error instanceof Error ? error.message : 'Unknown error', newPosts: 0, updated: 0 }
    }
  },
})

// ============ MUTATIONS =====

/**
 * Admin: Manually trigger Instagram sync
 */
export const adminTriggerSync = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .first()

    if (!user || user.role !== 'admin') {
      throw new ConvexError('Only admins can trigger sync')
    }

    // Schedule internal mutation to run immediately
    await ctx.scheduler.runAfter(0, internal.instagram.syncInstagramPostsInternal)
    
    return { success: true, scheduled: true }
  },
})

/**
 * Admin: Feature/unfeature a post
 */
export const adminToggleFeature = mutation({
  args: {
    postId: v.id('instagramPosts'),
    isFeatured: v.boolean(),
    displayOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .first()

    if (!user || user.role !== 'admin') {
      throw new ConvexError('Only admins can feature posts')
    }

    const post = await ctx.db.get(args.postId)
    if (!post) {
      throw new ConvexError('Post not found')
    }

    await ctx.db.patch(args.postId, {
      isFeatured: args.isFeatured,
      displayOrder: args.displayOrder,
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

// ============ QUERIES =====

/**
 * Get featured Instagram posts (for gallery display)
 */
export const getFeaturedInstagramPosts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 12, 100)

    return await ctx.db
      .query('instagramPosts')
      .withIndex('by_featured', (q) => q.eq('isFeatured', true))
      .filter((q) => q.eq(q.field('isActive'), true))
      .order('desc')
      .take(limit)
  },
})

/**
 * Get all Instagram posts (for admin view)
 */
export const getAllInstagramPosts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 50, 500)

    return await ctx.db
      .query('instagramPosts')
      .withIndex('by_igSourceCreatedAt')
      .filter((q) => q.eq(q.field('isActive'), true))
      .order('desc')
      .take(limit)
  },
})

/**
 * Get recent Instagram posts with sync status
 */
export const getInstagramStatus = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query('instagramPosts').collect()

    if (posts.length === 0) {
      return {
        totalPosts: 0,
        lastSyncedAt: null,
        nextSyncAt: null,
        status: 'never' as const,
      }
    }

    const recent = posts.sort((a, b) => b.syncedAt - a.syncedAt)[0]

    return {
      totalPosts: posts.length,
      lastSyncedAt: recent.syncedAt,
      nextSyncAt: recent.cacheExpiresAt,
      status: recent.cacheExpiresAt > Date.now() ? 'fresh' as const : 'stale' as const,
    }
  },
})
