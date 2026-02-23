import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { DashboardForumActivity } from '../components/Dashboard/DashboardForumActivity'

vi.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

describe('dashboard forum activity', () => {
  it('renders forum metrics rows with thread links', () => {
    render(
      <MemoryRouter>
        <DashboardForumActivity
          threads={[
            {
              _id: 'thread-1',
              title: 'How should we organize the next community playlist?',
              replyCount: 14,
              netVoteCount: 7,
              viewCount: 930,
              createdAt: Date.now(),
            },
          ]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('dashboard.forumActivity.title')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /How should we organize/i })).toHaveAttribute('href', '/forum/thread/thread-1')
    expect(screen.getByText('14')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('930')).toBeInTheDocument()
  })

  it('renders empty state when no threads are available', () => {
    render(
      <MemoryRouter>
        <DashboardForumActivity threads={[]} />
      </MemoryRouter>,
    )

    expect(screen.getByText('dashboard.forumActivity.empty')).toBeInTheDocument()
  })
})

