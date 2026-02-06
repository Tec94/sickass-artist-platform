export type EmbeddedSpotifyTrack = {
  spotifyTrackId: string
  title: string
  artist: string
  albumCover: string
  externalUrl: string
  previewUrl?: string | null
  albumTitle?: string
  releaseDate?: string
  durationMs?: number
  popularity?: number
  isrc?: string
}

export const embeddedSpotifyTracks: EmbeddedSpotifyTrack[] = [
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
