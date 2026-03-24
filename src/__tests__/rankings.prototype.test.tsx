import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Rankings from '../pages/StitchPrototypes/Rankings'

const { mockUseQuery } = vi.hoisted(() => ({
  mockUseQuery: vi.fn(),
}))

vi.mock('convex/react', () => ({
  useQuery: mockUseQuery,
}))

vi.mock('../components/Navigation/SharedNavbar', () => ({
  default: () => <div>Shared Navbar</div>,
}))

vi.mock('../features/artistContent', () => ({
  useArtistContent: () => ({
    isLoading: false,
    content: {
      artistName: 'ROA',
      scrapeDate: '2026-02-24T20:01:34-06:00',
      freshness: { ageDays: 4, isStale: false },
      instagram: {
        followersLabel: '2.3M',
        posts: [{ id: 'post-1', thumbnailUrl: 'https://example.com/post.jpg', caption: 'Signal', description: 'Signal', url: 'https://example.com' }],
      },
      spotify: {
        monthlyListeners: 14352933,
        topTrack: { id: 'track-1', name: 'WO OH OH', streams: 4123888 },
        latestRelease: { id: 'release-1', name: 'WO OH OH', type: 'Single', year: '2026' },
        popularTracks: [{ id: 'track-1', name: 'WO OH OH', streams: 4123888 }],
      },
    },
  }),
}))

describe('Rankings prototype', () => {
  beforeEach(() => {
    mockUseQuery.mockImplementation((_query, args) => {
      if (args === 'skip') return undefined

      if (args && typeof args === 'object' && 'period' in args) {
        return [
          {
            rank: 1,
            _id: 'weekly:track-1',
            leaderboardId: 'weekly',
            period: 'weekly',
            spotifyTrackId: 'track-1',
            songTitle: 'North Gate',
            songArtist: 'ROA',
            albumCover: 'https://example.com/cover.jpg',
            totalScore: 9.7,
            uniqueVoters: 54,
            updatedAt: Date.now(),
          },
        ]
      }

      return {
        entries: [
          {
            rank: 1,
            userId: 'alpha',
            displayName: 'Pack Hero',
            username: 'alpha',
            avatar: null,
            fanTier: 'gold',
            role: 'fan',
            totalPoints: 5600,
            availablePoints: 2400,
            currentStreak: 8,
            maxStreak: 12,
            lastInteractionDate: 1,
            statusLabel: 'Hot streak',
            isCurrentUser: true,
          },
        ],
        currentUserEntry: {
          rank: 1,
          userId: 'alpha',
          displayName: 'Pack Hero',
          username: 'alpha',
          avatar: null,
          fanTier: 'gold',
          role: 'fan',
          totalPoints: 5600,
          availablePoints: 2400,
          currentStreak: 8,
          maxStreak: 12,
          lastInteractionDate: 1,
          statusLabel: 'Hot streak',
          isCurrentUser: true,
        },
        fetchedAt: Date.now(),
      }
    })
  })

  it('renders member standings, song championship, and the submission portal access point', () => {
    render(
      <MemoryRouter>
        <Rankings />
      </MemoryRouter>,
    )

    expect(screen.getByText('Pack Rankings')).toBeInTheDocument()
    expect(screen.getAllByText('Pack Hero').length).toBeGreaterThan(0)
    expect(screen.getByText(/^current release$/i)).toBeInTheDocument()
    expect(screen.getAllByText('WO OH OH').length).toBeGreaterThan(0)
    expect(screen.getByText(/gold tier/i)).toBeInTheDocument()
    expect(screen.queryByText('Hot streak')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ranking submission portal/i })).toHaveAttribute('href', '/ranking-submission')

    fireEvent.click(screen.getByRole('tab', { name: /song championship/i }))

    expect(screen.getAllByText('North Gate').length).toBeGreaterThan(0)
    expect(screen.getByText('54 voters')).toBeInTheDocument()
    expect(screen.getByText('Score')).toBeInTheDocument()
  })
})
