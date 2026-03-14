import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { useQuery } from 'convex/react'
import { Ranking } from '../pages/Ranking'

vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
}))

vi.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('../hooks/useReducedMotionPreference', () => ({
  useReducedMotionPreference: () => ({ prefersReducedMotion: true, motionClassName: 'motion-reduce' }),
}))

vi.mock('../components/Leaderboard/SongRankingWidget', () => ({
  SongRankingWidget: () => <div data-testid="song-ranking-widget" />,
}))

vi.mock('../components/Leaderboard/UserRankingsFeed', () => ({
  UserRankingsFeed: () => <div data-testid="user-rankings-feed" />,
}))

vi.mock('../components/Leaderboard/RankingPeriodTabs', () => ({
  RankingPeriodTabs: ({ period, onChange }: { period: string; onChange: (next: any) => void }) => (
    <div>
      <button onClick={() => onChange('weekly')}>period-weekly-{period}</button>
      <button onClick={() => onChange('monthly')}>period-monthly-{period}</button>
    </div>
  ),
}))

describe('ranking redesign board', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useQuery).mockImplementation((...params) => {
      const args = params[1]
      if (args === 'skip') return undefined as never
      if (!args) return undefined as never

      const payload = args as Record<string, unknown>

      if ('limit' in payload) {
        if (payload.period === 'monthly') {
          return [
            {
              rank: 1,
              spotifyTrackId: 'track-m-1',
              songTitle: 'Monthly Signal',
              songArtist: 'ROA',
              albumCover: '/monthly.jpg',
              totalScore: 92.4,
              uniqueVoters: 54,
            },
          ] as never
        }

        return [
          {
            rank: 1,
            spotifyTrackId: 'track-a',
            songTitle: 'Alpha Echo',
            songArtist: 'ROA',
            albumCover: '/alpha.jpg',
            totalScore: 88.1,
            uniqueVoters: 42,
          },
          {
            rank: 2,
            spotifyTrackId: 'track-b',
            songTitle: 'Beta Noise',
            songArtist: 'ROA',
            albumCover: '/beta.jpg',
            totalScore: 80.6,
            uniqueVoters: 39,
          },
        ] as never
      }

      if ('points' in payload) {
        return [] as never
      }

      if ('spotifyTrackId' in payload) {
        const id = payload.spotifyTrackId as string
        if (id === 'track-b') {
          return {
            spotifyTrackId: 'track-b',
            period: payload.period,
            leaderboardId: 'weekly-board',
            rank: 2,
            totalScore: 80.6,
            uniqueVoters: 39,
            songTitle: 'Beta Noise',
            songArtist: 'ROA',
            albumCover: '/beta.jpg',
            totalMentions: 17,
            top3Mentions: 8,
            averageRank: 2.6,
            recentMentions: 11,
            totalSubmissionUpvotes: 47,
            contributors: 22,
            aheadTrack: null,
            behindTrack: null,
            updatedAt: Date.now(),
          } as never
        }

        if (id === 'track-m-1') {
          return {
            spotifyTrackId: 'track-m-1',
            period: payload.period,
            leaderboardId: 'monthly-board',
            rank: 1,
            totalScore: 92.4,
            uniqueVoters: 54,
            songTitle: 'Monthly Signal',
            songArtist: 'ROA',
            albumCover: '/monthly.jpg',
            totalMentions: 30,
            top3Mentions: 19,
            averageRank: 1.8,
            recentMentions: 22,
            totalSubmissionUpvotes: 80,
            contributors: 35,
            aheadTrack: null,
            behindTrack: null,
            updatedAt: Date.now(),
          } as never
        }

        return {
          spotifyTrackId: 'track-a',
          period: payload.period,
          leaderboardId: 'weekly-board',
          rank: 1,
          totalScore: 88.1,
          uniqueVoters: 42,
          songTitle: 'Alpha Echo',
          songArtist: 'ROA',
          albumCover: '/alpha.jpg',
          totalMentions: 23,
          top3Mentions: 14,
          averageRank: 1.9,
          recentMentions: 16,
          totalSubmissionUpvotes: 61,
          contributors: 28,
          aheadTrack: null,
          behindTrack: null,
          updatedAt: Date.now(),
        } as never
      }

      return undefined as never
    })
  })

  it('updates detail panel when selecting rows and supports period switching with sparkline fallback', async () => {
    const { container } = render(<Ranking />)

    expect(screen.getAllByText('Alpha Echo').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Beta Noise').length).toBeGreaterThan(0)
    expect(screen.getAllByText('88.10 / 10').length).toBeGreaterThan(0)
    expect(screen.getByText('ranking.listenNow')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Beta Noise/i }))

    await waitFor(() => {
      expect(screen.getAllByText('Beta Noise').length).toBeGreaterThan(0)
    })

    fireEvent.click(screen.getByRole('button', { name: /period-monthly-weekly/i }))

    await waitFor(() => {
      expect(screen.getAllByText('Monthly Signal').length).toBeGreaterThan(0)
    })

    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
