export type PhoneArtistPhoto = {
  id: string
  thumbnailUrl: string
  fullUrl?: string | null
  caption?: string | null
  sourceUrl?: string | null
}

export type PhoneArtistTrack = {
  id: string
  name: string
  url: string
  streams: number | null
}

export type PhoneArtistRelease = {
  id: string
  name: string
  type: string
  year: string | null
  url: string
  embedUrl?: string | null
}

export type PhoneSeedMessage = {
  id: string
  direction: 'incoming' | 'outgoing'
  textEs: string
  textEn: string
  timestampLabel: string
}

export type PhoneSeedNote = {
  id: string
  title: string
  bodyEs: string
  bodyEn: string
  updatedAtLabel: string
}

export type PhoneCollaborator = {
  id: string
  name: string
  url?: string | null
}

export type PhoneArtistContent = {
  artistName: string
  brandDisplayName: string
  wallpaperCandidates: Array<{ id: string; src: string; label: string }>
  profileImage: string | null
  music: {
    monthlyListeners: number | null
    popularTracks: PhoneArtistTrack[]
    discography: PhoneArtistRelease[]
  }
  photos: PhoneArtistPhoto[]
  messagesSeed: PhoneSeedMessage[]
  notesSeed: PhoneSeedNote[]
  collaborators: PhoneCollaborator[]
}

