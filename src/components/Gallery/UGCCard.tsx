import { memo, useState, useRef, useEffect, useCallback } from 'react'
import type { UGCItem } from '../../types/ugc'
import { useOptimisticLike } from '../../hooks/useOptimisticLike'
import { api } from '../../../convex/_generated/api'
import { useMutation } from 'convex/react'
import { OptimizedImage } from './OptimizedImage'

interface UGCCardProps {
  item: UGCItem
  onClick?: () => void
}

export const UGCCard = memo(function UGCCard({
  item,
  onClick,
}: UGCCardProps) {
  const [imageVisible, setImageVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { likeCount, isLiked, isPending, handleLike } = useOptimisticLike(
    item.ugcId,
    'ugc',
    item.likeCount,
    item.isLiked
  )
  
  const incrementViewCount = useMutation(api.ugc.incrementUGCViewCount)

  useEffect(() => {
    const containerElement = containerRef.current
    if (!containerElement) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !imageVisible) {
            setImageVisible(true)
            void incrementViewCount({ ugcId: item.ugcId })
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    )

    observer.observe(containerElement)

    return () => {
      if (containerElement) {
        observer.unobserve(containerElement)
      }
    }
  }, [item.ugcId, incrementViewCount, imageVisible])

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick()
    }
  }, [onClick])

  const handleLikeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    void handleLike()
  }, [handleLike])

  const categoryLabels: Record<string, string> = {
    'user-edit': 'User Edit',
    'fan-art': 'Fan Art',
    'repost': 'Repost',
  }

  return (
    <div
      ref={containerRef}
      className="bg-gray-900/70 border border-gray-800 rounded-lg overflow-hidden transition-all duration-200 cursor-pointer hover:border-cyan-500/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10"
      onClick={handleClick}
    >
      <div className="relative overflow-hidden bg-gray-950">
        {imageVisible ? (
          <OptimizedImage
            src={item.imageUrls[0]}
            alt={item.title}
            aspectRatio={16 / 9}
          />
        ) : (
          <div className="aspect-video bg-gray-900 animate-pulse" />
        )}

        <div className="absolute top-2 left-2 bg-cyan-500/90 text-black px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">
          {categoryLabels[item.category] || item.category}
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-white font-medium text-sm mb-2 truncate" title={item.title}>
          {item.title}
        </h3>
        
        <p className="text-gray-400 text-xs mb-3 line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-cyan-400 text-xs">@{item.creatorDisplayName}</span>
          
          <div className="flex gap-3 text-xs text-gray-500">
            <button
              onClick={handleLikeClick}
              disabled={isPending}
              className={`flex items-center gap-1 transition-colors ${
                isLiked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'
              } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>{isLiked ? '❤️' : '🤍'}</span>
              {likeCount}
            </button>
            
            <span className="flex items-center gap-1">
              <span className="text-blue-400">👁</span>
              {item.viewCount}
            </span>
            
            <span className="flex items-center gap-1">
              <span className="text-green-400">↓</span>
              {item.downloadCount}
            </span>
          </div>
        </div>
        
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-xs text-gray-500">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})