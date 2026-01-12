import { useState, useEffect, useCallback } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { EventFilters, EventItem } from '../types/events'

interface UseEventListResult {
  events: EventItem[]
  total: number
  loading: boolean
  error: Error | null
  hasMore: boolean
  loadMore: () => void
  reset: () => void
}

export function useEventList(filters: EventFilters, pageSize = 12): UseEventListResult {
  const [page, setPage] = useState(0)
  const [accumulatedEvents, setAccumulatedEvents] = useState<EventItem[]>([])
  const [error, setError] = useState<Error | null>(null)

  // Query events with current filters and page
  const queryResult = useQuery(
    api.events.getEvents,
    {
      page,
      pageSize,
      city: filters.city,
      startDate: filters.startDate,
      endDate: filters.endDate,
      // API only accepts 'upcoming' | 'on_sale' | null
      saleStatus: filters.saleStatus === 'upcoming' || filters.saleStatus === 'on_sale' 
        ? filters.saleStatus 
        : undefined,
      sortBy: filters.sortBy,
    }
  )

  const isLoading = queryResult === undefined
  const data = queryResult ?? null

  // Reset accumulated events when filters change
  useEffect(() => {
    setPage(0)
    setAccumulatedEvents([])
    setError(null)
  }, [
    filters.city,
    filters.startDate,
    filters.endDate,
    filters.saleStatus,
    filters.sortBy,
  ])

  // Accumulate events as pages load
  useEffect(() => {
    if (data?.items) {
      setAccumulatedEvents(prev => {
        const newItems = data.items.filter(
          item => !prev.some(p => p._id === item._id)
        )
        return page === 0 ? data.items : [...prev, ...newItems]
      })
    }
  }, [data, page])

  const loadMore = useCallback(() => {
    if (!isLoading && data?.hasMore) {
      setPage(prev => prev + 1)
    }
  }, [isLoading, data?.hasMore])

  const reset = useCallback(() => {
    setPage(0)
    setAccumulatedEvents([])
    setError(null)
  }, [])

  // Apply client-side price filtering if needed
  const filteredEvents = accumulatedEvents.filter(() => {
    // Price filtering would require ticket type data
    // For now, we skip price filtering at this level
    // Price filtering can be added when we fetch ticket types
    return true
  })

  return {
    events: filteredEvents,
    total: data?.totalCount ?? 0,
    loading: isLoading,
    error,
    hasMore: data?.hasMore ?? false,
    loadMore,
    reset,
  }
}
