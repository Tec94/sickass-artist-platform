import type { MutationCtx, QueryCtx } from './_generated/server'

export const ARTIST_CONTENT_KEY = 'default'

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const asString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

export const getArtistPayloadMetadata = (payload: unknown): { artist?: string; scrapeDate?: string } => {
  if (!isRecord(payload)) return {}
  return {
    artist: asString(payload.artist),
    scrapeDate: asString(payload.scrapeDate),
  }
}

export const getStoredArtistContent = async (ctx: QueryCtx | MutationCtx) =>
  ctx.db
    .query('phoneArtistContent')
    .withIndex('by_key', (q) => q.eq('key', ARTIST_CONTENT_KEY))
    .first()

export const serializeArtistContentRecord = (
  record:
    | {
        payloadEnvelope: {
          version: 'artist-scrape/v1'
          data: unknown
          importedAt: number
        }
        artist?: string
        scrapeDate?: string
        source?: string
        updatedAt: number
      }
    | null,
) => {
  if (!record) {
    return null
  }

  return {
    payload: record.payloadEnvelope.data,
    version: record.payloadEnvelope.version,
    importedAt: record.payloadEnvelope.importedAt,
    artist: record.artist ?? null,
    scrapeDate: record.scrapeDate ?? null,
    source: record.source ?? null,
    updatedAt: record.updatedAt,
  }
}
