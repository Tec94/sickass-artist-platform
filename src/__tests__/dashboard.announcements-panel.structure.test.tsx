import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { DashboardAnnouncementsPanel } from '../components/Dashboard/DashboardAnnouncementsPanel'

vi.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

describe('dashboard announcements panel', () => {
  it('renders recent announcements as links to chat', () => {
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
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('dashboard.announcements.title')).toBeInTheDocument()
    expect(screen.getByText('Server maintenance starts tonight.')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /ROA Team/i }).some((node) => node.getAttribute('href') === '/chat')).toBe(true)
  })

  it('renders empty state when no announcements are available', () => {
    render(
      <MemoryRouter>
        <DashboardAnnouncementsPanel announcements={[]} />
      </MemoryRouter>,
    )

    expect(screen.getByText('dashboard.announcements.empty')).toBeInTheDocument()
  })
})

