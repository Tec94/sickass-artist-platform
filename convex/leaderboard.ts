import { mutation, query, internalMutation } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import { v, ConvexError } from 'convex/values'
import { api } from './_generated/api'

// ============ TYPES ============

interface UserTierMultiplier {
  bronze: number
  silver: number
  gold: number
  platinum: number
}

type SongLeaderboardPeriod = 'allTime' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

// ============ UTILITIES ============

/**
 * Get current active leaderboard ID (e.g., "2025-01" for January 2025)
 * Format: YYYY-MM for monthly leaderboards
 */
function getCurrentLeaderboardId(period: 'weekly' | 'monthly' | 'quarterly' | 'allTime'): string {
  const now = new Date()

  if (period === 'allTime') {
    return 'all-time'
  }

  if (period === 'weekly') {
    // Get ISO week number (1-52)
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7)
    return `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`
  }

  if (period === 'monthly') {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  if (period === 'quarterly') {
    const quarter = Math.floor(now.getMonth() / 3) + 1
    return `${now.getFullYear()}-Q${quarter}`
  }

  return 'all-time'
}

/**
 * Calculate score for a single submission's song using HYBRID WEIGHTED algorithm
 * 
 * The hybrid approach ensures:
 * - Position is PRIMARY (rank 1 always scores higher than rank 10)
 * - Upvotes provide a LOGARITHMIC bonus (diminishing returns prevents dominance)
 * - Quality submissions get meaningful but not overwhelming boost
 * 
 * Formula: positionPoints × (1 + log10(upvotes + 1) × 0.5) × tierBonus × recencyBonus × qualityBonus
 */
function calculateSongScoreFromSubmission(
  songRank: number,
  submissionUpvotes: number,
  submissionAgeMs: number,
  userTier: string,
  isHighQuality: boolean
): number {
  // 1. Position points (PRIMARY factor): higher rank = more points
  // Rank 1 = 10pts, Rank 3 = 7pts, Rank 5 = 4pts, Rank 10 = 1pt
  const positionPoints = Math.max(1, 10 - (songRank - 1) * 1.0)

  // 2. Upvote bonus (LOGARITHMIC): prevents highly upvoted low-ranks from dominating
  // 0 upvotes = 1.0x, 9 upvotes = 1.5x, 99 upvotes = 2.0x, 999 upvotes = 2.5x
  const upvoteBonus = 1 + Math.log10(submissionUpvotes + 1) * 0.5

  // 3. Tier bonus: higher tier fans have slightly more authority
  const tierBonus: UserTierMultiplier = {
    bronze: 1.0,
    silver: 1.05,
    gold: 1.1,
    platinum: 1.15,
  }
  const tierValue = (tierBonus[userTier as keyof UserTierMultiplier] || 1.0)

  // 4. Recency bonus: newer submissions get slight boost
  const daysOld = submissionAgeMs / (1000 * 60 * 60 * 24)
  const recencyMultiplier = daysOld < 7 ? 1.1 : (daysOld < 30 ? 1.0 : 0.9)

  // 5. Quality bonus: admin-flagged submissions (reduced from 1.5x to 1.25x)
  const qualityMultiplier = isHighQuality ? 1.25 : 1.0

  return positionPoints * upvoteBonus * tierValue * recencyMultiplier * qualityMultiplier
}

/**
 * Shared implementation for leaderboard score recomputation.
 */
async function computeLeaderboardScoresImpl(
  ctx: MutationCtx,
  leaderboardId: string,
  period: SongLeaderboardPeriod
): Promise<{ processed: number; submissions: number }> {
  const now = Date.now()

  const submissions = await ctx.db
    .query('songSubmissions')
    .withIndex('by_leaderboardId_createdAt', (q) =>
      q.eq('leaderboardId', leaderboardId)
    )
    .collect()

  const trackScores = new Map<
    string,
    {
      score: number
      appearances: number
      topRankCount: number
      rankSum: number
      uniqueVoters: Set<string>
      title: string
      artist: string
      albumCover: string
    }
  >()

  for (const submission of submissions) {
    const upvotes = submission.upvoteCount || 0

    const user = await ctx.db.get(submission.userId)
    const userTier = user?.fanTier || 'bronze'

    const submissionAge = now - submission.createdAt

    for (const song of submission.rankedSongs) {
      const songScore = calculateSongScoreFromSubmission(
        song.rank,
        upvotes,
        submissionAge,
        userTier,
        submission.isHighQuality
      )

      const existing = trackScores.get(song.spotifyTrackId) || {
        score: 0,
        appearances: 0,
        topRankCount: 0,
        rankSum: 0,
        uniqueVoters: new Set<string>(),
        title: song.title,
        artist: song.artist,
        albumCover: song.albumCover,
      }

      existing.score += songScore
      existing.appearances += 1
      if (song.rank <= 3) existing.topRankCount += 1
      existing.rankSum += song.rank
      existing.uniqueVoters.add(String(submission.userId))

      trackScores.set(song.spotifyTrackId, existing)
    }
  }

  const oldEntries = await ctx.db
    .query('songLeaderboard')
    .withIndex('by_leaderboardId_score', (q) => q.eq('leaderboardId', leaderboardId))
    .collect()

  for (const entry of oldEntries) {
    await ctx.db.delete(entry._id)
  }

  const entries = Array.from(trackScores.entries())
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 100)

  for (const [trackId, data] of entries) {
    await ctx.db.insert('songLeaderboard', {
      leaderboardId,
      period,
      spotifyTrackId: trackId,
      songTitle: data.title,
      songArtist: data.artist,
      albumCover: data.albumCover,
      totalScore: Math.round(data.score * 10) / 10,
      uniqueVoters: data.uniqueVoters.size,
      updatedAt: now,
    })
  }

  return { processed: entries.length, submissions: submissions.length }
}

/**
 * Hourly cron job to recompute all active leaderboards
 */
export const hourlyLeaderboardComputation = internalMutation({
  args: {},
  handler: async (ctx) => {
    const periods = ['weekly', 'monthly', 'quarterly', 'allTime'] as const

    type LeaderboardComputationPeriod = (typeof periods)[number]
    type LeaderboardComputationResult =
      | {
        period: LeaderboardComputationPeriod
        status: 'success'
        processed: number
        submissions: number
      }
      | {
        period: LeaderboardComputationPeriod
        status: 'failed'
        error: string
      }

    const results: LeaderboardComputationResult[] = []

    for (const period of periods) {
      try {
        const leaderboardId = getCurrentLeaderboardId(period)
        const result = await computeLeaderboardScoresImpl(ctx, leaderboardId, period)
        results.push({ period, status: 'success', ...result })
      } catch (error: unknown) {
        console.error(`Leaderboard computation failed for ${period}:`, error)
        const message = error instanceof Error ? error.message : String(error)
        results.push({ period, status: 'failed', error: message })
      }
    }

    return results
  },
})

/**
 * Batch compute leaderboard scores (called by cron)
 */
export const computeLeaderboardScores = internalMutation({
  args: {
    leaderboardId: v.string(),
    period: v.union(
      v.literal('allTime'),
      v.literal('weekly'),
      v.literal('monthly'),
      v.literal('quarterly'),
      v.literal('yearly')
    ),
  },
  handler: async (ctx, args) => {
    return await computeLeaderboardScoresImpl(ctx, args.leaderboardId, args.period)
  },
})

// ============ MUTATIONS ============

/**
 * Create song submission for leaderboard
 */
export const submitSongRanking = mutation({
  args: {
    userId: v.id('users'),
    leaderboardId: v.string(), // e.g., "2025-01"
    submissionType: v.union(v.literal('top3'), v.literal('top5'), v.literal('top10'), v.literal('top15'), v.literal('top25')),
    rankedSongs: v.array(v.object({
      spotifyTrackId: v.string(),
      title: v.string(),
      artist: v.string(),
      rank: v.number(),
      albumCover: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    // ===== VALIDATION =====
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new ConvexError('User not found')
    }

    // Validate submission size matches type
    const expectedCounts = {
      top3: 3,
      top5: 5,
      top10: 10,
      top15: 15,
      top25: 25,
    }
    if (args.rankedSongs.length !== expectedCounts[args.submissionType]) {
      throw new ConvexError(
        `Expected ${expectedCounts[args.submissionType]} songs for ${args.submissionType}, got ${args.rankedSongs.length}`
      )
    }

    // Validate ranks are sequential (1, 2, 3, ... N)
    const ranks = args.rankedSongs.map(s => s.rank).sort((a, b) => a - b)
    for (let i = 0; i < ranks.length; i++) {
      if (ranks[i] !== i + 1) {
        throw new ConvexError('Song ranks must be sequential (1, 2, 3, ...)')
      }
    }

    // Validate no duplicate tracks
    const trackIds = new Set(args.rankedSongs.map(s => s.spotifyTrackId))
    if (trackIds.size !== args.rankedSongs.length) {
      throw new ConvexError('Cannot rank the same song twice')
    }

    // Rate limit: max 2 submissions per user per leaderboard per week
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const recentSubmissions = await ctx.db
      .query('songSubmissions')
      .withIndex('by_userId_leaderboard', (q) =>
        q.eq('userId', args.userId).eq('leaderboardId', args.leaderboardId)
      )
      .filter((q) => q.gt(q.field('createdAt'), weekAgo))
      .collect()

    if (recentSubmissions.length >= 2) {
      throw new ConvexError('You can only submit 2 rankings per week')
    }

    // Check minimum account age (7 days)
    const accountAge = Date.now() - user.createdAt
    if (accountAge < 7 * 24 * 60 * 60 * 1000) {
      throw new ConvexError('Your account must be at least 7 days old to submit rankings')
    }

    // ===== CREATE SUBMISSION =====
    const submissionId = await ctx.db.insert('songSubmissions', {
      userId: args.userId,
      leaderboardId: args.leaderboardId,
      submissionType: args.submissionType,
      rankedSongs: args.rankedSongs,
      upvoteCount: 0,
      upvoters: [],
      isHighQuality: false, // Set by admin later
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Award points for submission
    const idempotencyKey = `submission-${submissionId}`
    await ctx.runMutation(api.points.awardPoints, {
      userId: args.userId,
      type: 'quest_complete', // Reuse type
      amount: 10,
      description: 'Submitted song ranking',
      idempotencyKey,
    })

    return { submissionId, success: true }
  },
})

/**
 * Vote on a submission (upvote/downvote)
 * User can only vote once per submission
 */
export const voteOnSubmission = mutation({
  args: {
    userId: v.id('users'),
    submissionId: v.id('songSubmissions'),
    voteType: v.union(v.literal('upvote'), v.literal('downvote')),
  },
  handler: async (ctx, args) => {
    // Check if already voted
    const existingVote = await ctx.db
      .query('submissionVotes')
      .withIndex('by_submissionId_userId', (q) =>
        q.eq('submissionId', args.submissionId).eq('userId', args.userId)
      )
      .first()

    if (existingVote) {
      throw new ConvexError('You already voted on this submission')
    }

    // Create vote record
    await ctx.db.insert('submissionVotes', {
      userId: args.userId,
      submissionId: args.submissionId,
      voteType: args.voteType,
      createdAt: Date.now(),
    })

    // Get submission
    const submission = await ctx.db.get(args.submissionId)
    if (!submission) {
      throw new ConvexError('Submission not found')
    }

    // Update submission vote count
    let newCount = submission.upvoteCount
    const newVoters = submission.upvoters || []

    if (args.voteType === 'upvote') {
      newCount += 1
      if (!newVoters.includes(args.userId)) {
        newVoters.push(args.userId)
      }
    } else {
      newCount = Math.max(0, newCount - 1)
    }

    await ctx.db.patch(submission._id, {
      upvoteCount: newCount,
      upvoters: newVoters,
      updatedAt: Date.now(),
    })

    return { success: true, newVoteCount: newCount }
  },
})

/**
 * Admin: Mark submission as high quality (1.5x score multiplier)
 */
export const adminMarkHighQuality = mutation({
  args: {
    submissionId: v.id('songSubmissions'),
    adminId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminId)
    if (!admin || admin.role !== 'admin') {
      throw new ConvexError('Only admins can mark quality')
    }

    const submission = await ctx.db.get(args.submissionId)
    if (!submission) {
      throw new ConvexError('Submission not found')
    }

    await ctx.db.patch(submission._id, {
      isHighQuality: true,
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

// ============ QUERIES ============

/**
 * Get leaderboard for a period
 */
export const getLeaderboard = query({
  args: {
    period: v.union(
      v.literal('weekly'),
      v.literal('monthly'),
      v.literal('quarterly'),
      v.literal('allTime')
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 50, 500)
    const leaderboardId = getCurrentLeaderboardId(args.period)

    const entries = await ctx.db
      .query('songLeaderboard')
      .withIndex('by_leaderboardId_score', (q) =>
        q.eq('leaderboardId', leaderboardId)
      )
      .order('desc')
      .take(limit)

    return entries.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }))
  },
})

/**
 * Get user's submissions for a leaderboard
 */
export const getUserSubmissions = query({
  args: {
    userId: v.id('users'),
    period: v.optional(v.union(
      v.literal('weekly'),
      v.literal('monthly'),
      v.literal('quarterly'),
      v.literal('allTime')
    )),
  },
  handler: async (ctx, args) => {
    const leaderboardId = args.period ? getCurrentLeaderboardId(args.period) : undefined

    if (leaderboardId) {
      const submissions = await ctx.db
        .query('songSubmissions')
        .withIndex('by_userId_leaderboard', (q) =>
          q.eq('userId', args.userId).eq('leaderboardId', leaderboardId)
        )
        .order('desc')
        .collect()

      return submissions
    }

    // Get all submissions across all periods
    const allSubmissions = await ctx.db
      .query('songSubmissions')
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .order('desc')
      .collect()

    return allSubmissions
  },
})

/**
 * Get single submission with vote counts
 */
export const getSubmission = query({
  args: { submissionId: v.id('songSubmissions') },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId)
    if (!submission) return null

    // Get vote count
    const votes = await ctx.db
      .query('submissionVotes')
      .withIndex('by_submissionId', (q) => q.eq('submissionId', args.submissionId))
      .collect()

    const upvotes = votes.filter(v => v.voteType === 'upvote').length
    const downvotes = votes.filter(v => v.voteType === 'downvote').length

    return {
      ...submission,
      upvoteCount: upvotes,
      downvoteCount: downvotes,
    }
  },
})

/**
 * Get trending submissions (highly upvoted recently)
 */
export const getTrendingSubmissions = query({
  args: {
    limit: v.optional(v.number()),
    leaderboardId: v.optional(v.string()),
    userId: v.optional(v.id('users')), // Helper to check if current user upvoted (forced update)
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 10, 50)
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

    const baseQuery = ctx.db.query('songSubmissions')
    let submissions

    if (args.leaderboardId) {
      const leaderboardId = args.leaderboardId
      submissions = await baseQuery
        .withIndex('by_leaderboardId_upvotes', (q) =>
          q.eq('leaderboardId', leaderboardId)
        )
        .filter((q) => q.gt(q.field('createdAt'), weekAgo))
        .order('desc')
        .take(limit)
    } else {
      // Get all recent submissions
      const recent = await baseQuery
        .filter((q) => q.gt(q.field('createdAt'), weekAgo))
        .collect()

      // Sort in memory (for now, until we need a dedicated index)
      submissions = recent.sort((a, b) => b.upvoteCount - a.upvoteCount).slice(0, limit)
    }

    // Join with user data
    const submissionsWithData = await Promise.all(
      submissions.map(async (s) => {
        const user = await ctx.db.get(s.userId)

        // Check upvote status if userId provided
        let hasUpvoted = false
        if (args.userId) {
          const vote = await ctx.db
            .query('submissionVotes')
            .withIndex('by_submissionId_userId', q =>
              q.eq('submissionId', s._id).eq('userId', args.userId!)
            )
            .first()
          hasUpvoted = !!vote
        }

        return {
          ...s,
          user: user ? {
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar,
            fanTier: user.fanTier,
          } : null,
          hasUpvoted
        }
      })
    )

    return submissionsWithData
  },
})

// Seed function for leaderboard testing
export const seedLeaderboard = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Ensure we have a user
    let user = await ctx.db.query('users').first()
    if (!user) {
      // Create a dummy user if none exists (shouldn't happen in dev usually)
      return "No users found. Please login first."
    }

    const songs = [
      { spotifyId: '1', title: 'Neon Nights', artist: 'Cyber Punk', albumCover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop' },
      { spotifyId: '2', title: 'Digital Dreams', artist: 'Synth Wave', albumCover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop' },
      { spotifyId: '3', title: 'Bass Drop', artist: 'Dub Stepper', albumCover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop' },
      { spotifyId: '4', title: 'Code Flow', artist: 'The Hackers', albumCover: 'https://images.unsplash.com/photo-1514525253440-b393452e2729?w=300&h=300&fit=crop' },
      { spotifyId: '5', title: 'Algorithm', artist: 'Data Science', albumCover: 'https://images.unsplash.com/photo-1459749411177-287ce35e8b0f?w=300&h=300&fit=crop' },
    ]

    // Create 3 random submissions
    for (let i = 0; i < 3; i++) {
      const shuffledSongs = [...songs].sort(() => 0.5 - Math.random()).slice(0, 3)
      const rankedSongs = shuffledSongs.map((song, index) => ({
        spotifyTrackId: song.spotifyId,
        title: song.title,
        artist: song.artist,
        albumCover: song.albumCover,
        rank: index + 1,
      }))

      // Create submission with random upvotes
      await ctx.db.insert('songSubmissions', {
        userId: user._id,
        leaderboardId: '2026-W02',
        submissionType: 'top3',
        rankedSongs,
        upvoteCount: Math.floor(Math.random() * 50),
        upvoters: [],
        isHighQuality: false,
        createdAt: Date.now() - Math.floor(Math.random() * 48 * 60 * 60 * 1000),
        updatedAt: Date.now(),
      })
    }

    return `Seeded 3 submissions for ${user.username}`
  }
})

/**
 * Search submissions by song name
 */
export const searchSubmissions = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 20, 100)

    // Get all submissions (client-side search is acceptable for small sets)
    const submissions = await ctx.db.query('songSubmissions').collect()

    const filtered = submissions
      .filter(s =>
        s.rankedSongs.some(song =>
          song.title.toLowerCase().includes(args.query.toLowerCase()) ||
          song.artist.toLowerCase().includes(args.query.toLowerCase())
        )
      )
      .slice(0, limit)

    return filtered
  },
})
