import type { MutationCtx, QueryCtx } from './_generated/server'
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

export const getCurrentUserOrNull = async (ctx: QueryCtx): Promise<Doc<'users'> | null> => {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) return null

  const clerkId = identity.subject
  const user = await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q) => q.eq('clerkId', clerkId))
    .first()

  return user ?? null
}

const sanitizeUsername = (raw: string): string => {
  const s = raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 20)

  return s.length >= 3 ? s : ''
}

const fnv1a32Base36 = (input: string): string => {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(36)
}

export const getOrCreateCurrentUser = async (ctx: MutationCtx): Promise<Doc<'users'>> => {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new Error('Not authenticated')

  const clerkId = identity.subject

  const existing = await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q) => q.eq('clerkId', clerkId))
    .first()
  if (existing) return existing

  const now = Date.now()

  const email = typeof (identity as any).email === 'string' ? ((identity as any).email as string) : ''
  const name = typeof (identity as any).name === 'string' ? ((identity as any).name as string) : ''
  const picture = typeof (identity as any).picture === 'string' ? ((identity as any).picture as string) : ''

  const hash = fnv1a32Base36(clerkId).slice(0, 8)
  const fallbackUsername = `user_${hash}` // <= 13 chars, valid

  const candidateUsernames = [
    sanitizeUsername((identity as any).nickname ?? ''),
    sanitizeUsername(name),
    sanitizeUsername(email.split('@')[0] ?? ''),
    sanitizeUsername(fallbackUsername),
  ].filter(Boolean)

  let usernameToUse: string | null = null
  for (const candidate of candidateUsernames) {
    const taken = await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', candidate))
      .first()
    if (!taken) {
      usernameToUse = candidate
      break
    }
  }

  // Ultra-rare collision fallback.
  if (!usernameToUse) {
    for (let i = 0; i < 5; i++) {
      const candidate = sanitizeUsername(`user_${hash}${Math.floor(Math.random() * 10)}`)
      if (!candidate) continue
      const taken = await ctx.db
        .query('users')
        .withIndex('by_username', (q) => q.eq('username', candidate))
        .first()
      if (!taken) {
        usernameToUse = candidate
        break
      }
    }
  }

  if (!usernameToUse) throw new Error('Failed to allocate username')

  const userId = await ctx.db.insert('users', {
    clerkId,
    email,
    username: usernameToUse,
    displayName: sanitizeUsername(name) ? name : usernameToUse,
    bio: '',
    avatar: picture || '',
    role: 'fan',
    fanTier: 'bronze',
    socials: {},
    location: '',
    xp: 0,
    level: 1,
    badges: [],
    votedPoints: 0,
    createdAt: now,
    updatedAt: now,
    lastSignIn: now,
  })

  const created = await ctx.db.get(userId)
  if (!created) throw new Error('Failed to create user')
  return created
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
