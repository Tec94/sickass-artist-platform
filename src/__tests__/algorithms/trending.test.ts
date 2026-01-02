import { calculateTrendingScore } from '../../../convex/trending'
import { describe, it, expect } from 'vitest'

describe('Trending Algorithm', () => {
  // ✅ TEST: Score calculated correctly
  it('should calculate trending score correctly', () => {
    const now = Date.now()
    const item = {
      likeCount: 10,
      viewCount: 100,
      commentCount: 5,
      createdAt: now - 24 * 60 * 60 * 1000, // 1 day old
    }

    const { trendingScore: score } = calculateTrendingScore(
      item.likeCount,
      item.viewCount,
      item.commentCount,
      item.createdAt,
      now
    )

    // likes (10 * 2) + views (100 * 0.5) + comments (5 * 1.5)
    // = 20 + 50 + 7.5 = 77.5
    // × recencyFactor for 1 day = 77.5 / (1 + 1/7) ≈ 67.8

    expect(score).toBeGreaterThan(60)
    expect(score).toBeLessThan(80)
    expect(Math.round(score * 10) / 10).toBe(67.8)
  })

  // ✅ TEST: Recency factor works
  it('should apply 7-day half-life correctly', () => {
    const now = Date.now()
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
    const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000

    const { trendingScore: scoreAt7Days } = calculateTrendingScore(
      100, 100, 0, sevenDaysAgo, now
    )
    const { trendingScore: scoreAt14Days } = calculateTrendingScore(
      100, 100, 0, fourteenDaysAgo, now
    )

    // 7 days old: recency factor = 1/(1 + 7/7) = 0.5
    // 14 days old: recency factor = 1/(1 + 14/7) = 1/3 ≈ 0.33
    expect(scoreAt14Days).toBeLessThan(scoreAt7Days)
    expect(Math.round(scoreAt14Days / scoreAt7Days * 100) / 100).toBe(0.67) // 0.333 / 0.5 = 0.666
  })

  // ✅ TEST: Older items ranked lower
  it('should rank older items lower', () => {
    const now = Date.now()
    const newItem = { likeCount: 5, viewCount: 5, commentCount: 0, createdAt: now }
    const oldItem = { likeCount: 5, viewCount: 5, commentCount: 0, createdAt: now - 30 * 24 * 60 * 60 * 1000 }

    const { trendingScore: newScore } = calculateTrendingScore(
      newItem.likeCount, newItem.viewCount, newItem.commentCount, newItem.createdAt, now
    )
    const { trendingScore: oldScore } = calculateTrendingScore(
      oldItem.likeCount, oldItem.viewCount, oldItem.commentCount, oldItem.createdAt, now
    )

    expect(newScore).toBeGreaterThan(oldScore)
  })
})
