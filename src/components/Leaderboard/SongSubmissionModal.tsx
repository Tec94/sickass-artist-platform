import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useAuth } from '../../hooks/useAuth'
import { useDebounce } from '../../hooks/useDebounce'

interface Song {
  spotifyTrackId: string
  title: string
  artist: string
  rank: number
  albumCover: string
}

type SubmissionType = 'top3' | 'top5' | 'top10' | 'top15' | 'top25'

interface SongSubmissionModalProps {
  isOpen: boolean
  onClose: () => void
  period?: 'weekly' | 'monthly' | 'quarterly' | 'allTime'
}

export const SongSubmissionModal = ({ isOpen, onClose, period = 'weekly' }: SongSubmissionModalProps) => {
  const { user } = useAuth()
  const [submissionType, setSubmissionType] = useState<SubmissionType>('top5')
  const [rankedSongs, setRankedSongs] = useState<Song[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Search results
  const searchResults = useQuery(api.spotify.searchSongs, { 
    query: debouncedSearch, 
    limit: 10 
  })

  const submitMutation = useMutation(api.leaderboard.submitSongRanking)

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setSuccess(false)
      setError(null)
      // We could optionally load existing submission here if we wanted editable rankings
    }
  }, [isOpen])

  const limit = parseInt(submissionType.replace('top', ''))

  const handleAddSong = (track: any) => {
    if (rankedSongs.length >= limit) {
      setError(`You've reached the limit for this ranking (${limit} songs)`)
      return
    }

    if (rankedSongs.some(s => s.spotifyTrackId === track.spotifyTrackId)) {
      setError('You already added this song')
      return
    }

    setRankedSongs([
      ...rankedSongs, 
      { 
        spotifyTrackId: track.spotifyTrackId,
        title: track.title,
        artist: track.artist,
        rank: rankedSongs.length + 1,
        albumCover: track.albumCover || ''
      }
    ])
    setSearchQuery('') // Clear search after adding
    setError(null)
  }

  const handleRemoveSong = (index: number) => {
    const updated = rankedSongs.filter((_, i) => i !== index)
    updated.forEach((song, i) => song.rank = i + 1)
    setRankedSongs(updated)
  }

  const handleMoveSong = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === rankedSongs.length - 1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    const updated = [...rankedSongs]
    const [moved] = updated.splice(index, 1)
    updated.splice(newIndex, 0, moved)
    
    updated.forEach((song, i) => song.rank = i + 1)
    setRankedSongs(updated)
  }

  const getCurrentLeaderboardId = (p: string) => {
    const now = new Date()
    if (p === 'allTime') return 'all-time'
    if (p === 'monthly') return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    if (p === 'weekly') {
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
      const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7)
      return `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`
    }
    // Quarterly fallback
    const quarter = Math.floor(now.getMonth() / 3) + 1
    return `${now.getFullYear()}-Q${quarter}`
  }

  const handleSubmit = async () => {
    if (!user) return
    if (rankedSongs.length !== limit) {
      setError(`Please rank exactly ${limit} songs`)
      return
    }

    setIsSubmitting(true)
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
      setTimeout(() => {
        onClose()
        setRankedSongs([])
        setSuccess(false)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to submit ranking')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold text-white">Submit Ranking</h2>
                <p className="text-zinc-400 text-sm">Select your top songs for the {period} leaderboard</p>
              </div>
              <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
                <iconify-icon icon="solar:close-circle-linear" width="24" height="24"></iconify-icon>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-700">
              {/* Type Selection */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {(['top3', 'top5', 'top10', 'top15', 'top25'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      setSubmissionType(type)
                      setRankedSongs([]) // Clear on change to avoid confusion
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${
                      submissionType === type
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    Top {type.replace('top', '')}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  <iconify-icon icon="solar:magnifer-linear" width="18" height="18"></iconify-icon>
                </div>
                <input
                  type="text"
                  placeholder="Search for a song..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition"
                  disabled={rankedSongs.length >= limit}
                />
                
                {/* Search Results Dropdown */}
                {searchQuery && searchResults && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map(track => (
                        <button
                          key={track.spotifyTrackId}
                          onClick={() => handleAddSong(track)}
                          disabled={rankedSongs.some(s => s.spotifyTrackId === track.spotifyTrackId)}
                          className="w-full p-3 flex items-center gap-3 hover:bg-zinc-700 text-left disabled:opacity-50 disabled:cursor-not-allowed group transition"
                        >
                          <img src={track.albumCover || '/placeholder.jpg'} alt="" className="w-10 h-10 rounded object-cover" />
                          <div>
                            <div className="font-bold text-white group-hover:text-red-500 transition">{track.title}</div>
                            <div className="text-xs text-zinc-400">{track.artist}</div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-zinc-500">No songs found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Current Rankings List */}
              <div className="space-y-2">
                {rankedSongs.map((song, index) => (
                  <motion.div
                    key={song.spotifyTrackId}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 p-3 rounded-lg group hover:border-zinc-700 transition"
                  >
                    <div className="font-display font-bold text-2xl text-zinc-600 w-8 text-center">
                      #{index + 1}
                    </div>
                    <img src={song.albumCover} alt="" className="w-12 h-12 rounded object-cover shadow-sm" />
                    <div className="flex-1">
                      <div className="font-bold text-white">{song.title}</div>
                      <div className="text-sm text-zinc-400">{song.artist}</div>
                    </div>
                    
                    <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                      <div className="flex flex-col gap-1 text-zinc-400">
                        <button 
                          onClick={() => handleMoveSong(index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-zinc-800 rounded disabled:opacity-30 hover:text-white"
                        >
                          <iconify-icon icon="solar:alt-arrow-up-linear" width="16" height="16"></iconify-icon>
                        </button>
                        <button 
                          onClick={() => handleMoveSong(index, 'down')}
                          disabled={index === rankedSongs.length - 1}
                          className="p-1 hover:bg-zinc-800 rounded disabled:opacity-30 hover:text-white"
                        >
                          <iconify-icon icon="solar:alt-arrow-down-linear" width="16" height="16"></iconify-icon>
                        </button>
                      </div>
                      <button 
                        onClick={() => handleRemoveSong(index)}
                        className="p-2 hover:bg-red-900/30 text-zinc-500 hover:text-red-500 rounded ml-2 transition"
                      >
                        <iconify-icon icon="solar:trash-bin-trash-linear" width="18" height="18"></iconify-icon>
                      </button>
                    </div>
                  </motion.div>
                ))}

                {rankedSongs.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl">
                    <div className="text-zinc-600 mb-2">Your ranking is empty</div>
                    <div className="text-sm text-zinc-500">Search above to add your top {limit} songs</div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-900/50">
              {error && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 text-red-200 text-sm rounded-lg flex items-center gap-2">
                  <iconify-icon icon="solar:danger-circle-bold" width="16" height="16"></iconify-icon> {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-900/20 border border-green-900/50 text-green-200 text-sm rounded-lg flex items-center gap-2">
                  <iconify-icon icon="solar:check-circle-bold" width="16" height="16"></iconify-icon> Ranking submitted!
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || rankedSongs.length !== limit || success}
                className="w-full py-4 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold uppercase tracking-wider rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Submitting...' : success ? 'Submitted' : `Submit Ranking (${rankedSongs.length}/${limit})`}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
