import { query } from './_generated/server'
import { v } from 'convex/values'

/**
 * Get unified gallery items (Instagram + Spotify)
 */
export const getSocialGalleryItems = query({
  args: {
    source: v.optional(v.union(
      v.literal('instagram'),
      v.literal('spotify'),
      v.literal('all')
    )),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 20, 100)
    const takeLimit = Math.min(limit + 1, 101)
    const source = args.source || 'all'

    const items = []

    // Fetch Instagram posts
    if (source === 'instagram' || source === 'all') {
      const igPosts = await ctx.db
        .query('instagramPosts')
        .withIndex('by_igSourceCreatedAt')
        .filter((q) => q.eq(q.field('isFeatured'), true))
        .filter((q) => q.eq(q.field('isActive'), true))
        .order('desc')
        .take(takeLimit)

      items.push(
        ...igPosts.map(post => ({
          _id: post._id,
          type: 'instagram' as const,
          id: post.igPostId,
          thumbnail: post.thumbnailUrl,
          title: post.caption?.split('\n')[0] || 'Instagram Post',
          metadata: {
            caption: post.caption,
            likeCount: post.likeCount,
            commentCount: post.commentCount,
            url: post.igLink,
            mediaType: post.mediaType,
            mediaUrl: post.mediaUrl,
          },
          createdAt: post.igSourceCreatedAt,
        }))
      )
    }

    // Fetch Spotify tracks (new releases)
    if (source === 'spotify' || source === 'all') {
      const spotifyTracks = await ctx.db
        .query('spotifySongs')
        .withIndex('by_artist', (q) => q.eq('isArtistRelease', true))
        .order('desc')
        .take(takeLimit)

      items.push(
        ...spotifyTracks.map(track => ({
          _id: track._id,
          type: 'spotify' as const,
          id: track.spotifyTrackId,
          thumbnail: track.albumCover,
          title: track.title,
          metadata: {
            artist: track.artist,
            album: track.albumTitle,
            previewUrl: track.previewUrl,
            url: track.externalUrl,
            hasPreview: !!track.previewUrl,
            popularity: track.popularity,
          },
          createdAt: track.syncedAt,
        }))
      )
    }

    // Sort by recency
    items.sort((a, b) => b.createdAt - a.createdAt)

    return {
      items: items.slice(0, limit),
      hasMore: items.length > limit,
    }
  },
})

/**
 * Search across all social gallery items
 */
export const searchSocialGallery = query({
  args: { query: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 20, 100)
    const q = args.query.toLowerCase()

    const items = []

    // Search Instagram
    const igPosts = await ctx.db
      .query('instagramPosts')
      .filter((q) => q.eq(q.field('isFeatured'), true))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect()

    const filteredIG = igPosts
      .filter(post => post.caption.toLowerCase().includes(q))
      .map((post) => ({
        _id: post._id,
        type: 'instagram' as const,
        id: post.igPostId,
        thumbnail: post.thumbnailUrl,
        title: post.caption?.split('\n')[0] || 'Post',
        metadata: {
          caption: post.caption,
          likeCount: post.likeCount,
          commentCount: post.commentCount,
          url: post.igLink,
          mediaType: post.mediaType,
          mediaUrl: post.mediaUrl,
        },
        createdAt: post.igSourceCreatedAt,
      }))

    items.push(...filteredIG)

    // Search Spotify
    const spotifyTracks = await ctx.db.query('spotifySongs').collect()

    const filteredSpotify = spotifyTracks
      .filter(
        (track) =>
          track.title.toLowerCase().includes(q) ||
          track.artist.toLowerCase().includes(q) ||
          track.albumTitle.toLowerCase().includes(q)
      )
      .map((track) => ({
        _id: track._id,
        type: 'spotify' as const,
        id: track.spotifyTrackId,
        thumbnail: track.albumCover,
        title: track.title,
        metadata: {
          artist: track.artist,
          album: track.albumTitle,
          previewUrl: track.previewUrl,
          url: track.externalUrl,
          hasPreview: !!track.previewUrl,
          popularity: track.popularity,
        },
        createdAt: track.syncedAt,
      }))

    items.push(...filteredSpotify)

    // Sort by relevance (title match > other fields)
    items.sort((a, b) => {
      const aMatch = a.title.toLowerCase().includes(q) ? 1 : 0
      const bMatch = b.title.toLowerCase().includes(q) ? 1 : 0
      return bMatch - aMatch
    })

    return items.slice(0, limit)
  },
})
