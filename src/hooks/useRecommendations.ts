import { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { recommendationCache } from '../utils/recommendationCache'
import type { GalleryContentItem } from '../types/gallery'

interface UseRecommendationsOptions {
  contentId: string
  limit?: number
  enabled?: boolean
}

export const useRecommendations = ({
  contentId,
  limit = 6,
  enabled = true,
}: UseRecommendationsOptions) => {
  const [cached, setCached] = useState<GalleryContentItem[] | null>(null)
  const [isFromCache, setIsFromCache] = useState(false)

  // Try cache first
  useEffect(() => {
    if (!enabled) return

    const cached = recommendationCache.get(contentId)
    if (cached) {
      setCached(cached)
      setIsFromCache(true)
    }
  }, [contentId, enabled])

  // Query from server
  const recommendations = useQuery(
    api.recommendations.getRelatedContent,
    enabled && !cached ? { contentId, limit } : 'skip'
  )

  // Cache new results
  useEffect(() => {
    if (recommendations && !isFromCache) {
      recommendationCache.set(contentId, recommendations, 60)
      setCached(recommendations)
    }
  }, [recommendations, contentId, isFromCache])

  const data = cached || recommendations || []

  return {
    data,
    isLoading: enabled && !cached && !recommendations,
    isFromCache,
  }
}
