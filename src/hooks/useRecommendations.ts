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
    if (cached && Array.isArray(cached)) {
      // Check if cached items are already GalleryContentItem format
      const isValid = cached.length > 0 && cached.every(item => 
        item !== null && 
        typeof item === 'object' &&
        'contentId' in item &&
        'creator' in item &&
        'isLiked' in item &&
        'isLocked' in item
      )
      if (isValid) {
        setCached(cached as GalleryContentItem[])
        setIsFromCache(true)
      }
    }
  }, [contentId, enabled])

  // Query from server
  const recommendations = useQuery(
    api.recommendations.getRelatedContent,
    enabled && !cached ? { contentId, limit } : 'skip'
  )

  // Cache new results
  useEffect(() => {
    if (recommendations && !isFromCache && Array.isArray(recommendations)) {
      // Check if recommendations are already in GalleryContentItem format
      const isValid = recommendations.length > 0 && recommendations.every(item => 
        item !== null && 
        typeof item === 'object' &&
        'contentId' in item &&
        'creator' in item &&
        'isLiked' in item &&
        'isLocked' in item
      )
      if (isValid) {
        const validRecommendations = recommendations as GalleryContentItem[]
        recommendationCache.set(contentId, validRecommendations, 60)
        setCached(validRecommendations)
      }
    }
  }, [recommendations, contentId, isFromCache])

  const data = cached || recommendations || []

  return {
    data,
    isLoading: enabled && !cached && !recommendations,
    isFromCache,
  }
}
