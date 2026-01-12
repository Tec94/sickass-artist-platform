import { useEffect, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Doc, Id } from '../../convex/_generated/dataModel'

interface UseSearchThreadsProps {
  categoryId: Id<'categories'>
  query: string
  limit?: number
}

interface UseSearchThreadsResult {
  results: Doc<'threads'>[]
  isLoading: boolean
  error: string | null
}

export function useSearchThreads({
  categoryId,
  query,
  limit = 20,
}: UseSearchThreadsProps): UseSearchThreadsResult {
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [query])

  const shouldSearch = debouncedQuery.trim().length >= 2

  const results = useQuery(
    api.search.searchThreads,
    shouldSearch
      ? {
          categoryId,
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

    const timer = window.setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => window.clearTimeout(timer)
  }, [debouncedQuery, shouldSearch])

  useEffect(() => {
    if (!shouldSearch) {
      setError(null)
      return
    }

    if (results === undefined) return

    if (results === null) {
      setError('Failed to search threads')
    } else {
      setError(null)
    }
  }, [results, shouldSearch])

  return {
    results: results || [],
    isLoading,
    error,
  }
}
