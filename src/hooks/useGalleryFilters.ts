import { useSearchParams } from 'react-router-dom'
import { useCallback, useMemo, useEffect, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { GalleryFilters } from '../types/gallery'
import type { Id } from '../../convex/_generated/dataModel'

const DEFAULT_FILTERS: GalleryFilters = {
  types: [],
  dateRange: 'all',
  creatorId: null,
  fanTier: 'all',
  tags: [],
  sortBy: 'newest',
  page: 0,
}

export const useGalleryFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [resultsCount, setResultsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Parse filters from URL
  const filters: GalleryFilters = useMemo(() => {
    try {
      const typesParam = searchParams.get('types')?.split(',').filter(Boolean) || []
      const validTypes = typesParam.filter((t): t is 'show' | 'bts' | 'edit' | 'wip' | 'exclusive' =>
        ['show', 'bts', 'edit', 'wip', 'exclusive'].includes(t)
      )

      const dateRangeParam = searchParams.get('date') || 'all'
      const dateRangeOptions: readonly string[] = ['7d', '30d', '90d', 'all']
      const validDateRange = dateRangeOptions.includes(dateRangeParam)
        ? dateRangeParam as '7d' | '30d' | '90d' | 'all'
        : 'all'

      const tierParam = searchParams.get('tier') || 'all'
      const tierOptions: readonly string[] = ['all', 'bronze', 'silver', 'gold', 'platinum']
      const validTier = tierOptions.includes(tierParam)
        ? tierParam as 'all' | 'bronze' | 'silver' | 'gold' | 'platinum'
        : 'all'

      const sortParam = searchParams.get('sort') || 'newest'
      const sortOptions: readonly string[] = ['newest', 'oldest', 'mostLiked', 'mostViewed', 'trending']
      const validSort = sortOptions.includes(sortParam)
        ? sortParam as 'newest' | 'oldest' | 'mostLiked' | 'mostViewed' | 'trending'
        : 'newest'

      return {
        types: validTypes,
        dateRange: validDateRange,
        creatorId: searchParams.get('creator') || null,
        fanTier: validTier,
        tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
        sortBy: validSort,
        page: parseInt(searchParams.get('page') || '0'),
      }
    } catch (e) {
      console.error('Failed to parse filters from URL', e)
      return DEFAULT_FILTERS
    }
  }, [searchParams])

  // Query filtered content
  const queryFilters = useQuery(api.gallery.getFilteredGallery, {
    types: filters.types.length > 0 ? filters.types : undefined,
    dateRange: filters.dateRange !== 'all' ? filters.dateRange : undefined,
    creatorId: filters.creatorId ? (filters.creatorId as Id<'users'>) : undefined,
    fanTier: filters.fanTier !== 'all' ? filters.fanTier : undefined,
    tags: filters.tags.length > 0 ? filters.tags : undefined,
    sortBy: filters.sortBy,
    page: filters.page,
    pageSize: 24,
  })

  useEffect(() => {
    if (queryFilters) {
      setResultsCount(queryFilters.items?.length ?? 0)
      setIsLoading(false)
    }
  }, [queryFilters])

  // Set filter and sync to URL
  const setFilter = useCallback((key: keyof GalleryFilters, value: GalleryFilters[typeof key]) => {
    const newParams = new URLSearchParams(searchParams)

    if (Array.isArray(value) && value.length === 0) {
      newParams.delete(mapFilterKeyToParam(key))
    } else if (value === null || value === 'all') {
      newParams.delete(mapFilterKeyToParam(key))
    } else if (Array.isArray(value)) {
      newParams.set(mapFilterKeyToParam(key), value.join(','))
    } else {
      newParams.set(mapFilterKeyToParam(key), String(value))
    }

    // Reset page when filter changes (unless changing page itself)
    if (key !== 'page') {
      newParams.set('page', '0')
    }
    setSearchParams(newParams)
  }, [searchParams, setSearchParams])

  // Clear individual filter
  const clearFilter = useCallback((key: keyof GalleryFilters) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete(mapFilterKeyToParam(key))
    newParams.set('page', '0')
    setSearchParams(newParams)
  }, [searchParams, setSearchParams])

  // Clear all filters
  const clearAll = useCallback(() => {
    setSearchParams(new URLSearchParams())
  }, [setSearchParams])

  // Get active filter count
  const appliedCount = useMemo(() => {
    return [
      filters.types.length > 0 ? 1 : 0,
      filters.dateRange !== 'all' ? 1 : 0,
      filters.creatorId ? 1 : 0,
      filters.fanTier !== 'all' ? 1 : 0,
      filters.tags.length > 0 ? 1 : 0,
    ].reduce((a, b) => a + b, 0)
  }, [filters])

  const isActive = appliedCount > 0

  return {
    filters,
    setFilter,
    clearFilter,
    clearAll,
    isActive,
    appliedCount,
    resultsCount,
    isLoading,
    queryResult: queryFilters,
  }
}

// Helper to map filter key to URL param
function mapFilterKeyToParam(key: keyof GalleryFilters): string {
  const map: Record<keyof GalleryFilters, string> = {
    types: 'types',
    dateRange: 'date',
    creatorId: 'creator',
    fanTier: 'tier',
    tags: 'tags',
    sortBy: 'sort',
    page: 'page',
  }
  return map[key]
}
