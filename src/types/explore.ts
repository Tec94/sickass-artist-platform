// Explore page types

import type { FanTier } from './index'

export type ExploreCategory = 'all' | 'gallery' | 'ugc' | 'users'
export type DateRange = '7d' | '30d' | '90d' | 'all'
export type FanTierFilter = 'all' | FanTier
export type SortBy = 'trending' | 'newest' | 'mostLiked' | 'mostViewed'

export interface ExploreFilters {
  category: ExploreCategory
  dateRange: DateRange
  tier: FanTierFilter
  sort: SortBy
}

// Trending item type (mirrors convex/recommendations.ts)
export interface TrendingItem {
  id: string
  contentId: string
  title: string
  thumbnailUrl: string
  type: 'gallery' | 'ugc'
  subType: 'show' | 'bts' | 'edit' | 'wip' | 'exclusive' | 'user-edit' | 'fan-art' | 'repost'
  creatorId: string
  creatorDisplayName: string
  creatorAvatar: string
  creatorTier: FanTier
  likeCount: number
  viewCount: number
  isLocked: boolean
  requiredFanTier?: FanTier
  createdAt: number
  trendingScore: number
}
