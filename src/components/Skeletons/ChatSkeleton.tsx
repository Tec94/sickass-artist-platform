import { memo } from 'react'

interface ChatSkeletonProps {
  count?: number
}

export const ChatSkeleton = memo(function ChatSkeleton({ count = 3 }: ChatSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex gap-3 p-3 rounded-lg"
        >
          {/* Avatar (32x32px) */}
          <div className="skeleton-avatar w-8 h-8 rounded-full flex-shrink-0" />
          
          {/* Message content */}
          <div className="flex-1 min-w-0">
            {/* Header with name, tier, and timestamp */}
            <div className="flex items-center gap-2 mb-1">
              <div className="skeleton-text h-3 w-20" />
              <div className="skeleton-text h-3 w-12" />
              <div className="skeleton-text h-3 w-16" />
            </div>
            
            {/* Message bubble (variable width) */}
            <div className="mb-2">
              <div className="skeleton-text h-4 w-3/4 mb-2" />
              <div className="skeleton-text h-4 w-1/2" />
            </div>
            
            {/* Actions row */}
            <div className="flex items-center gap-3">
              <div className="skeleton-text h-3 w-12" />
              <div className="skeleton-text h-3 w-16" />
              <div className="skeleton-text h-3 w-10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})