import { memo } from 'react'

interface ForumSkeletonProps {
  count?: number
}

export const ForumSkeleton = memo(function ForumSkeleton({ count = 5 }: ForumSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden p-5"
        >
          <div className="flex gap-5">
            {/* Avatar (32x32px circle) */}
            <div className="skeleton-avatar w-8 h-8 rounded-full flex-shrink-0" />
            
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Header row with user info and stats */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="skeleton-text h-3 w-24" />
                  <div className="skeleton-text h-3 w-16" />
                </div>
                <div className="skeleton-text h-3 w-16" />
              </div>
              
              {/* Thread title (2 lines) */}
              <div className="mb-3 space-y-2">
                <div className="skeleton-text h-4 w-full" />
                <div className="skeleton-text h-4 w-4/5" />
              </div>
              
              {/* Preview text (3 lines) */}
              <div className="mb-3 space-y-2">
                <div className="skeleton-text h-3 w-full" />
                <div className="skeleton-text h-3 w-full" />
                <div className="skeleton-text h-3 w-3/4" />
              </div>
              
              {/* Tags row */}
              <div className="flex gap-2 mb-3">
                <div className="skeleton-text h-3 w-12" />
                <div className="skeleton-text h-3 w-16" />
                <div className="skeleton-text h-3 w-10" />
              </div>
            </div>
            
            {/* Vote buttons */}
            <div className="flex flex-col gap-1">
              <div className="skeleton-text h-6 w-6 rounded" />
              <div className="skeleton-text h-4 w-8" />
              <div className="skeleton-text h-6 w-6 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})