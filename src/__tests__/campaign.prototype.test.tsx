import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Campaign from '../pages/StitchPrototypes/Campaign'

vi.mock('../components/Navigation/SharedNavbar', () => ({
  default: () => <div>Shared Navbar</div>,
}))

vi.mock('../features/artistContent', () => ({
  useArtistContent: () => ({
    isLoading: false,
    content: {
      artistName: 'ROA',
      freshness: { ageDays: 26, isStale: true },
      instagram: {
        followersLabel: '2.3M',
        posts: [
          {
            id: 'post-1',
            thumbnailUrl: 'https://example.com/post.jpg',
            caption: 'Yo creo que ya es hora... Tamos ready PR? pr',
            description: 'Promotion for a show',
          },
        ],
      },
      spotify: {
        monthlyListeners: 14352933,
        topTrack: { id: 'track-1', name: 'YOGURCITO REMIX (feat. Kris R., ROA)' },
        latestRelease: {
          id: 'release-1',
          name: 'WO OH OH',
          type: 'Single',
          year: '2026',
          embedUrl: 'https://open.spotify.com/embed/album/1',
          url: 'https://open.spotify.com/album/1',
        },
        relatedArtists: [{ id: 'artist-1', name: 'Luar La L', url: 'https://example.com/artist' }],
      },
    },
  }),
}))

describe('Campaign prototype', () => {
  it('renders a scrollable campaign shell with rebalanced top metrics', () => {
    const { container } = render(
      <MemoryRouter>
        <Campaign />
      </MemoryRouter>,
    )

    expect(screen.getByText('Current release campaign')).toBeInTheDocument()
    expect(screen.getByText('Listeners')).toBeInTheDocument()
    expect(screen.getByText('Followers')).toBeInTheDocument()
    expect(screen.getByText('Top track')).toBeInTheDocument()
    expect(screen.getByText('Recent social proof')).toBeInTheDocument()
    expect(container.querySelector('main')).toHaveClass('overflow-y-auto')
  })
})
