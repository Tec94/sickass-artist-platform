import { useState, useCallback, memo } from 'react'
import { ContentCard } from './ContentCard'
import { LoadingSkeleton } from '../LoadingSkeleton'
import { useQueryWithTimeout } from '../../hooks/useQueryWithTimeout'
import { TierLockedOverlay } from './TierLockedOverlay'
import { LightboxContainer } from './LightboxContainer'
import type { GalleryContentItem } from '../../types/gallery'

interface QueryFunction {
  (args: Record<string, unknown>): unknown
}

interface GalleryGridProps {
  queryFn?: QueryFunction
  queryArgs?: Record<string, unknown>
  items?: GalleryContentItem[]
  isLoading?: boolean
  error?: Error
  onRetry?: () => void
  timeoutMs?: number
}

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
  queryFn,
  queryArgs,
  items: initialItems,
  isLoading: initialIsLoading = false,
  error: initialError,
  onRetry,
  timeoutMs = 5000,
}: GalleryGridProps) {
  const [selectedItem, setSelectedItem] = useState<GalleryContentItem | null>(null)
  const [showLockModal, setShowLockModal] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Use timeout hook - always call hooks in the same order
  const queryResult = useQueryWithTimeout(
    queryFn || (() => undefined),
    queryArgs || {},
    { timeoutMs, enabled: !!queryFn }
  )

  const {
    data: items = (initialItems || []) as GalleryContentItem[],
    isLoading = initialIsLoading,
    error = initialError,
    timedOut
  } = queryResult

  const handleCardClick = useCallback((item: GalleryContentItem, index: number) => {
    if (item.isLocked) {
      setSelectedItem(item)
      setShowLockModal(true)
    } else {
      setLightboxIndex(index)
    }
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowLockModal(false)
    setSelectedItem(null)
  }, [])

  const handleCloseLightbox = useCallback(() => {
    setLightboxIndex(null)
  }, [])

  const handleRetry = useCallback(() => {
    onRetry?.()
  }, [onRetry])

  // Show timeout error after 5s
  if (timedOut) {
    return (
      <div className="gallery-grid max-w-[1200px] mx-auto px-4">
        <ErrorBanner 
          error={new Error('Request timed out after 5 seconds')} 
          onRetry={handleRetry} 
        />
      </div>
    )
  }

  return (
    <div className="gallery-grid max-w-[1200px] mx-auto px-4">
      {/* Error State */}
      {error && <ErrorBanner error={error} onRetry={handleRetry} />}

      {/* Loading State with Skeletons */}
      {isLoading && items.length === 0 && (
        <LoadingSkeleton 
          type="gallery" 
          count={12}
          className="animate-in fade-in duration-200"
        />
      )}

      {/* Content Grid with fade-in animation */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-enter">
          {items.map((item, index) => (
            <ContentCard
              key={item.contentId}
              item={item}
              isLocked={item.isLocked}
              onClick={() => handleCardClick(item, index)}
            />
          ))}
        </div>
      )}

      {/* Loading More Skeletons */}
      {isLoading && items.length > 0 && (
        <LoadingSkeleton 
          type="gallery" 
          count={3}
          className="mt-4 animate-in fade-in duration-200"
        />
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

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <LightboxContainer
          items={items}
          currentIndex={lightboxIndex}
          isOpen={true}
          onClose={handleCloseLightbox}
        />
      )}
    </div>
  )
})
