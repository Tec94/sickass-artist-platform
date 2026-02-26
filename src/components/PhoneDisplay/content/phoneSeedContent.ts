import type { PhoneArtistContent } from './phoneContentTypes'

export const FALLBACK_PHONE_ARTIST_CONTENT: PhoneArtistContent = {
  artistName: 'ROA',
  brandDisplayName: 'ROA',
  wallpaperCandidates: [
    { id: 'roa-profile', src: '/images/roa profile.jpg', label: 'ROA Profile' },
  ],
  profileImage: '/images/roa profile.jpg',
  music: {
    monthlyListeners: null,
    popularTracks: [
      { id: 'track-yogurcito', name: 'YOGURCITO REMIX', url: 'https://open.spotify.com', streams: 226000000 },
      { id: 'track-eta-rmx', name: 'ETA - RMX', url: 'https://open.spotify.com', streams: 186000000 },
      { id: 'track-me-gustas', name: 'ME GUSTAS CC', url: 'https://open.spotify.com', streams: 131000000 },
    ],
    discography: [
      { id: 'release-private-suite', name: 'PRIVATE SUITE (Complete EP Edition)', type: 'Album', year: '2026', url: 'https://open.spotify.com' },
      { id: 'release-falsas-promesas', name: 'Falsas Promesas (Remix)', type: 'Single', year: '2026', url: 'https://open.spotify.com' },
    ],
  },
  photos: [
    {
      id: 'photo-roa-1',
      thumbnailUrl: '/images/roa profile.jpg',
      fullUrl: '/images/roa profile.jpg',
      caption: 'ROA placeholder',
      sourceUrl: undefined,
    },
  ],
  messagesSeed: [
    {
      id: 'msg-1',
      direction: 'incoming',
      textEs: 'Yo creo que ya es hora... Tamos ready PR?',
      textEn: 'I think it is time... We ready PR?',
      timestampLabel: '10:43',
    },
    {
      id: 'msg-2',
      direction: 'incoming',
      textEs: 'Private Suite Complete Edition ya esta afuera.',
      textEn: 'Private Suite Complete Edition is out now.',
      timestampLabel: '10:45',
    },
  ],
  notesSeed: [
    {
      id: 'note-1',
      title: 'PRIVATE SUITE',
      bodyEs: 'Borrador creativo de concepto y estetica de lanzamiento.',
      bodyEn: 'Creative concept and release aesthetic draft.',
      updatedAtLabel: 'Today',
    },
    {
      id: 'note-2',
      title: 'TOUR IDEAS',
      bodyEs: 'Fechas tentativas, venues y activaciones con fans.',
      bodyEn: 'Tentative dates, venues, and fan activations.',
      updatedAtLabel: 'Yesterday',
    },
  ],
  collaborators: [
    { id: 'collab-mora', name: 'Mora' },
    { id: 'collab-eladio', name: 'Eladio Carrion' },
    { id: 'collab-team', name: 'ROA Team' },
  ],
}

export const PHONE_CARD_PASS_COLORS = ['#111827', '#0f172a', '#1f2937', '#172554', '#052e16', '#7c2d12'] as const

