// User roles
export type UserRole = 'artist' | 'admin' | 'mod' | 'crew' | 'fan'

// Fan tiers
export type FanTier = 'bronze' | 'silver' | 'gold' | 'platinum'

// User profile data (stored in Convex)
export interface UserProfile {
  userId: string  // User ID
  username: string
  displayName: string
  bio: string
  avatar: string
  role: UserRole
  fanTier: FanTier
  socials: {
    twitter?: string
    instagram?: string
    tiktok?: string
  }
  location: string
  xp: number
  level: number
  badges: string[]
  createdAt: number
  updatedAt: number
}

// User data with auth integration
export interface User {
  clerkId: string // Auth subject (`sub`) from Auth0 (historical field name)
  email: string
  profile: UserProfile
}

// Explore page types
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

// Chat types
export * from './chat'

// Forum types
export * from './forum'

// Event types
export * from './events'
