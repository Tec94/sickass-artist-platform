import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { SpotifyPlaylist } from '../components/SpotifyPlayer'
import { useState } from 'react'

export const Music = () => {
  const [filter, setFilter] = useState<'all' | 'new'>('all')

  const allTracks = useQuery(api.spotify.getArtistTracks)
  const newTracks = useQuery(api.spotify.getNewReleases)

  const tracks = filter === 'all' ? allTracks : newTracks

  if (!tracks) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-800 rounded w-48 mb-2" />
          <div className="h-6 bg-gray-800 rounded w-96 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg h-64" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Music</h1>
        <p className="text-gray-400">Listen to exclusive previews and full tracks</p>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-2 rounded font-semibold transition ${
            filter === 'all'
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All Tracks
        </button>
        <button
          onClick={() => setFilter('new')}
          className={`px-6 py-2 rounded font-semibold transition ${
            filter === 'new'
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          New Releases
        </button>
      </div>

      {/* Tracks */}
      {tracks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No tracks available yet</p>
        </div>
      ) : (
        <SpotifyPlaylist tracks={tracks} />
      )}
    </div>
  )
}
