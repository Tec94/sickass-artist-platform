import { memo } from 'react'

interface GallerySkeletonProps {
  count?: number
}

export const GallerySkeleton = memo(function GallerySkeleton({ count = 1 }: GallerySkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden"
        >
          <div className="relative aspect-video overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-750 to-gray-800 animate-[shimmer_1.5s_infinite]" />
          </div>
          <div className="p-3 space-y-2">
            <div className="h-4 bg-gray-800 rounded animate-pulse" />
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-gray-800 rounded animate-pulse" />
              <div className="flex gap-3">
                <div className="h-3 w-8 bg-gray-800 rounded animate-pulse" />
                <div className="h-3 w-8 bg-gray-800 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </>
  )
})
