import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface SpotifyPlayerProps {
  previewUrl?: string | null
  title: string
  artist: string
  albumCover: string
  spotifyUrl: string
}

export const SpotifyPlayer = ({
  previewUrl,
  title,
  artist,
  albumCover,
  spotifyUrl,
}: SpotifyPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  if (!previewUrl) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 text-center">
        <p className="text-sm text-gray-400 mb-3">Preview not available</p>
        <a
          href={spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition"
        >
          <span>🎵</span>
          <span>Listen on Spotify</span>
        </a>
      </div>
    )
  }

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
  }

  return (
    <motion.div
      className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Album Cover */}
      <div className="relative h-40 bg-gray-900 flex items-center justify-center overflow-hidden">
        {albumCover && (
          <img
            src={albumCover}
            alt={title}
            className="w-full h-full object-cover opacity-80"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src =
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23111827" width="400" height="400"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EAlbum Art Unavailable%3C/text%3E%3C/svg%3E'
            }}
          />
        )}

        {/* Play Button */}
        <motion.button
          onClick={togglePlay}
          className="absolute w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-500 shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-2xl">{isPlaying ? '⏸' : '▶'}</span>
        </motion.button>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-white truncate">{title}</h3>
        <p className="text-sm text-gray-400 truncate mb-3">{artist}</p>

        {/* Audio element */}
        <audio
          ref={audioRef}
          src={previewUrl}
          preload="metadata"
          onEnded={handleEnded}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />

        {/* Actions */}
        <a
          href={spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full block text-center py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 text-sm transition"
        >
          Open in Spotify
        </a>
      </div>
    </motion.div>
  )
}

/**
 * Grid of Spotify songs with players
 */
const HARDCODED_TRACKS = [
  {
    spotifyTrackId: '7nrd0eIftH3NQLfgk20Qp9',
    title: 'YOGURCITO REMIX',
    artist: 'Kris R., ROA',
    albumCover: 'https://i.scdn.co/image/ab67616d00001e02a12acd5e9f8c12c2fc6a1e44',
    previewUrl: null,
    externalUrl: 'https://open.spotify.com/track/7nrd0eIftH3NQLfgk20Qp9'
  },
  {
    spotifyTrackId: '4Hkp1TiYqGYhknFwtUsbqd',
    title: 'ME GUSTAS CC',
    artist: 'ROA',
    albumCover: 'https://i.scdn.co/image/ab67616d00001e02b2c0e9901d01c15c4cf8fed6',
    previewUrl: null,
    externalUrl: 'https://open.spotify.com/track/4Hkp1TiYqGYhknFwtUsbqd'
  },
  {
    spotifyTrackId: '3YrTrs2hJbLklaBdhr4TrH',
    title: 'ETA - RMX',
    artist: 'ROA',
    albumCover: 'https://i.scdn.co/image/ab67616d00001e02b2c0e9901d01c15c4cf8fed6',
    previewUrl: null,
    externalUrl: 'https://open.spotify.com/track/3YrTrs2hJbLklaBdhr4TrH'
  },
  {
    spotifyTrackId: '5hWpXZOs7vpz0JD3CIylsb',
    title: 'FANTASÍA',
    artist: 'ROA',
    albumCover: 'https://i.scdn.co/image/ab67616d00001e0232be66e296d4b19ec9513506',
    previewUrl: null,
    externalUrl: 'https://open.spotify.com/track/5hWpXZOs7vpz0JD3CIylsb'
  },
  {
    spotifyTrackId: '30ga1gIdpg6M6ZshWo7YgC',
    title: 'PPC',
    artist: 'ROA',
    albumCover: 'https://i.scdn.co/image/ab67616d00001e0285d36426f1aae4f2f3ae66bc',
    previewUrl: null,
    externalUrl: 'https://open.spotify.com/track/30ga1gIdpg6M6ZshWo7YgC'
  },
  {
    spotifyTrackId: '1agNeynGrAgsS1XbsJUM5w',
    title: 'Pieza Exhibición',
    artist: 'ROA',
    albumCover: 'https://i.scdn.co/image/ab67616d00001e02392ba661e02dc5cc9ceed533',
    previewUrl: null,
    externalUrl: 'https://open.spotify.com/track/1agNeynGrAgsS1XbsJUM5w'
  }
];

interface SpotifyPlaylistProps {
  tracks?: any[]
}

export const SpotifyPlaylist = ({ tracks = HARDCODED_TRACKS }: SpotifyPlaylistProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tracks.map((track) => (
        <SpotifyPlayer
          key={track.spotifyTrackId || track._id}
          previewUrl={track.previewUrl}
          title={track.title}
          artist={track.artist}
          albumCover={track.albumCover}
          spotifyUrl={track.externalUrl || track.spotifyUrl}
        />
      ))}
    </div>
  )
}
