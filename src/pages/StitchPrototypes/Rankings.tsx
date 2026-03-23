import { useMemo } from 'react'
import { useQuery } from 'convex/react'
import { Link } from 'react-router-dom'
import { ArrowRight, Circle, Flame, RadioTower } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import PrototypeSafeImage from '../../components/Media/PrototypeSafeImage'
import SharedNavbar from '../../components/Navigation/SharedNavbar'
import { useArtistContent } from '../../features/artistContent'

const formatCompact = (value: number | null | undefined) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '--'
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

const formatPoints = (value: number | null | undefined) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '--'
  return new Intl.NumberFormat('en-US').format(value)
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
  value.length > maxLength ? `${value.slice(0, maxLength - 1).trimEnd()}…` : value

export default function Rankings() {
  const { content, isLoading: isArtistLoading } = useArtistContent()
  const leaderboard = useQuery(api.points.getFanLeaderboard, { limit: 12 })

  const entries = leaderboard?.entries ?? []
  const podium = entries.slice(0, 3)
  const remainder = entries.slice(3)
  const currentUserEntry = leaderboard?.currentUserEntry ?? null
  const recentPost = content.instagram.posts[0] ?? null

  const artistSnapshot = useMemo(
    () => [
      {
        label: 'Monthly listeners',
        value: formatCompact(content.spotify.monthlyListeners),
      },
      {
        label: 'Followers',
        value: content.instagram.followersLabel || '--',
      },
      {
        label: 'Top track',
        value: content.spotify.topTrack?.name || 'Waiting for sync',
      },
      {
        label: 'Latest drop',
        value: content.spotify.latestRelease?.name || 'Pending',
      },
    ],
    [content],
  )

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F4EFE6] font-sans text-[#3C2A21]">
      <SharedNavbar />

      <main className="h-[calc(100dvh-72px)] overflow-y-auto overscroll-contain">
        <div className="grid min-h-0 xl:grid-cols-[minmax(0,1.12fr)_360px]">
          <section className="bg-[#F4EFE6]">
            <div className="border-b border-[#3C2A21] bg-[#FAF7F2] px-6 py-10 md:px-10 md:py-12">
              <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl">
                  <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8E7D72]">
                    Fan standings
                  </p>
                  <h1 className="mb-4 font-serif text-5xl leading-none md:text-7xl">Pack Rankings</h1>
                  <p className="text-base leading-7 text-[#3C2A21]/80 md:text-lg">
                    Fan rank stays driven by community reward points. The ROA pulse rail tracks the
                    current release cycle separately, so artist momentum never reads like leaderboard
                    score.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:max-w-[440px]">
                  {artistSnapshot.map((item) => (
                    <div key={item.label} className="border border-[#3C2A21]/12 bg-[#F4EFE6] px-4 py-4">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                        {item.label}
                      </p>
                      <p className="font-serif text-[1.75rem] leading-none">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-8 md:px-10 md:py-10">
              <div className="mb-10 grid gap-5 lg:grid-cols-3">
                {podium.map((entry) => (
                  <article
                    key={entry.userId}
                    className={`border bg-[#FAF7F2] p-5 md:p-6 ${
                      entry.rank === 1 ? 'border-[#3C2A21] shadow-sm' : 'border-[#3C2A21]/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                          Rank {String(entry.rank).padStart(2, '0')}
                        </p>
                        <h2 className="mt-3 font-serif text-[2.6rem] leading-[0.94]">
                          {entry.displayName}
                        </h2>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] uppercase tracking-[0.18em] text-[#C36B42]">
                          {tierLabel(entry.fanTier)}
                        </span>
                        {entry.role !== 'fan' ? (
                          <span className="border border-[#3C2A21]/15 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#3C2A21]">
                            Staff
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-4">
                      {entry.avatar ? (
                        <img
                          src={entry.avatar}
                          alt={entry.displayName}
                          className="h-16 w-16 border border-[#3C2A21] object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center border border-[#3C2A21] bg-[#F4EFE6] font-serif text-xl">
                          {initialsFromName(entry.displayName)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                          Points
                        </p>
                        <p className="mt-2 font-serif text-[2.35rem] leading-none">
                          {formatPoints(entry.totalPoints)}
                        </p>
                        <p className="mt-2 truncate text-[11px] uppercase tracking-[0.16em] text-[#8E7D72]">
                          {entry.username ? `@${entry.username}` : 'Pack member'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#3C2A21]/10 pt-4">
                      <div className="border border-[#3C2A21]/10 bg-[#F4EFE6] px-3 py-3">
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                          Available
                        </p>
                        <p className="mt-2 font-semibold text-[#3C2A21]">
                          {formatPoints(entry.availablePoints)}
                        </p>
                      </div>
                      <div className="border border-[#3C2A21]/10 bg-[#F4EFE6] px-3 py-3">
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                          Streak
                        </p>
                        <p className="mt-2 font-semibold text-[#3C2A21]">
                          {entry.currentStreak} day{entry.currentStreak === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="border border-[#3C2A21] bg-[#FCFBF9]">
                <div className="grid grid-cols-[72px_minmax(0,1fr)_140px_120px] gap-4 border-b border-[#3C2A21] px-6 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                  <div>Rank</div>
                  <div>Member</div>
                  <div className="text-right">Points</div>
                  <div className="text-right">Status</div>
                </div>

                {remainder.length > 0 ? (
                  remainder.map((entry) => (
                    <div
                      key={entry.userId}
                      className={`grid grid-cols-[72px_minmax(0,1fr)_140px_120px] items-center gap-4 border-b border-[#3C2A21]/10 px-6 py-4 ${
                        entry.isCurrentUser ? 'bg-[#C36B42]/8' : 'bg-transparent'
                      }`}
                    >
                      <div className="text-sm font-semibold text-[#8E7D72]">
                        {String(entry.rank).padStart(2, '0')}
                      </div>
                      <div className="flex min-w-0 items-center gap-3">
                        {entry.avatar ? (
                          <img
                            src={entry.avatar}
                            alt={entry.displayName}
                            className="h-10 w-10 rounded-full border border-[#3C2A21]/15 object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#3C2A21]/15 bg-[#F4EFE6] text-xs font-bold">
                            {initialsFromName(entry.displayName)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{entry.displayName}</p>
                          <p className="truncate text-[11px] uppercase tracking-[0.14em] text-[#8E7D72]">
                            {entry.username ? `@${entry.username}` : tierLabel(entry.fanTier)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right font-mono">{formatPoints(entry.totalPoints)}</div>
                      <div className="text-right">
                        <span className="inline-flex items-center justify-end gap-1 text-[10px] uppercase tracking-[0.16em] text-[#8E7D72]">
                          <Circle size={12} />
                          {entry.role !== 'fan' ? 'Staff' : entry.statusLabel}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-12 text-center text-sm text-[#3C2A21]/70">
                    {leaderboard === undefined
                      ? 'Loading fan standings.'
                      : 'No fan ranking data is available yet.'}
                  </div>
                )}
              </div>

              {currentUserEntry && !entries.some((entry) => entry.userId === currentUserEntry.userId) ? (
                <div className="mt-6 flex items-center justify-between gap-4 border border-[#C36B42] bg-[#FAF7F2] px-6 py-5">
                  <div>
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                      Your position
                    </p>
                    <p className="font-serif text-3xl leading-none">{currentUserEntry.displayName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#8E7D72]">
                      Rank {String(currentUserEntry.rank).padStart(2, '0')}
                    </p>
                    <p className="font-mono text-lg">{formatPoints(currentUserEntry.totalPoints)} pts</p>
                  </div>
                </div>
              ) : null}

              <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-[#3C2A21]/70">
                  Artist pulse stays sourced from the shared artist payload while fan rank remains
                  tied to reward points.
                </p>
                <Link
                  to="/ranking-submission"
                  className="inline-flex items-center gap-3 border border-[#3C2A21] bg-[#3C2A21] px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#F4EFE6] transition-colors hover:border-[#C36B42] hover:bg-[#C36B42]"
                >
                  Submit Your Rankings
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>

          <aside className="border-t border-[#3C2A21] bg-[#FAF7F2] p-8 md:p-9 xl:border-l xl:border-t-0">
            <div className="border-b border-[#3C2A21]/12 pb-6">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8E7D72]">
                Current release
              </p>
              <h2 className="font-serif text-4xl leading-none">
                {content.spotify.latestRelease?.name || 'Artist sync pending'}
              </h2>
              <p className="mt-4 text-sm leading-6 text-[#3C2A21]/80">
                Context only. This rail tracks the live release cycle while the main board stays
                focused on fan standings.
              </p>
            </div>

            <div className="mt-6 border border-[#3C2A21] bg-[#F4EFE6] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#8E7D72]">Freshness</p>
                  <p className="mt-2 font-serif text-2xl">
                    {content.freshness?.ageDays === null || content.freshness?.ageDays === undefined
                      ? 'Unsynced'
                      : `${content.freshness.ageDays}d old`}
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#8E7D72]">
                  <RadioTower size={14} />
                  {content.freshness?.isStale ? 'Needs refresh' : 'Current'}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-[#3C2A21]/80">
                {recentPost?.caption
                  ? trimCopy(recentPost.caption)
                  : isArtistLoading
                    ? 'Loading the artist signal feed.'
                    : 'No recent Instagram copy has been synced yet.'}
              </p>
              <Link
                to="/campaign"
                className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors hover:text-[#C36B42]"
              >
                <Flame size={14} />
                Open campaign
              </Link>
            </div>

            <div className="mt-6 border border-[#3C2A21]/12 bg-[#FCFBF9] p-5">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                Top tracks
              </p>
              <div className="space-y-4">
                {content.spotify.popularTracks.slice(0, 4).map((track, index) => (
                  <div
                    key={track.id}
                    className="flex items-baseline justify-between gap-4 border-b border-[#3C2A21]/8 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                        #{index + 1}
                      </p>
                      <p className="mt-1 truncate font-semibold">{track.name}</p>
                    </div>
                    <p className="whitespace-nowrap text-xs text-[#8E7D72]">
                      {formatCompact(track.streams)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 border border-[#3C2A21]/12 bg-[#FCFBF9] p-5">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                Recent post
              </p>

              {recentPost ? (
                <a
                  href={recentPost.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="block transition-colors hover:text-[#C36B42]"
                >
                  <div className="overflow-hidden border border-[#3C2A21]/12 bg-[#F4EFE6]">
                    <PrototypeSafeImage
                      src={recentPost.thumbnailUrl}
                      alt={recentPost.description || `${content.artistName} post`}
                      kind="social"
                      className="h-44 w-full object-cover"
                      description="The synced caption stays visible even if the original image host expires."
                    />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[#3C2A21]/80">
                    {trimCopy(
                      recentPost.caption ||
                        recentPost.description ||
                        'No social caption is available for the current post.',
                    )}
                  </p>
                </a>
              ) : (
                <div className="border border-dashed border-[#3C2A21]/12 bg-[#F4EFE6] px-4 py-6 text-sm leading-6 text-[#3C2A21]/70">
                  No recent social proof has been synced into the current payload yet.
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
