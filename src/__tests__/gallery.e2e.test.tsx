import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { Gallery as GalleryPage } from '../pages/Gallery'
import { useGalleryFilters } from '../hooks/useGalleryFilters'
import { mockGalleryItems } from './mocks'

vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}))

vi.mock('../hooks/useGalleryFilters')
vi.mock('../hooks/useAnalytics', () => ({
  useAnalytics: vi.fn(),
}))
vi.mock('../hooks/usePerformanceMetrics', () => ({
  usePerformanceMetrics: vi.fn(),
  usePerformanceOperation: () => ({ start: vi.fn(), end: vi.fn() }),
}))
vi.mock('../hooks/useScrollAnimation', () => ({
  useScrollAnimation: () => vi.fn(),
}))
vi.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock('../hooks/useReducedMotionPreference', () => ({
  useReducedMotionPreference: () => ({ prefersReducedMotion: true, motionClassName: 'motion-reduce' }),
}))
vi.mock('../pages/galleryState', async () => {
  const actual = await vi.importActual('../pages/galleryState')
  return {
    ...actual,
    openGalleryLightbox: () => 0,
  }
})

vi.mock('../components/Gallery/AdvancedFilters', () => ({
  AdvancedFilters: () => <div>advanced-filters</div>,
}))
vi.mock('../components/Gallery/FilterChips', () => ({
  FilterChips: () => <div>filter-chips</div>,
}))
vi.mock('../components/SocialGallery', () => ({
  SocialGallery: () => <div>social-gallery</div>,
}))
vi.mock('../components/Gallery/GalleryFYP', () => ({
  GalleryFYP: ({ onItemClick }: { onItemClick?: (index: number) => void }) => (
    <button type="button" onClick={() => onItemClick?.(0)}>
      open-lightbox
    </button>
  ),
}))
vi.mock('../components/Gallery/LightboxContainer', () => ({
  LightboxContainer: ({ onClose }: { onClose: () => void }) => (
    <div role="dialog">
      <button type="button" onClick={onClose}>
        close-lightbox
      </button>
    </div>
  ),
}))
vi.mock('../components/Performance/PerformanceDashboard', () => ({
  PerformanceDashboard: () => null,
}))

describe('Gallery E2E Tests', () => {
  const mockFilters = {
    filters: {
      types: [],
      dateRange: 'all',
      creatorId: null,
      fanTier: 'all',
      tags: [],
      sortBy: 'newest',
      page: 0,
    },
    setFilter: vi.fn(),
    clearFilter: vi.fn(),
    queryResult: {
      items: mockGalleryItems,
      total: mockGalleryItems.length,
      hasMore: false,
    },
    appliedCount: 0,
    isActive: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useGalleryFilters).mockReturnValue(mockFilters as unknown as ReturnType<typeof useGalleryFilters>)
    vi.mocked(useQuery).mockReturnValue(undefined as never)
    vi.mocked(useMutation).mockReturnValue(vi.fn().mockResolvedValue(undefined) as never)
  })

  it('opens and closes lightbox from the feed', async () => {
    render(
      <MemoryRouter>
        <GalleryPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'open-lightbox' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'close-lightbox' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('applies content type filter from redesigned toolbar tabs', () => {
    render(
      <MemoryRouter>
        <GalleryPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'gallery.show' }))
    expect(mockFilters.setFilter).toHaveBeenCalledWith('types', ['show'])
  })

  it('switches between artist and community tabs', () => {
    render(
      <MemoryRouter>
        <GalleryPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'gallery.community' }))
    expect(screen.getByText('social-gallery')).toBeInTheDocument()
  })

  it('toggles layout mode control label', () => {
    render(
      <MemoryRouter>
        <GalleryPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'gallery.gridMode' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'gallery.gridMode' }))
    expect(screen.getByRole('button', { name: 'gallery.feedMode' })).toBeInTheDocument()
  })

  it('reveals filter rail in artist mode', () => {
    render(
      <MemoryRouter>
        <GalleryPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'gallery.filtersLabel' }))
    expect(screen.getByText('advanced-filters')).toBeInTheDocument()
  })
})
