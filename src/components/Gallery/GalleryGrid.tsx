import { useState, useCallback, memo } from 'react'
import { GalleryCard } from './GalleryCard'
import { GallerySkeleton } from './GallerySkeleton'
import { TierLockedOverlay } from './TierLockedOverlay'
import type { GalleryContentItem } from '../../types/gallery'

interface GalleryGridProps {
  items: GalleryContentItem[]
  isLoading?: boolean
  error?: Error
  onRetry?: () => void
}

const SkeletonCards = memo(function SkeletonCards({ count }: { count: number }) {
  return <GallerySkeleton count={count} />
})

const ErrorBanner = memo(function ErrorBanner({
  error,
  onRetry,
}: {
  error?: Error
  onRetry?: () => void
}) {
  return (
    <div className="col-span-full mb-6">
      <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-2xl">⚠️</span>
          <h3 className="text-lg font-semibold text-red-300">
            Failed to load gallery items
          </h3>
        </div>
        {error && (
          <p className="text-red-200/70 text-sm mb-4">{error.message}</p>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  )
})

export const GalleryGrid = memo(function GalleryGrid({
  items,
  isLoading = false,
  error,
  onRetry,
}: GalleryGridProps) {
  const [selectedItem, setSelectedItem] = useState<GalleryContentItem | null>(null)
  const [showLockModal, setShowLockModal] = useState(false)

  const handleCardClick = useCallback((item: GalleryContentItem) => {
    if (item.isLocked) {
      setSelectedItem(item)
      setShowLockModal(true)
    } else {
      // Open Lightbox (Task 8)
      console.log('Opening lightbox for:', item.contentId)
    }
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowLockModal(false)
    setSelectedItem(null)
  }, [])

  return (
    <div className="gallery-grid max-w-[1200px] mx-auto px-4">
      {/* Error State */}
      {error && <ErrorBanner error={error} onRetry={onRetry} />}

      {/* Loading State */}
      {isLoading && items.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCards count={12} />
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <GalleryCard
            key={item.contentId}
            item={item}
            isLocked={item.isLocked}
            onClick={() => handleCardClick(item)}
          />
        ))}
      </div>

      {/* Loading More Skeletons */}
      {isLoading && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <SkeletonCards count={3} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && items.length === 0 && (
        <div className="col-span-full py-20 text-center">
          <div className="text-6xl mb-4">🖼️</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Content Found</h3>
          <p className="text-gray-500">Check back later for new gallery items</p>
        </div>
      )}

      {/* Tier Locked Overlay Modal */}
      {showLockModal && selectedItem && (
        <TierLockedOverlay item={selectedItem} onClose={handleCloseModal} />
      )}
    </div>
  )
})
