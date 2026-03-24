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
        payloadEnvelope?: {
          version: 'artist-scrape/v1'
          data: unknown
          importedAt: number
        }
        payload?: unknown
        artist?: string
        scrapeDate?: string
        source?: string
        createdAt?: number
        updatedAt: number
      }
    | null,
) => {
  if (!record) {
    return null
  }

  const payloadEnvelope = record.payloadEnvelope
  const payload = payloadEnvelope?.data ?? record.payload ?? null
  const version = payloadEnvelope?.version ?? 'artist-scrape/v1'
  const importedAt = payloadEnvelope?.importedAt ?? record.createdAt ?? record.updatedAt

  return {
    payload,
    version,
    importedAt,
    artist: record.artist ?? null,
    scrapeDate: record.scrapeDate ?? null,
    source: record.source ?? null,
    updatedAt: record.updatedAt,
  }
}
