import { mutation, query } from './_generated/server'
import { v, ConvexError } from 'convex/values'
import { getCurrentUser } from './helpers'

async function requireAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new ConvexError('Not authenticated')
  }

  const user = await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q: any) => q.eq('clerkId', identity.subject))
    .first()

  if (!user) {
    throw new ConvexError('User not found')
  }

  if (user.role !== 'admin' && user.role !== 'mod' && user.role !== 'artist') {
    throw new ConvexError('Insufficient permissions.')
  }

  return user
}

export const getUserNotifications = query({
  args: {
    userId: v.id('users'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return []
    }

    const currentUser = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .first()

    if (!currentUser) {
      return []
    }

    if (currentUser._id.toString() !== args.userId.toString() && currentUser.role !== 'admin') {
      return []
    }

    const limit = Math.min(Math.max(args.limit ?? 20, 1), 100)
    return await ctx.db
      .query('notifications')
      .withIndex('by_user_createdAt', (q) => q.eq('userId', args.userId))
      .order('desc')
      .take(limit)
  },
})

export const markNotificationRead = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx)
    const notification = await ctx.db.get(args.notificationId)
    if (!notification) {
      throw new ConvexError('Notification not found')
    }
    if (notification.userId.toString() !== currentUser._id.toString()) {
      throw new ConvexError('Unauthorized')
    }

    await ctx.db.patch(args.notificationId, {
      isRead: true,
    })
    return { success: true }
  },
})

export const markAllRead = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx)
    if (currentUser._id.toString() !== args.userId.toString()) {
      throw new ConvexError('Unauthorized')
    }

    const unread = await ctx.db
      .query('notifications')
      .withIndex('by_user_unread', (q) => q.eq('userId', args.userId).eq('isRead', false))
      .collect()

    for (const note of unread) {
      await ctx.db.patch(note._id, { isRead: true })
    }

    return { success: true, updated: unread.length }
  },
})

export const createNotification = mutation({
  args: {
    userId: v.id('users'),
    title: v.string(),
    message: v.string(),
    type: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const notificationId = await ctx.db.insert('notifications', {
      userId: args.userId,
      title: args.title,
      message: args.message,
      type: args.type,
      actionUrl: args.actionUrl,
      isRead: false,
      createdAt: Date.now(),
    })

    return { notificationId }
  },
})
