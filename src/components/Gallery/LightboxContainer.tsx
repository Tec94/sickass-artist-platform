import { useLightbox } from '../../hooks/useLightbox'
import { LightboxImage } from './LightboxImage'
import { LightboxControls } from './LightboxControls'
import { LightboxMetadata } from './LightboxMetadata'
import { RelatedContent } from './RelatedContent'
import { CreatorPortfolio } from './CreatorPortfolio'
import type { GalleryContentItem } from '../../types/gallery'
import { useRef, useEffect } from 'react'

interface LightboxContainerProps {
  items: GalleryContentItem[]
  isOpen: boolean
  currentIndex: number
  onClose: () => void
}

export const LightboxContainer = ({
  items,
  isOpen: initialIsOpen,
  currentIndex: initialIndex,
  onClose,
}: LightboxContainerProps) => {
  const {
    isOpen,
    currentIndex,
    zoom,
    setZoom,
    next,
    previous,
    close,
    canNext,
    canPrev,
    currentItem,
    open,
  } = useLightbox(items)

  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 })
  const lastTapRef = useRef(0)

  // Focus management
  useEffect(() => {
    if (isOpen && containerRef.current) {
      containerRef.current.focus()
    }
  }, [isOpen])

  // Sync initial state
  useEffect(() => {
    if (initialIsOpen) {
      open(initialIndex)
    } else {
      close()
    }
  }, [initialIsOpen, initialIndex, open, close])

  // Handle touch swipe and double tap
  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          time: Date.now(),
        }

        // Double tap detection
        const now = Date.now()
        if (now - lastTapRef.current < 300) {
          handleDoubleTap()
        }
        lastTapRef.current = now
      }
    }

    const handleDoubleTap = () => {
      setZoom(prev => ({
        ...prev,
        scale: prev.scale === 1 ? 2 : 1,
        offsetX: 0,
        offsetY: 0,
      }))
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1 && zoom.scale === 1) {
        const touch = e.changedTouches[0]
        const deltaX = touch.clientX - touchStartRef.current.x
        const deltaY = touch.clientY - touchStartRef.current.y
        const deltaTime = Date.now() - touchStartRef.current.time

        // Fast swipe (< 500ms) with > 50px distance
        if (deltaTime < 500 && Math.abs(deltaX) > 50 && Math.abs(deltaY) < 50) {
          if (deltaX > 0 && canPrev) {
            previous()
          } else if (deltaX < 0 && canNext) {
            next()
          }
        }
      }
    }

    const container = containerRef.current
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isOpen, canNext, canPrev, next, previous, zoom.scale, setZoom])

  // Pinch zoom logic (simplified for implementation)
  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const distance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        )
        
        // Use a base distance for calculation
        const newScale = Math.max(1, Math.min(3, distance / 200 * 2))
        setZoom(prev => ({ ...prev, scale: newScale }))
      } else if (e.touches.length === 1 && zoom.scale > 1) {
        // Panning logic could go here
      }
    }

    const container = containerRef.current
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    return () => container.removeEventListener('touchmove', handleTouchMove)
  }, [isOpen, zoom.scale, setZoom])

  const handleClose = () => {
    close()
    onClose()
  }

  if (!isOpen || !currentItem) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-black/95 flex flex-col lg:flex-row transition-opacity duration-300 outline-none"
      onClick={handleClose}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`${currentItem.title} - Lightbox`}
    >
      {/* Main content area */}
      <div
        className="flex-1 flex items-center justify-center relative min-h-0"
        onClick={e => e.stopPropagation()}
      >
        <LightboxImage
          src={currentItem.imageUrl}
          alt={currentItem.title}
          zoom={zoom.scale}
          offsetX={zoom.offsetX}
          offsetY={zoom.offsetY}
          onLoad={time => console.log(`Image loaded in ${time.toFixed(0)}ms`)}
          onError={error => console.error('Image error:', error)}
          thumbnailSrc={currentItem.thumbnailUrl}
          onPan={(x, y) => setZoom(prev => ({ ...prev, offsetX: x, offsetY: y }))}
        />

        <LightboxControls
          currentIndex={currentIndex}
          total={items.length}
          zoom={zoom.scale}
          canNext={canNext}
          canPrev={canPrev}
          onNext={next}
          onPrev={previous}
          onClose={handleClose}
          onZoomIn={() => setZoom(prev => ({ ...prev, scale: Math.min(3, prev.scale + 0.5) }))}
          onZoomOut={() => setZoom(prev => ({ ...prev, scale: Math.max(1, prev.scale - 0.5) }))}
          onResetZoom={() => setZoom({ scale: 1, offsetX: 0, offsetY: 0 })}
        />
      </div>

      {/* Metadata sidebar (desktop) */}
        <div
          className="hidden lg:block w-96 border-l border-gray-800 bg-black/50 overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <LightboxMetadata item={currentItem} />
          <div className="p-6 pt-0">
            <RelatedContent
              currentItem={currentItem}
              onItemClick={(item) => {
                const itemIndex = items.findIndex(i => i.contentId === item.contentId)
                if (itemIndex !== -1) {
                  open(itemIndex)
                }
              }}
            />
            <CreatorPortfolio
              creatorId={currentItem.creator._id}
              onItemClick={(item) => {
                const itemIndex = items.findIndex(i => i.contentId === item.contentId)
                if (itemIndex !== -1) {
                  open(itemIndex)
                }
              }}
            />
          </div>
        </div>

      {/* Metadata below image (mobile) */}
      <div 
        className="lg:hidden bg-gradient-to-t from-black to-transparent p-6 pt-12"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-white font-semibold text-lg">{currentItem.title}</h3>
        <p className="text-gray-300 text-sm mt-2 line-clamp-2">{currentItem.description}</p>
        <div className="flex items-center gap-2 mt-4">
           <img src={currentItem.creator.avatar} alt="" className="w-6 h-6 rounded-full" />
           <span className="text-gray-400 text-xs">{currentItem.creator.displayName}</span>
        </div>
      </div>

      {/* Related content section */}
      <div className="lg:hidden mt-auto" onClick={e => e.stopPropagation()}>
      <RelatedContent
        currentItem={currentItem}
        onItemClick={(item) => {
          const itemIndex = items.findIndex(i => i.contentId === item.contentId)
          if (itemIndex !== -1) {
            open(itemIndex)
          }
        }}
      />
      </div>

      {/* Creator portfolio section */}
      <div className="lg:hidden mt-auto" onClick={e => e.stopPropagation()}>
        <CreatorPortfolio 
          creatorId={currentItem.creator._id}
          onItemClick={(item) => {
            const itemIndex = items.findIndex(i => i.contentId === item.contentId)
            if (itemIndex !== -1) {
              open(itemIndex)
            }
          }}
        />
      </div>
    </div>
  )
}
