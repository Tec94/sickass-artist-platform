import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation } from 'convex/react'
import type { Doc } from '../../../convex/_generated/dataModel'
import { api } from '../../../convex/_generated/api'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAuth } from '../../hooks/useAuth'
import { useDebounce } from '../../hooks/useDebounce'
import {
  getCurrentLeaderboardId,
  getSubmissionLimit,
  withSequentialRanks,
  type SubmissionType,
  type LeaderboardPeriod,
} from '../../utils/leaderboard'

type SpotifyTrack = Doc<'spotifySongs'>

type RankedSong = {
  spotifyTrackId: string
  title: string
  artist: string
  rank: number
  albumCover: string
}

interface SongSubmissionModalProps {
  isOpen: boolean
  onClose: () => void
  period: LeaderboardPeriod
}

interface SortableRankItemProps {
  song: RankedSong
  index: number
  onRemove: () => void
}

function SortableRankItem({ song, index, onRemove }: SortableRankItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: song.spotifyTrackId,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 bg-zinc-900/60 border border-zinc-800 p-3 rounded-lg group hover:border-zinc-700 transition"
    >
      <div className="font-display font-bold text-2xl text-zinc-600 w-8 text-center">#{index + 1}</div>
      <img src={song.albumCover} alt="" className="w-12 h-12 rounded object-cover shadow-sm" />
      <div className="flex-1 min-w-0">
        <div className="font-bold text-white truncate">{song.title}</div>
        <div className="text-sm text-zinc-400 truncate">{song.artist}</div>
      </div>

      <button
        className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition cursor-grab active:cursor-grabbing"
        aria-label={`Drag ${song.title}`}
        {...attributes}
        {...listeners}
      >
        <iconify-icon icon="solar:hamburger-menu-linear" width="18" height="18"></iconify-icon>
      </button>

      <button
        onClick={onRemove}
        className="p-2 hover:bg-red-900/30 text-zinc-500 hover:text-red-500 rounded transition"
        aria-label={`Remove ${song.title}`}
      >
        <iconify-icon icon="solar:trash-bin-trash-linear" width="18" height="18"></iconify-icon>
      </button>
    </div>
  )
}

export const SongSubmissionModal = ({ isOpen, onClose, period }: SongSubmissionModalProps) => {
  const { user } = useAuth()
  const [submissionType, setSubmissionType] = useState<SubmissionType>('top5')
  const [rankedSongs, setRankedSongs] = useState<RankedSong[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const hasHydratedRef = useRef(false)

  const leaderboardId = useMemo(() => getCurrentLeaderboardId(period), [period])
  const limit = useMemo(() => getSubmissionLimit(submissionType), [submissionType])

  const searchTerm = debouncedSearch.trim()
  const searchResults = useQuery(
    api.spotify.searchSongs,
    searchTerm.length >= 2
      ? {
          query: searchTerm,
          limit: 10,
        }
      : 'skip'
  )

  const userSubmission = useQuery(
    api.leaderboard.getUserSubmissionForPeriod,
    user && isOpen
      ? {
          period,
        }
      : 'skip'
  )

  const submitMutation = useMutation(api.leaderboard.submitSongRanking)
  const updateMutation = useMutation(api.leaderboard.updateSongSubmission)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    if (!isOpen) return
    setSuccess(false)
    setError(null)
    setIsSubmitting(false)
    setRankedSongs([])
    setSubmissionType('top5')
    setSearchQuery('')
    hasHydratedRef.current = false
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !userSubmission || hasHydratedRef.current) return
    if (userSubmission.leaderboardId !== leaderboardId) return

    const nextType = userSubmission.submissionType as SubmissionType
    const hydratedSongs = withSequentialRanks(
      [...userSubmission.rankedSongs].sort((a, b) => a.rank - b.rank)
    )

    setSubmissionType(nextType)
    setRankedSongs(hydratedSongs)
    hasHydratedRef.current = true
  }, [isOpen, userSubmission, leaderboardId])

  const handleSubmissionTypeChange = (type: SubmissionType) => {
    setSubmissionType(type)
    const nextLimit = getSubmissionLimit(type)
    setRankedSongs((prev) => withSequentialRanks(prev.slice(0, nextLimit)))
    setError(null)
  }

  const handleAddSong = (track: SpotifyTrack) => {
    if (rankedSongs.length >= limit) {
      setError(`You've reached the limit for this ranking (${limit} songs)`)
      return
    }
    if (rankedSongs.some((song) => song.spotifyTrackId === track.spotifyTrackId)) {
      setError('You already added this song')
      return
    }

    const nextSongs = withSequentialRanks([
      ...rankedSongs,
      {
        spotifyTrackId: track.spotifyTrackId,
        title: track.title,
        artist: track.artist,
        rank: rankedSongs.length + 1,
        albumCover: track.albumCover || '',
      },
    ])

    setRankedSongs(nextSongs)
    setSearchQuery('')
    setError(null)
  }

  const handleRemoveSong = (spotifyTrackId: string) => {
    setRankedSongs((prev) =>
      withSequentialRanks(prev.filter((song) => song.spotifyTrackId !== spotifyTrackId))
    )
    setError(null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setRankedSongs((prev) => {
      const oldIndex = prev.findIndex((song) => song.spotifyTrackId === active.id)
      const newIndex = prev.findIndex((song) => song.spotifyTrackId === over.id)
      if (oldIndex === -1 || newIndex === -1) return prev
      return withSequentialRanks(arrayMove(prev, oldIndex, newIndex))
    })
  }

  const handleSubmit = async () => {
    if (!user) return
    if (rankedSongs.length !== limit) {
      setError(`Please rank exactly ${limit} songs`)
      return
    }

    const normalizedSongs = withSequentialRanks([...rankedSongs])
    setRankedSongs(normalizedSongs)

    const payload = normalizedSongs.map((song) => ({
      spotifyTrackId: song.spotifyTrackId,
      title: song.title,
      artist: song.artist,
      rank: song.rank,
      albumCover: song.albumCover,
    }))

    setIsSubmitting(true)
    setError(null)

    try {
      if (userSubmission && userSubmission.leaderboardId === leaderboardId) {
        await updateMutation({
          submissionId: userSubmission._id,
          submissionType,
          rankedSongs: payload,
        })
      } else {
        await submitMutation({
          leaderboardId,
          submissionType,
          rankedSongs: payload,
        })
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 1400)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit ranking'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEditing = Boolean(userSubmission && userSubmission.leaderboardId === leaderboardId)
  const lastEditedAt = userSubmission?.lastEditedAt ?? userSubmission?.updatedAt ?? userSubmission?.createdAt

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
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-h-[92vh] flex flex-col"
          >
            <div className="p-6 border-b border-zinc-800 flex items-start justify-between gap-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-white">
                  {isEditing ? 'Edit Your Ranking' : 'Rank Your Songs'}
                </h2>
                <p className="text-zinc-400 text-sm mt-1">
                  Drag to reorder. You can revise this submission anytime.
                </p>
                {isEditing && lastEditedAt && (
                  <div className="text-xs text-zinc-500 mt-2">
                    Last updated {new Date(lastEditedAt).toLocaleString()}
                  </div>
                )}
              </div>
              <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
                <iconify-icon icon="solar:close-circle-linear" width="24" height="24"></iconify-icon>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-700">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {(['top3', 'top5', 'top10', 'top15', 'top25'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleSubmissionTypeChange(type)}
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

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  <iconify-icon icon="solar:magnifer-linear" width="18" height="18"></iconify-icon>
                </div>
                <input
                  type="text"
                  placeholder={`Search songs (need ${limit - rankedSongs.length} more)`}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition"
                  disabled={rankedSongs.length >= limit}
                />

                {searchTerm.length >= 2 && searchResults && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-20 max-h-72 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map((track) => (
                        <button
                          key={track.spotifyTrackId}
                          onClick={() => handleAddSong(track)}
                          disabled={rankedSongs.some((song) => song.spotifyTrackId === track.spotifyTrackId)}
                          className="w-full p-3 flex items-center gap-3 hover:bg-zinc-700 text-left disabled:opacity-50 disabled:cursor-not-allowed group transition"
                        >
                          <img
                            src={track.albumCover || '/placeholder.jpg'}
                            alt=""
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-white group-hover:text-red-500 transition truncate">
                              {track.title}
                            </div>
                            <div className="text-xs text-zinc-400 truncate">{track.artist}</div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-zinc-500">No songs found</div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {rankedSongs.length === 0 ? (
                  <div className="text-center py-14 border-2 border-dashed border-zinc-800 rounded-xl">
                    <div className="text-zinc-500 font-bold">No songs ranked yet</div>
                    <div className="text-sm text-zinc-600 mt-1">Search above to build your list</div>
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext
                      items={rankedSongs.map((song) => song.spotifyTrackId)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {rankedSongs.map((song, index) => (
                          <SortableRankItem
                            key={song.spotifyTrackId}
                            song={song}
                            index={index}
                            onRemove={() => handleRemoveSong(song.spotifyTrackId)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-zinc-800 bg-zinc-900/60">
              {error && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 text-red-200 text-sm rounded-lg flex items-center gap-2">
                  <iconify-icon icon="solar:danger-circle-bold" width="16" height="16"></iconify-icon> {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-emerald-900/20 border border-emerald-900/40 text-emerald-200 text-sm rounded-lg flex items-center gap-2">
                  <iconify-icon icon="solar:check-circle-bold" width="16" height="16"></iconify-icon> Ranking saved
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || rankedSongs.length !== limit || success}
                className="w-full py-4 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold uppercase tracking-wider rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
              >
                {isSubmitting
                  ? 'Saving...'
                  : success
                    ? 'Saved'
                    : `${isEditing ? 'Update Ranking' : 'Submit Ranking'} (${rankedSongs.length}/${limit})`}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
