import { useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { adaptArtistContentPayload, createFallbackArtistContent } from './artistContentAdapter'
import type { ArtistContent, ArtistContentPayloadResult } from './types'

export type UseArtistContentResult = {
  content: ArtistContent
  payload: ArtistContentPayloadResult
  isLoading: boolean
  hasPayload: boolean
}

export function useArtistContent(): UseArtistContentResult {
  const payload = useQuery(api.artistContent.getArtistContentPayload, {})
  const isLoading = payload === undefined

  const content = useMemo(() => {
    if (!payload) {
      return createFallbackArtistContent()
    }

    return adaptArtistContentPayload(payload.payload, {
      artist: payload.artist,
      scrapeDate: payload.scrapeDate,
      source: payload.source,
      updatedAt: payload.updatedAt,
    })
  }, [payload])

  return {
    content,
    payload: payload ?? null,
    isLoading,
    hasPayload: Boolean(payload?.payload),
  }
}
