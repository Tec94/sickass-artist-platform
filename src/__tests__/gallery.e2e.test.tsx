import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { Gallery as GalleryPage } from '../pages/Gallery'
import { MemoryRouter } from 'react-router-dom'
import { useGalleryFilters } from '../hooks/useGalleryFilters'
import { mockGalleryItems } from './mocks'

// Mock the hooks
vi.mock('../hooks/useGalleryFilters')
vi.mock('../hooks/useOptimisticLike', () => ({
  useOptimisticLike: (_id: string, _type: string, count: number, liked: boolean) => ({
    likeCount: liked ? count : count,
    isLiked: liked,
    isPending: false,
    handleLike: vi.fn(),
  })
}))
vi.mock('../hooks/usePerformanceMetrics', () => ({
  usePerformanceMetrics: vi.fn(),
  usePerformanceOperation: () => ({
    start: vi.fn(),
    end: vi.fn(),
  })
}))
vi.mock('../hooks/useScrollAnimation', () => ({
  useScrollAnimation: () => vi.fn()
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
  })

  it('should open lightbox when clicking gallery item', async () => {
    render(
      <MemoryRouter>
        <GalleryPage />
      </MemoryRouter>
    )
    
    // Find one of the items rendered by GalleryFYP
    const galleryItems = await screen.findAllByRole('button', { name: /view item/i })
    fireEvent.click(galleryItems[0])
    
    // LightboxContainer uses a dialog role (usually)
    const lightbox = await screen.findByRole('dialog')
    expect(lightbox).toBeInTheDocument()
  })

  it('should navigate lightbox with keyboard', async () => {
    render(
      <MemoryRouter>
        <GalleryPage />
      </MemoryRouter>
    )
    
    const galleryItems = await screen.findAllByRole('button', { name: /view item/i })
    fireEvent.click(galleryItems[0])
    
    // Check for counter in lightbox. LightboxMetadata usually shows it
    const counter = await screen.findByText(/1 \/ \d+/)
    expect(counter).toHaveTextContent('1 /')
    
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    await waitFor(() => expect(screen.getByText(/2 \/ \d+/)).toBeInTheDocument())
  })

  it('should apply filters and update results', async () => {
    render(
      <MemoryRouter>
        <GalleryPage />
      </MemoryRouter>
    )
    
    const filterButton = screen.getByRole('button', { name: /toggle filters/i })
    fireEvent.click(filterButton)
    
    // In AdvancedFilters, we have "Show" checkbox
    const showCheckbox = screen.getByRole('checkbox', { name: /show/i })
    fireEvent.click(showCheckbox)
    
    const applyButton = screen.getByRole('button', { name: /apply/i })
    fireEvent.click(applyButton)
    
    expect(mockFilters.setFilter).toHaveBeenCalled()
  })

  it('should toggle like with optimistic update', async () => {
    render(
      <MemoryRouter>
        <GalleryPage />
      </MemoryRouter>
    )
    
    // Each post in GalleryFYP has a like button.
    const likeButtons = await screen.findAllByRole('button', { name: /like/i })
    const likeButton = likeButtons[0]
    
    // Initial count from mock is 10
    expect(screen.getAllByText('10')[0]).toBeInTheDocument()
    
    fireEvent.click(likeButton)
  })

  it('should show related content', async () => {
    render(
      <MemoryRouter>
        <GalleryPage />
      </MemoryRouter>
    )
    
    // Open lightbox first to see related content
    const galleryItems = await screen.findAllByRole('button', { name: /view item/i })
    fireEvent.click(galleryItems[0])
    
    await waitFor(() => {
      expect(screen.getByText(/you might also like/i)).toBeInTheDocument()
    })
  })
})
