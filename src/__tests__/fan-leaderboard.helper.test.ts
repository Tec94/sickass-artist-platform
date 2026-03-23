import { describe, expect, it } from 'vitest'
import { buildFanLeaderboardEntries } from '../../convex/points'

describe('fan leaderboard helper', () => {
  it('sorts by points first, then streak, and marks the current user', () => {
    const rewards = [
      {
        userId: 'user-1',
        totalPoints: 400,
        availablePoints: 300,
        currentStreak: 3,
        maxStreak: 6,
        lastInteractionDate: 10,
      },
      {
        userId: 'user-2',
        totalPoints: 800,
        availablePoints: 500,
        currentStreak: 2,
        maxStreak: 8,
        lastInteractionDate: 20,
      },
      {
        userId: 'user-3',
        totalPoints: 400,
        availablePoints: 250,
        currentStreak: 8,
        maxStreak: 10,
        lastInteractionDate: 30,
      },
    ] as any

    const users = [
      { _id: 'user-1', displayName: 'Wolf One', username: 'wolf1', avatar: '', fanTier: 'bronze', role: 'fan' },
      { _id: 'user-2', displayName: 'Wolf Two', username: 'wolf2', avatar: '', fanTier: 'gold', role: 'fan' },
      { _id: 'user-3', displayName: 'Wolf Three', username: 'wolf3', avatar: '', fanTier: 'silver', role: 'fan' },
    ] as any

    const entries = buildFanLeaderboardEntries(rewards, users, 'user-3' as any)

    expect(entries.map((entry) => entry.userId)).toEqual(['user-2', 'user-3', 'user-1'])
    expect(entries[1]?.isCurrentUser).toBe(true)
    expect(entries[1]?.statusLabel).toBe('Hot streak')
    expect(entries[0]?.rank).toBe(1)
    expect(entries[2]?.rank).toBe(3)
  })
})
