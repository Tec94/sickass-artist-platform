import { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id, Doc } from '../../convex/_generated/dataModel'

interface UseSearchMessagesProps {
  channelId: Id<'channels'>
  query: string
  limit?: number
}

interface UseSearchMessagesResult {
  results: Doc<'messages'>[]
  isLoading: boolean
  error: string | null
}

export function useSearchMessages({
  channelId,
  query,
  limit = 20,
}: UseSearchMessagesProps): UseSearchMessagesResult {
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounce the query input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Only search if query.length >= 2
  const shouldSearch = debouncedQuery.trim().length >= 2

  const results = useQuery(
    api.search.searchMessages,
    shouldSearch
      ? {
          channelId,
          query: debouncedQuery,
          limit,
        }
      : 'skip'
  )

  useEffect(() => {
    if (!shouldSearch) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500) // Show loading for at least 500ms for better UX

    return () => clearTimeout(timer)
  }, [debouncedQuery, shouldSearch])

  useEffect(() => {
    if (results === undefined) {
      return // Still loading
    }

    if (results === null) {
      setError('Failed to search messages')
    } else {
      setError(null)
    }
  }, [results])

  return {
    results: results || [],
    isLoading,
    error,
  }
}