import { useState, useCallback, useRef, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useOfflineQueue } from './useOfflineQueue'
import { useAuth } from './useAuth'

interface UseOptimisticLikeReturn {
  isLiked: boolean
  likeCount: number
  isLoading: boolean
  isRetrying: boolean
  error: Error | null
  isPending: boolean
  toggleLike: () => Promise<void>
  handleLike: () => Promise<void>
}

export const useOptimisticLike = (
  contentId: string,
  contentType: 'gallery' | 'ugc',
  initialLiked: boolean,
  initialCount: number
): UseOptimisticLikeReturn => {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isPending, setIsPending] = useState(false)

  // Refs for state consistency
  const previousStateRef = useRef({ isLiked: initialLiked, count: initialCount })
  const mutationQueueRef = useRef<Promise<void>>(Promise.resolve())
  const retryCountRef = useRef(0)
  const maxRetriesRef = useRef(3)

  // Mutations
  const likeContentMutation = useMutation(
    contentType === 'gallery' ? api.gallery.likeGalleryContent : api.ugc.likeUGC
  )
  const unlikeContentMutation = useMutation(
    contentType === 'gallery' ? api.gallery.unlikeGalleryContent : api.ugc.unlikeUGC
  )

  // Offline queue
  const { addToQueue } = useOfflineQueue()

  // Retry with exponential backoff
  const retryWithBackoff = useCallback(
    async (action: () => Promise<void>, maxRetries = 3) => {
      let lastError: Error | null = null

      for (let i = 0; i < maxRetries; i++) {
        try {
          setIsRetrying(i > 0)
          await action()
          retryCountRef.current = 0
          setIsRetrying(false)
          return
        } catch (err) {
          lastError = err as Error
          if (i < maxRetries - 1) {
            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.pow(2, i) * 1000
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        }
      }

      throw lastError
    },
    []
  )

  // Toggle like
  const toggleLike = useCallback(async () => {
    if (!user) {
      setError(new Error('You must be logged in to like'))
      return
    }

    // Add to mutation queue to prevent race conditions
    mutationQueueRef.current = mutationQueueRef.current.then(async () => {
      setIsLoading(true)
      setError(null)

      // Store previous state for rollback
      previousStateRef.current = { isLiked, count: likeCount }

      // Optimistic update
      const newLiked = !isLiked
      setIsLiked(newLiked)
      setLikeCount(prev => (newLiked ? prev + 1 : prev - 1))
      setIsPending(true)

      try {
        const mutation = newLiked
          ? () => likeContentMutation({ [contentType === 'gallery' ? 'contentId' : 'ugcId']: contentId })
          : () => unlikeContentMutation({ [contentType === 'gallery' ? 'contentId' : 'ugcId']: contentId })

        // Try with retries
        await retryWithBackoff(mutation, maxRetriesRef.current)

        setIsPending(false)
        setIsLoading(false)
      } catch (err) {
        const error = err as Error

        // Rollback on error
        setIsLiked(previousStateRef.current.isLiked)
        setLikeCount(previousStateRef.current.count)
        setError(error)
        setIsPending(false)
        setIsLoading(false)

        // Queue for offline sync
        if (navigator.onLine === false) {
          const queueType = contentType === 'gallery' ? 'like_gallery' : 'like_ugc'
          const payload = contentType === 'gallery'
            ? { contentId }
            : { ugcId: contentId }

          await addToQueue({
            type: queueType,
            action: newLiked ? 'like' : 'unlike',
            payload,
          })
        }

        // Show error toast
        console.error('Failed to update like:', error)
        throw error
      }
    })
  }, [user, isLiked, likeCount, contentId, contentType, likeContentMutation, unlikeContentMutation, addToQueue, retryWithBackoff])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel pending mutations if component unmounts
    }
  }, [])

  return {
    isLiked,
    likeCount,
    isLoading,
    isRetrying,
    error,
    isPending,
    toggleLike,
    handleLike: toggleLike,
  }
}
