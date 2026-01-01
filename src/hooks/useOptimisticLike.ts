import { useCallback, useRef } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useOfflineQueue } from './useOfflineQueue'
import { showToast } from '../lib/toast'

type LikeType = 'gallery' | 'ugc'

interface UseOptimisticLikeResult {
  likeCount: number
  isLiked: boolean
  isPending: boolean
  error: string | null
  handleLike: () => Promise<void>
}

export function useOptimisticLike(
  contentId: string,
  type: LikeType,
  initialCount: number,
  initialIsLiked = false
): UseOptimisticLikeResult {
  const { addToQueue, isOnline } = useOfflineQueue()

  const likeGallery = useMutation(api.gallery.likeGalleryContent)
  const likeUGC = useMutation(api.ugc.likeUGC)

  const stateRef = useRef({
    likeCount: initialCount,
    isLiked: initialIsLiked,
  })

  const isPendingRef = useRef(false)

  const handleLike = useCallback(async () => {
    if (isPendingRef.current) return

    isPendingRef.current = true

    const previousLiked = stateRef.current.isLiked
    const previousCount = stateRef.current.likeCount

    const optimisticLiked = !previousLiked
    const optimisticCount = Math.max(0, previousCount + (previousLiked ? -1 : 1))

    stateRef.current = {
      likeCount: optimisticCount,
      isLiked: optimisticLiked,
    }

    if (!isOnline) {
      await addToQueue({
        type: 'like_gallery',
        payload: {
          contentId: type === 'gallery' ? contentId : undefined,
          ugcId: type === 'ugc' ? contentId : undefined,
        },
      })
      isPendingRef.current = false
      return
    }

    try {
      let result: { liked: boolean; newCount: number }
      if (type === 'gallery') {
        result = await likeGallery({ contentId })
      } else {
        result = await likeUGC({ ugcId: contentId })
      }

      stateRef.current = {
        likeCount: result.newCount,
        isLiked: result.liked,
      }
    } catch (err) {
      stateRef.current = {
        likeCount: previousCount,
        isLiked: previousLiked,
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to update like'
      showToast(errorMessage, {
        action: {
          label: 'Retry',
          onClick: () => {
            void handleLike()
          },
        },
      })
    } finally {
      isPendingRef.current = false
    }
  }, [contentId, type, isOnline, addToQueue, likeGallery, likeUGC])

  return {
    get likeCount() {
      return stateRef.current.likeCount
    },
    get isLiked() {
      return stateRef.current.isLiked
    },
    get isPending() {
      return isPendingRef.current
    },
    get error() {
      return null
    },
    handleLike,
  }
}
