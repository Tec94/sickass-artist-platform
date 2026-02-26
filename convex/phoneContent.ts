import { mutation, query } from './_generated/server'
import { v, ConvexError } from 'convex/values'

const PHONE_CONTENT_KEY = 'default'

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const asString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

const getPayloadMetadata = (payload: unknown): { artist?: string; scrapeDate?: string } => {
  if (!isRecord(payload)) return {}
  return {
    artist: asString(payload.artist),
    scrapeDate: asString(payload.scrapeDate),
  }
}

export const getPhoneArtistContentPayload = query({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query('phoneArtistContent')
      .withIndex('by_key', (q) => q.eq('key', PHONE_CONTENT_KEY))
      .first()

    if (!existing) {
      return null
    }

    return {
      payload: existing.payload,
      artist: existing.artist ?? null,
      scrapeDate: existing.scrapeDate ?? null,
      source: existing.source ?? null,
      updatedAt: existing.updatedAt,
    }
  },
})

export const uploadPhoneArtistContentPayload = mutation({
  args: {
    payload: v.any(),
    source: v.optional(v.string()),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const expectedToken = process.env.PHONE_CONTENT_UPLOAD_TOKEN
    if (expectedToken && args.token !== expectedToken) {
      throw new ConvexError('Unauthorized phone content upload.')
    }

    const existing = await ctx.db
      .query('phoneArtistContent')
      .withIndex('by_key', (q) => q.eq('key', PHONE_CONTENT_KEY))
      .first()

    const now = Date.now()
    const metadata = getPayloadMetadata(args.payload)

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
      key: PHONE_CONTENT_KEY,
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
