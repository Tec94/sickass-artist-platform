export type ArtistContentPost = {
  id: string
  url: string | null
  caption: string | null
  description: string | null
  thumbnailUrl: string | null
}

export type ArtistContentTrack = {
  id: string
  name: string
  url: string | null
  streams: number | null
}

export type ArtistContentRelease = {
  id: string
  name: string
  type: string
  year: string | null
  url: string | null
  embedUrl: string | null
}

export type ArtistContentRelatedArtist = {
  id: string
  name: string
  url: string | null
}

export type ArtistContentPlaylist = {
  id: string
  name: string
  url: string | null
  description: string | null
}

export type ArtistContentFreshness = {
  ageDays: number | null
  isStale: boolean
}

export type ArtistContent = {
  artistName: string
  source: string | null
  scrapeDate: string | null
  updatedAt: number | null
  freshness: ArtistContentFreshness
  isFallback: boolean
  instagram: {
    username: string | null
    displayName: string | null
    verified: boolean
    bio: string | null
    profileUrl: string | null
    profilePictureUrl: string | null
    followersLabel: string | null
    followingCount: number | null
    totalPosts: number | null
    posts: ArtistContentPost[]
    reelsCount: number
  }
  spotify: {
    artistUrl: string | null
    artistId: string | null
    artistEmbedUrl: string | null
    monthlyListeners: number | null
    popularTracks: ArtistContentTrack[]
    topTrack: ArtistContentTrack | null
    releases: ArtistContentRelease[]
    latestRelease: ArtistContentRelease | null
    playlists: ArtistContentPlaylist[]
    relatedArtists: ArtistContentRelatedArtist[]
  }
}

export type ArtistContentPayloadResult = {
  payload: unknown
  version: 'artist-scrape/v1'
  importedAt: number
  artist: string | null
  scrapeDate: string | null
  source: string | null
  updatedAt: number
} | null
