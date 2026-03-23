import type {
  ArtistContent,
  ArtistContentPayloadResult,
  ArtistContentPlaylist,
  ArtistContentPost,
  ArtistContentRelatedArtist,
  ArtistContentRelease,
  ArtistContentTrack,
} from './types'

type UnknownRecord = Record<string, unknown>

const FALLBACK_ARTIST_NAME = 'ROA'
const STALE_AFTER_DAYS = 21

const isRecord = (value: unknown): value is UnknownRecord => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const asString = (value: unknown): string | null => (typeof value === 'string' && value.trim() ? value : null)
const asNumber = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : null)
const asArray = <T = unknown>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : [])

const compareReleaseYearsDesc = (left: ArtistContentRelease, right: ArtistContentRelease) => {
  const leftYear = Number.parseInt(left.year ?? '', 10)
  const rightYear = Number.parseInt(right.year ?? '', 10)

  if (Number.isFinite(leftYear) && Number.isFinite(rightYear) && leftYear !== rightYear) {
    return rightYear - leftYear
  }

  if (Number.isFinite(leftYear) !== Number.isFinite(rightYear)) {
    return Number.isFinite(rightYear) ? 1 : -1
  }

  return 0
}

const buildPost = (post: UnknownRecord, index: number): ArtistContentPost => ({
  id: `post-${index}`,
  url: asString(post.url),
  caption: asString(post.caption),
  description: asString(post.description),
  thumbnailUrl: asString(post.thumbnailUrl),
})

const buildTrack = (track: UnknownRecord, index: number): ArtistContentTrack | null => {
  const name = asString(track.name)
  if (!name) return null

  return {
    id: `track-${index}`,
    name,
    url: asString(track.url),
    streams: asNumber(track.streams),
  }
}

const buildRelease = (release: UnknownRecord, index: number): ArtistContentRelease | null => {
  const name = asString(release.name)
  if (!name) return null

  return {
    id: `release-${index}`,
    name,
    type: asString(release.type) || 'Release',
    year: asString(release.year),
    url: asString(release.url),
    embedUrl: asString(release.embedUrl),
  }
}

const buildPlaylist = (playlist: UnknownRecord, index: number): ArtistContentPlaylist | null => {
  const name = asString(playlist.name)
  if (!name) return null

  return {
    id: `playlist-${index}`,
    name,
    url: asString(playlist.url),
    description: asString(playlist.description),
  }
}

const buildRelatedArtist = (artist: UnknownRecord, index: number): ArtistContentRelatedArtist | null => {
  const name = asString(artist.name) || asString(artist.artistName)
  if (!name) return null

  return {
    id: `related-${index}`,
    name,
    url: asString(artist.url),
  }
}

const computeFreshness = (scrapeDate: string | null, now: number) => {
  if (!scrapeDate) {
    return { ageDays: null, isStale: true }
  }

  const timestamp = Date.parse(scrapeDate)
  if (!Number.isFinite(timestamp)) {
    return { ageDays: null, isStale: true }
  }

  const ageDays = Math.max(0, Math.floor((now - timestamp) / (1000 * 60 * 60 * 24)))
  return {
    ageDays,
    isStale: ageDays >= STALE_AFTER_DAYS,
  }
}

const FALLBACK_ARTIST_CONTENT: ArtistContent = {
  artistName: FALLBACK_ARTIST_NAME,
  source: null,
  scrapeDate: null,
  updatedAt: null,
  freshness: {
    ageDays: null,
    isStale: true,
  },
  isFallback: true,
  instagram: {
    username: null,
    displayName: FALLBACK_ARTIST_NAME,
    verified: false,
    bio: null,
    profileUrl: null,
    profilePictureUrl: null,
    followersLabel: null,
    followingCount: null,
    totalPosts: null,
    posts: [],
    reelsCount: 0,
  },
  spotify: {
    artistUrl: null,
    artistId: null,
    artistEmbedUrl: null,
    monthlyListeners: null,
    popularTracks: [],
    topTrack: null,
    releases: [],
    latestRelease: null,
    playlists: [],
    relatedArtists: [],
  },
}

export const createFallbackArtistContent = (): ArtistContent => ({
  ...FALLBACK_ARTIST_CONTENT,
  instagram: {
    ...FALLBACK_ARTIST_CONTENT.instagram,
    posts: [],
  },
  spotify: {
    ...FALLBACK_ARTIST_CONTENT.spotify,
    popularTracks: [],
    releases: [],
    playlists: [],
    relatedArtists: [],
  },
})

export const adaptArtistContentPayload = (
  raw: unknown,
  metadata?: Partial<Omit<NonNullable<ArtistContentPayloadResult>, 'payload'>> & { now?: number },
): ArtistContent => {
  if (!isRecord(raw)) {
    return createFallbackArtistContent()
  }

  const now = metadata?.now ?? Date.now()
  const artistName = asString(raw.artist) || metadata?.artist || FALLBACK_ARTIST_NAME

  const instagram = isRecord(raw.instagram) ? raw.instagram : {}
  const spotify = isRecord(raw.spotify) ? raw.spotify : {}
  const artistEmbed = isRecord(spotify.artistEmbed) ? spotify.artistEmbed : {}

  const posts = asArray<UnknownRecord>(instagram.posts)
    .map(buildPost)
    .filter((post) => Boolean(post.thumbnailUrl || post.caption || post.url))

  const popularTracks = asArray<UnknownRecord>(spotify.popularTracks)
    .map(buildTrack)
    .filter((track): track is ArtistContentTrack => Boolean(track))

  const releases = asArray<UnknownRecord>(spotify.discography)
    .map(buildRelease)
    .filter((release): release is ArtistContentRelease => Boolean(release))

  const sortedReleases = [...releases].sort(compareReleaseYearsDesc)

  const playlists = asArray<UnknownRecord>(spotify.playlists)
    .map(buildPlaylist)
    .filter((playlist): playlist is ArtistContentPlaylist => Boolean(playlist))

  const relatedArtists = asArray<UnknownRecord>(spotify.relatedArtists)
    .map(buildRelatedArtist)
    .filter((artist): artist is ArtistContentRelatedArtist => Boolean(artist))

  const scrapeDate = metadata?.scrapeDate ?? asString(raw.scrapeDate)
  return {
    artistName,
    source: metadata?.source ?? null,
    scrapeDate,
    updatedAt: typeof metadata?.updatedAt === 'number' ? metadata.updatedAt : null,
    freshness: computeFreshness(scrapeDate, now),
    isFallback: false,
    instagram: {
      username: asString(instagram.username),
      displayName: asString(instagram.displayName) || artistName,
      verified: Boolean(instagram.verified),
      bio: asString(instagram.bio),
      profileUrl: asString(instagram.profileUrl),
      profilePictureUrl: asString(instagram.profilePictureUrl),
      followersLabel: asString(instagram.followers),
      followingCount: asNumber(instagram.following),
      totalPosts: asNumber(instagram.totalPosts),
      posts,
      reelsCount: asArray(instagram.reels).length,
    },
    spotify: {
      artistUrl: asString(spotify.artistUrl),
      artistId: asString(spotify.artistId),
      artistEmbedUrl: asString(artistEmbed.embedUrl),
      monthlyListeners: asNumber(spotify.monthlyListeners),
      popularTracks,
      topTrack: popularTracks[0] ?? null,
      releases: sortedReleases.length ? sortedReleases : releases,
      latestRelease: (sortedReleases.length ? sortedReleases : releases)[0] ?? null,
      playlists,
      relatedArtists,
    },
  }
}
