import { mutation, query } from './_generated/server'
import { v, ConvexError } from 'convex/values'
import {
  getArtistPayloadMetadata,
  getStoredArtistContent,
  serializeArtistContentRecord,
  ARTIST_CONTENT_KEY,
} from './artistContentShared'

export const getArtistContentPayload = query({
  args: {},
  handler: async (ctx) => {
    const existing = await getStoredArtistContent(ctx)
    return serializeArtistContentRecord(existing)
  },
})

export const uploadArtistContentPayload = mutation({
  args: {
    payload: v.any(),
    source: v.optional(v.string()),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const expectedToken = process.env.PHONE_CONTENT_UPLOAD_TOKEN
    if (expectedToken && args.token !== expectedToken) {
      throw new ConvexError('Unauthorized artist content upload.')
    }

    const existing = await getStoredArtistContent(ctx)
    const now = Date.now()
    const metadata = getArtistPayloadMetadata(args.payload)

    if (existing) {
      await ctx.db.patch(existing._id, {
        payload: args.payload,
        source: args.source ?? existing.source,
        artist: metadata.artist ?? existing.artist,
        scrapeDate: metadata.scrapeDate ?? existing.scrapeDate,
        updatedAt: now,
      })

      return {
        created: false,
        updatedAt: now,
        artist: metadata.artist ?? existing.artist ?? null,
        scrapeDate: metadata.scrapeDate ?? existing.scrapeDate ?? null,
      }
    }

    await ctx.db.insert('phoneArtistContent', {
      key: ARTIST_CONTENT_KEY,
      payload: args.payload,
      source: args.source,
      artist: metadata.artist,
      scrapeDate: metadata.scrapeDate,
      createdAt: now,
      updatedAt: now,
    })

    return {
      created: true,
      updatedAt: now,
      artist: metadata.artist ?? null,
      scrapeDate: metadata.scrapeDate ?? null,
    }
  },
})
