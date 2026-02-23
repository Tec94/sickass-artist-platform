import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { DashboardAnnouncementsPanel } from '../components/Dashboard/DashboardAnnouncementsPanel'

vi.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

describe('dashboard announcements panel', () => {
  it('renders announcements plus the embedded forum activity window', () => {
    render(
      <MemoryRouter>
        <DashboardAnnouncementsPanel
          announcements={[
            {
              _id: 'a1',
              content: 'Server maintenance starts tonight.',
              authorDisplayName: 'ROA Team',
              createdAt: Date.now() - 10 * 60 * 1000,
            },
          ]}
          forumThreads={[
            {
              _id: 'thread-1',
              title: 'Forum thread',
              replyCount: 3,
              netVoteCount: 2,
              viewCount: 12,
              createdAt: Date.now(),
            },
          ]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('dashboard.announcements.title')).toBeInTheDocument()
    expect(screen.getByText('dashboard.forumActivity.title')).toBeInTheDocument()
    expect(screen.getByText('dashboard.announcements.latestBadge')).toBeInTheDocument()
    expect(screen.getByText('Server maintenance starts tonight.')).toBeInTheDocument()
    expect(screen.getAllByRole('link').some((node) => node.getAttribute('href') === '/chat')).toBe(true)
  })

  it('shows only the latest four announcements in the left column', () => {
    const now = Date.now()

    render(
      <MemoryRouter>
        <DashboardAnnouncementsPanel
          announcements={[
            {
              _id: 'oldest',
              content: 'Oldest should be dropped from the left list.',
              authorDisplayName: 'Team A',
              createdAt: now - 70 * 60 * 1000,
            },
            {
              _id: 'newest',
              content: 'Newest item',
              authorDisplayName: 'Team B',
              createdAt: now - 5 * 60 * 1000,
            },
            {
              _id: 'second',
              content: 'Second item',
              authorDisplayName: 'Team C',
              createdAt: now - 20 * 60 * 1000,
            },
            {
              _id: 'third',
              content: 'Third item',
              authorDisplayName: 'Team D',
              createdAt: now - 30 * 60 * 1000,
            },
            {
              _id: 'fourth',
              content: 'Fourth item',
              authorDisplayName: 'Team E',
              createdAt: now - 40 * 60 * 1000,
            },
          ]}
          forumThreads={[]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Newest item')).toBeInTheDocument()
    expect(screen.getByText('Second item')).toBeInTheDocument()
    expect(screen.getByText('Third item')).toBeInTheDocument()
    expect(screen.getByText('Fourth item')).toBeInTheDocument()
    expect(screen.queryByText('Oldest should be dropped from the left list.')).not.toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'dashboard.announcements.title' })).toBeInTheDocument()
  })

  it('renders empty state when no announcements are available', () => {
    render(
      <MemoryRouter>
        <DashboardAnnouncementsPanel announcements={[]} />
      </MemoryRouter>,
    )

    expect(screen.getByText('dashboard.announcements.empty')).toBeInTheDocument()
    expect(screen.getByText('dashboard.forumActivity.empty')).toBeInTheDocument()
  })
})
