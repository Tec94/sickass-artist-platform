import { mutation, query, internalMutation } from './_generated/server'
import { v, ConvexError } from 'convex/values'
import { internal } from './_generated/api'

// ============ INTERNAL MUTATION FOR UPSERTING POSTS =====

export const upsertInstagramPostsInternal = internalMutation({
  args: {
    igAccountId: v.string(),
    posts: v.array(
      v.object({
        id: v.string(),
        media_type: v.optional(v.string()),
        media_url: v.optional(v.string()),
        thumbnail_url: v.optional(v.string()),
        caption: v.optional(v.string()),
        timestamp: v.string(),
        like_count: v.optional(v.number()),
        comments_count: v.optional(v.number()),
        views: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    let newPosts = 0
    let updated = 0

    for (const post of args.posts) {
      const existing = await ctx.db
        .query('instagramPosts')
        .withIndex('by_igPostId', (q) => q.eq('igPostId', post.id))
        .first()

      const postData = {
        igPostId: post.id,
        igAccountId: args.igAccountId,
        mediaUrl: post.media_url || '',
        thumbnailUrl: post.thumbnail_url || post.media_url || '',
        caption: post.caption || '',
        mediaType: (post.media_type || 'IMAGE').toLowerCase(),
        likeCount: post.like_count || 0,
        commentCount: post.comments_count || 0,
        viewCount: post.views || undefined,
        igLink: `https://instagram.com/p/${post.id}`,
        syncedAt: now,
        igSourceCreatedAt: new Date(post.timestamp).getTime(),
        cacheExpiresAt: now + 24 * 60 * 60 * 1000,
        isFeatured: existing?.isFeatured || false,
        displayOrder: existing?.displayOrder,
        isActive: true,
        createdAt: existing?.createdAt || now,
      }

      if (existing) {
        await ctx.db.patch(existing._id, {
          ...postData,
          updatedAt: now,
        })
        updated++
      } else {
        await ctx.db.insert('instagramPosts', postData)
        newPosts++
      }
    }

    return { success: true, newPosts, updated, total: args.posts.length }
  },
})

// ============ MUTATIONS =====

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

    await ctx.scheduler.runAfter(0, internal.instagramSync.syncInstagramPostsInternal)

    return { success: true, scheduled: true }
  },
})

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

export const getFeaturedInstagramPosts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 12, 100)

    return await ctx.db
      .query('instagramPosts')
      .withIndex('by_featured', (q) => q.eq('isFeatured', true))
      .filter((q) => q.eq(q.field('isActive'), true))
      .order('asc')
      .take(limit)
  },
})

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
      status: recent.cacheExpiresAt > Date.now() ? ('fresh' as const) : ('stale' as const),
    }
  },
})
