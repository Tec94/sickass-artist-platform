import { memo, useState, useRef, useEffect, useCallback } from 'react'
import type { GalleryContentItem } from '../../types/gallery'

interface GalleryCardProps {
  item: GalleryContentItem
  isLocked?: boolean
  onClick?: () => void
}

export const GalleryCard = memo(function GalleryCard({
  item,
  isLocked,
  onClick,
}: GalleryCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageVisible, setImageVisible] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const imgElement = imgRef.current
    if (!imgElement) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    )

    observer.observe(imgElement)

    return () => {
      if (imgElement) {
        observer.unobserve(imgElement)
      }
    }
  }, [])

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick()
    }
  }, [onClick])

  return (
    <div
      className={`bg-gray-900/70 border border-gray-800 rounded-lg overflow-hidden transition-all duration-200 cursor-pointer hover:border-cyan-500/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10 ${
        isLocked ? 'opacity-80' : ''
      }`}
      onClick={handleClick}
    >
      <div className="relative aspect-video overflow-hidden bg-gray-950">
        {!imageVisible && (
          <div className="absolute inset-0 bg-gray-900 animate-pulse" />
        )}
        
        <img
          ref={imgRef}
          src={imageVisible ? item.thumbnailUrl || item.imageUrl : ''}
          alt={item.title}
          loading="lazy"
          onLoad={handleImageLoad}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${isLocked ? 'filter blur-sm' : ''}`}
        />

        {isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
            <span className="text-3xl mb-2">🔒</span>
            <span className="text-xs font-bold tracking-wider text-amber-400 bg-black/60 px-3 py-1 rounded-full">
              {item.requiredFanTier?.toUpperCase()} ONLY
            </span>
          </div>
        )}

        <div className="absolute top-2 left-2 bg-cyan-500/90 text-black px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">
          {item.type}
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-white font-medium text-sm mb-2 truncate" title={item.title}>
          {item.title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-cyan-400 text-xs">@{item.creator.username}</span>
          <div className="flex gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="text-red-400">❤</span>
              {item.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-blue-400">👁</span>
              {item.viewCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
})
