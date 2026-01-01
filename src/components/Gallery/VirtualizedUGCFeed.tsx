import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { FixedSizeList } from 'react-window'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { UGCCard } from './UGCCard'
import type { UGCItem } from '../../types/ugc'

interface VirtualizedUGCFeedProps {
  sortBy?: 'newest' | 'trending' | 'mostLiked' | 'mostViewed'
  category?: 'user-edit' | 'fan-art' | 'repost'
  onSortChange?: (sort: string) => void
  onCategoryChange?: (category: string) => void
}

export function VirtualizedUGCFeed({
  sortBy = 'newest',
  category,
  onSortChange,
  onCategoryChange,
}: VirtualizedUGCFeedProps) {
  const [sort, setSort] = useState(sortBy)
  const [cat, setCat] = useState<typeof category>(category)
  const [page, setPage] = useState(0)
  const [items, setItems] = useState<UGCItem[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<FixedSizeList>(null)
  const hasMoreRef = useRef(true)
  const loadingRef = useRef(false)

  const pageSize = 12

  // Use Convex query directly
  const queryResult = useQuery(
    api.ugc.getUGCFeed,
    { page, pageSize, sortBy: sort, category: cat }
  )

  const isLoading = queryResult === undefined
  const hasMore = queryResult ? queryResult.hasMore : false
  const loading = isLoading || loadingRef.current

  // Accumulate items when query result changes
  useEffect(() => {
    if (queryResult?.items) {
      setItems(prev => {
        const newItems = queryResult.items.filter(
          item => !prev.some(p => p.ugcId === item.ugcId)
        )
        return page === 0 ? queryResult.items : [...prev, ...newItems]
      })
      hasMoreRef.current = queryResult.hasMore
      loadingRef.current = false
    }
  }, [queryResult, page])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1)
        }
      },
      { threshold: 0.1 }
    )

    const sentinel = containerRef.current.querySelector('[data-sentinel]')
    if (sentinel) {
      observer.observe(sentinel)
    }

    return () => observer.disconnect()
  }, [hasMore, loading])

  // Reset scroll position and pagination when filters change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(0, 'start')
    }
    setPage(0)
    setItems([])
  }, [sort, cat])

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSort = e.target.value as typeof sort
      setSort(newSort)
      onSortChange?.(newSort)
    },
    [onSortChange]
  )

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCat = (e.target.value || undefined) as typeof cat
      setCat(newCat)
      onCategoryChange?.(newCat || '')
    },
    [onCategoryChange]
  )

  // Calculate responsive item height based on container width
  // Fixed at 400px as specified in requirements
  const itemHeight = useMemo(() => 400, [])

  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const item = items[index]
      if (!item) return null

      return (
        <div style={style} className="px-2">
          <UGCCard item={item} />
        </div>
      )
    },
    [items]
  )

  return (
    <div ref={containerRef} className="flex flex-col h-full gap-4 w-full">
      {/* Filter/Sort Bar */}
      <div className="flex gap-3 px-4 pt-4 flex-wrap">
        <select
          value={sort}
          onChange={handleSortChange}
          className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 hover:border-cyan-500 focus:border-cyan-500 focus:outline-none transition-colors"
        >
          <option value="newest">Newest</option>
          <option value="trending">Trending</option>
          <option value="mostLiked">Most Liked</option>
          <option value="mostViewed">Most Viewed</option>
        </select>

        <select
          value={cat || ''}
          onChange={handleCategoryChange}
          className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 hover:border-cyan-500 focus:border-cyan-500 focus:outline-none transition-colors"
        >
          <option value="">All Categories</option>
          <option value="user-edit">User Edits</option>
          <option value="fan-art">Fan Art</option>
          <option value="repost">Reposts</option>
        </select>
      </div>

      {/* Error Banner */}
      {queryResult === null && (
        <div className="mx-4 p-3 bg-red-900/30 text-red-200 rounded-lg flex items-center justify-between border border-red-800">
          <span>Failed to load UGC feed.</span>
          <button 
            onClick={() => setPage(p => p)} 
            className="text-red-300 hover:text-red-100 underline hover:no-underline transition-colors px-2 py-1 rounded"
          >
            Retry
          </button>
        </div>
      )}

      {/* Virtualized List */}
      {items.length > 0 && (
        <FixedSizeList
          ref={listRef}
          className="flex-1"
          height={window.innerHeight - 200}
          itemCount={items.length}
          itemSize={itemHeight}
          width="100%"
          overscanCount={5}
        >
          {Row}
        </FixedSizeList>
      )}

      {/* Loading placeholder when no items yet */}
      {items.length === 0 && loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      )}

      {/* Sentinel for intersection observer */}
      {hasMore && (
        <div
          data-sentinel
          className="p-4 flex justify-center"
        >
          {loading && <span className="text-gray-400">Loading more...</span>}
        </div>
      )}

      {/* Edge case: no content found */}
      {!hasMore && items.length === 0 && !loading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500 text-center">
            No UGC content found.
            <br />
            Try a different filter or check back later!
          </div>
        </div>
      )}
    </div>
  )
}