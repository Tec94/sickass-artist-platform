import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import RankingSubmission from '../pages/StitchPrototypes/RankingSubmission'

vi.mock('../components/Navigation/SharedNavbar', () => ({
  default: () => <div>Shared Navbar</div>,
}))

vi.mock('../features/artistContent', () => ({
  useArtistContent: () => ({
    content: {
      artistName: 'ROA',
      instagram: {
        posts: [{ id: 'post-1', thumbnailUrl: 'https://example.com/post.jpg', caption: 'Campaign signal', description: 'Campaign signal' }],
      },
      spotify: {
        latestRelease: { id: 'release-1', name: 'WO OH OH', type: 'Single', year: '2026', embedUrl: 'https://open.spotify.com/embed/album/1' },
        popularTracks: [
          { id: 'track-1', name: 'WO OH OH', streams: 4123888, url: 'https://open.spotify.com/track/1' },
          { id: 'track-2', name: 'FANTASIA', streams: 89261593, url: 'https://open.spotify.com/track/2' },
        ],
        releases: [
          { id: 'release-1', name: 'WO OH OH', type: 'Single', year: '2026', url: 'https://open.spotify.com/album/1', embedUrl: 'https://open.spotify.com/embed/album/1' },
        ],
      },
    },
  }),
}))

describe('RankingSubmission prototype', () => {
  it('builds a ranked archive from the synced ROA track pool', () => {
    render(
      <MemoryRouter>
        <RankingSubmission />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('ranking-submission-shell')).toHaveClass(
      'xl:flex-row',
      'xl:overflow-hidden',
    )
    expect(screen.getByTestId('ranking-submission-left-pane')).toHaveClass(
      'xl:overflow-y-auto',
      'xl:overscroll-contain',
    )
    expect(screen.getByTestId('ranking-submission-right-pane')).toHaveClass(
      'xl:overflow-y-auto',
      'xl:overscroll-contain',
    )
    expect(screen.getByText('Submit Your Rankings')).toBeInTheDocument()
    expect(screen.getAllByText('WO OH OH').length).toBeGreaterThan(0)
    expect(screen.queryByText('Midnight City')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to rankings/i })).toHaveAttribute('href', '/rankings')

    fireEvent.click(screen.getByRole('button', { name: /add wo oh oh to ranking/i }))

    expect(screen.getByText('1 / 5 tracks staged')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reorder wo oh oh/i })).toBeInTheDocument()
  })
})
