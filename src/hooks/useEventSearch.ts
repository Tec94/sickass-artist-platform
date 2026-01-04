import { useState, useEffect, useRef } from 'react'
import { useConvex } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { EventSearchResult } from '../types/events'

interface UseEventSearchOptions {
  debounceMs?: number
  limit?: number
  city?: string
  saleStatus?: 'upcoming' | 'on_sale'
}

interface UseEventSearchResult {
  results: EventSearchResult[]
  loading: boolean
  error: Error | null
  hasSearched: boolean
}

export function useEventSearch(
  query: string,
  options: UseEventSearchOptions = {}
): UseEventSearchResult {
  const {
    debounceMs = 300,
    limit = 20,
    city,
    saleStatus,
  } = options

  const convex = useConvex()
  const [results, setResults] = useState<EventSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortController = useRef<AbortController | null>(null)

  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort()
    }

    // Reset if query is too short
    if (query.length < 2) {
      setResults([])
      setLoading(false)
      setError(null)
      setHasSearched(false)
      return
    }

    // Set loading state immediately
    setLoading(true)
    setError(null)

    // Debounce the search
    debounceTimer.current = setTimeout(async () => {
      try {
        abortController.current = new AbortController()

        // Note: api.events will be available once convex dev is run
        if (!api.events?.searchEvents) {
          setResults([])
          setHasSearched(true)
          setLoading(false)
          return
        }

        const searchResults = await convex.query(api.events.searchEvents, {
          query,
          limit,
          city,
          saleStatus,
        })

        setResults(searchResults)
        setHasSearched(true)
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err)
          console.error('[EventSearch] Search error:', err)
        }
      } finally {
        setLoading(false)
      }
    }, debounceMs)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [query, limit, city, saleStatus, debounceMs, convex])

  return {
    results,
    loading,
    error,
    hasSearched,
  }
}
