import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { DashboardOverviewPanel } from '../components/Dashboard/DashboardOverviewPanel'

vi.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

describe('dashboard overview panel', () => {
  it('renders fan snapshot previews, actions, and progression state', () => {
    render(
      <MemoryRouter>
        <DashboardOverviewPanel
          snapshot={{
            isSignedIn: true,
            fetchedAt: Date.UTC(2026, 1, 23, 12, 30, 0),
            featuredAnnouncement: {
              _id: 'note-1',
              content: 'Signal live now for private suite members.',
              authorDisplayName: 'ROA Team',
              createdAt: Date.now() - 15 * 60 * 1000,
            },
            nextEvent: {
              _id: 'event-1',
              title: 'Moonlit Arena Show',
              city: 'Miami',
              startAtUtc: Date.UTC(2026, 2, 1, 2, 0, 0),
            },
            topProduct: {
              _id: 'merch-1',
              name: 'Crimson Crest Jacket',
              price: 12000,
              category: 'apparel',
            },
            forumPosts: [
              {
                _id: 'thread-1',
                title: 'Setlist predictions',
                replyCount: 9,
                createdAt: Date.UTC(2026, 1, 20, 0, 0, 0),
              },
            ],
            fanProgression: {
              memberName: 'Wolf Alpha',
              points: {
                totalPoints: 5400,
                availablePoints: 1200,
                redeemedPoints: 300,
                currentStreak: 7,
                maxStreak: 14,
                lastInteractionDate: Date.now(),
                lastLoginDate: '2026-02-23',
              },
              activeQuests: [
                {
                  progressId: 'progress-1',
                  questId: 'daily_chat_001',
                  name: 'Keep the signal alive',
                  description: 'Send messages',
                  icon: 'solar:chat-line-linear',
                  category: 'social',
                  progress: 13,
                  target: 20,
                  progressPercent: 65,
                  isCompleted: false,
                  pointsClaimed: false,
                  rewardPoints: 50,
                  expiresAt: Date.now() + 3600_000,
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
          }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('dashboard.overview.title')).toBeInTheDocument()
    expect(screen.getByText('dashboard.overview.tonightTitle')).toBeInTheDocument()
    expect(screen.getByText('Wolf Alpha')).toBeInTheDocument()
    expect(screen.getByText('65%')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /dashboard\.overview\.openChat/i })).toHaveAttribute('href', '/chat')
    expect(screen.getByRole('link', { name: /dashboard\.overview\.browseGallery/i })).toHaveAttribute('href', '/gallery')
    expect(screen.getByRole('link', { name: /dashboard\.overview\.viewRankings/i })).toHaveAttribute('href', '/ranking')
    expect(screen.getAllByRole('link', { name: /dashboard\.overview\.viewQuests/i })[0]).toHaveAttribute('href', '/quests')
  })

  it('renders guest progression fallback and sign-in CTA safely', () => {
    render(
      <MemoryRouter>
        <DashboardOverviewPanel
          snapshot={{
            isSignedIn: false,
            fetchedAt: undefined,
            fanProgression: null,
          }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('dashboard.overview.progressionGuestTitle')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /dashboard\.overview\.signInToTrack/i })[0]).toHaveAttribute('href', '/sign-in')
    expect(screen.getAllByText('--').length).toBeGreaterThan(0)
  })
})
