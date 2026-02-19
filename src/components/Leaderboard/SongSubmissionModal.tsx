import { useState, useEffect, useRef, useMemo } from 'react'
import { toast } from 'sonner'
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
import { embeddedSpotifyTracks } from '../../data/spotifyEmbeddedTracks'

type SpotifyTrack = Pick<Doc<'spotifySongs'>, 'spotifyTrackId' | 'title' | 'artist' | 'albumCover'> & {
  externalUrl?: string
}

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
      className="flex items-center gap-4 bg-[#0D151F]/88 border border-[#2A3541] p-3 rounded-lg transition-colors hover:border-[#3A4A5A]"
    >
      <div className="font-display font-semibold text-2xl text-[#6E8092] w-8 text-center">#{index + 1}</div>
      <img src={song.albumCover} alt="" className="w-12 h-12 rounded object-cover shadow-sm" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[#E8E1D5] truncate">{song.title}</div>
        <div className="text-sm text-[#8EA0B3] truncate">{song.artist}</div>
      </div>

      <button
        className="p-2 text-[#7F90A3] hover:text-[#E8E1D5] hover:bg-[#1A2531] rounded transition cursor-grab active:cursor-grabbing"
        aria-label={`Drag ${song.title}`}
        {...attributes}
        {...listeners}
      >
        <iconify-icon icon="solar:hamburger-menu-linear" width="18" height="18"></iconify-icon>
      </button>

      <button
        onClick={onRemove}
        className="p-2 hover:bg-[#5A1D26]/35 text-[#8A5D66] hover:text-[#F29A9A] rounded transition-colors"
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
  const fallbackResults = useMemo(() => {
    if (searchTerm.length < 2) return []
    const query = searchTerm.toLowerCase()
    return embeddedSpotifyTracks
      .filter((track) =>
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query)
      )
      .slice(0, 10)
      .map((track) => ({
        spotifyTrackId: track.spotifyTrackId,
        title: track.title,
        artist: track.artist,
        albumCover: track.albumCover,
        externalUrl: track.externalUrl,
      }))
  }, [searchTerm])
  const effectiveResults = (searchResults && searchResults.length > 0 ? searchResults : fallbackResults) as SpotifyTrack[]

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
  }

  const handleAddSong = (track: SpotifyTrack) => {
    if (rankedSongs.length >= limit) {
      toast.error(`You've reached the limit for this ranking (${limit} songs)`)
      return
    }
    if (rankedSongs.some((song) => song.spotifyTrackId === track.spotifyTrackId)) {
      toast.error('You already added this song')
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
  }

  const handleRemoveSong = (spotifyTrackId: string) => {
    setRankedSongs((prev) =>
      withSequentialRanks(prev.filter((song) => song.spotifyTrackId !== spotifyTrackId))
    )
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
      toast.error(`Please rank exactly ${limit} songs`)
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

    const promise = (userSubmission && userSubmission.leaderboardId === leaderboardId)
      ? updateMutation({
          submissionId: userSubmission._id,
          submissionType,
          rankedSongs: payload,
        })
      : submitMutation({
          leaderboardId,
          submissionType,
          rankedSongs: payload,
        })

    toast.promise(promise, {
      loading: 'Saving ranking...',
      success: () => {
        setIsSubmitting(false)
        onClose()
        return 'Ranking saved successfully!'
      },
      error: (err) => {
        setIsSubmitting(false)
        return err instanceof Error ? err.message : 'Failed to submit ranking'
      }
    })
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
            className="relative w-full max-w-3xl bg-[#111A24] border border-[#2A3541] rounded-xl shadow-2xl max-h-[92vh] flex flex-col"
          >
            <div className="p-6 border-b border-[#2A3541] flex items-start justify-between gap-6">
              <div>
                <h2 className="text-2xl font-display font-semibold text-[#E8E1D5]">
                  {isEditing ? 'Edit Your Ranking' : 'Rank Your Songs'}
                </h2>
                <p className="text-[#9AA7B5] text-sm mt-1">
                  Drag to reorder. You can revise this submission anytime.
                </p>
                {isEditing && lastEditedAt && (
                  <div className="text-xs text-[#75879A] mt-2">
                    Last updated {new Date(lastEditedAt).toLocaleString()}
                  </div>
                )}
              </div>
              <button onClick={onClose} className="text-[#8EA0B3] hover:text-[#E8E1D5] transition-colors">
                <iconify-icon icon="solar:close-circle-linear" width="24" height="24"></iconify-icon>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {(['top3', 'top5', 'top10', 'top15', 'top25'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleSubmissionTypeChange(type)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                      submissionType === type
                        ? 'bg-[#A62B3A] text-[#F5EFE4] shadow-[0_8px_18px_rgba(166,43,58,0.28)]'
                        : 'bg-[#1A2531] text-[#8FA0B2] hover:bg-[#243241] hover:text-[#E8E1D5]'
                    }`}
                  >
                    Top {type.replace('top', '')}
                  </button>
                ))}
              </div>

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C8EA1]">
                  <iconify-icon icon="solar:magnifer-linear" width="18" height="18"></iconify-icon>
                </div>
                <input
                  type="text"
                  placeholder={`Search songs (need ${limit - rankedSongs.length} more)`}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0A1118] border border-[#2A3541] rounded-lg text-[#E8E1D5] placeholder:text-[#6F7E8E] focus:outline-none focus:border-[#A62B3A] focus:ring-1 focus:ring-[#A62B3A] transition-colors"
                  disabled={rankedSongs.length >= limit}
                />

                {searchTerm.length >= 2 && effectiveResults && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#0D151F] border border-[#2A3541] rounded-lg shadow-xl z-20 max-h-72 overflow-y-auto">
                    {effectiveResults.length > 0 ? (
                      effectiveResults.map((track) => (
                        <button
                          key={track.spotifyTrackId}
                          onClick={() => handleAddSong(track)}
                          disabled={rankedSongs.some((song) => song.spotifyTrackId === track.spotifyTrackId)}
                          className="w-full p-3 flex items-center gap-3 hover:bg-[#1A2531] text-left disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <img
                            src={track.albumCover || '/placeholder.jpg'}
                            alt=""
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-[#E8E1D5] truncate">
                              {track.title}
                            </div>
                            <div className="text-xs text-[#8EA0B3] truncate">{track.artist}</div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-[#7C8EA1]">No songs found</div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {rankedSongs.length === 0 ? (
                  <div className="text-center py-14 border-2 border-dashed border-[#2A3541] rounded-xl">
                    <div className="text-[#8EA0B3] font-semibold">No songs ranked yet</div>
                    <div className="text-sm text-[#6F7E8E] mt-1">Search above to build your list</div>
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

            <div className="p-6 border-t border-[#2A3541] bg-[#0D151F]/80">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || rankedSongs.length !== limit}
                className="w-full py-4 bg-[#A62B3A] hover:bg-[#B43849] active:bg-[#7F1F2C] text-[#F5EFE4] font-bold uppercase tracking-wider rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-[#20080d]/35 flex items-center justify-center gap-2"
              >
                {isSubmitting
                  ? 'Saving...'
                  : `${isEditing ? 'Update Ranking' : 'Submit Ranking'} (${rankedSongs.length}/${limit})`}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
