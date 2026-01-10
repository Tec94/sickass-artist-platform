import { useState, useCallback, useEffect, useRef } from 'react'
import { useConvex } from 'convex/react'
import { api } from '../../convex/_generated/api'

// Search result types (defined here since they're internal to convex/search.ts)
export type SearchUserResult = {
  _id: string
  username: string
  displayName: string
  avatar: string
  fanTier: 'bronze' | 'silver' | 'gold' | 'platinum'
  role: 'artist' | 'admin' | 'mod' | 'crew' | 'fan'
}

export type SearchThreadResult = {
  _id: string
  title: string
  content: string
  authorDisplayName: string
  authorAvatar: string
  netVoteCount: number
  replyCount: number
  createdAt: number
}

export type SearchGalleryResult = {
  contentId: string
  title: string
  thumbnailUrl: string
  type: 'show' | 'bts' | 'edit' | 'wip' | 'exclusive'
  creatorId: string
  likeCount: number
  isLocked: boolean
}

export type SearchUGCResult = {
  ugcId: string
  title: string
  thumbnailUrl: string
  category: 'user-edit' | 'fan-art' | 'repost'
  creatorId: string
  creatorDisplayName: string
  likeCount: number
  isLocked: boolean
}

export type SearchChannelResult = {
  _id: string
  name: string
  slug: string
  description: string
  category: 'general' | 'mod' | 'fan-only' | 'announcements'
  messageCount: number
  isLocked: boolean
}

export type SearchMerchResult = {
  _id: string
  name: string
  description: string
  price: number
  thumbnailUrl: string
  category: string
  inStock: boolean
}

export type SearchEventResult = {
  _id: string
  title: string
  description: string
  imageUrl: string
  city: string
  startAtUtc: number
  saleStatus: string
}

export type SearchResult = {
  users: SearchUserResult[]
  threads: SearchThreadResult[]
  gallery: SearchGalleryResult[]
  ugc: SearchUGCResult[]
  channels: SearchChannelResult[]
  merch: SearchMerchResult[]
  events: SearchEventResult[]
  totalResults: number
  query: string
}

interface UseGlobalSearchOptions {
  enabled?: boolean
  debounceMs?: number
  maxRecentSearches?: number
}

interface UseGlobalSearchResult {
  results: SearchResult | null
  isLoading: boolean
  error: Error | null
  query: string
  setQuery: (q: string) => void
  recentSearches: string[]
  clearRecentSearches: () => void
  addToRecentSearches: (q: string) => void
  hasSearched: boolean
}

const STORAGE_KEY = 'global_search_recent'
const DEFAULT_DEBOUNCE_MS = 300
const DEFAULT_MAX_RECENT = 10

export function useGlobalSearch({
  enabled = true,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  maxRecentSearches = DEFAULT_MAX_RECENT,
}: UseGlobalSearchOptions = {}): UseGlobalSearchResult {
  const [query, setQueryState] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const convex = useConvex()

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>()

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as string[]
        setRecentSearches(Array.isArray(parsed) ? parsed : [])
      }
    } catch (err) {
      console.warn('[Search] Failed to load recent searches:', err)
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  // Debounced search function
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setResults(null)
        setHasSearched(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const searchResults = await convex.query(api.search.globalSearch, {
          query: searchQuery,
          limit: 20,
        })

        setResults(searchResults)
        setHasSearched(true)
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error('Search failed. Please try again.')
        )
        setResults(null)
        setHasSearched(true)
      } finally {
        setIsLoading(false)
      }
    },
    [convex]
  )

  // Debounce query changes
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery)

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new debounced search
    debounceTimerRef.current = setTimeout(() => {
      if (enabled) {
        performSearch(newQuery)
      }
    }, debounceMs)
  }, [enabled, debounceMs, performSearch])

  // Add to recent searches
  const addToRecentSearches = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return

    setRecentSearches((prev) => {
      const filtered = prev.filter((q) => q !== searchQuery)
      const updated = [searchQuery, ...filtered].slice(0, maxRecentSearches)

      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (err) {
        console.warn('[Search] Failed to save recent searches:', err)
      }

      return updated
    })
  }, [maxRecentSearches])

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (err) {
      console.warn('[Search] Failed to clear recent searches:', err)
    }
  }, [])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return {
    results,
    isLoading,
    error,
    query,
    setQuery,
    recentSearches,
    clearRecentSearches,
    addToRecentSearches,
    hasSearched,
  }
}
