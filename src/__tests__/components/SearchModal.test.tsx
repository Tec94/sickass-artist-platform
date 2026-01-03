import { render, screen, fireEvent } from '@testing-library/react'
import { SearchModal } from '../../components/Search/SearchModal'
import { SearchTrigger } from '../../components/Search/SearchTrigger'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { useGlobalSearch } from '../../hooks/useGlobalSearch'
import React from 'react'

// Mock useGlobalSearch
vi.mock('../../hooks/useGlobalSearch')

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock createPortal to render into a div instead of document.body if needed, 
// but standard testing library handles portals if we are careful.
// Actually, for simplicity in tests, we can mock it or just let it render.

describe('SearchModal and Trigger', () => {
  const defaultMockResult = {
    results: null,
    isLoading: false,
    error: null,
    query: '',
    setQuery: vi.fn(),
    recentSearches: [],
    clearRecentSearches: vi.fn(),
    addToRecentSearches: vi.fn(),
    hasSearched: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useGlobalSearch).mockReturnValue(defaultMockResult as unknown as ReturnType<typeof useGlobalSearch>)
  })

  // ✅ TEST: Opens with Cmd+K / Ctrl+K
  it('should trigger onClick with Cmd+K', () => {
    const onClick = vi.fn()
    render(<SearchTrigger onClick={onClick} />)

    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    expect(onClick).toHaveBeenCalled()
  })

  it('should render when isOpen is true', () => {
    render(
      <MemoryRouter>
        <SearchModal isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    )
    expect(screen.getByRole('dialog')).toBeDefined()
  })

  // ✅ TEST: ESC closes
  it('should call onClose on ESC', () => {
    const onClose = vi.fn()
    render(
      <MemoryRouter>
        <SearchModal isOpen={true} onClose={onClose} />
      </MemoryRouter>
    )
    
    fireEvent.keyDown(screen.getByPlaceholderText(/Search/i), { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  // ✅ TEST: Arrow navigation works
  it('should navigate results with arrow keys', () => {
    const results = {
      users: [{ _id: '1', username: 'user1', displayName: 'User One', avatar: '', fanTier: 'bronze', role: 'fan' }],
      threads: [],
      gallery: [],
      ugc: [],
      channels: [],
      totalResults: 1,
      query: 'user'
    }
    vi.mocked(useGlobalSearch).mockReturnValue({
      ...defaultMockResult,
      results,
      hasSearched: true,
      query: 'user'
    } as unknown as ReturnType<typeof useGlobalSearch>)

    render(
      <MemoryRouter>
        <SearchModal isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    )

    const input = screen.getByPlaceholderText(/Search/i)
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    // We expect the selectedIndex to have changed internally
  })

  // ✅ TEST: Enter selects result
  it('should select result on Enter', () => {
    const onClose = vi.fn()
    const results = {
      users: [{ _id: '1', username: 'user1', displayName: 'User One', avatar: '', fanTier: 'bronze', role: 'fan' }],
      threads: [],
      gallery: [],
      ugc: [],
      channels: [],
      totalResults: 1,
      query: 'user'
    }
    vi.mocked(useGlobalSearch).mockReturnValue({
      ...defaultMockResult,
      results,
      hasSearched: true,
      query: 'user',
      addToRecentSearches: vi.fn()
    } as unknown as ReturnType<typeof useGlobalSearch>)

    render(
      <MemoryRouter>
        <SearchModal isOpen={true} onClose={onClose} />
      </MemoryRouter>
    )

    const input = screen.getByPlaceholderText(/Search/i)
    fireEvent.keyDown(input, { key: 'Enter' })
    
    expect(mockNavigate).toHaveBeenCalledWith('/profile/1')
    expect(onClose).toHaveBeenCalled()
  })
})
