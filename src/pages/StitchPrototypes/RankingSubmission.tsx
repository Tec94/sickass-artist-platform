import { useMemo, useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, GripVertical, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import PrototypeSafeImage from '../../components/Media/PrototypeSafeImage'
import SharedNavbar from '../../components/Navigation/SharedNavbar'
import type { ArtistContentTrack } from '../../features/artistContent'
import { useArtistContent } from '../../features/artistContent'

const MAX_RANKED_TRACKS = 5
const RANKED_DROPZONE_ID = 'ranked-dropzone'

const formatStreams = (value: number | null | undefined) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '--'
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

const trimCopy = (value: string, maxLength = 150) =>
  value.length > maxLength ? `${value.slice(0, maxLength - 1).trimEnd()}…` : value

interface PoolTrackCardProps {
  track: ArtistContentTrack
  onAdd: (track: ArtistContentTrack) => void
}

function PoolTrackCard({ track, onAdd }: PoolTrackCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: track.id,
    data: {
      source: 'pool',
      track,
    },
  })

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.55 : 1,
      }}
      className="border border-[#3C2A21]/12 bg-[#FCFBF9] p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold uppercase tracking-[0.08em] text-[#3C2A21]">
            {track.name}
          </p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-[#8E7D72]">
            {formatStreams(track.streams)} streams
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAdd(track)}
            className="inline-flex items-center gap-1 border border-[#3C2A21] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors hover:bg-[#3C2A21] hover:text-[#F4EFE6]"
            aria-label={`Add ${track.name} to ranking`}
          >
            <Plus size={12} />
            Add
          </button>
          <button
            type="button"
            className="cursor-grab border border-[#3C2A21]/12 p-2 text-[#8E7D72] transition-colors hover:border-[#3C2A21] hover:text-[#3C2A21] active:cursor-grabbing"
            aria-label={`Drag ${track.name}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical size={14} />
          </button>
        </div>
      </div>

      {track.url ? (
        <a
          href={track.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8E7D72] transition-colors hover:text-[#C36B42]"
        >
          Open on Spotify
          <ArrowUpRight size={12} />
        </a>
      ) : null}
    </article>
  )
}

interface RankedTrackCardProps {
  track: ArtistContentTrack
  index: number
  onRemove: (trackId: string) => void
}

function RankedTrackCard({ track, index, onRemove }: RankedTrackCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: track.id,
    data: {
      source: 'ranked',
      track,
    },
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
      }}
      className="border border-[#1C1B1A] bg-[#F4EFE6] px-4 py-4 shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 text-[2rem] font-['Cormorant_Garamond'] leading-none text-[#C36B42]">
          {String(index + 1).padStart(2, '0')}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold uppercase tracking-[0.1em] text-[#3C2A21]">
            {track.name}
          </p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-[#8E7D72]">
            {formatStreams(track.streams)} streams
          </p>
        </div>
        <button
          type="button"
          className="cursor-grab border border-[#3C2A21]/12 p-2 text-[#8E7D72] transition-colors hover:border-[#3C2A21] hover:text-[#3C2A21] active:cursor-grabbing"
          aria-label={`Reorder ${track.name}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>
        <button
          type="button"
          onClick={() => onRemove(track.id)}
          className="border border-[#3C2A21]/12 p-2 text-[#8E7D72] transition-colors hover:border-[#A62B3A] hover:text-[#A62B3A]"
          aria-label={`Remove ${track.name}`}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}

function RankedDropZone({ isActive }: { isActive: boolean }) {
  const { setNodeRef } = useDroppable({
    id: RANKED_DROPZONE_ID,
  })

  return (
    <div
      ref={setNodeRef}
      className={`rounded-none border border-dashed px-5 py-8 text-center transition-colors ${
        isActive
          ? 'border-[#C36B42] bg-[#C36B42]/6'
          : 'border-[#3C2A21]/18 bg-[#FCFBF9] text-[#3C2A21]/72'
      }`}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
        Drop tracks here
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6">
        Build your top five from the source pool, then reorder them inside the ranked list.
      </p>
    </div>
  )
}

export default function RankingSubmission() {
  const { content } = useArtistContent()
  const latestRelease = content.spotify.latestRelease
  const recentPost = content.instagram.posts[0] ?? null
  const sourceTracks = useMemo(() => content.spotify.popularTracks.slice(0, 10), [content.spotify.popularTracks])
  const releasePool = content.spotify.releases.slice(0, 6)
  const [rankedTracks, setRankedTracks] = useState<ArtistContentTrack[]>([])
  const [isDropActive, setIsDropActive] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const availableTracks = useMemo(
    () => sourceTracks.filter((track) => !rankedTracks.some((selected) => selected.id === track.id)),
    [rankedTracks, sourceTracks],
  )

  const addTrack = (track: ArtistContentTrack) => {
    setRankedTracks((currentTracks) => {
      if (currentTracks.some((item) => item.id === track.id)) return currentTracks
      if (currentTracks.length >= MAX_RANKED_TRACKS) {
        toast.error('Your archive is already holding five tracks.')
        return currentTracks
      }

      return [...currentTracks, track]
    })
  }

  const removeTrack = (trackId: string) => {
    setRankedTracks((currentTracks) => currentTracks.filter((track) => track.id !== trackId))
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setIsDropActive(false)

    if (!over) return

    const activeSource = active.data.current?.source as 'pool' | 'ranked' | undefined
    const activeTrack = active.data.current?.track as ArtistContentTrack | undefined

    if (!activeTrack || !activeSource) return

    if (activeSource === 'pool') {
      setRankedTracks((currentTracks) => {
        if (currentTracks.some((track) => track.id === activeTrack.id)) return currentTracks
        if (currentTracks.length >= MAX_RANKED_TRACKS) {
          toast.error('Your archive is already holding five tracks.')
          return currentTracks
        }

        const overIndex = currentTracks.findIndex((track) => track.id === over.id)
        if (overIndex >= 0) {
          const nextTracks = [...currentTracks]
          nextTracks.splice(overIndex, 0, activeTrack)
          return nextTracks
        }

        if (over.id === RANKED_DROPZONE_ID) {
          return [...currentTracks, activeTrack]
        }

        return currentTracks
      })
      return
    }

    if (active.id === over.id || over.id === RANKED_DROPZONE_ID) return

    setRankedTracks((currentTracks) => {
      const oldIndex = currentTracks.findIndex((track) => track.id === active.id)
      const nextIndex = currentTracks.findIndex((track) => track.id === over.id)
      if (oldIndex < 0 || nextIndex < 0) return currentTracks
      return arrayMove(currentTracks, oldIndex, nextIndex)
    })
  }

  const handleSubmit = () => {
    if (rankedTracks.length === 0) {
      toast.error('Build your archive before sealing it.')
      return
    }

    toast.success(`Prototype archive staged with ${rankedTracks.length} ranked track${rankedTracks.length === 1 ? '' : 's'}.`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-parchment font-sans text-ink">
      <SharedNavbar />

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-[1600px] flex-col xl:flex-row">
          <div className="flex flex-1 flex-col overflow-y-auto border-r border-ink bg-vellum p-8 md:p-12">
            <div className="mb-10">
              <Link
                to="/rankings"
                className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors hover:text-primary"
              >
                <ArrowLeft size={16} /> Back to Rankings
              </Link>
              <h1 className="mb-4 font-display text-4xl uppercase leading-none tracking-tighter md:text-6xl">
                Submit Your Archive
              </h1>
              <p className="max-w-2xl font-headline text-lg italic text-muted">
                Build your top five from the synced ROA track pool, then drag inside the ranked list
                to set the final order.
              </p>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={() => setIsDropActive(true)}
              onDragCancel={() => setIsDropActive(false)}
              onDragEnd={handleDragEnd}
            >
              <section className="border border-ink bg-parchment">
                <div className="border-b border-ink/20 px-6 py-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest">Ranked slots</p>
                      <p className="mt-2 text-sm text-muted">
                        {rankedTracks.length} / {MAX_RANKED_TRACKS} tracks staged
                      </p>
                    </div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
                      Drag from pool, reorder in place
                    </p>
                  </div>
                </div>

                <div className="space-y-4 px-6 py-6">
                  <SortableContext
                    items={rankedTracks.map((track) => track.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {rankedTracks.map((track, index) => (
                      <RankedTrackCard
                        key={track.id}
                        track={track}
                        index={index}
                        onRemove={removeTrack}
                      />
                    ))}
                  </SortableContext>

                  {rankedTracks.length < MAX_RANKED_TRACKS ? <RankedDropZone isActive={isDropActive} /> : null}
                </div>
              </section>

              <section className="mt-8">
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest">Source track pool</p>
                    <p className="mt-2 text-sm text-muted">
                      Drag songs into the ranked slots or tap add for a quick stage.
                    </p>
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
                    {availableTracks.length} available
                  </p>
                </div>

                {availableTracks.length > 0 ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {availableTracks.map((track) => (
                      <PoolTrackCard key={track.id} track={track} onAdd={addTrack} />
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-ink/20 bg-parchment px-5 py-6 text-sm leading-6 text-muted">
                    The full pool is already staged in your archive. Reorder the ranked list or remove
                    a track to make room.
                  </div>
                )}
              </section>
            </DndContext>

            <div className="mt-10 flex flex-col gap-4 border-t border-ink/20 pt-8 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted">
                Prototype mode only. Ranking order is interactive on this page, but submit is not yet
                persisted to Convex.
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-ink px-12 py-4 text-xs font-bold uppercase tracking-widest text-vellum transition-colors hover:bg-primary"
              >
                Seal & Submit Archive
              </button>
            </div>
          </div>

          <aside className="xl:w-[40%] bg-[#F4EFE6]">
            <div className="border-b border-ink/10">
              <div className="relative min-h-[420px] overflow-hidden">
                <PrototypeSafeImage
                  src={recentPost?.thumbnailUrl}
                  alt={recentPost?.description || `${content.artistName} recent post`}
                  kind="social"
                  className="absolute inset-0 h-full w-full object-cover grayscale opacity-90 mix-blend-multiply"
                  title={latestRelease?.name || 'Latest release context'}
                  description="The campaign context stays readable even when the external post image is blocked."
                />
                <div className="absolute inset-0 bg-gradient-to-t from-parchment via-parchment/75 to-transparent" />

                <div className="relative z-10 flex min-h-[420px] flex-col justify-end p-10 md:p-12">
                  <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                    Latest release context
                  </p>
                  <h2 className="font-display text-4xl uppercase leading-none tracking-tighter text-ink md:text-5xl">
                    {latestRelease?.name || 'Waiting for current drop'}
                  </h2>
                  <div className="mb-6 mt-6 h-1 w-12 bg-primary" />
                  <p className="max-w-md font-headline text-xl italic text-ink">
                    {trimCopy(
                      recentPost?.caption ||
                        'The archive panel will fill with the latest ROA campaign signal after the next payload sync.',
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-8 md:p-10">
              <section>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                  Release context
                </p>
                <div className="space-y-3">
                  {releasePool.map((release) => (
                    <div
                      key={release.id}
                      className="flex items-center justify-between gap-4 border border-ink/15 bg-vellum p-4"
                    >
                      <div>
                        <p className="font-semibold">{release.name}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted">
                          {release.type} {release.year ? `• ${release.year}` : ''}
                        </p>
                      </div>
                      {release.url ? (
                        <a
                          href={release.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted transition-colors hover:text-primary"
                          aria-label={`Open ${release.name} on Spotify`}
                        >
                          <ArrowUpRight size={18} />
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>

              {latestRelease?.embedUrl ? (
                <section className="border border-ink/15 bg-vellum p-3">
                  <iframe
                    title={`${latestRelease.name} Spotify embed`}
                    src={latestRelease.embedUrl}
                    className="h-[352px] w-full border-0"
                    loading="lazy"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  />
                </section>
              ) : (
                <section className="border border-dashed border-ink/15 bg-vellum px-4 py-6 text-sm leading-6 text-muted">
                  No release embed is available for the current payload.
                </section>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
