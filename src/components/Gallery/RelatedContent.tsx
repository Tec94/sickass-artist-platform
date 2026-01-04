import { useRef, useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRecommendations } from '../../hooks/useRecommendations'
import { GalleryCard } from './GalleryCard'
import { GallerySkeleton } from './GallerySkeleton'
import type { GalleryContentItem } from '../../types/gallery'

interface RelatedContentProps {
  currentItem: GalleryContentItem
  onItemClick: (item: GalleryContentItem, index: number) => void
}

export const RelatedContent = ({ currentItem, onItemClick }: RelatedContentProps) => {
  const { data, isLoading, isFromCache } = useRecommendations({
    contentId: currentItem.contentId,
    limit: 12,
  })

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Check scroll position
  const checkScroll = useCallback(() => {
    if (!scrollContainerRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }, [])

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [checkScroll])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return

    const scrollAmount = 320 // Card width + gap
    const newScroll =
      scrollContainerRef.current.scrollLeft +
      (direction === 'left' ? -scrollAmount : scrollAmount)

    scrollContainerRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth',
    })

    setTimeout(checkScroll, 300)
  }

  if (!data || data.length === 0) {
    return null
  }

  return (
    <section className="py-8 px-4 md:px-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white">
          {isFromCache ? '📌 ' : ''}You might also like
        </h3>
        {isFromCache && (
          <p className="text-xs text-gray-500 mt-1">Cached results</p>
        )}
      </div>

      {/* Carousel container */}
      <div className="relative">
        {/* Scroll indicators */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gradient-to-r from-black to-transparent hover:from-gray-900 transition rounded"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}

        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gradient-to-l from-black to-transparent hover:from-gray-900 transition rounded"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory"
          onScroll={checkScroll}
        >
          {isLoading ? (
            <>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-72">
                  <GallerySkeleton />
                </div>
              ))}
            </>
          ) : (
            data.map((item, index) => (
              <button
                key={item.contentId}
                onClick={() => onItemClick(item, index)}
                className="flex-shrink-0 w-72 snap-start group"
              >
                <GalleryCard item={item} onClick={() => onItemClick(item, index)} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Mobile dots */}
      <div className="flex justify-center gap-2 mt-4 md:hidden">
        {data.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition ${
              index === 0 ? 'bg-cyan-500' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            aria-label={`View item ${index + 1}`}
          />
        ))}
      </div>

      {/* Info badge */}
      <div className="mt-4 text-center text-xs text-gray-500">
        {data.length} recommendations {isFromCache && '• Cached'}
      </div>
    </section>
  )
}
