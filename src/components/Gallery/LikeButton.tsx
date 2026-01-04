import { Heart, Loader2 } from 'lucide-react'
import { useOptimisticLike } from '../../hooks/useOptimisticLike'
import { useAuth } from '../../hooks/useAuth'

interface LikeButtonProps {
  contentId: string
  contentType: 'gallery' | 'ugc'
  initialLiked: boolean
  initialCount: number
  onError?: (error: Error) => void
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  compact?: boolean
}

export const LikeButton = ({
  contentId,
  contentType,
  initialLiked,
  initialCount,
  onError,
  size = 'md',
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

    try {
      await toggleLike()
    } catch (err) {
      onError?.(err as Error)
    }
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
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
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : (
        <Heart
          className={`${iconSizes[size]} ${isLiked ? 'fill-current' : ''} transition-all`}
        />
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
