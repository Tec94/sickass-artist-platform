import { renderHook, act, waitFor } from '@testing-library/react'
import { useGlobalSearch } from '../../hooks/useGlobalSearch'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock useConvex
const mockQuery = vi.fn()
vi.mock('convex/react', () => ({
  useConvex: () => ({
    query: mockQuery,
  }),
}))

describe('useGlobalSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  // ✅ TEST: Debounces at 300ms
  it('should debounce search requests by 300ms', async () => {
    mockQuery.mockResolvedValue({ 
      users: [], 
      threads: [], 
      gallery: [], 
      ugc: [], 
      channels: [], 
      totalResults: 0, 
      query: 'test' 
    })
    
    const { result } = renderHook(() => useGlobalSearch({ debounceMs: 300 }))

    act(() => {
      result.current.setQuery('test')
    })

    // Should not search immediately
    expect(result.current.isLoading).toBe(false)
    expect(mockQuery).not.toHaveBeenCalled()

    // Should search after debounce
    await waitFor(
      () => {
        expect(result.current.hasSearched).toBe(true)
      },
      { timeout: 500 }
    )
    expect(mockQuery).toHaveBeenCalledWith(expect.anything(), { query: 'test', limit: 20 })
  })

  // ✅ TEST: No search if query < 2 chars
  it('should not search if query less than 2 characters', async () => {
    const { result } = renderHook(() => useGlobalSearch())

    act(() => {
      result.current.setQuery('a')
    })

    // Wait a bit to ensure debounce would have fired if it were to
    await new Promise(r => setTimeout(r, 400))
    
    expect(result.current.results).toBeNull()
    expect(mockQuery).not.toHaveBeenCalled()
  })

  // ✅ TEST: Recent searches persist/clear
  it('should persist recent searches to localStorage', async () => {
    const { result } = renderHook(() => useGlobalSearch())

    act(() => {
      result.current.addToRecentSearches('react hooks')
    })

    const stored = JSON.parse(localStorage.getItem('global_search_recent') || '[]')
    expect(stored).toContain('react hooks')

    act(() => {
      result.current.clearRecentSearches()
    })

    const cleared = localStorage.getItem('global_search_recent')
    expect(cleared).toBeNull()
  })

  // ✅ TEST: Handles network errors gracefully
  it('should handle network errors gracefully', async () => {
    mockQuery.mockRejectedValue(new Error('Network error'))
    
    const { result } = renderHook(() => useGlobalSearch({ debounceMs: 0 }))

    act(() => {
      result.current.setQuery('test')
    })

    await waitFor(() => {
      expect(result.current.error).toBeDefined()
      expect(result.current.error?.message).toBe('Network error')
    })
    
    expect(result.current.isLoading).toBe(false)
  })
})
