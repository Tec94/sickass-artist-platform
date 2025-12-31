import { useCallback, useEffect, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

type LikeType = 'gallery' | 'ugc'

interface UseOptimisticLikeResult {
  likeCount: number
  isLiked: boolean
  isLoading: boolean
  error: Error | null
  handleLike: () => Promise<void>
}

export function useOptimisticLike(
  contentId: string,
  type: LikeType,
  initialLikeCount: number,
  initialIsLiked = false
): UseOptimisticLikeResult {
  const likeGallery = useMutation(api.gallery.likeGalleryContent)
  const likeUGC = useMutation(api.ugc.likeUGC)

  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isLoading) return
    setLikeCount(initialLikeCount)
    setIsLiked(initialIsLiked)
  }, [contentId, initialIsLiked, initialLikeCount, isLoading])

  const handleLike = useCallback(async () => {
    if (isLoading) return

    setError(null)
    setIsLoading(true)

    const previousLiked = isLiked
    const previousCount = likeCount

    const optimisticLiked = !previousLiked
    const optimisticCount = Math.max(0, previousCount + (previousLiked ? -1 : 1))

    setIsLiked(optimisticLiked)
    setLikeCount(optimisticCount)

    try {
      if (type === 'gallery') {
        const result = await likeGallery({ contentId })
        setIsLiked(result.liked)
        setLikeCount(result.newCount)
      } else {
        const result = await likeUGC({ ugcId: contentId })
        setIsLiked(result.liked)
        setLikeCount(result.newCount)
      }
    } catch (err) {
      setIsLiked(previousLiked)
      setLikeCount(previousCount)

      const errorObject = err instanceof Error ? err : new Error('Failed to update like')
      setError(errorObject)
      throw errorObject
    } finally {
      setIsLoading(false)
    }
  }, [contentId, isLiked, isLoading, likeCount, likeGallery, likeUGC, type])

  return {
    likeCount,
    isLiked,
    isLoading,
    error,
    handleLike,
  }
}
