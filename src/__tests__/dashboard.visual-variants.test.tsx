import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { Dashboard } from '../pages/Dashboard'
import {
  DASHBOARD_VARIANT_STORAGE_KEY,
  parseDashboardVisualVariant,
} from '../components/Dashboard/dashboardVisualVariants'

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
  CinematicHero: ({ visualVariant }: { visualVariant?: string }) => (
    <section data-testid="cinematic-hero" data-variant={visualVariant} />
  ),
}))

vi.mock('../components/Leaderboard/LiveLeaderboard', () => ({
  LiveLeaderboard: ({ variant }: { variant?: string }) => <div data-testid="live-leaderboard" data-variant={variant} />,
}))

vi.mock('../components/Leaderboard/SongRankingWidget', () => ({
  SongRankingWidget: ({ variant }: { variant?: string }) => <div data-testid="song-ranking-widget" data-variant={variant} />,
}))

vi.mock('../components/Leaderboard/UserRankingsFeed', () => ({
  UserRankingsFeed: ({ variant }: { variant?: string }) => <div data-testid="user-rankings-feed" data-variant={variant} />,
}))

vi.mock('../components/Leaderboard/RankingPeriodTabs', () => ({
  RankingPeriodTabs: ({ variant }: { variant?: string }) => <div data-testid="ranking-period-tabs" data-variant={variant} />,
}))

vi.mock('../components/ui/LogoSlider', () => ({
  LogoSlider: () => <div>LogoSlider</div>,
}))

describe('dashboard visual variants', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('parses known variants and falls back to ranking-nocturne', () => {
    expect(parseDashboardVisualVariant('forum-ops')).toBe('forum-ops')
    expect(parseDashboardVisualVariant('curated-shop')).toBe('curated-shop')
    expect(parseDashboardVisualVariant('ranking-nocturne')).toBe('ranking-nocturne')
    expect(parseDashboardVisualVariant('invalid')).toBe('ranking-nocturne')
    expect(parseDashboardVisualVariant(null)).toBe('ranking-nocturne')
  })

  it('uses default variant and hides switcher when review mode is off', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>,
    )

    const root = container.querySelector('[data-dashboard-visual-variant]')
    expect(root).toHaveAttribute('data-dashboard-visual-variant', 'ranking-nocturne')
    expect(root).toHaveAttribute('data-dashboard-design-lab', 'false')
    expect(screen.queryByLabelText('Dashboard design review switcher')).not.toBeInTheDocument()
    expect(screen.getByTestId('cinematic-hero')).toHaveAttribute('data-variant', 'ranking-nocturne')
    expect(screen.getByTestId('ranking-period-tabs')).toHaveAttribute('data-variant', 'ranking-nocturne')
    expect(screen.getByRole('link', { name: /dashboard\.joinDiscussion/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /dashboard\.viewAllThreads/i })).not.toBeInTheDocument()
  })

  it('shows switcher and propagates selected variant when query params are present', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard?dashboardDesignLab=1&dashboardVariant=curated-shop']}>
        <Dashboard />
      </MemoryRouter>,
    )

    const root = container.querySelector('[data-dashboard-visual-variant]')
    expect(root).toHaveAttribute('data-dashboard-visual-variant', 'curated-shop')
    expect(root).toHaveAttribute('data-dashboard-design-lab', 'true')
    expect(screen.getByLabelText('Dashboard design review switcher')).toBeInTheDocument()
    expect(screen.getByTestId('live-leaderboard')).toHaveAttribute('data-variant', 'curated-shop')
    expect(screen.getByTestId('user-rankings-feed')).toHaveAttribute('data-variant', 'curated-shop')
  })

  it('treats invalid query variant as default even when local storage has a valid value', () => {
    window.localStorage.setItem(DASHBOARD_VARIANT_STORAGE_KEY, 'ranking-nocturne')

    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard?dashboardVariant=bad-value']}>
        <Dashboard />
      </MemoryRouter>,
    )

    const root = container.querySelector('[data-dashboard-visual-variant]')
    expect(root).toHaveAttribute('data-dashboard-visual-variant', 'ranking-nocturne')
  })
})
