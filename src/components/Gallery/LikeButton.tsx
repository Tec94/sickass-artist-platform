import { useOptimisticLike } from '../../hooks/useOptimisticLike'
import { useAuth } from '../../hooks/useAuth'
import { perfMonitor } from '../../utils/performanceMonitor'
import { trackLike, trackUnlike } from '../../utils/analytics'

interface LikeButtonProps {
  contentId: string
  contentType: 'gallery' | 'ugc'
  initialLiked: boolean
  initialCount: number
  onError?: (error: Error) => void
  showCount?: boolean
  compact?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const LikeButton = ({
  contentId,
  contentType,
  initialLiked,
  initialCount,
  onError,
  showCount = true,
  compact = false,
}: LikeButtonProps) => {
  const { user } = useAuth()
  const { isLiked, likeCount, isLoading, isPending, toggleLike } =
    useOptimisticLike(contentId, contentType, initialLiked, initialCount)

  const handleClick = async () => {
    if (!user) {
      // Redirect to login or show modal
      console.log('User must login')
      return
    }

    const startTime = performance.now()
    const willLike = !isLiked

    try {
      await toggleLike()
      const duration = performance.now() - startTime
      perfMonitor.trackLikeResponse(duration, true)
      
      // Track analytics
      if (willLike) {
        trackLike(contentType, contentId)
      } else {
        trackUnlike(contentType, contentId)
      }
    } catch (err) {
      const duration = performance.now() - startTime
      perfMonitor.trackLikeResponse(duration, false)
      onError?.(err as Error)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`flex items-center gap-2 ${compact ? '' : 'transition-all duration-200'} ${
        isLiked
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-400 hover:text-gray-300'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isLiked ? 'Unlike' : 'Like'}
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      {isLoading || isPending ? (
        <iconify-icon icon="solar:spinner-linear" class="animate-spin"></iconify-icon>
      ) : (
        <iconify-icon
          icon="solar:heart-linear"
          class={isLiked ? 'fill-current' : ''}
          style={{ transition: 'all 0.2s' }}
        ></iconify-icon>
      )}
      {showCount && (
        <span className="text-sm font-medium tabular-nums">{likeCount}</span>
      )}
      {isPending && (
        <span className="text-xs text-gray-500 animate-pulse">pending</span>
      )}
    </button>
  )
}
