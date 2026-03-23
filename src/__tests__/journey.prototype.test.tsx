import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Journey from '../pages/StitchPrototypes/Journey'

vi.mock('convex/react', () => ({
  useQuery: vi.fn(() => ({
    topMerch: [
      {
        _id: 'product-1',
        name: 'Private Suit Capsule',
        price: 12000,
      },
    ],
    recentAnnouncements: [
      {
        _id: 'announcement-1',
        content: 'The member wing is carrying the latest campaign notes tonight.',
      },
    ],
    upcomingEvents: [
      {
        _id: 'event-1',
        title: 'ROA House Show',
        startAtUtc: Date.parse('2026-04-18T19:00:00Z'),
        city: 'Chicago',
      },
    ],
    fanProgression: {
      memberName: 'Wolf Member',
      points: {
        totalPoints: 5400,
        availablePoints: 1200,
        redeemedPoints: 500,
        currentStreak: 7,
        maxStreak: 14,
        lastInteractionDate: null,
        lastLoginDate: '2026-03-20',
      },
      activeQuests: [
        {
          progressId: 'quest-progress-1',
          questId: 'quest-1',
          name: 'First Listen',
          description: 'Listen once',
          icon: 'x',
          category: 'music',
          progress: 2,
          target: 3,
          progressPercent: 67,
          isCompleted: false,
          pointsClaimed: false,
          rewardPoints: 50,
          expiresAt: Date.now() + 1000,
          type: 'daily',
        },
      ],
      questSummary: {
        activeCount: 1,
        claimableCount: 0,
        dailyCount: 1,
        weeklyCount: 0,
      },
    },
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
      instagram: {
        followersLabel: '2.3M',
        posts: [{ id: 'post-1', thumbnailUrl: 'https://example.com/post.jpg', caption: 'Campaign signal', description: 'Campaign signal' }],
      },
      spotify: {
        monthlyListeners: 14352933,
        latestRelease: { id: 'release-1', name: 'WO OH OH', type: 'Single', year: '2026' },
      },
    },
  }),
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    isSignedIn: true,
  }),
}))

vi.mock('../pages/LandingPage', () => ({
  LandingPage: ({ onVisibleRegionChange }: { onVisibleRegionChange?: (region: any) => void }) => {
    const React = require('react') as typeof import('react')
    React.useEffect(() => {
      onVisibleRegionChange?.({
        id: 'campaign',
        label: 'Current Release',
        journeyLabel: 'Campaign',
        locationLabel: 'Center Plaza',
        subtitle: 'Featured Campaign',
        preview: 'Featured release, campaign focus, and the live callout axis.',
        route: '/campaign',
        authRequired: false,
      })
    }, [onVisibleRegionChange])
    return <div>Estate Map</div>
  },
}))

describe('Journey prototype', () => {
  it('renders a live chapter ledger instead of the old progression console', () => {
    const { container } = render(
      <MemoryRouter>
        <Journey />
      </MemoryRouter>,
    )

    expect(screen.getByText('Open destinations')).toBeInTheDocument()
    expect(screen.getByText('Campaign')).toBeInTheDocument()
    expect(screen.getByText('Events')).toBeInTheDocument()
    expect(screen.getByText('Store')).toBeInTheDocument()
    expect(screen.queryByText('Journey Console')).not.toBeInTheDocument()
    expect(screen.queryByText('Progression')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /open campaign/i })).toBeInTheDocument()
    expect(screen.getByText(/private suit capsule/i)).toBeInTheDocument()

    const returnLink = screen.getByRole('link', { name: /return/i })
    expect(returnLink.parentElement).toHaveClass('h-10')
    expect(returnLink.parentElement).not.toHaveClass('h-[72px]')

    const scrollRegion = container.querySelector('.overflow-y-auto')
    expect(scrollRegion).toHaveClass('min-h-0')

    const campaignButton = screen.getByText('Campaign').closest('button')
    expect(campaignButton).toHaveClass('px-3')
  })
})
