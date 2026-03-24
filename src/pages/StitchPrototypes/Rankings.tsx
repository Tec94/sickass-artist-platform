import { useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { Link } from 'react-router-dom'
import { ArrowRight, History, Landmark, PenTool, RadioTower, TrendingUp } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import PrototypeSafeImage from '../../components/Media/PrototypeSafeImage'
import SharedNavbar from '../../components/Navigation/SharedNavbar'
import { useArtistContent } from '../../features/artistContent'
import './RankingsV2.css'

type ActiveBoard = 'members' | 'songs'

const LEDGER_LIMIT = 20

const formatCompact = (value: number | null | undefined) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '--'
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

const formatPoints = (value: number | null | undefined) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '--'
  return new Intl.NumberFormat('en-US').format(value)
}

const formatScore = (value: number | null | undefined) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '--'
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)
}

const initialsFromName = (value: string) =>
  value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

const tierLabel = (tier: string) => {
  switch (tier) {
    case 'platinum':
      return 'Apex'
    case 'gold':
      return 'Gold'
    case 'silver':
      return 'Silver'
    default:
      return 'Bronze'
  }
}

const trimCopy = (value: string, maxLength = 132) =>
  value.length > maxLength ? `${value.slice(0, maxLength - 1).trimEnd()}...` : value

const momentumPatterns = [
  [12, 24, 30, 18],
  [20, 11, 28, 16],
  [10, 30, 18, 24],
  [24, 16, 28, 12],
] as const

const MomentumGlyph = ({
  index,
  caption,
  accent = '#C36B42',
}: {
  index: number
  caption: string
  accent?: string
}) => {
  const bars = momentumPatterns[index % momentumPatterns.length]

  return (
    <div className="flex items-center gap-4 sm:justify-center">
      <div className="flex h-8 items-end gap-1 opacity-70" aria-hidden="true">
        {bars.map((height, barIndex) => (
          <span
            key={`${caption}-${barIndex}`}
            className="block w-1 rounded-full"
            style={{ height, backgroundColor: accent }}
          />
        ))}
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8E8982]">{caption}</span>
    </div>
  )
}

const LedgerSkeleton = ({ label }: { label: string }) => (
  <div className="space-y-px border border-black/5 bg-black/5">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={`${label}-${index}`} className="grid gap-4 bg-[#FCFBF9]/70 px-5 py-5 sm:grid-cols-[64px_minmax(0,1fr)_120px_140px] sm:items-center">
        <div className="h-4 w-10 animate-pulse bg-[#D7D1C8]" />
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 animate-pulse bg-[#D7D1C8]" />
          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse bg-[#D7D1C8]" />
            <div className="h-3 w-20 animate-pulse bg-[#E6DFD4]" />
          </div>
        </div>
        <div className="h-6 w-24 animate-pulse bg-[#E6DFD4]" />
        <div className="h-6 w-28 animate-pulse justify-self-start sm:justify-self-end bg-[#D7D1C8]" />
      </div>
    ))}
  </div>
)

export default function Rankings() {
  const [activeBoard, setActiveBoard] = useState<ActiveBoard>('members')
  const { content, isLoading: isArtistLoading } = useArtistContent()
  const fanLeaderboard = useQuery(api.points.getFanLeaderboard, { limit: LEDGER_LIMIT })
  const songLeaderboard = useQuery(
    api.leaderboard.getLeaderboard,
    activeBoard === 'songs' ? { period: 'weekly', limit: LEDGER_LIMIT } : 'skip',
  )

  const entries = fanLeaderboard?.entries ?? []
  const currentUserEntry = fanLeaderboard?.currentUserEntry ?? null
  const currentUserVisible = Boolean(
    currentUserEntry && entries.some((entry) => entry.userId === currentUserEntry.userId),
  )
  const recentPost = content.instagram.posts[0] ?? null

  const artistSnapshot = useMemo(
    () => [
      {
        label: 'Active Peers',
        value: formatCompact(content.spotify.monthlyListeners),
      },
      {
        label: 'Citations',
        value: content.instagram.followersLabel || '--',
      },
      {
        label: 'Top Track',
        value: content.spotify.topTrack?.name || 'Waiting for sync',
      },
      {
        label: 'Latest Drop',
        value: content.spotify.latestRelease?.name || 'Pending',
      },
    ],
    [content],
  )

  const boardSummary = useMemo(() => {
    if (activeBoard === 'members') {
      return [
        {
          label: 'Primary Standing',
          value: entries[0]?.displayName || 'Awaiting entry',
        },
        {
          label: 'Tracked Members',
          value: entries.length ? String(entries.length).padStart(2, '0') : '--',
        },
        {
          label: 'Current Ledger',
          value: 'Lunar Cycle',
        },
      ]
    }

    const leader = songLeaderboard?.[0]
    const voterVolume = songLeaderboard?.reduce((total, row) => total + row.uniqueVoters, 0) ?? null

    return [
      {
        label: 'Leading Track',
        value: leader?.songTitle || 'Awaiting ranking',
      },
      {
        label: 'Active Voters',
        value: typeof voterVolume === 'number' ? formatCompact(voterVolume) : '--',
      },
      {
        label: 'Current Ledger',
        value: 'Weekly Board',
      },
    ]
  }, [activeBoard, entries, songLeaderboard])

  return (
    <div className="rankings-v2-container flex h-full min-h-0 flex-col overflow-x-hidden">
      <div className="halftone-overlay" />
      <SharedNavbar />

      <main className="mx-auto flex min-h-[calc(100dvh-72px)] w-full max-w-[1920px]">
        <div className="custom-scrollbar flex-1 overflow-y-auto border-r border-structural p-8 md:p-12">
          <header className="mb-10 space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8E8982]">
                Collection: Pack_Rankings_2024
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8E8982]">
                Log No. 882-C
              </span>
            </div>
            <div className="space-y-4">
              <h2 className="editorial-title text-5xl leading-none text-[#1C1B1A] md:text-7xl">Pack Rankings</h2>
              <div className="h-px w-full bg-[#1C1B1A]/15" />
              <p className="max-w-3xl text-sm leading-relaxed text-[#5B554D] md:text-[15px]">
                A denser ledger of the archive&apos;s most influential members and the tracks shaping the current cycle.
                Shift between collector standing and weekly song hierarchy without leaving the dossier.
              </p>
            </div>
          </header>

          <section className="mb-12 border border-black/5 bg-[#EFE8DC]/70 p-2 shadow-[0_20px_45px_rgba(28,27,26,0.06)]">
            <div
              className="grid gap-2 md:grid-cols-2"
              role="tablist"
              aria-label="Rankings boards"
            >
              <button
                id="rankings-tab-members"
                type="button"
                role="tab"
                aria-selected={activeBoard === 'members'}
                aria-controls="rankings-panel-members"
                onClick={() => setActiveBoard('members')}
                className={`min-h-[64px] border px-6 py-4 text-left transition-colors ${
                  activeBoard === 'members'
                    ? 'border-[#D7C4B7] bg-[#FCFBF9] text-[#1C1B1A] shadow-[inset_0_-2px_0_#C36B42]'
                    : 'border-transparent bg-[#E7DED1] text-[#8E8982] hover:text-[#1C1B1A]'
                }`}
              >
                <span className="block font-mono text-[10px] uppercase tracking-[0.26em]">Member Standings</span>
                <span className="mt-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8E8982]">
                  <TrendingUp size={14} strokeWidth={1.75} />
                  Collector momentum
                </span>
              </button>
              <button
                id="rankings-tab-songs"
                type="button"
                role="tab"
                aria-selected={activeBoard === 'songs'}
                aria-controls="rankings-panel-songs"
                onClick={() => setActiveBoard('songs')}
                className={`min-h-[64px] border px-6 py-4 text-left transition-colors ${
                  activeBoard === 'songs'
                    ? 'border-[#D7C4B7] bg-[#FCFBF9] text-[#1C1B1A] shadow-[inset_0_-2px_0_#C36B42]'
                    : 'border-transparent bg-[#E7DED1] text-[#8E8982] hover:text-[#1C1B1A]'
                }`}
              >
                <span className="block font-mono text-[10px] uppercase tracking-[0.26em]">Song Championship</span>
                <span className="mt-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8E8982]">
                  <RadioTower size={14} strokeWidth={1.75} />
                  Weekly board
                </span>
              </button>
            </div>
          </section>

          <section
            id={activeBoard === 'members' ? 'rankings-panel-members' : 'rankings-panel-songs'}
            role="tabpanel"
            aria-labelledby={activeBoard === 'members' ? 'rankings-tab-members' : 'rankings-tab-songs'}
            className="space-y-8"
          >
            <div className="grid gap-px border border-black/5 bg-black/5 md:grid-cols-3">
              {boardSummary.map((item) => (
                <div key={item.label} className="bg-[#FCFBF9]/90 px-5 py-4">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-[#8E8982]">
                    {item.label}
                  </span>
                  <span className="mt-2 block truncate text-lg font-semibold tracking-tight text-[#1C1B1A]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {activeBoard === 'members' ? (
              <section className="space-y-4">
                {fanLeaderboard === undefined ? (
                  <LedgerSkeleton label="members" />
                ) : entries.length === 0 ? (
                  <div className="border border-dashed border-black/10 bg-[#FCFBF9]/70 px-6 py-12 text-center text-sm italic text-[#8E8982]">
                    No collector standings have been logged for this cycle.
                  </div>
                ) : (
                  <div className="space-y-px border border-black/5 bg-black/5">
                    {entries.map((entry, index) => (
                      <article
                        key={entry.userId}
                        className={`grid gap-4 px-5 py-5 transition-colors sm:grid-cols-[64px_minmax(0,1fr)_132px_140px] sm:items-center ${
                          entry.isCurrentUser
                            ? 'bg-[#FCFBF9] shadow-[inset_3px_0_0_#C36B42]'
                            : 'bg-[#FCFBF9]/75 hover:bg-[#FCFBF9]'
                        }`}
                      >
                        <div className="font-mono text-sm tracking-[0.24em] text-[#8E8982] tabular-nums">
                          {String(entry.rank).padStart(3, '0')}
                        </div>
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="h-12 w-12 overflow-hidden border border-black/10 bg-white">
                            {entry.avatar ? (
                              <img src={entry.avatar} alt={entry.displayName} className="h-full w-full object-cover grayscale" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-[#F4F0EB] text-[11px] font-bold text-[#1C1B1A]">
                                {initialsFromName(entry.displayName)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-base font-semibold text-[#1C1B1A]">{entry.displayName}</h3>
                              {entry.isCurrentUser ? (
                                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#C36B42]">
                                  Your Standing
                                </span>
                              ) : null}
                            </div>
                            <span className="mt-1 inline-flex bg-[#C36B42]/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#A15332]">
                              {tierLabel(entry.fanTier)} Tier
                            </span>
                          </div>
                        </div>
                        <MomentumGlyph index={index} caption={entry.isCurrentUser ? 'Tracked' : 'Rising signal'} />
                        <div className="text-left sm:text-right">
                          <div className="font-mono text-2xl font-semibold tracking-tight text-[#1C1B1A] tabular-nums">
                            {formatPoints(entry.totalPoints)}
                          </div>
                          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8E8982]">PTS</div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                {currentUserEntry && !currentUserVisible ? (
                  <div className="border border-dashed border-[#C36B42]/25 bg-[#FCFBF9] p-4">
                    <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[#8E8982]">Your standing</div>
                    <article className="grid gap-4 sm:grid-cols-[64px_minmax(0,1fr)_132px_140px] sm:items-center">
                      <div className="font-mono text-sm tracking-[0.24em] text-[#8E8982] tabular-nums">
                        {String(currentUserEntry.rank).padStart(3, '0')}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-[#1C1B1A]">{currentUserEntry.displayName}</h3>
                        <span className="mt-1 inline-flex bg-[#C36B42]/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#A15332]">
                          {tierLabel(currentUserEntry.fanTier)} Tier
                        </span>
                      </div>
                      <MomentumGlyph index={currentUserEntry.rank} caption="Tracked" />
                      <div className="text-left sm:text-right">
                        <div className="font-mono text-2xl font-semibold tracking-tight text-[#1C1B1A] tabular-nums">
                          {formatPoints(currentUserEntry.totalPoints)}
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8E8982]">PTS</div>
                      </div>
                    </article>
                  </div>
                ) : null}
              </section>
            ) : (
              <section className="space-y-4">
                {songLeaderboard === undefined ? (
                  <LedgerSkeleton label="songs" />
                ) : songLeaderboard.length === 0 ? (
                  <div className="border border-dashed border-black/10 bg-[#FCFBF9]/70 px-6 py-12 text-center text-sm italic text-[#8E8982]">
                    No song rankings are available for the current weekly board.
                  </div>
                ) : (
                  <div className="space-y-px border border-black/5 bg-black/5">
                    {songLeaderboard.map((entry, index) => (
                      <article
                        key={entry.spotifyTrackId}
                        className="grid gap-4 bg-[#FCFBF9]/80 px-5 py-5 transition-colors hover:bg-[#FCFBF9] sm:grid-cols-[64px_minmax(0,1fr)_132px_140px] sm:items-center"
                      >
                        <div className="font-mono text-sm tracking-[0.24em] text-[#8E8982] tabular-nums">
                          {String(entry.rank).padStart(3, '0')}
                        </div>
                        <div className="flex min-w-0 items-center gap-4">
                          <img
                            src={entry.albumCover}
                            alt={`${entry.songTitle} cover`}
                            className="h-12 w-12 border border-black/10 object-cover grayscale"
                          />
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold text-[#1C1B1A]">{entry.songTitle}</h3>
                            <span className="mt-1 block truncate font-mono text-[10px] uppercase tracking-[0.18em] text-[#8E8982]">
                              {entry.songArtist}
                            </span>
                          </div>
                        </div>
                        <MomentumGlyph index={index} caption={`${entry.uniqueVoters} voters`} accent="#8A5A43" />
                        <div className="text-left sm:text-right">
                          <div className="font-mono text-2xl font-semibold tracking-tight text-[#1C1B1A] tabular-nums">
                            {formatScore(entry.totalScore)}
                          </div>
                          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8E8982]">Score</div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}
          </section>
        </div>

        <aside className="hidden w-96 flex-col border-l border-structural bg-[#FAF7F2]/80 pt-12 xl:flex">

          <div className="custom-scrollbar flex-1 overflow-y-auto px-8 pb-12">
            <div className="relative mb-12 overflow-hidden bg-[#1C1B1A] p-8 text-[#F4F0EB]">
              <div className="absolute right-0 top-0 p-4 opacity-10">
                <Landmark size={80} strokeWidth={1} />
              </div>
              <span className="mb-6 block font-mono text-[9px] uppercase tracking-widest opacity-70">Current Release</span>

              <div className="group relative mb-6 aspect-square overflow-hidden bg-white/5">
                <PrototypeSafeImage
                  src={null}
                  alt={`${content.spotify.latestRelease?.name || 'Current release'} artwork`}
                  kind="release"
                  title={content.spotify.latestRelease?.name || 'Artwork unavailable'}
                  description="Artwork sync is still pending, but the current release dossier remains active."
                  className="h-full w-full"
                />
                <div className="absolute inset-0 m-3 border border-white/10" />
              </div>

              <h4 className="editorial-title mb-2 text-3xl leading-tight">
                {isArtistLoading ? 'Syncing release dossier...' : content.spotify.latestRelease?.name || 'Echoes of Vellum'}
              </h4>
              <p className="mb-8 font-mono text-[9px] uppercase tracking-widest opacity-60">
                Collection: {content.spotify.latestRelease?.type || 'Sonic_Artifact'}
              </p>

              <Link
                to="/campaign"
                className="block w-full bg-[#F4F0EB] py-3 text-center font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#1C1B1A] transition-colors hover:bg-white"
              >
                Access Manuscript
              </Link>
            </div>

            <div className="mb-12">
              <h5 className="mb-6 border-b border-black/5 pb-2 text-[10px] font-bold uppercase tracking-widest opacity-30">
                Audience Metrics
              </h5>
              <div className="grid grid-cols-2 gap-px overflow-hidden border border-black/5 bg-black/5">
                {artistSnapshot.map((item) => (
                  <div key={item.label} className="bg-[#FAF7F2] p-4">
                    <span className="mb-1 block text-[10px] uppercase tracking-tighter opacity-40">{item.label}</span>
                    <span className="block text-xl font-bold tracking-tighter text-[#1C1B1A]">{item.value}</span>
                  </div>
                ))}
                <div className="bg-[#FAF7F2] p-4">
                  <span className="mb-1 block text-[10px] uppercase tracking-tighter opacity-40">Reliability</span>
                  <span className="block text-xl font-bold tracking-tighter text-[#C36B42]">99.1</span>
                </div>
              </div>
            </div>

            {recentPost ? (
              <div className="relative border-t border-black/5 pb-4 pt-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-8 w-8 overflow-hidden rounded-sm border border-black/10 grayscale">
                    <PrototypeSafeImage
                      src={recentPost.thumbnailUrl}
                      alt="Recent social post"
                      kind="social"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="font-mono text-[10px] font-bold tracking-tighter opacity-60">
                    @{content.instagram.username || 'archivist'}
                  </span>
                </div>
                <blockquote className="mb-6 text-xs italic leading-relaxed opacity-70">
                  &quot;{trimCopy(recentPost.caption || recentPost.description || 'The archive breathes through our interaction.', 180)}&quot;
                </blockquote>
                <div className="flex items-center justify-between font-mono text-[9px] opacity-40">
                  <span>
                    RECORDED: {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase()}
                  </span>
                  <Link to="/ranking-submission" className="transition-colors hover:text-[#C36B42]" aria-label="Open ranking submission history">
                    <History size={12} />
                  </Link>
                </div>
              </div>
            ) : null}
          </div>

          <footer className="border-t border-structural bg-[#FAF7F2] p-8">
            <Link
              to="/ranking-submission"
              className="group block border border-[#1C1B1A] bg-[#1C1B1A] p-6 text-[#F4F0EB] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-[#2A211E]"
            >
              <span className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[#D7C9BF]">
                <PenTool size={14} strokeWidth={1.75} />
                Ranking Submission Portal
              </span>
              <div className="flex items-end justify-between gap-6">
                <div>
                  <h5 className="editorial-title text-3xl leading-none">Authorize Entry</h5>
                  <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-[#D7C9BF]">
                    Submit or revise your list for the weekly song championship ledger.
                  </p>
                </div>
                <ArrowRight
                  size={22}
                  className="shrink-0 transition-transform duration-300 group-hover:translate-x-1.5"
                  strokeWidth={1.8}
                />
              </div>
            </Link>
          </footer>
        </aside>
      </main>
    </div>
  )
}
