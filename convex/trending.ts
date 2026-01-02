import { mutation, query } from './_generated/server'
import { v, ConvexError } from 'convex/values'

/**
 * Calculate trending score for a piece of content
 * Formula: (likes × 2 + views × 0.5 + comments × 1.5) × recencyFactor
 * Recency factor: 1 / (1 + daysOld / 7) → 7-day half-life
 */
function calculateTrendingScore(
  likeCount: number,
  viewCount: number,
  commentCount: number,
  createdAt: number,
  now: number
): {
  trendingScore: number
  recencyFactor: number
  engagementScore: number
} {
  const ageInDays = (now - createdAt) / (1000 * 60 * 60 * 24)
  const recencyFactor = 1 / (1 + ageInDays / 7)

  const engagementScore = likeCount * 2 + viewCount * 0.5 + commentCount * 1.5
  const trendingScore = engagementScore * recencyFactor

  return { trendingScore, recencyFactor, engagementScore }
}

/**
 * Refresh trending scores for all content
 * This should be called on a schedule (e.g., every hour)
 * It recalculates scores for all gallery and approved UGC content
 */
export const refreshTrendingScores = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    let galleryUpdated = 0
    let ugcUpdated = 0
    const errors: string[] = []

    try {
      // Get all gallery content
      const allGallery = await ctx.db.query('galleryContent').collect()

      // Update trending scores for gallery content
      for (const gallery of allGallery) {
        try {
          const { trendingScore, recencyFactor, engagementScore } =
            calculateTrendingScore(
              gallery.likeCount,
              gallery.viewCount,
              0, // TODO: Add comment aggregation when comments table exists
              gallery.createdAt,
              now
            )

          // Check if score already exists
          const existingScore = await ctx.db
            .query('trendingScores')
            .withIndex('by_contentId', (q) =>
              q.eq('contentId', gallery.contentId).eq('contentType', 'gallery')
            )
            .first()

          if (existingScore) {
            // Update existing score
            await ctx.db.patch(existingScore._id, {
              trendingScore,
              recencyFactor,
              engagementScore,
              likeCount: gallery.likeCount,
              viewCount: gallery.viewCount,
              commentCount: 0,
              computedAt: now,
            })
          } else {
            // Insert new score
            await ctx.db.insert('trendingScores', {
              contentId: gallery.contentId,
              contentType: 'gallery',
              trendingScore,
              recencyFactor,
              engagementScore,
              likeCount: gallery.likeCount,
              viewCount: gallery.viewCount,
              commentCount: 0,
              createdAt: gallery.createdAt,
              computedAt: now,
            })
          }

          galleryUpdated++
        } catch (err) {
          const errorMsg = `Failed to update gallery score for ${gallery.contentId}: ${err instanceof Error ? err.message : 'Unknown error'}`
          errors.push(errorMsg)
          console.error('[Trending] ' + errorMsg)
        }
      }
    } catch (err) {
      const errorMsg = `Failed to process gallery content: ${err instanceof Error ? err.message : 'Unknown error'}`
      errors.push(errorMsg)
      console.error('[Trending] ' + errorMsg)
    }

    try {
      // Get all approved UGC content
      const allUGC = await ctx.db
        .query('ugcContent')
        .withIndex('by_approved', (q) => q.eq('isApproved', true))
        .collect()

      // Update trending scores for UGC content
      for (const ugc of allUGC) {
        try {
          const { trendingScore, recencyFactor, engagementScore } =
            calculateTrendingScore(
              ugc.likeCount,
              ugc.viewCount,
              0, // TODO: Add comment aggregation when comments table exists
              ugc.createdAt,
              now
            )

          // Check if score already exists
          const existingScore = await ctx.db
            .query('trendingScores')
            .withIndex('by_contentId', (q) =>
              q.eq('contentId', ugc.ugcId).eq('contentType', 'ugc')
            )
            .first()

          if (existingScore) {
            // Update existing score
            await ctx.db.patch(existingScore._id, {
              trendingScore,
              recencyFactor,
              engagementScore,
              likeCount: ugc.likeCount,
              viewCount: ugc.viewCount,
              commentCount: 0,
              computedAt: now,
            })
          } else {
            // Insert new score
            await ctx.db.insert('trendingScores', {
              contentId: ugc.ugcId,
              contentType: 'ugc',
              trendingScore,
              recencyFactor,
              engagementScore,
              likeCount: ugc.likeCount,
              viewCount: ugc.viewCount,
              commentCount: 0,
              createdAt: ugc.createdAt,
              computedAt: now,
            })
          }

          ugcUpdated++
        } catch (err) {
          const errorMsg = `Failed to update UGC score for ${ugc.ugcId}: ${err instanceof Error ? err.message : 'Unknown error'}`
          errors.push(errorMsg)
          console.error('[Trending] ' + errorMsg)
        }
      }
    } catch (err) {
      const errorMsg = `Failed to process UGC content: ${err instanceof Error ? err.message : 'Unknown error'}`
      errors.push(errorMsg)
      console.error('[Trending] ' + errorMsg)
    }

    const totalUpdated = galleryUpdated + ugcUpdated

    return {
      totalUpdated,
      galleryUpdated,
      ugcUpdated,
      computedAt: now,
      errors: errors.length > 0 ? errors : undefined,
      message: `Refreshed ${totalUpdated} trending scores (${galleryUpdated} gallery, ${ugcUpdated} UGC)`,
    }
  },
})

/**
 * Get the last computed timestamp for trending scores
 * Useful for monitoring staleness of cached scores
 */
export const getLastTrendingUpdate = query({
  args: {},
  handler: async (ctx) => {
    // Get the most recent computed timestamp
    const recentScores = await ctx.db
      .query('trendingScores')
      .order('desc')
      .take(1)

    if (recentScores.length === 0) {
      return { lastComputedAt: null, scoreCount: 0 }
    }

    // Count total scores
    const allScores = await ctx.db.query('trendingScores').collect()

    return {
      lastComputedAt: recentScores[0].computedAt,
      scoreCount: allScores.length,
    }
  },
})

/**
 * Manually trigger a score refresh for a specific piece of content
 * This can be called after likes/views are updated to immediately reflect changes
 * without waiting for the hourly refresh
 */
export const refreshContentScore = mutation({
  args: {
    contentId: v.string(),
    contentType: v.union(v.literal('gallery'), v.literal('ugc')),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    try {
      let likeCount = 0
      let viewCount = 0
      let createdAt = 0

      // Fetch content based on type
      if (args.contentType === 'gallery') {
        const content = await ctx.db
          .query('galleryContent')
          .filter((q) => q.eq(q.field('contentId'), args.contentId))
          .first()

        if (!content) {
          throw new ConvexError('Gallery content not found')
        }

        likeCount = content.likeCount
        viewCount = content.viewCount
        createdAt = content.createdAt
      } else {
        const content = await ctx.db
          .query('ugcContent')
          .filter((q) => q.eq(q.field('ugcId'), args.contentId))
          .first()

        if (!content) {
          throw new ConvexError('UGC content not found')
        }

        // Only approved content can be refreshed
        if (!content.isApproved) {
          throw new ConvexError('UGC content is not approved')
        }

        likeCount = content.likeCount
        viewCount = content.viewCount
        createdAt = content.createdAt
      }

      // Calculate new score
      const { trendingScore, recencyFactor, engagementScore } =
        calculateTrendingScore(likeCount, viewCount, 0, createdAt, now)

      // Check if score already exists
      const existingScore = await ctx.db
        .query('trendingScores')
        .withIndex('by_contentId', (q) =>
          q.eq('contentId', args.contentId).eq('contentType', args.contentType)
        )
        .first()

      if (existingScore) {
        // Update existing score
        await ctx.db.patch(existingScore._id, {
          trendingScore,
          recencyFactor,
          engagementScore,
          likeCount,
          viewCount,
          commentCount: 0,
          computedAt: now,
        })
      } else {
        // Insert new score
        await ctx.db.insert('trendingScores', {
          contentId: args.contentId,
          contentType: args.contentType,
          trendingScore,
          recencyFactor,
          engagementScore,
          likeCount,
          viewCount,
          commentCount: 0,
          createdAt,
          computedAt: now,
        })
      }

      return {
        success: true,
        contentId: args.contentId,
        contentType: args.contentType,
        trendingScore,
        computedAt: now,
        message: `Refreshed trending score for ${args.contentType} ${args.contentId}`,
      }
    } catch (err) {
      console.error('[Trending] Failed to refresh content score:', err)
      throw new ConvexError(
        err instanceof Error ? err.message : 'Failed to refresh content score'
      )
    }
  },
})
