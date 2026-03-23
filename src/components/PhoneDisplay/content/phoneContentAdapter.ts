import { adaptArtistContentPayload, type ArtistContent } from '../../../features/artistContent'
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

export function adaptArtistContentToPhone(content: ArtistContent): PhoneArtistContent {
  const artistName = content.artistName || FALLBACK_PHONE_ARTIST_CONTENT.artistName
  const igPosts = content.instagram.posts
    .map((post, index): PhoneArtistPhoto | null => {
      if (!post.thumbnailUrl) return null
      return {
        id: post.id || `ig-post-${index}`,
        thumbnailUrl: post.thumbnailUrl,
        fullUrl: post.thumbnailUrl,
        caption: post.caption,
        sourceUrl: post.url,
      }
    })
    .filter((value): value is PhoneArtistPhoto => Boolean(value))

  const popularTracks = content.spotify.popularTracks
    .map((track): PhoneArtistTrack | null => {
      if (!track.url) return null
      return {
        id: track.id,
        name: track.name,
        url: track.url,
        streams: track.streams,
      }
    })
    .filter((value): value is PhoneArtistTrack => Boolean(value))

  const discography = content.spotify.releases
    .map((release): PhoneArtistRelease | null => {
      if (!release.url) return null
      return {
        id: release.id,
        name: release.name,
        type: release.type,
        year: release.year,
        url: release.url,
        embedUrl: release.embedUrl,
      }
    })
    .filter((value): value is PhoneArtistRelease => Boolean(value))

  const relatedArtists = content.spotify.relatedArtists.map((artist): PhoneCollaborator => ({
    id: artist.id,
    name: artist.name,
    url: artist.url,
  }))

  const profileImage = content.instagram.profilePictureUrl || FALLBACK_PHONE_ARTIST_CONTENT.profileImage
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
      monthlyListeners: content.spotify.monthlyListeners,
      popularTracks: popularTracks.length ? popularTracks : FALLBACK_PHONE_ARTIST_CONTENT.music.popularTracks,
      discography: discography.length ? discography : FALLBACK_PHONE_ARTIST_CONTENT.music.discography,
    },
    photos: igPosts.length ? igPosts : FALLBACK_PHONE_ARTIST_CONTENT.photos,
    messagesSeed: messagesSeed.length ? messagesSeed : FALLBACK_PHONE_ARTIST_CONTENT.messagesSeed,
    notesSeed: notesSeed.length ? notesSeed : FALLBACK_PHONE_ARTIST_CONTENT.notesSeed,
    collaborators: relatedArtists.length ? relatedArtists : FALLBACK_PHONE_ARTIST_CONTENT.collaborators,
  }
}

export function adaptArtistScrapedData(raw: unknown): PhoneArtistContent {
  return adaptArtistContentToPhone(adaptArtistContentPayload(raw))
}
