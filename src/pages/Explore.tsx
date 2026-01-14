import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { TrendingGrid } from '../components/Explore/TrendingGrid'
import { FilterBar } from '../components/Explore/FilterBar'
import { CreatorCard } from '../components/Gallery/CreatorCard'
import type { ExploreFilters, TrendingItem } from '../types'

// Default filters
const DEFAULT_FILTERS: ExploreFilters = {
  category: 'all',
  dateRange: '30d',
  tier: 'all',
  sort: 'trending',
}

// Query function type
type TrendingQueryResult = {
  items: TrendingItem[]
  hasMore: boolean
  totalCount: number
  page: number
} | undefined

type CreatorsQueryResult = {
  _id: string
  displayName: string
  username: string
  avatar: string
  fanTier: string
  role: string
  bio: string
  level: number
  xp: number
}[] | undefined

export const Explore: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const sentinelRef = useRef<HTMLDivElement>(null)
  
  // Track pagination state
  const [page, setPage] = useState(0)
  const [accumulatedItems, setAccumulatedItems] = useState<TrendingItem[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Parse URL state
  const filters = useMemo<ExploreFilters>(() => ({
    category: (searchParams.get('category') || DEFAULT_FILTERS.category) as ExploreFilters['category'],
    dateRange: (searchParams.get('dateRange') || DEFAULT_FILTERS.dateRange) as ExploreFilters['dateRange'],
    tier: (searchParams.get('tier') || DEFAULT_FILTERS.tier) as ExploreFilters['tier'],
    sort: (searchParams.get('sort') || DEFAULT_FILTERS.sort) as ExploreFilters['sort'],
  }), [searchParams])

  // Query recommended creators
  const creatorsQuery = useQuery(
    api.recommendations?.getRecommendedCreators ?? (() => null as any),
    { limit: 6 }
  ) as CreatorsQueryResult

  // Query trending content for current page
  const queryResult = useQuery(
    api.recommendations?.getTrendingContent ?? (() => null as any),
    {
      category: filters.category,
      dateRange: filters.dateRange,
      tierFilter: filters.tier === 'all' ? undefined : filters.tier,
      sortBy: filters.sort,
      page,
      pageSize: 12,
    }
  ) as TrendingQueryResult

  const isLoading = queryResult === undefined
  const data = queryResult

  // Reset pagination when filters change
  useEffect(() => {
    setPage(0)
    setAccumulatedItems([])
  }, [filters.category, filters.dateRange, filters.tier, filters.sort])

  // Accumulate items across pages
  useEffect(() => {
    if (data?.items) {
      setAccumulatedItems(prev => {
        // Prevent duplicates
        const newItems = data.items.filter(
          (item: TrendingItem) => !prev.some(p => p.id === item.id)
        )
        return page === 0 ? data.items : [...prev, ...newItems]
      })
    }
  }, [data, page])

  // Load more function
  const loadMore = useCallback(() => {
    if (isLoadingMore || !data?.hasMore || isLoading) return
    setIsLoadingMore(true)
    setPage(prev => prev + 1)
  }, [isLoadingMore, data?.hasMore, isLoading])

  // Reset loading state when page changes
  useEffect(() => {
    setIsLoadingMore(false)
  }, [page])

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && data?.hasMore && !isLoading) {
          loadMore()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current)
    }

    return () => observer.disconnect()
  }, [data?.hasMore, isLoading, loadMore])

  // Update URL when filters change
  const handleFilterChange = useCallback((newFilters: Partial<ExploreFilters>) => {
    const updated = { ...filters, ...newFilters }
    setSearchParams({
      category: updated.category,
      dateRange: updated.dateRange,
      tier: updated.tier,
      sort: updated.sort,
    })
  }, [filters, setSearchParams])

  const displayedItems = page === 0 && data?.items ? data.items : accumulatedItems

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Explore</h1>
          <p className="text-gray-400">Discover trending content and amazing creators</p>
        </div>

        {/* Filter Bar */}
        <FilterBar filters={filters} onChange={handleFilterChange} />

        {/* Creator Recommendations */}
        {creatorsQuery && creatorsQuery.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Recommended Creators</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {creatorsQuery.map((creator) => (
                <CreatorCard 
                  key={creator._id} 
                  creator={creator as any} 
                  compact 
                />
              ))}
            </div>
          </div>
        )}

        {/* Trending Content */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            {filters.category === 'all' ? 'Trending Now' : `Trending ${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}`}
          </h2>

          {isLoading && displayedItems.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <iconify-icon icon="solar:spinner-linear" class="h-8 w-8 animate-spin text-red-400"></iconify-icon>
            </div>
          ) : displayedItems.length === 0 && !isLoading ? (
            <div className="rounded-lg border border-red-500/20 bg-slate-900/50 p-8 text-center">
              <p className="text-gray-400">No trending content found</p>
              <p className="mt-2 text-sm text-gray-500">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <TrendingGrid items={displayedItems} />
              
              {/* Infinite scroll sentinel and loading indicator */}
              {displayedItems.length > 0 && (
                <div className="mt-8">
                  {(isLoadingMore || isLoading) && (
                    <div className="flex items-center justify-center py-8">
                      <iconify-icon icon="solar:spinner-linear" class="h-6 w-6 animate-spin text-red-400"></iconify-icon>
                    </div>
                  )}
                  {/* Sentinel element for intersection observer */}
                  <div 
                    id="trending-sentinel" 
                    ref={sentinelRef}
                    className="h-10"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
