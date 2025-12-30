import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import type { Id } from '../../types/forum'
import type { Thread, ThreadSortBy } from '../../types/forum'
import { ThreadListItem } from './ThreadListItem'

interface ThreadListProps {
  categoryId: Id<'categories'> | null
  threads: Thread[]
  selectedThreadId: Id<'threads'> | null
  isLoading: boolean
  sortBy: ThreadSortBy
  onSortChange: (sortBy: ThreadSortBy) => void
  onSelectThread: (threadId: Id<'threads'>) => void
  hasMore?: boolean
  fetchMore?: () => void
}

const SortButton = memo(function SortButton({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        `px-3 py-1.5 text-sm rounded-lg border transition-colors ` +
        `${isActive ? 'border-cyan-500/60 bg-cyan-500/20 text-cyan-100' : 'border-gray-700 bg-gray-900/30 text-gray-200 hover:bg-gray-800/50'}`
      }
    >
      {label}
    </button>
  )
})

export const ThreadList = memo(function ThreadList({
  categoryId,
  threads,
  selectedThreadId,
  isLoading,
  sortBy,
  onSortChange,
  onSelectThread,
  hasMore = false,
  fetchMore,
}: ThreadListProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const handleSelectThread = useCallback(
    (threadId: Id<'threads'>) => {
      onSelectThread(threadId)
    },
    [onSelectThread]
  )

  const sortedThreads = useMemo(() => {
    return threads
  }, [threads])

  useEffect(() => {
    if (!hasMore || !fetchMore) return
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          fetchMore()
        }
      },
      { root: null, rootMargin: '200px', threshold: 0.1 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [fetchMore, hasMore])

  if (!categoryId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400">Select a category to view threads</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-700 bg-gray-800/30">
        <div className="flex flex-wrap items-center gap-2">
          <SortButton label="Newest" isActive={sortBy === 'newest'} onClick={() => onSortChange('newest')} />
          <SortButton label="Top Votes" isActive={sortBy === 'top'} onClick={() => onSortChange('top')} />
          <SortButton label="Most Replies" isActive={sortBy === 'mostReplies'} onClick={() => onSortChange('mostReplies')} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3" aria-label="Loading threads">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-28 rounded-xl border border-gray-700 bg-gray-900/30 animate-pulse"
              />
            ))}
          </div>
        ) : sortedThreads.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No threads in this category</p>
          </div>
        ) : (
          sortedThreads.map((thread) => (
            <ThreadListItem
              key={thread._id}
              thread={thread}
              isSelected={selectedThreadId === thread._id}
              onClick={handleSelectThread}
            />
          ))
        )}

        {hasMore && (
          <div ref={sentinelRef} className="h-10 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Loading more…</span>
          </div>
        )}
      </div>
    </div>
  )
})
