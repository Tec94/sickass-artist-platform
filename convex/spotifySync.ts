'use node'

import { internalAction } from './_generated/server'
import { internal } from './_generated/api'

declare const process: { env: Record<string, string | undefined> }
declare const Buffer: {
  from(data: string, encoding?: string): { toString(encoding: string): string }
}

type SyncResult = {
  success?: boolean
  error?: string
  newTracks: number
  updated: number
  total?: number
}

/**
 * Get Spotify access token using client credentials flow (cached ~1 hour)
 */
let tokenCache: { token: string; expiresAt: number } | null = null

async function getSpotifyAccessToken(): Promise<string> {
  const now = Date.now()
  if (tokenCache && tokenCache.expiresAt > now) {
    return tokenCache.token
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Missing Spotify credentials')
  }

  const credentials = `${clientId}:${clientSecret}`
  const base64Credentials = Buffer.from(credentials).toString('base64')

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${base64Credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error(`Spotify auth failed: ${response.statusText}`)
  }

  const data = (await response.json()) as { access_token: string; expires_in?: number }
  const expiresInSeconds = data.expires_in ?? 3600

  tokenCache = {
    token: data.access_token,
    expiresAt: now + Math.max(0, expiresInSeconds - 60) * 1000,
  }

  return data.access_token
}

/**
 * Internal action called by cron job
 * Fetches latest tracks from artist's Spotify account and stores them
 */
export const syncSpotifyTracksInternal = internalAction({
  args: {},
  handler: async (ctx): Promise<SyncResult> => {
    try {
      const artistId = process.env.SPOTIFY_ARTIST_ID

      if (!artistId) {
        console.error('Missing SPOTIFY_ARTIST_ID')
        return { error: 'Missing SPOTIFY_ARTIST_ID', newTracks: 0, updated: 0 }
      }

      const token = await getSpotifyAccessToken()

      // Get artist's top tracks
      const response = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!response.ok) {
        console.error(`Spotify API error: ${response.statusText}`)
        return { error: `Spotify API: ${response.statusText}`, newTracks: 0, updated: 0 }
      }

      const data = (await response.json()) as {
        tracks?: Array<{
          id: string
          name: string
          artists: Array<{ name: string }>
          album: {
            name: string
            images: Array<{ url: string }>
            release_date: string
          }
          preview_url?: string | null
          duration_ms: number
          external_urls: { spotify: string }
          external_ids?: { isrc?: string }
          popularity: number
        }>
      }

      const rawTracks = data.tracks || []

      if (rawTracks.length === 0) {
        return { success: true, newTracks: 0, updated: 0, total: 0 }
      }

      const tracks = rawTracks.map((track) => ({
        id: track.id,
        name: track.name,
        artists: (track.artists || []).map((a) => ({ name: a.name })),
        album: {
          name: track.album.name,
          images: (track.album.images || []).map((img) => ({ url: img.url })),
          release_date: track.album.release_date,
        },
        preview_url: track.preview_url ?? null,
        duration_ms: track.duration_ms,
        external_urls: { spotify: track.external_urls.spotify },
        external_ids: track.external_ids?.isrc ? { isrc: track.external_ids.isrc } : undefined,
        popularity: track.popularity,
      }))

      return await ctx.runMutation(internal.spotify.upsertSpotifyTracksInternal, {
        tracks,
      })
    } catch (error) {
      console.error('Spotify sync error:', error)
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        newTracks: 0,
        updated: 0,
      }
    }
  },
})
