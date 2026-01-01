import { useState, useCallback, useEffect, useRef } from 'react'

interface UseInfiniteScrollOptions<T> {
  queryFn: (args: { page: number; pageSize: number }) => Promise<{
    items: T[]
    hasMore: boolean
    totalCount: number
    page: number
  }>
  pageSize?: number
  deps?: unknown[]
}

interface UseInfiniteScrollResult<T> {
  items: T[]
  loading: boolean
  hasMore: boolean
  error: Error | null
  loadMore: () => Promise<void>
  reset: () => void
}

export function useInfiniteScroll<T>({
  queryFn,
  pageSize = 12,
  deps = [],
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollResult<T> {
  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const pendingRef = useRef(false)

  const loadMore = useCallback(
    async () => {
      if (pendingRef.current || !hasMore || loading) return

      pendingRef.current = true
      setLoading(true)
      setError(null)

      try {
        const result = await queryFn({ page, pageSize })
        setItems((prev) => [...prev, ...result.items])
        setPage(result.page + 1)
        setHasMore(result.hasMore)
      } catch (err) {
        setError(err as Error)
      } finally {
        pendingRef.current = false
        setLoading(false)
      }
    },
    [queryFn, page, pageSize, hasMore, loading]
  )

  const reset = useCallback(() => {
    setItems([])
    setPage(0)
    setHasMore(true)
    setError(null)
    pendingRef.current = false
  }, [])

  useEffect(() => {
    reset()
  }, deps)

  return { items, loading, hasMore, error, loadMore, reset }
}
