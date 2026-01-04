interface CachedRecommendation {
  contentId: string
  recommendations: unknown[]
  timestamp: number
  ttl: number
}

const DEFAULT_TTL = 60 // minutes

class RecommendationCache {
  private cache: Map<string, CachedRecommendation> = new Map()

  get(contentId: string): unknown[] | null {
    const cached = this.cache.get(contentId)
    if (!cached) return null

    const ageMinutes = (Date.now() - cached.timestamp) / (60 * 1000)
    if (ageMinutes > cached.ttl) {
      this.cache.delete(contentId)
      return null
    }

    return cached.recommendations
  }

  set(contentId: string, recommendations: unknown[], ttlMinutes = DEFAULT_TTL): void {
    this.cache.set(contentId, {
      contentId,
      recommendations,
      timestamp: Date.now(),
      ttl: ttlMinutes,
    })
  }

  clear(): void {
    this.cache.clear()
  }

  // Cleanup expired entries periodically
  cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      const ageMinutes = (now - value.timestamp) / (60 * 1000)
      if (ageMinutes > value.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

export const recommendationCache = new RecommendationCache()

// Cleanup every 5 minutes
setInterval(() => {
  recommendationCache.cleanup()
}, 5 * 60 * 1000)
