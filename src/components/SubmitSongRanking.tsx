import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface Song {
  spotifyTrackId: string
  title: string
  artist: string
  rank: number
  albumCover: string
}

type LeaderboardPeriod = 'monthly' | 'quarterly' | 'allTime'

function getCurrentLeaderboardId(period: LeaderboardPeriod): string {
  const now = new Date()

  if (period === 'allTime') {
    return 'all-time'
  }

  if (period === 'monthly') {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  const quarter = Math.floor(now.getMonth() / 3) + 1
  return `${now.getFullYear()}-Q${quarter}`
}

export const SubmitSongRanking = ({
  period = 'monthly',
}: {
  period?: LeaderboardPeriod
}) => {
  const { user } = useAuth()
  const [submissionType, setSubmissionType] = useState<'top5' | 'top10' | 'top15' | 'top25'>('top5')
  const [rankedSongs, setRankedSongs] = useState<Song[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const submitMutation = useMutation(api.leaderboard.submitSongRanking)

  const handleAddSong = (song: Omit<Song, 'rank'>) => {
    const limit = parseInt(submissionType.replace('top', ''))
    if (rankedSongs.length >= limit) {
      setError(`You've reached the limit for this ranking (${limit} songs)`)
      return
    }

    if (rankedSongs.some(s => s.spotifyTrackId === song.spotifyTrackId)) {
      setError('You already added this song')
      return
    }

    setRankedSongs([...rankedSongs, { ...song, rank: rankedSongs.length + 1 }])
    setError(null)
  }

  const handleRemoveSong = (index: number) => {
    const updated = rankedSongs.filter((_, i) => i !== index)
    // Update ranks
    updated.forEach((song, i) => {
      song.rank = i + 1
    })
    setRankedSongs(updated)
  }

  const handleReorder = (oldIndex: number, newIndex: number) => {
    const updated = [...rankedSongs]
    const [removed] = updated.splice(oldIndex, 1)
    updated.splice(newIndex, 0, removed)
    // Update ranks
    updated.forEach((song, i) => {
      song.rank = i + 1
    })
    setRankedSongs(updated)
  }

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to submit rankings')
      return
    }

    const limit = parseInt(submissionType.replace('top', ''))
    if (rankedSongs.length !== limit) {
      setError(`Please rank exactly ${limit} songs`)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      await submitMutation({
        userId: user._id,
        leaderboardId: getCurrentLeaderboardId(period),
        submissionType,
        rankedSongs: rankedSongs.map(s => ({
          spotifyTrackId: s.spotifyTrackId,
          title: s.title,
          artist: s.artist,
          rank: s.rank,
          albumCover: s.albumCover,
        })),
      })

      setSuccess(true)
      setRankedSongs([])
      setSubmissionType('top5')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit ranking'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const limit = parseInt(submissionType.replace('top', ''))

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-white mb-6">Submit Your Rankings</h2>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-600/20 border border-green-600 text-green-300 p-4 rounded-lg mb-6"
        >
          ✓ Ranking submitted successfully! You earned 10 points.
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-600/20 border border-red-600 text-red-300 p-4 rounded-lg mb-6"
        >
          {error}
        </motion.div>
      )}

      {/* Type Selection */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-2">How many songs do you want to rank?</p>
        <div className="flex gap-2">
          {(['top5', 'top10', 'top15', 'top25'] as const).map(type => (
            <button
              key={type}
              onClick={() => {
                setSubmissionType(type)
                setRankedSongs([])
                setError(null)
              }}
              className={`px-4 py-2 rounded font-semibold transition ${
                submissionType === type
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {type.replace('top', '')} Songs
            </button>
          ))}
        </div>
      </div>

      {/* Search & Add */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <input
          type="text"
          placeholder="Search for a song..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-gray-400">
          Search integration coming soon - for now, add songs manually using the format below
        </p>
        <div className="mt-3 text-xs text-gray-500">
          <p>Demo: Click to add sample songs:</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={() => handleAddSong({
                spotifyTrackId: `demo-${Date.now()}-1`,
                title: 'Sample Song 1',
                artist: 'Artist Name',
                albumCover: 'https://via.placeholder.com/64',
              })}
              className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 text-gray-300"
            >
              + Add Sample Song
            </button>
          </div>
        </div>
      </div>

      {/* Current Rankings */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-3">
          Your Rankings ({rankedSongs.length}/{limit})
        </h3>

        {rankedSongs.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-gray-800 rounded-lg border border-gray-700">
            <p>No songs added yet. Start building your ranking!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rankedSongs.map((song, index) => (
              <motion.div
                key={song.spotifyTrackId}
                className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex items-center gap-3"
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="text-2xl font-bold text-purple-400 w-8">#{index + 1}</div>
                {song.albumCover && (
                  <img
                    src={song.albumCover}
                    alt={song.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-white">{song.title}</p>
                  <p className="text-sm text-gray-400">{song.artist}</p>
                </div>
                <div className="flex gap-2">
                  {index > 0 && (
                    <button
                      onClick={() => handleReorder(index, index - 1)}
                      className="px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                      title="Move up"
                    >
                      ↑
                    </button>
                  )}
                  {index < rankedSongs.length - 1 && (
                    <button
                      onClick={() => handleReorder(index, index + 1)}
                      className="px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                      title="Move down"
                    >
                      ↓
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveSong(index)}
                    className="px-3 py-1 bg-red-600/50 text-red-300 rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <motion.button
        onClick={handleSubmit}
        disabled={isLoading || rankedSongs.length !== limit || !user}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
        whileHover={!isLoading && rankedSongs.length === limit ? { scale: 1.02 } : undefined}
        whileTap={!isLoading && rankedSongs.length === limit ? { scale: 0.98 } : undefined}
      >
        {isLoading ? 'Submitting...' : 'Submit Ranking'}
      </motion.button>

      {!user && (
        <p className="text-center text-gray-400 text-sm mt-2">
          You must be logged in to submit rankings
        </p>
      )}
    </div>
  )
}
