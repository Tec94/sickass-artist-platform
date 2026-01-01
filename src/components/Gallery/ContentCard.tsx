import { useCallback, useMemo, useState } from 'react'
import { Heart, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ProfileAvatar } from '../Profile/ProfileAvatar'
import { useOptimisticLike } from '../../hooks/useOptimisticLike'
import { formatTierLabel, tierStyles } from '../../constants/tierStyles'
import type { GalleryContentItem as GalleryItem } from '../../types/gallery'

interface ContentCardProps {
  item: GalleryItem
  isLocked?: boolean
  onClick?: () => void
}

export function ContentCard({ item, isLocked, onClick }: ContentCardProps) {
  const navigate = useNavigate()
  const [imageError, setImageError] = useState(false)

  const { likeCount, isLiked, isPending, handleLike } = useOptimisticLike(
    item.contentId,
    'gallery',
    item.likeCount,
    item.isLiked
  )

  const requiredTierLabel = useMemo(() => {
    const tier = item.requiredFanTier ?? 'platinum'
    return `${formatTierLabel(tier)} Only`
  }, [item.requiredFanTier])

  const handleCreatorClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      navigate(`/profile/${item.creator._id}`)
    },
    [item.creator._id, navigate]
  )

  const handleLikeClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      if (isPending) return

      await handleLike()
    },
    [handleLike, isPending]
  )

  const visibleTags = useMemo(() => {
    const tags = item.tags ?? []
    const sliced = tags.slice(0, 3)
    const remaining = tags.length - sliced.length
    return {
      sliced,
      remaining,
    }
  }, [item.tags])

  return (
    <div
      role="button"
      tabIndex={0}
      className={
        'group relative rounded-lg overflow-hidden cursor-pointer bg-gray-900/70 border border-gray-800 ' +
        'transition-all duration-200 hover:shadow-lg hover:shadow-black/30 hover:scale-[1.02]'
      }
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
    >
      <div className="relative aspect-video bg-gray-800 overflow-hidden">
        {!imageError ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-300 text-xs">
            Image unavailable
          </div>
        )}

        {item.creator?.fanTier && (
          <div
            className={
              `absolute top-2 right-2 border rounded-full px-2 py-0.5 text-xs font-semibold ${
                tierStyles[item.creator.fanTier]
              }`
            }
          >
            {item.creator.fanTier.toUpperCase()}
          </div>
        )}

        {isLocked && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
            <Lock className="w-8 h-8 text-white" />
            <span className="text-xs font-semibold tracking-wide text-white bg-black/40 px-3 py-1 rounded-full">
              {requiredTierLabel}
            </span>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3
          className="font-semibold text-sm text-white mb-2"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
          title={item.title}
        >
          {item.title}
        </h3>

        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={handleCreatorClick}
            className="flex items-center gap-2 min-w-0 hover:opacity-90 transition"
          >
            <ProfileAvatar user={item.creator} size="sm" />
            <span className="text-xs font-medium text-gray-200 truncate max-w-[140px]">
              {item.creator.displayName}
            </span>
          </button>

          <button
            type="button"
            onClick={handleLikeClick}
            className="ml-auto flex items-center gap-1 text-xs text-gray-300 hover:opacity-80 transition"
            aria-pressed={isLiked}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart
              className={`w-4 h-4 ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'
              }`}
            />
            <span>{formatNumber(likeCount)}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {visibleTags.sliced.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700"
            >
              {tag}
            </span>
          ))}
          {visibleTags.remaining > 0 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
              +{visibleTags.remaining}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return n.toString()
}
