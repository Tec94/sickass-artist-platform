import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Rankings from '../pages/StitchPrototypes/Rankings'

vi.mock('convex/react', () => ({
  useQuery: vi.fn(() => ({
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
        isCurrentUser: false,
      },
    ],
    currentUserEntry: null,
    fetchedAt: Date.now(),
  })),
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
  it('renders fan standings with artist pulse context', () => {
    render(
      <MemoryRouter>
        <Rankings />
      </MemoryRouter>,
    )

    expect(screen.getByText('Pack Rankings')).toBeInTheDocument()
    expect(screen.getByText('Pack Hero')).toBeInTheDocument()
    expect(screen.getByText('Current release')).toBeInTheDocument()
    expect(screen.getAllByText('WO OH OH').length).toBeGreaterThan(0)
    expect(screen.getByText('Gold')).toBeInTheDocument()
    expect(screen.queryByText('Hot streak')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /submit your rankings/i })).toHaveAttribute('href', '/ranking-submission')
  })
})
