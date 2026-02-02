import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const ingestEvents = mutation({
  args: {
    events: v.array(v.object({
      name: v.string(),
      data: v.any(),
      timestamp: v.number(),
      sessionId: v.string(),
      userId: v.optional(v.string()),
      tier: v.optional(v.union(
        v.literal('artist'),
        v.literal('admin'),
        v.literal('mod'),
        v.literal('fan')
      )),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const batch = args.events.slice(0, 200)

    for (const event of batch) {
      await ctx.db.insert('analyticsEvents', {
        ...event,
        createdAt: now,
      })
    }

    return { inserted: batch.length }
  },
})
