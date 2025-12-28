// User roles
export type UserRole = 'artist' | 'admin' | 'mod' | 'crew' | 'fan'

// Fan tiers (linked to Clerk Billing)
export type FanTier = 'bronze' | 'silver' | 'gold' | 'platinum'

// User profile data (stored in Convex)
export interface UserProfile {
  userId: string  // Clerk user ID
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

// User data with Clerk integration
export interface User {
  clerkId: string
  email: string
  profile: UserProfile
}