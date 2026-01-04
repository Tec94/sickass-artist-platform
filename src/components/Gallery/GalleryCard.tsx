import { memo, useCallback } from 'react'
import type { GalleryContentItem } from '../../types/gallery'
import { OptimizedImage } from './OptimizedImage'
import { LikeButton } from './LikeButton'

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
  const handleCardClick = useCallback(() => {
    if (onClick) {
      onClick()
    }
  }, [onClick])

  const handleLikeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  return (
    <div
      className={`bg-gray-900/70 border border-gray-800 rounded-lg overflow-hidden transition-all duration-200 cursor-pointer hover:border-cyan-500/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10 ${
        isLocked ? 'opacity-80' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden bg-gray-950">
        <OptimizedImage
          src={item.thumbnailUrl || item.imageUrl}
          alt={item.title}
          aspectRatio={16 / 9}
          className={isLocked ? 'filter blur-sm' : ''}
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
        <div className="flex gap-3 items-center">
          <div onClick={handleLikeClick}>
            <LikeButton
              contentId={item.contentId}
              contentType="gallery"
              initialLiked={item.isLiked}
              initialCount={item.likeCount}
              size="sm"
              showCount
              compact
            />
          </div>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <span className="text-blue-400">👁</span>
            {item.viewCount}
          </span>
        </div>
      </div>
      </div>
    </div>
  )
})
