import type { QueryCtx } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'

type UserRole = 'artist' | 'admin' | 'mod' | 'crew' | 'fan'
type FanTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export const getCurrentUser = async (ctx: QueryCtx): Promise<Doc<'users'>> => {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Not authenticated')
  }

  const clerkId = identity.subject

  const user = await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q) => q.eq('clerkId', clerkId))
    .first()

  if (!user) {
    throw new Error('User not found')
  }

  return user
}

export const canAccessChannel = async (
  ctx: QueryCtx,
  userId: Id<'users'>,
  channelId: Id<'channels'>
): Promise<boolean> => {
  const user = await ctx.db.get(userId)
  const channel = await ctx.db.get(channelId)

  if (!user || !channel) {
    return false
  }

  if (channel.requiredRole) {
    const roleHierarchy: Record<UserRole, number> = {
      artist: 4,
      admin: 3,
      mod: 2,
      crew: 1,
      fan: 0,
    }
    if (roleHierarchy[user.role] < roleHierarchy[channel.requiredRole]) {
      return false
    }
  }

  if (channel.requiredFanTier) {
    const tierLevel = getTierLevel(user.fanTier)
    const requiredLevel = getTierLevel(channel.requiredFanTier)
    if (tierLevel < requiredLevel) {
      return false
    }
  }

  return true
}

export const canAccessCategory = async (
  ctx: QueryCtx,
  userId: Id<'users'>,
  categoryId: Id<'categories'>
): Promise<boolean> => {
  const user = await ctx.db.get(userId)
  const category = await ctx.db.get(categoryId)

  if (!user || !category) {
    return false
  }

  if (category.requiredRole) {
    const roleHierarchy: Record<UserRole, number> = {
      artist: 4,
      admin: 3,
      mod: 2,
      crew: 1,
      fan: 0,
    }
    if (roleHierarchy[user.role] < roleHierarchy[category.requiredRole]) {
      return false
    }
  }

  if (category.requiredFanTier) {
    const tierLevel = getTierLevel(user.fanTier)
    const requiredLevel = getTierLevel(category.requiredFanTier)
    if (tierLevel < requiredLevel) {
      return false
    }
  }

  return true
}

export const isModerator = (user: Doc<'users'>): boolean => {
  return user.role === 'mod' || user.role === 'admin' || user.role === 'artist'
}

export const validateIdempotencyKey = async (
  ctx: QueryCtx,
  channelId: Id<'channels'>,
  authorId: Id<'users'>,
  idempotencyKey: string
): Promise<boolean> => {
  const existingMessage = await ctx.db
    .query('messages')
    .withIndex('by_idempotency', (q) =>
      q.eq('channelId', channelId).eq('authorId', authorId).eq('idempotencyKey', idempotencyKey)
    )
    .first()

  return existingMessage === null
}

export const getTierLevel = (tier: FanTier): number => {
  const tierLevels: Record<FanTier, number> = {
    bronze: 0,
    silver: 1,
    gold: 2,
    platinum: 3,
  }
  return tierLevels[tier]
}

export const generateIdempotencyKey = (
  userId: Id<'users'>,
  channelId: Id<'channels'>,
  nonce: string = Date.now().toString()
): string => {
  return `${userId}|${channelId}|${nonce}`
}

export const updateUserSocialPoints = async (
  ctx: { db: any },
  userId: Id<'users'>,
  delta: number
) => {
  const user = await ctx.db.get(userId)
  if (!user) return

  await ctx.db.patch(userId, {
    votedPoints: (user.votedPoints || 0) + delta,
  })
}
