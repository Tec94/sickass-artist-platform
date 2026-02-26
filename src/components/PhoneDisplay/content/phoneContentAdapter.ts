import { FALLBACK_PHONE_ARTIST_CONTENT } from './phoneSeedContent'
import type {
  PhoneArtistContent,
  PhoneArtistPhoto,
  PhoneArtistRelease,
  PhoneArtistTrack,
  PhoneCollaborator,
  PhoneSeedMessage,
  PhoneSeedNote,
} from './phoneContentTypes'

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const asString = (value: unknown): string | null => (typeof value === 'string' && value.trim() ? value : null)
const asNumber = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : null)

const asArray = <T = unknown>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : [])

const buildMessages = (posts: PhoneArtistPhoto[], tracks: PhoneArtistTrack[]): PhoneSeedMessage[] => {
  const fromPosts = posts.slice(0, 3).map((post, index): PhoneSeedMessage => ({
    id: `ig-${post.id}`,
    direction: 'incoming',
    textEs: (post.caption || 'Actualizacion nueva de ROA.').slice(0, 120),
    textEn:
      index === 0
        ? 'New ROA update. Tap through to check the details.'
        : index === 1
          ? 'Another drop teaser for the pack.'
          : 'Saved this post for the next rollout.',
    timestampLabel: `${10 + index}:1${index}`,
  }))

  const featuredTrack = tracks[0]
  const trackMessages = featuredTrack
    ? [
        {
          id: 'track-promo',
          direction: 'incoming' as const,
          textEs: `En loop ahora: ${featuredTrack.name}`,
          textEn: `Now on loop: ${featuredTrack.name}`,
          timestampLabel: '11:11',
        },
      ]
    : []

  const systemReply: PhoneSeedMessage[] = [
    {
      id: 'reply-pack',
      direction: 'outgoing',
      textEs: 'Listo. Armando rollout del proximo drop.',
      textEn: 'Ready. Building the next drop rollout.',
      timestampLabel: '11:14',
    },
  ]

  return [...fromPosts, ...trackMessages, ...systemReply].slice(0, 8)
}

const buildNotes = (tracks: PhoneArtistTrack[], posts: PhoneArtistPhoto[]): PhoneSeedNote[] => {
  const trackNotes = tracks.slice(0, 5).map((track, index): PhoneSeedNote => ({
    id: `track-note-${index}`,
    title: track.name,
    bodyEs: `Idea de visual y rollout para ${track.name}. Mantener tono oscuro, textura de calle y mensaje corto.`,
    bodyEn: `Visual and rollout idea for ${track.name}. Keep it dark, street-textured, and concise.`,
    updatedAtLabel: index === 0 ? 'Today' : `${index + 1}d`,
  }))

  const postNotes = posts.slice(0, 2).map((post, index): PhoneSeedNote => ({
    id: `post-note-${index}`,
    title: `CAPTION ${index + 1}`,
    bodyEs: post.caption || 'Caption guardado para referencia.',
    bodyEn: 'Saved caption reference for campaign planning.',
    updatedAtLabel: `${index + 3}d`,
  }))

  return [...trackNotes, ...postNotes]
}

const formatPhotoSource = (post: UnknownRecord, index: number): PhoneArtistPhoto | null => {
  const thumbnailUrl = asString(post.thumbnailUrl)
  if (!thumbnailUrl) return null
  return {
    id: `ig-post-${index}`,
    thumbnailUrl,
    fullUrl: thumbnailUrl,
    caption: asString(post.caption),
    sourceUrl: asString(post.url),
  }
}

const formatTrack = (track: UnknownRecord, index: number): PhoneArtistTrack | null => {
  const name = asString(track.name)
  const url = asString(track.url)
  if (!name || !url) return null
  return {
    id: `track-${index}`,
    name,
    url,
    streams: asNumber(track.streams),
  }
}

const formatRelease = (release: UnknownRecord, index: number): PhoneArtistRelease | null => {
  const name = asString(release.name)
  const url = asString(release.url)
  if (!name || !url) return null
  return {
    id: `release-${index}`,
    name,
    type: asString(release.type) || 'Release',
    year: asString(release.year),
    url,
    embedUrl: asString(release.embedUrl),
  }
}

const formatCollaborator = (artist: UnknownRecord, index: number): PhoneCollaborator | null => {
  const name = asString(artist.name) || asString(artist.artistName)
  if (!name) return null
  return {
    id: `collab-${index}`,
    name,
    url: asString(artist.url),
  }
}

export function adaptArtistScrapedData(raw: unknown): PhoneArtistContent {
  if (!isRecord(raw)) {
    return FALLBACK_PHONE_ARTIST_CONTENT
  }

  const artistName = asString(raw.artist) || FALLBACK_PHONE_ARTIST_CONTENT.artistName
  const instagram = isRecord(raw.instagram) ? raw.instagram : {}
  const spotify = isRecord(raw.spotify) ? raw.spotify : {}

  const igPosts = asArray<UnknownRecord>(instagram.posts)
    .map(formatPhotoSource)
    .filter((value): value is PhoneArtistPhoto => Boolean(value))

  const popularTracks = asArray<UnknownRecord>(spotify.popularTracks)
    .map(formatTrack)
    .filter((value): value is PhoneArtistTrack => Boolean(value))

  const discography = asArray<UnknownRecord>(spotify.discography)
    .map(formatRelease)
    .filter((value): value is PhoneArtistRelease => Boolean(value))

  const relatedArtists = asArray<UnknownRecord>(spotify.relatedArtists)
    .map(formatCollaborator)
    .filter((value): value is PhoneCollaborator => Boolean(value))

  const profileImage = asString(instagram.profilePictureUrl) || FALLBACK_PHONE_ARTIST_CONTENT.profileImage
  const messagesSeed = buildMessages(igPosts.length ? igPosts : FALLBACK_PHONE_ARTIST_CONTENT.photos, popularTracks)
  const notesSeed = buildNotes(popularTracks.length ? popularTracks : FALLBACK_PHONE_ARTIST_CONTENT.music.popularTracks, igPosts)

  return {
    artistName,
    brandDisplayName: artistName,
    wallpaperCandidates: [
      { id: 'roa-profile-placeholder', src: '/images/roa profile.jpg', label: 'ROA Profile' },
      ...(igPosts[0] ? [{ id: 'ig-photo-0', src: igPosts[0].thumbnailUrl, label: 'Instagram Feature' }] : []),
    ],
    profileImage,
    music: {
      monthlyListeners: asNumber(spotify.monthlyListeners),
      popularTracks: popularTracks.length ? popularTracks : FALLBACK_PHONE_ARTIST_CONTENT.music.popularTracks,
      discography: discography.length ? discography : FALLBACK_PHONE_ARTIST_CONTENT.music.discography,
    },
    photos: igPosts.length ? igPosts : FALLBACK_PHONE_ARTIST_CONTENT.photos,
    messagesSeed: messagesSeed.length ? messagesSeed : FALLBACK_PHONE_ARTIST_CONTENT.messagesSeed,
    notesSeed: notesSeed.length ? notesSeed : FALLBACK_PHONE_ARTIST_CONTENT.notesSeed,
    collaborators: relatedArtists.length ? relatedArtists : FALLBACK_PHONE_ARTIST_CONTENT.collaborators,
  }
}

export async function fetchPhoneArtistContent(signal?: AbortSignal): Promise<PhoneArtistContent> {
  try {
    const response = await fetch('/data/artist-scraped-data.json', { signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = (await response.json()) as unknown
    return adaptArtistScrapedData(data)
  } catch {
    return FALLBACK_PHONE_ARTIST_CONTENT
  }
}
