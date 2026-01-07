import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const getChannelSettings = query({
    args: {
        channelId: v.id('channels'),
        userId: v.id('users')
    },
    handler: async (ctx, args) => {
        const settings = await ctx.db
            .query('userChannelSettings')
            .withIndex('by_user_channel', (q) =>
                q.eq('userId', args.userId).eq('channelId', args.channelId)
            )
            .unique()

        return settings || { muted: false, deafened: false }
    },
})

export const toggleMute = mutation({
    args: {
        channelId: v.id('channels'),
        userId: v.id('users')
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query('userChannelSettings')
            .withIndex('by_user_channel', (q) =>
                q.eq('userId', args.userId).eq('channelId', args.channelId)
            )
            .unique()

        if (existing) {
            await ctx.db.patch(existing._id, {
                muted: !existing.muted,
                updatedAt: Date.now(),
            })
        } else {
            await ctx.db.insert('userChannelSettings', {
                userId: args.userId,
                channelId: args.channelId,
                muted: true,
                deafened: false,
                updatedAt: Date.now(),
            })
        }
    },
})

export const toggleDeafen = mutation({
    args: {
        channelId: v.id('channels'),
        userId: v.id('users')
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query('userChannelSettings')
            .withIndex('by_user_channel', (q) =>
                q.eq('userId', args.userId).eq('channelId', args.channelId)
            )
            .unique()

        if (existing) {
            await ctx.db.patch(existing._id, {
                deafened: !existing.deafened,
                updatedAt: Date.now(),
            })
        } else {
            await ctx.db.insert('userChannelSettings', {
                userId: args.userId,
                channelId: args.channelId,
                muted: false,
                deafened: true,
                updatedAt: Date.now(),
            })
        }
    },
})

export const getAllChannelSettings = query({
    args: { userId: v.id('users') },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('userChannelSettings')
            .withIndex('by_user', (q) => q.eq('userId', args.userId))
            .collect()
    },
})
