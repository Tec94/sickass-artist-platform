import { mutation, query, internalMutation } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { v, ConvexError } from 'convex/values'
import { api } from './_generated/api'
import { getCurrentUser, getCurrentUserOrNull } from './helpers'

// ============ TYPES ============

interface UserTierMultiplier {
  bronze: number
  silver: number
  gold: number
  platinum: number
}

type SongLeaderboardPeriod = 'allTime' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
type SubmissionType = 'top3' | 'top5' | 'top10' | 'top15' | 'top25'

type RankedSong = {
  spotifyTrackId: string
  title: string
  artist: string
  rank: number
  albumCover: string
}

// ============ CONSTANTS ============

const DAY_MS = 24 * 60 * 60 * 1000
const ACCOUNT_MIN_AGE_MS = 7 * DAY_MS
const RATE_LIMIT_WINDOW_MS = 7 * DAY_MS
const RATE_LIMIT_MAX_SUBMISSIONS = 2
const MAX_LEADERBOARD_LIMIT = 50
const MAX_TRENDING_LIMIT = 50
const MAX_SEARCH_LIMIT = 50
const MAX_SUBMISSION_SCAN = 60

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
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / DAY_MS)
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

function getSubmissionLimit(submissionType: SubmissionType): number {
  const expectedCounts: Record<SubmissionType, number> = {
    top3: 3,
    top5: 5,
    top10: 10,
    top15: 15,
    top25: 25,
  }
  return expectedCounts[submissionType]
}

function normalizeRankedSongs(rankedSongs: RankedSong[]): RankedSong[] {
  return [...rankedSongs].sort((a, b) => a.rank - b.rank)
}

function buildSubmissionSearchText(leaderboardId: string, submissionType: SubmissionType, rankedSongs: RankedSong[]): string {
  const parts: string[] = [leaderboardId, submissionType]
  for (const song of rankedSongs) {
    parts.push(song.title, song.artist, song.spotifyTrackId)
  }
  return parts.join(' ').toLowerCase()
}

function validateRankedSongs(submissionType: SubmissionType, rankedSongs: RankedSong[]): RankedSong[] {
  const expectedCount = getSubmissionLimit(submissionType)
  if (rankedSongs.length !== expectedCount) {
    throw new ConvexError(`Expected ${expectedCount} songs for ${submissionType}, got ${rankedSongs.length}`)
  }

  const normalized = normalizeRankedSongs(rankedSongs)

  for (let i = 0; i < normalized.length; i++) {
    const song = normalized[i]
    if (song.rank !== i + 1) {
      throw new ConvexError('Song ranks must be sequential (1, 2, 3, ...)')
    }
    if (!song.spotifyTrackId.trim() || !song.title.trim() || !song.artist.trim()) {
      throw new ConvexError('Songs must include a track id, title, and artist')
    }
  }

  const trackIds = new Set(normalized.map((s) => s.spotifyTrackId))
  if (trackIds.size !== normalized.length) {
    throw new ConvexError('Cannot rank the same song twice')
  }

  return normalized
}

function findLatestSubmission<T extends { isActive?: boolean }>(submissions: T[]): T | null {
  return submissions.find((submission) => submission.isActive !== false) ?? null
}

async function getUserTier(ctx: MutationCtx, userId: Id<'users'>, memo: Map<Id<'users'>, string>): Promise<string> {
  const cached = memo.get(userId)
  if (cached) return cached
  const user = await ctx.db.get(userId)
  const tier = user?.fanTier || 'bronze'
  memo.set(userId, tier)
  return tier
}

async function upsertLeaderboardCache(
  ctx: MutationCtx,
  leaderboardId: string,
  period: SongLeaderboardPeriod,
  entries: Array<{
    spotifyTrackId: string
    songTitle: string
    songArtist: string
    albumCover: string
    totalScore: number
    uniqueVoters: number
  }>,
  submissionCount: number,
  now: number
) {
  const existing = await ctx.db
    .query('leaderboardCache')
    .withIndex('by_leaderboardId', (q) => q.eq('leaderboardId', leaderboardId))
    .first()

  const payload = {
    leaderboardId,
    period,
    entries,
    submissionCount,
    computedAt: now,
    updatedAt: now,
  }

  if (existing) {
    await ctx.db.patch(existing._id, payload)
  } else {
    await ctx.db.insert('leaderboardCache', payload)
  }
}

async function collectLatestActiveSubmissions(ctx: MutationCtx, leaderboardId: string) {
  const submissions = await ctx.db
    .query('songSubmissions')
    .withIndex('by_leaderboardId_updatedAt', (q) => q.eq('leaderboardId', leaderboardId))
    .order('desc')
    .collect()

  const seenUserIds = new Set<string>()
  const latest: typeof submissions = []

  for (const submission of submissions) {
    if (submission.isActive === false) continue
    const userKey = String(submission.userId)
    if (seenUserIds.has(userKey)) continue
    seenUserIds.add(userKey)
    latest.push(submission)
  }

  return latest
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
  const tierValue = tierBonus[userTier as keyof UserTierMultiplier] || 1.0

  // 4. Recency bonus: newer submissions get slight boost
  const daysOld = submissionAgeMs / DAY_MS
  const recencyMultiplier = daysOld < 7 ? 1.1 : daysOld < 30 ? 1.0 : 0.9

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

  const latestSubmissions = await collectLatestActiveSubmissions(ctx, leaderboardId)
  const userTierMemo = new Map<Id<'users'>, string>()

  const trackScores = new Map<
    string,
    {
      score: number
      appearances: number
      topRankCount: number
      rankSum: number
      uniqueVoters: Set<Id<'users'>>
      title: string
      artist: string
      albumCover: string
    }
  >()

  for (const submission of latestSubmissions) {
    const upvotes = submission.upvoteCount || 0
    const submissionTimestamp = submission.lastEditedAt ?? submission.updatedAt ?? submission.createdAt
    const submissionAge = Math.max(0, now - submissionTimestamp)
    const userTier = await getUserTier(ctx, submission.userId, userTierMemo)
    const rankedSongs = normalizeRankedSongs(submission.rankedSongs as RankedSong[])

    for (const song of rankedSongs) {
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
        uniqueVoters: new Set<Id<'users'>>(),
        title: song.title,
        artist: song.artist,
        albumCover: song.albumCover,
      }

      existing.score += songScore
      existing.appearances += 1
      if (song.rank <= 3) existing.topRankCount += 1
      existing.rankSum += song.rank
      existing.uniqueVoters.add(submission.userId)

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

  const cacheEntries: Array<{
    spotifyTrackId: string
    songTitle: string
    songArtist: string
    albumCover: string
    totalScore: number
    uniqueVoters: number
  }> = []

  for (const [trackId, data] of entries) {
    const totalScore = Math.round(data.score * 10) / 10
    await ctx.db.insert('songLeaderboard', {
      leaderboardId,
      period,
      spotifyTrackId: trackId,
      songTitle: data.title,
      songArtist: data.artist,
      albumCover: data.albumCover,
      totalScore,
      uniqueVoters: data.uniqueVoters.size,
      updatedAt: now,
    })

    cacheEntries.push({
      spotifyTrackId: trackId,
      songTitle: data.title,
      songArtist: data.artist,
      albumCover: data.albumCover,
      totalScore,
      uniqueVoters: data.uniqueVoters.size,
    })
  }

  await upsertLeaderboardCache(ctx, leaderboardId, period, cacheEntries, latestSubmissions.length, now)

  return { processed: entries.length, submissions: latestSubmissions.length }
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
 * Create or update song submission for leaderboard
 */
export const submitSongRanking = mutation({
  args: {
    leaderboardId: v.string(), // e.g., "2025-01"
    submissionType: v.union(v.literal('top3'), v.literal('top5'), v.literal('top10'), v.literal('top15'), v.literal('top25')),
    rankedSongs: v.array(
      v.object({
        spotifyTrackId: v.string(),
        title: v.string(),
        artist: v.string(),
        rank: v.number(),
        albumCover: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx)
    if (!currentUser) {
      throw new ConvexError('You must be logged in to submit rankings')
    }

    const now = Date.now()
    const accountAge = now - currentUser.createdAt
    if (accountAge < ACCOUNT_MIN_AGE_MS) {
      throw new ConvexError('Your account must be at least 7 days old to submit rankings')
    }

    const submissionType = args.submissionType as SubmissionType
    const rankedSongs = validateRankedSongs(submissionType, args.rankedSongs as RankedSong[])

    const recentSubmissions = await ctx.db
      .query('songSubmissions')
      .withIndex('by_userId_leaderboard', (q) => q.eq('userId', currentUser._id).eq('leaderboardId', args.leaderboardId))
      .order('desc')
      .take(MAX_SUBMISSION_SCAN)

    const existingSubmission = findLatestSubmission(recentSubmissions)

    if (!existingSubmission) {
      const windowStart = now - RATE_LIMIT_WINDOW_MS
      const recentCount = recentSubmissions.filter((submission) => submission.createdAt > windowStart).length
      if (recentCount >= RATE_LIMIT_MAX_SUBMISSIONS) {
        throw new ConvexError('You can only submit 2 rankings per week')
      }
    }

    const searchText = buildSubmissionSearchText(args.leaderboardId, submissionType, rankedSongs)

    if (existingSubmission) {
      const nextRevision = (existingSubmission.revision ?? 1) + 1
      await ctx.db.patch(existingSubmission._id, {
        submissionType,
        rankedSongs,
        revision: nextRevision,
        lastEditedAt: now,
        updatedAt: now,
        isActive: true,
        searchText,
      })

      return {
        submissionId: existingSubmission._id,
        success: true,
        wasUpdated: true,
        revision: nextRevision,
      }
    }

    const submissionId = await ctx.db.insert('songSubmissions', {
      userId: currentUser._id,
      leaderboardId: args.leaderboardId,
      submissionType,
      rankedSongs,
      revision: 1,
      lastEditedAt: now,
      isActive: true,
      searchText,
      upvoteCount: 0,
      upvoters: [],
      isHighQuality: false,
      createdAt: now,
      updatedAt: now,
    })

    // Award points for brand-new submissions, but don't block submission success on points failures.
    try {
      const idempotencyKey = `submission-${submissionId}`
      await ctx.runMutation(api.points.awardPoints, {
        userId: currentUser._id,
        type: 'quest_complete',
        amount: 10,
        description: 'Submitted song ranking',
        idempotencyKey,
      })
    } catch (error) {
      console.error('Failed to award submission points', error)
    }

    return { submissionId, success: true, wasUpdated: false, revision: 1 }
  },
})

/**
 * Update an existing submission without counting against submission limits
 */
export const updateSongSubmission = mutation({
  args: {
    submissionId: v.id('songSubmissions'),
    submissionType: v.union(v.literal('top3'), v.literal('top5'), v.literal('top10'), v.literal('top15'), v.literal('top25')),
    rankedSongs: v.array(
      v.object({
        spotifyTrackId: v.string(),
        title: v.string(),
        artist: v.string(),
        rank: v.number(),
        albumCover: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx)
    if (!currentUser) {
      throw new ConvexError('You must be logged in to update rankings')
    }

    const submission = await ctx.db.get(args.submissionId)
    if (!submission) {
      throw new ConvexError('Submission not found')
    }
    if (submission.userId !== currentUser._id) {
      throw new ConvexError('You can only edit your own submissions')
    }
    if (submission.isActive === false) {
      throw new ConvexError('This submission is no longer active')
    }

    const now = Date.now()
    const submissionType = args.submissionType as SubmissionType
    const rankedSongs = validateRankedSongs(submissionType, args.rankedSongs as RankedSong[])
    const searchText = buildSubmissionSearchText(submission.leaderboardId, submissionType, rankedSongs)
    const nextRevision = (submission.revision ?? 1) + 1

    await ctx.db.patch(submission._id, {
      submissionType,
      rankedSongs,
      revision: nextRevision,
      lastEditedAt: now,
      updatedAt: now,
      isActive: true,
      searchText,
    })

    return { success: true, submissionId: submission._id, revision: nextRevision }
  },
})

/**
 * Vote on a submission (upvote/downvote)
 * User can toggle between votes but cannot vote on their own submission.
 */
export const voteOnSubmission = mutation({
  args: {
    submissionId: v.id('songSubmissions'),
    voteType: v.union(v.literal('upvote'), v.literal('downvote')),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx)
    if (!currentUser) {
      throw new ConvexError('You must be logged in to vote')
    }

    const submission = await ctx.db.get(args.submissionId)
    if (!submission || submission.isActive === false) {
      throw new ConvexError('Submission not found')
    }
    if (submission.userId === currentUser._id) {
      throw new ConvexError('You cannot vote on your own submission')
    }

    const now = Date.now()
    const upvoters = [...(submission.upvoters || [])]

    const existingVote = await ctx.db
      .query('submissionVotes')
      .withIndex('by_submissionId_userId', (q) => q.eq('submissionId', args.submissionId).eq('userId', currentUser._id))
      .first()

    if (existingVote?.voteType === args.voteType) {
      return { success: true, newVoteCount: submission.upvoteCount, unchanged: true }
    }

    let delta = 0

    if (existingVote) {
      if (existingVote.voteType === 'upvote') {
        delta -= 1
        const index = upvoters.findIndex((id) => id === currentUser._id)
        if (index !== -1) upvoters.splice(index, 1)
      } else {
        delta += 1
      }
      await ctx.db.patch(existingVote._id, { voteType: args.voteType, createdAt: now })
    } else {
      await ctx.db.insert('submissionVotes', {
        userId: currentUser._id,
        submissionId: args.submissionId,
        voteType: args.voteType,
        createdAt: now,
      })
    }

    if (args.voteType === 'upvote') {
      delta += 1
      if (!upvoters.some((id) => id === currentUser._id)) {
        upvoters.push(currentUser._id)
      }
    } else {
      delta -= 1
      const index = upvoters.findIndex((id) => id === currentUser._id)
      if (index !== -1) upvoters.splice(index, 1)
    }

    const newVoteCount = Math.max(0, submission.upvoteCount + delta)

    await ctx.db.patch(submission._id, {
      upvoteCount: newVoteCount,
      upvoters,
      updatedAt: now,
    })

    return { success: true, newVoteCount }
  },
})

/**
 * Admin: Mark submission as high quality (1.25x score multiplier)
 */
export const adminMarkHighQuality = mutation({
  args: {
    submissionId: v.id('songSubmissions'),
  },
  handler: async (ctx, args) => {
    const admin = await getCurrentUser(ctx)
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
    period: v.union(v.literal('weekly'), v.literal('monthly'), v.literal('quarterly'), v.literal('allTime')),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || MAX_LEADERBOARD_LIMIT, MAX_LEADERBOARD_LIMIT)
    const leaderboardId = getCurrentLeaderboardId(args.period)

    const cache = await ctx.db
      .query('leaderboardCache')
      .withIndex('by_leaderboardId', (q) => q.eq('leaderboardId', leaderboardId))
      .first()

    let entries: Array<{
      _id: string
      leaderboardId: string
      period: SongLeaderboardPeriod
      spotifyTrackId: string
      songTitle: string
      songArtist: string
      albumCover: string
      totalScore: number
      uniqueVoters: number
      updatedAt: number
    }>

    if (cache && cache.period === args.period) {
      entries = cache.entries.slice(0, limit).map((entry) => ({
        _id: `${leaderboardId}:${entry.spotifyTrackId}`,
        leaderboardId,
        period: cache.period,
        spotifyTrackId: entry.spotifyTrackId,
        songTitle: entry.songTitle,
        songArtist: entry.songArtist,
        albumCover: entry.albumCover,
        totalScore: entry.totalScore,
        uniqueVoters: entry.uniqueVoters,
        updatedAt: cache.updatedAt,
      }))
    } else {
      const rawEntries = await ctx.db
        .query('songLeaderboard')
        .withIndex('by_leaderboardId_score', (q) => q.eq('leaderboardId', leaderboardId))
        .order('desc')
        .take(limit)

      entries = rawEntries.map((entry) => ({
        _id: String(entry._id),
        leaderboardId: entry.leaderboardId,
        period: entry.period,
        spotifyTrackId: entry.spotifyTrackId,
        songTitle: entry.songTitle,
        songArtist: entry.songArtist,
        albumCover: entry.albumCover,
        totalScore: entry.totalScore,
        uniqueVoters: entry.uniqueVoters,
        updatedAt: entry.updatedAt,
      }))
    }

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
    period: v.optional(v.union(v.literal('weekly'), v.literal('monthly'), v.literal('quarterly'), v.literal('allTime'))),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx)
    if (!currentUser) {
      throw new ConvexError('You must be logged in to view submissions')
    }

    const leaderboardId = args.period ? getCurrentLeaderboardId(args.period) : undefined

    if (leaderboardId) {
      const submissions = await ctx.db
        .query('songSubmissions')
        .withIndex('by_userId_leaderboard', (q) => q.eq('userId', currentUser._id).eq('leaderboardId', leaderboardId))
        .order('desc')
        .take(MAX_SUBMISSION_SCAN)

      return submissions.filter((submission) => submission.isActive !== false)
    }

    const allSubmissions = await ctx.db
      .query('songSubmissions')
      .filter((q) => q.eq(q.field('userId'), currentUser._id))
      .order('desc')
      .take(MAX_SUBMISSION_SCAN)

    return allSubmissions.filter((submission) => submission.isActive !== false)
  },
})

/**
 * Get the latest submission for the current user and period
 */
export const getUserSubmissionForPeriod = query({
  args: {
    period: v.union(v.literal('weekly'), v.literal('monthly'), v.literal('quarterly'), v.literal('allTime')),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrNull(ctx)
    if (!currentUser) return null

    const leaderboardId = getCurrentLeaderboardId(args.period)
    const submissions = await ctx.db
      .query('songSubmissions')
      .withIndex('by_userId_leaderboard', (q) => q.eq('userId', currentUser._id).eq('leaderboardId', leaderboardId))
      .order('desc')
      .take(MAX_SUBMISSION_SCAN)

    return findLatestSubmission(submissions)
  },
})

/**
 * Get single submission with vote counts
 */
export const getSubmission = query({
  args: { submissionId: v.id('songSubmissions') },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId)
    if (!submission || submission.isActive === false) return null

    const votes = await ctx.db
      .query('submissionVotes')
      .withIndex('by_submissionId', (q) => q.eq('submissionId', args.submissionId))
      .collect()

    const upvotes = votes.filter((vote) => vote.voteType === 'upvote').length
    const downvotes = votes.filter((vote) => vote.voteType === 'downvote').length

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
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrNull(ctx)
    const limit = Math.min(args.limit || 10, MAX_TRENDING_LIMIT)
    const candidateLimit = Math.min(limit * 4, 200)
    const weekAgo = Date.now() - RATE_LIMIT_WINDOW_MS
    const leaderboardId = args.leaderboardId ?? getCurrentLeaderboardId('weekly')

    const candidates = await ctx.db
      .query('songSubmissions')
      .withIndex('by_leaderboardId_upvotes', (q) => q.eq('leaderboardId', leaderboardId))
      .order('desc')
      .take(candidateLimit)

    const submissions = candidates
      .filter((submission) => submission.isActive !== false && submission.createdAt > weekAgo)
      .slice(0, limit)

    const userMemo = new Map<string, { username?: string; displayName?: string; avatar?: string; fanTier?: string } | null>()

    let voteLookup = new Map<string, string>()
    if (currentUser) {
      const recentVotes = await ctx.db
        .query('submissionVotes')
        .withIndex('by_userId', (q) => q.eq('userId', currentUser._id))
        .order('desc')
        .take(500)

      voteLookup = new Map(recentVotes.map((vote) => [String(vote.submissionId), vote.voteType]))
    }

    const submissionsWithData = await Promise.all(
      submissions.map(async (submission) => {
        const userKey = String(submission.userId)
        if (!userMemo.has(userKey)) {
          const user = await ctx.db.get(submission.userId)
          userMemo.set(
            userKey,
            user
              ? {
                  username: user.username,
                  displayName: user.displayName,
                  avatar: user.avatar,
                  fanTier: user.fanTier,
                }
              : null
          )
        }

        const voteType = currentUser ? voteLookup.get(String(submission._id)) : undefined

        return {
          ...submission,
          user: userMemo.get(userKey) ?? null,
          hasUpvoted: voteType === 'upvote',
          voteType: voteType ?? null,
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
    const user = await ctx.db.query('users').first()
    if (!user) {
      return 'No users found. Please login first.'
    }

    const songs = [
      {
        spotifyId: '1',
        title: 'Neon Nights',
        artist: 'Cyber Punk',
        albumCover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop',
      },
      {
        spotifyId: '2',
        title: 'Digital Dreams',
        artist: 'Synth Wave',
        albumCover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
      },
      {
        spotifyId: '3',
        title: 'Bass Drop',
        artist: 'Dub Stepper',
        albumCover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
      },
      {
        spotifyId: '4',
        title: 'Code Flow',
        artist: 'The Hackers',
        albumCover: 'https://images.unsplash.com/photo-1514525253440-b393452e2729?w=300&h=300&fit=crop',
      },
      {
        spotifyId: '5',
        title: 'Algorithm',
        artist: 'Data Science',
        albumCover: 'https://images.unsplash.com/photo-1459749411177-287ce35e8b0f?w=300&h=300&fit=crop',
      },
    ]

    const now = Date.now()

    for (let i = 0; i < 3; i++) {
      const shuffledSongs = [...songs].sort(() => 0.5 - Math.random()).slice(0, 3)
      const rankedSongs = shuffledSongs.map((song, index) => ({
        spotifyTrackId: song.spotifyId,
        title: song.title,
        artist: song.artist,
        albumCover: song.albumCover,
        rank: index + 1,
      }))

      const createdAt = now - Math.floor(Math.random() * 48 * 60 * 60 * 1000)
      const searchText = buildSubmissionSearchText('2026-W02', 'top3', rankedSongs)

      await ctx.db.insert('songSubmissions', {
        userId: user._id,
        leaderboardId: '2026-W02',
        submissionType: 'top3',
        rankedSongs,
        revision: 1,
        lastEditedAt: createdAt,
        isActive: true,
        searchText,
        upvoteCount: Math.floor(Math.random() * 50),
        upvoters: [],
        isHighQuality: false,
        createdAt,
        updatedAt: createdAt,
      })
    }

    return `Seeded 3 submissions for ${user.username}`
  },
})

/**
 * Search submissions by song name
 */
export const searchSubmissions = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    period: v.optional(v.union(v.literal('weekly'), v.literal('monthly'), v.literal('quarterly'), v.literal('allTime'))),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 20, MAX_SEARCH_LIMIT)
    const leaderboardId = getCurrentLeaderboardId(args.period ?? 'weekly')
    const candidateLimit = Math.min(limit * 3, 150)
    const searchQuery = args.query.trim()
    if (!searchQuery) return []

    const candidates = await ctx.db
      .query('songSubmissions')
      .withSearchIndex('search_songSubmissions', (q) => q.search('searchText', searchQuery).eq('leaderboardId', leaderboardId))
      .take(candidateLimit)

    return candidates.filter((submission) => submission.isActive !== false).slice(0, limit)
  },
})
