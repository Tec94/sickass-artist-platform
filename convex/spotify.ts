import { mutation, query, internalMutation } from './_generated/server'
import { v } from 'convex/values'
import { internal } from './_generated/api'
import { requireAdmin } from './helpers'

type EmbeddedTrack = {
  spotifyTrackId: string
  title: string
  artist: string
  albumCover: string
  externalUrl: string
  albumTitle?: string
  releaseDate?: string
  durationMs?: number
  popularity?: number
  isrc?: string
  previewUrl?: string | null
}

const EMBEDDED_TRACKS: EmbeddedTrack[] = [
  {
    spotifyTrackId: '7nrd0eIftH3NQLfgk20Qp9',
    title: 'YOGURCITO REMIX',
    artist: 'Kris R., ROA',
    albumCover: 'https://i.scdn.co/image/ab67616d00001e02a12acd5e9f8c12c2fc6a1e44',
    externalUrl: 'https://open.spotify.com/track/7nrd0eIftH3NQLfgk20Qp9',
  },
  {
    spotifyTrackId: '4Hkp1TiYqGYhknFwtUsbqd',
    title: 'ME GUSTAS CC',
    artist: 'ROA',
    albumCover: 'https://i.scdn.co/image/ab67616d00001e02b2c0e9901d01c15c4cf8fed6',
    externalUrl: 'https://open.spotify.com/track/4Hkp1TiYqGYhknFwtUsbqd',
  },
  {
    spotifyTrackId: '3YrTrs2hJbLklaBdhr4TrH',
    title: 'ETA - RMX',
    artist: 'ROA',
    albumCover: 'https://i.scdn.co/image/ab67616d00001e02b2c0e9901d01c15c4cf8fed6',
    externalUrl: 'https://open.spotify.com/track/3YrTrs2hJbLklaBdhr4TrH',
  },
  {
    spotifyTrackId: '5hWpXZOs7vpz0JD3CIylsb',
    title: 'FANTAS\u00cdA',
    artist: 'ROA',
    albumCover: 'https://i.scdn.co/image/ab67616d00001e0232be66e296d4b19ec9513506',
    externalUrl: 'https://open.spotify.com/track/5hWpXZOs7vpz0JD3CIylsb',
  },
  {
    spotifyTrackId: '30ga1gIdpg6M6ZshWo7YgC',
    title: 'PPC',
    artist: 'ROA',
    albumCover: 'https://i.scdn.co/image/ab67616d00001e0285d36426f1aae4f2f3ae66bc',
    externalUrl: 'https://open.spotify.com/track/30ga1gIdpg6M6ZshWo7YgC',
  },
  {
    spotifyTrackId: '1agNeynGrAgsS1XbsJUM5w',
    title: 'Pieza Exhibici\u00f3n',
    artist: 'ROA',
    albumCover: 'https://i.scdn.co/image/ab67616d00001e02392ba661e02dc5cc9ceed533',
    externalUrl: 'https://open.spotify.com/track/1agNeynGrAgsS1XbsJUM5w',
  },
]

// ============ INTERNAL MUTATION FOR UPSERTING TRACKS =====

export const upsertSpotifyTracksInternal = internalMutation({
  args: {
    tracks: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        artists: v.array(v.object({ name: v.string() })),
        album: v.object({
          name: v.string(),
          images: v.array(v.object({ url: v.string() })),
          release_date: v.string(),
        }),
        preview_url: v.optional(v.union(v.string(), v.null())),
        duration_ms: v.number(),
        external_urls: v.object({ spotify: v.string() }),
        external_ids: v.optional(v.object({ isrc: v.optional(v.string()) })),
        popularity: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    let newTracks = 0
    let updated = 0

    for (const track of args.tracks) {
      const existing = await ctx.db
        .query('spotifySongs')
        .withIndex('by_spotifyTrackId', (q) => q.eq('spotifyTrackId', track.id))
        .first()

      const trackData = {
        spotifyTrackId: track.id,
        title: track.name,
        artist: track.artists[0]?.name || 'Unknown',
        albumTitle: track.album.name,
        albumCover: track.album.images[0]?.url || '',
        previewUrl: track.preview_url || undefined,
        duration: track.duration_ms,
        releaseDate: track.album.release_date,
        externalUrl: track.external_urls.spotify,
        isrc: track.external_ids?.isrc || '',
        popularity: track.popularity,
        isArtistRelease: true,
        syncedAt: now,
        createdAt: existing?.createdAt || now,
      }

      if (existing) {
        await ctx.db.patch(existing._id, trackData)
        updated++
      } else {
        await ctx.db.insert('spotifySongs', trackData)
        newTracks++
      }
    }

    return { success: true, newTracks, updated, total: args.tracks.length }
  },
})

// ============ MUTATIONS =====

/**
 * Sync artist tracks from Spotify (admin-only, legacy signature)
 */
export const syncArtistTracks = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx, ['admin'])

    await ctx.scheduler.runAfter(0, internal.spotifySync.syncSpotifyTracksInternal)

    return { success: true, scheduled: true }
  },
})

/**
 * Admin-only mutation to manually trigger Spotify sync
 */
export const adminTriggerSync = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx, ['admin'])

    await ctx.scheduler.runAfter(0, internal.spotifySync.syncSpotifyTracksInternal)

    return { success: true, scheduled: true }
  },
})

/**
 * Seed Spotify table with embedded tracks (admin-only)
 */
export const seedEmbeddedTracks = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx, ['admin'])

    const now = Date.now()
    let inserted = 0
    let updated = 0

    for (const track of EMBEDDED_TRACKS) {
      const existing = await ctx.db
        .query('spotifySongs')
        .withIndex('by_spotifyTrackId', (q) => q.eq('spotifyTrackId', track.spotifyTrackId))
        .first()

      const payload = {
        spotifyTrackId: track.spotifyTrackId,
        title: track.title,
        artist: track.artist,
        albumTitle: track.albumTitle ?? track.title,
        albumCover: track.albumCover,
        previewUrl: track.previewUrl ?? undefined,
        duration: track.durationMs ?? 0,
        releaseDate: track.releaseDate ?? '1970-01-01',
        externalUrl: track.externalUrl,
        isrc: track.isrc ?? '',
        popularity: track.popularity ?? 0,
        isArtistRelease: true,
        syncedAt: now,
        createdAt: existing?.createdAt ?? now,
      }

      if (existing) {
        await ctx.db.patch(existing._id, payload)
        updated += 1
      } else {
        await ctx.db.insert('spotifySongs', payload)
        inserted += 1
      }
    }

    return { success: true, inserted, updated, total: EMBEDDED_TRACKS.length }
  },
})

// ============ QUERIES =====

/**
 * Get all cached artist tracks
 */
export const getArtistTracks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('spotifySongs')
      .withIndex('by_artist', (q) => q.eq('isArtistRelease', true))
      .order('desc')
      .collect()
  },
})

/**
 * Get track details with preview
 */
export const getTrackPreview = query({
  args: { spotifyTrackId: v.string() },
  handler: async (ctx, args) => {
    const track = await ctx.db
      .query('spotifySongs')
      .withIndex('by_spotifyTrackId', (q) => q.eq('spotifyTrackId', args.spotifyTrackId))
      .first()

    if (!track) {
      return null
    }

    return {
      spotifyTrackId: track.spotifyTrackId,
      title: track.title,
      artist: track.artist,
      albumCover: track.albumCover,
      previewUrl: track.previewUrl,
      duration: track.duration,
      externalUrl: track.externalUrl,
      hasPreview: !!track.previewUrl,
    }
  },
})

/**
 * Search songs across cached Spotify data
 */
export const searchSongs = query({
  args: { query: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 20, 100)
    const q = args.query.toLowerCase()

    const all = await ctx.db.query('spotifySongs').collect()

    const filtered = all
      .filter(
        (track) =>
          track.title.toLowerCase().includes(q) ||
          track.artist.toLowerCase().includes(q) ||
          track.albumTitle.toLowerCase().includes(q)
      )
      .slice(0, limit)

    return filtered
  },
})

/**
 * Get new releases (last 30 days)
 */
export const getNewReleases = query({
  args: {},
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000

    // Get all tracks sorted by release date
    const allTracks = await ctx.db
      .query('spotifySongs')
      .withIndex('by_artist', (q) => q.eq('isArtistRelease', true))
      .order('desc')
      .collect()

    // Filter by release date and limit to 12
    const recentTracks = allTracks
      .filter((track) => {
        const releaseDate = new Date(track.releaseDate).getTime()
        return releaseDate >= thirtyDaysAgo
      })
      .slice(0, 12)

    return recentTracks
  },
})

/**
 * Get sync status for admin panel
 */
export const getSyncStatus = query({
  args: {},
  handler: async (ctx) => {
    const tracks = await ctx.db.query('spotifySongs').collect()

    const totalTracks = tracks.length
    const lastSyncedTrack = tracks.length > 0 
      ? Math.max(...tracks.map((t) => t.syncedAt))
      : null

    return {
      totalTracks,
      lastSyncedAt: lastSyncedTrack,
      status: lastSyncedTrack 
        ? Date.now() - lastSyncedTrack < 24 * 60 * 60 * 1000
          ? 'fresh'
          : 'stale'
        : 'never',
    }
  },
})
