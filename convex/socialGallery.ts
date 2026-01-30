import { query, action, internalMutation, mutation } from './_generated/server'
import { internal } from './_generated/api'
import { v } from 'convex/values'

/**
 * Get unified gallery items (Spotify only).
 */
export const getSocialGalleryItems = query({
  args: {
    source: v.optional(v.union(v.literal('spotify'), v.literal('all'))),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 20, 100)
    const takeLimit = Math.min(limit + 1, 101)

    const spotifyTracks = await ctx.db
      .query('spotifySongs')
      .filter((q) => q.eq(q.field('isArtistRelease'), true))
      .order('desc')
      .take(takeLimit)

    const items = spotifyTracks.map((track) => ({
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

    return {
      items: items.slice(0, limit),
      hasMore: items.length > limit,
    }
  },
})

/**
 * Search across Spotify gallery items.
 */
export const searchSocialGallery = query({
  args: { query: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 20, 100)
    const q = args.query.toLowerCase()

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

    filteredSpotify.sort((a, b) => {
      const aMatch = a.title.toLowerCase().includes(q) ? 1 : 0
      const bMatch = b.title.toLowerCase().includes(q) ? 1 : 0
      return bMatch - aMatch
    })

    return filteredSpotify.slice(0, limit)
  },
})

/**
 * Seeding logic for Spotify gallery.
 */
const SCRAPED_DATA = {
  spotify: {
    artist_name: "ROA",
    albums: [
      {
        albumTitle: "NETFLIX AND CHILL",
        artistName: "Chris Jedi, Anuel AA, ROA",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e026c255ec3a49e4601c3645858",
        spotifyAlbumUrl: "https://open.spotify.com/album/7F1YcZQm1HvLwPFNEpdRpR"
      },
      {
        albumTitle: "Private Suite (Vol. 4)",
        artistName: "ROA, Botlok, Kris R., Hades66, Topboy TGR, GeezyDee, CDobleta, Midnvght, Tutu, Luar La L, Almighty",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e0271aa3cd80a05cd7262028873",
        spotifyAlbumUrl: "https://open.spotify.com/album/1XSQ56Y0zCG0Aht3EvSHj4"
      },
      {
        albumTitle: "Private Suite (Vol. 3)",
        artistName: "ROA, Dei V",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e02af18b9183b24f21b3542b81e",
        spotifyAlbumUrl: "https://open.spotify.com/album/5e5rU0LAzThZeH5YCc4Pmi"
      },
      {
        albumTitle: "MI DEMONIA",
        artistName: "ROA",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e02ffa57e775228e7c56fa295b3",
        spotifyAlbumUrl: "https://open.spotify.com/album/4RcEaPXzHUbxExvOTrgy4d"
      },
      {
        albumTitle: "LA FAVORITA DE DIOS (with Dei V)",
        artistName: "ROA, Dei V",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e023ac20e7d20dae9150f6120e3",
        spotifyAlbumUrl: "https://open.spotify.com/album/1INfJ1JocVxxImzjHRIkX7"
      },
      {
        albumTitle: "EENIMINIMAINIMOE",
        artistName: "ROA",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e026e5d3f8bb2b66c4c9fb61b96",
        spotifyAlbumUrl: "https://open.spotify.com/album/63JTxHdKDSM158qksCAMSR"
      },
      {
        albumTitle: "Deja Vu",
        artistName: "Hades66, ROA",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e02d91ed79a78d334df5177d25a",
        spotifyAlbumUrl: "https://open.spotify.com/album/76QtJHDzirYxGkZYiBuPyA"
      },
      {
        albumTitle: "11:11",
        artistName: "ROA",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e02fae538a2b3e1e9865ec9835f",
        spotifyAlbumUrl: "https://open.spotify.com/album/5iBpXBEBA7548DsoMbgmQr"
      },
      {
        albumTitle: "Pieza Exhibición",
        artistName: "Luar La L, ROA, Blessd",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e021184b51bb2ddf0c7cbc7980f",
        spotifyAlbumUrl: "https://open.spotify.com/album/7p5H5BRUqMenAPNZmLsiuX"
      },
      {
        albumTitle: "REINAA",
        artistName: "ROA, Clarent, Midnvght",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e02c90a4be7019639a9a3d91922",
        spotifyAlbumUrl: "https://open.spotify.com/album/6r6VRNL37I9iwMzwnOp7nc"
      },
      {
        albumTitle: "MI KILITO",
        artistName: "ROA",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e02206e0e2e547bc8f1bce6dc8c",
        spotifyAlbumUrl: "https://open.spotify.com/album/6u6TW2dD4Bi8b548On5mtT"
      },
      {
        albumTitle: "REINA",
        artistName: "ROA",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e02235d8a55be00c81e1c4887fd",
        spotifyAlbumUrl: "https://open.spotify.com/album/0y6lOcsYAu8u6Rdpe1e7ZU"
      },
      {
        albumTitle: "BURBUJITA",
        artistName: "ROA",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e0222610316aa48599905ee2723",
        spotifyAlbumUrl: "https://open.spotify.com/album/7eaKADBqG2B7DQt0JJhibT"
      },
      {
        albumTitle: "PPC",
        artistName: "ROA, Hades66",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e0285d36426f1aae4f2f3ae66bc",
        spotifyAlbumUrl: "https://open.spotify.com/album/4V5HyefyVSF15kOhuy11up"
      },
      {
        albumTitle: "Private Suite (Vol. 2)",
        artistName: "ROA, J Abdiel, Slayter, CDobleta, Yan Block, De La Rose, Luar La L, Omar Courtz",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e02b2c0e9901d01c15c4cf8fed6",
        spotifyAlbumUrl: "https://open.spotify.com/album/07Rj5RQ0ZRrq11wiajvRv9"
      },
      {
        albumTitle: "TATE QUIETA",
        artistName: "ROA, CDobleta",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e02b5421631fc09141103e079c6",
        spotifyAlbumUrl: "https://open.spotify.com/album/4Jvn1wzRGr5KUQ97PIke8K"
      },
      {
        albumTitle: "NEVER 2 LATE",
        artistName: "ROA, Yan Block",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e02ec532a41bf2f52d391dfdd7d",
        spotifyAlbumUrl: "https://open.spotify.com/album/1eBgb6uugLDKJ1UpXtJNug"
      },
      {
        albumTitle: "ETA (RMX)",
        artistName: "ROA, De La Rose, Luar La L, Yan Block, Omar Courtz",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e02b5576e1d3dddb4ede5c8f1f4",
        spotifyAlbumUrl: "https://open.spotify.com/album/3gRImh7Qfr9rspysznv2Jr"
      },
      {
        albumTitle: "PETITE",
        artistName: "ROA",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e02c60d96da270d543876988da6",
        spotifyAlbumUrl: "https://open.spotify.com/album/6arDXXLzgsELJIPIuaBplg"
      },
      {
        albumTitle: "ECLIPSE",
        artistName: "ROA, J Abdiel, Slayter",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e025f68e1d7c3a914c56974ba42",
        spotifyAlbumUrl: "https://open.spotify.com/album/6RKsrhcsEh1FfTdLAk6EvE"
      },
      {
        albumTitle: "NunK es Tarde",
        artistName: "ROA",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e02eff71c2dcdfe395a9d8ac833",
        spotifyAlbumUrl: "https://open.spotify.com/album/2pdbc6KYkMIBsFF3sSBA1Q"
      },
      {
        albumTitle: "ETA",
        artistName: "ROA",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e02adbf5fa5e3c8de709d43997e",
        spotifyAlbumUrl: "https://open.spotify.com/album/7yofWqjDQfluI8HN9ZqUqq"
      },
      {
        albumTitle: "Private Suite (Vol. 1 / Reloaded)",
        artistName: "ROA, Jay Wheeler, Omar Courtz, Bryant Myers, Dei V, De La Rose, Hades66, Luar La L, Amarion, Ankhal, Anubiis, CDobleta",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e02ea349647429b13d9e80a4483",
        spotifyAlbumUrl: "https://open.spotify.com/album/7FDCMT0q5SVLPosdokrINh"
      },
      {
        albumTitle: "UuU 2",
        artistName: "ROA, Hades66, Luar La L",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e02518b6b60b24ecaf9f245189c",
        spotifyAlbumUrl: "https://open.spotify.com/album/0Q0tPst1r7QwrFGzhj2XwO"
      },
      {
        albumTitle: "FREELANCE 2.0 ROA, Amarion, Ankhal ( FT. CDobleta, Anubiis)",
        artistName: "ROA, Amarion, Ankhal, Anubiis, CDobleta",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e02d7862afd76c78cd5beb802e6",
        spotifyAlbumUrl: "https://open.spotify.com/album/5x5L7lXzNVon76iOsZKdPx"
      },
      {
        albumTitle: "NOCHE PASAJERA II",
        artistName: "ROA, Jay Wheeler",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e0210a2b9b681eac1278f25bb22",
        spotifyAlbumUrl: "https://open.spotify.com/album/2pw0fy29GKTUZS30stt8J3"
      },
      {
        albumTitle: "Private Suite (Vol. 1)",
        artistName: "ROA, Hades66, Omar Courtz, Bryant Myers, Dei V",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e02228428097f134604cfd7eec6",
        spotifyAlbumUrl: "https://open.spotify.com/album/2LWGIFtUcl0NxjjoyVv3ex"
      },
      {
        albumTitle: "UuU",
        artistName: "ROA, Hades66",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e028b05e0c8b216c5b9671f6187",
        spotifyAlbumUrl: "https://open.spotify.com/album/0Bv985mz2ttFowbxdfJZHq"
      },
      {
        albumTitle: "JETSKI (Remix)",
        artistName: "ROA, Omar Courtz, Bryant Myers, Dei V",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e02806b31d18b28e10f075c65c3",
        spotifyAlbumUrl: "https://open.spotify.com/album/13W7b2LEH1MpoWPQzNpsHI"
      },
      {
        albumTitle: "PA CUANDO",
        artistName: "ROA, Young Cister",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e027e1c3bf6e7d34fe8e844d516",
        spotifyAlbumUrl: "https://open.spotify.com/album/5TPoJi1Jl1eyA3fFHjh9YD"
      },
      {
        albumTitle: "JETSKI",
        artistName: "ROA",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e02128af276984d38b3597581de",
        spotifyAlbumUrl: "https://open.spotify.com/album/2t0Q5KqCtLMjnvvMBjPm0F"
      },
      {
        albumTitle: "Bellakeame",
        artistName: "ROA",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e024445736420e3308cad2f7be1",
        spotifyAlbumUrl: "https://open.spotify.com/album/4HEW97ER8ogI1KdHns3WH5"
      },
      {
        albumTitle: "Mal Amor",
        artistName: "Drago200, Harry Nach, ROA",
        albumCoverImageUrl: "https://i.scdn.co/image/ab67616d00001e022b639193a9518db05091247f",
        spotifyAlbumUrl: "https://open.spotify.com/album/1SsBehaKyFxnhpZlUX4UUS"
      }
    ]
  }
}

export const seed = action({
  args: {},
  handler: async (ctx) => {
    await ctx.runMutation(internal.socialGallery.saveSocialData, { data: SCRAPED_DATA })
  },
})

// Public mutation that can be called directly without actions
export const seedDirect = mutation({
  args: {},
  handler: async (ctx) => {
    const { spotify } = SCRAPED_DATA

    let spotifyInserted = 0

    for (const album of spotify.albums) {
      const spotifyId = album.spotifyAlbumUrl.split('album/')[1] || 'unknown'
      const existing = await ctx.db.query('spotifySongs')
        .filter(q => q.eq(q.field('spotifyTrackId'), spotifyId))
        .first();

      if (!existing) {
        await ctx.db.insert('spotifySongs', {
          spotifyTrackId: spotifyId,
          title: album.albumTitle,
          artist: album.artistName,
          albumTitle: album.albumTitle,
          albumCover: album.albumCoverImageUrl,
          externalUrl: album.spotifyAlbumUrl,
          duration: 0,
          releaseDate: '2024',
          isrc: 'UNKNOWN',
          popularity: 50,
          isArtistRelease: true,
          syncedAt: Date.now(),
          createdAt: Date.now(),
        })
        spotifyInserted++
      }
    }

    return { spotifyInserted }
  },
})

export const saveSocialData = internalMutation({
  args: { data: v.any() },
  handler: async (ctx, args) => {
    const { spotify } = args.data

    for (const album of spotify.albums) {
      const spotifyId = album.spotifyAlbumUrl.split('album/')[1] || 'unknown'
      const existing = await ctx.db.query('spotifySongs')
        .filter(q => q.eq(q.field('spotifyTrackId'), spotifyId))
        .first();

      if (!existing) {
        await ctx.db.insert('spotifySongs', {
          spotifyTrackId: spotifyId,
          title: album.albumTitle,
          artist: album.artistName,
          albumTitle: album.albumTitle,
          albumCover: album.albumCoverImageUrl,
          externalUrl: album.spotifyAlbumUrl,
          duration: 0,
          releaseDate: '2024',
          isrc: 'UNKNOWN',
          popularity: 50,
          isArtistRelease: true,
          syncedAt: Date.now(),
          createdAt: Date.now(),
        })
      }
    }
  }
})
