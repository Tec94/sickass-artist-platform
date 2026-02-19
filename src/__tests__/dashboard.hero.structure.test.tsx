import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { Dashboard } from '../pages/Dashboard'

vi.mock('convex/react', () => ({
  useQuery: () => ({
    hardeningV1: false,
    headerCollapseV1: false,
    contentHygieneV1: false,
    upcomingEvents: [
      {
        _id: 'event-1',
        title: 'Moonlit Arena Show',
        city: 'Miami',
        startAtUtc: Date.now(),
        imageUrl: null,
      },
    ],
    topMerch: [
      {
        _id: 'merch-1',
        name: 'Crimson Crest Jacket',
        price: 12000,
        category: 'apparel',
        image: null,
      },
    ],
    trendingForum: [
      {
        _id: 'thread-1',
        title: 'Setlist predictions',
        replyCount: 9,
        createdAt: Date.now(),
      },
    ],
    recentAnnouncements: [
      {
        _id: 'note-1',
        content: 'Signal live now for private suite members.',
        authorDisplayName: 'ROA Team',
      },
    ],
  }),
}))

vi.mock('../hooks/useAnalytics', () => ({
  useAnalytics: vi.fn(),
}))

vi.mock('../contexts/UserContext', () => ({
  useUser: () => ({ isSignedIn: true }),
}))

vi.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('../components/Dashboard/CinematicHero', () => ({
  CinematicHero: () => <section data-testid="cinematic-hero" />,
}))

vi.mock('../components/Leaderboard/LiveLeaderboard', () => ({
  LiveLeaderboard: () => <div>LiveLeaderboard</div>,
}))

vi.mock('../components/Leaderboard/SongRankingWidget', () => ({
  SongRankingWidget: () => <div>SongRankingWidget</div>,
}))

vi.mock('../components/Leaderboard/UserRankingsFeed', () => ({
  UserRankingsFeed: () => <div>UserRankingsFeed</div>,
}))

vi.mock('../components/Leaderboard/RankingPeriodTabs', () => ({
  RankingPeriodTabs: () => <div>RankingPeriodTabs</div>,
}))

vi.mock('../components/ui/LogoSlider', () => ({
  LogoSlider: () => <div>LogoSlider</div>,
}))

describe('dashboard hero structure', () => {
  it('renders a single cinematic hero and keeps dashboard widgets accessible', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    )

    expect(screen.getAllByTestId('cinematic-hero')).toHaveLength(1)
    expect(screen.queryByText('PRIVATE SUITE.')).not.toBeInTheDocument()
    expect(screen.queryByText(/Enter Private Suite/i)).not.toBeInTheDocument()
    expect(screen.getByText('dashboard.liveSignalScreensTitle')).toBeInTheDocument()
  })
})
