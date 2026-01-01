import { useState, useEffect, memo } from 'react'
import { ChevronLeft, ChevronRight, X, Download, Share2, Loader2 } from 'lucide-react'
import type { GalleryContentItem } from '../../types/gallery'
import { useSwipe } from '../../hooks/useSwipe'

interface LightboxProps {
  items: GalleryContentItem[]
  initialIndex: number
  onClose: () => void
}

const Spinner = () => (
  <div className="flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
  </div>
)

export const Lightbox = memo(function Lightbox({ items, initialIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isLoading, setIsLoading] = useState(true)
  
  const current = items[currentIndex]
  const hasMore = (index: number) => index < items.length - 1
  const hasPrev = currentIndex > 0

  // Preload adjacent images
  useEffect(() => {
    const preloadImage = (src: string) => {
      const img = new Image()
      img.src = src
    }

    if (hasPrev) preloadImage(items[currentIndex - 1].imageUrl)
    if (hasMore(currentIndex)) preloadImage(items[currentIndex + 1].imageUrl)
  }, [currentIndex, items, hasPrev])

  // Keyboard handling
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrev) {
        setCurrentIndex(c => c - 1)
        setIsLoading(true)
      }
      if (e.key === 'ArrowRight' && hasMore(currentIndex)) {
        setCurrentIndex(c => c + 1)
        setIsLoading(true)
      }
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [currentIndex, hasPrev, items.length, onClose])

  // Touch swipe
  const handleSwipe = useSwipe({
    onSwipeLeft: () => {
      if (hasMore(currentIndex)) {
        setCurrentIndex(c => c + 1)
        setIsLoading(true)
      }
    },
    onSwipeRight: () => {
      if (hasPrev) {
        setCurrentIndex(c => c - 1)
        setIsLoading(true)
      }
    },
  })

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = current.imageUrl
    link.download = current.title || 'image'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: current.title,
          text: current.description,
          url: window.location.href,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  // Related content (same type, excluding current)
  const related = items
    .map((item, index) => ({ item, index }))
    .filter(({ item, index }) => index !== currentIndex && item.type === current.type)
    .slice(0, 4)

  return (
    <div
      className="fixed inset-0 bg-black/95 flex flex-col z-[100] backdrop-blur-sm"
      {...handleSwipe}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <div className="hidden sm:block text-white text-sm font-medium">
          <span className="text-cyan-400">{currentIndex + 1}</span>
          <span className="text-gray-500 mx-1">of</span>
          <span className="text-gray-400">{items.length}</span>
        </div>
        <div className="sm:hidden" /> {/* Spacer for mobile to keep close button right */}
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-white hover:bg-gray-800/50 p-2 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Image */}
      <div className="flex-1 flex items-center justify-center relative px-4 sm:px-12 overflow-hidden">
        <button
          onClick={() => {
            setCurrentIndex(c => c - 1)
            setIsLoading(true)
          }}
          disabled={!hasPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white hover:bg-gray-800/50 p-2 rounded-full disabled:opacity-0 transition-all sm:left-6 sm:p-3"
          aria-label="Previous"
        >
          <ChevronLeft className="w-10 h-10 sm:w-8 sm:h-8" />
        </button>

        <div className="relative flex items-center justify-center w-full h-full max-h-[80vh] max-w-[90vw]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner />
            </div>
          )}
          <img
            src={current.imageUrl}
            alt={current.title}
            onLoad={() => setIsLoading(false)}
            className={`max-h-[80vh] max-w-[90vw] object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          />
        </div>

        <button
          onClick={() => {
            setCurrentIndex(c => c + 1)
            setIsLoading(true)
          }}
          disabled={!hasMore(currentIndex)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white hover:bg-gray-800/50 p-2 rounded-full disabled:opacity-0 transition-all sm:right-6 sm:p-3"
          aria-label="Next"
        >
          <ChevronRight className="w-10 h-10 sm:w-8 sm:h-8" />
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 bg-black/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
              <div className="text-white text-center sm:text-left font-medium">
                {currentIndex + 1} of {items.length}
              </div>
              <div className="flex gap-2 justify-center sm:justify-start w-full sm:w-auto">
                <button 
                  onClick={handleDownload}
                  className="flex-1 sm:flex-none text-white bg-gray-800/80 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
                <button 
                  onClick={handleShare}
                  className="flex-1 sm:flex-none text-white bg-gray-800/80 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>
          </div>

          {/* Related Content */}
          {related.length > 0 && (
            <div className="border-t border-gray-800 pt-4">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-3 font-semibold text-center sm:text-left">Related Content</p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center sm:justify-start">
                {related.map(({ item, index }) => (
                  <button
                    key={item.contentId}
                    onClick={() => {
                      setCurrentIndex(index)
                      setIsLoading(true)
                    }}
                    className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden transition-all opacity-60 hover:opacity-100 hover:scale-105"
                  >
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
