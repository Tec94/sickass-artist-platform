import { memo } from 'react'

interface GallerySkeletonProps {
  count?: number
}

export const GallerySkeleton = memo(function GallerySkeleton({ count = 4 }: GallerySkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-900/70 border border-gray-800 rounded-lg overflow-hidden"
        >
          {/* Image placeholder with aspect-ratio to prevent CLS */}
          <div className="relative aspect-square overflow-hidden">
            <div className="skeleton-image" />
          </div>
          
          {/* Content area */}
          <div className="p-3 space-y-2">
            {/* Title text (1 line, 100%) */}
            <div className="skeleton-text h-4 w-full" />
            
            {/* Creator text (1 line, 60%) */}
            <div className="skeleton-text h-3 w-3/5" />
            
            {/* Stats row */}
            <div className="flex items-center justify-between">
              <div className="skeleton-text h-3 w-16" />
              <div className="flex gap-3">
                <div className="skeleton-text h-3 w-6" />
                <div className="skeleton-text h-3 w-6" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})