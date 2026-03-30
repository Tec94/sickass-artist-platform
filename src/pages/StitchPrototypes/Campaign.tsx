import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Flame, Instagram, Music4 } from 'lucide-react'
import PrototypeSafeImage from '../../components/Media/PrototypeSafeImage'
import SharedNavbar from '../../components/Navigation/SharedNavbar'
import { useArtistContent } from '../../features/artistContent'

const formatCompact = (value: number | null | undefined) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '--'
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

const trimCopy = (value: string, maxLength = 148) =>
  value.length > maxLength ? `${value.slice(0, maxLength - 1).trimEnd()}…` : value

export default function Campaign() {
  const { content, isLoading } = useArtistContent()
  const latestRelease = content.spotify.latestRelease
  const recentPosts = content.instagram.posts.slice(0, 3)
  const topTrack = content.spotify.topTrack

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F4EFE6] font-sans text-[#3C2A21]">
      <SharedNavbar />

      <main className="h-[calc(100dvh-72px)] overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-8 md:px-8 md:pb-20 md:pt-10">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <section className="border border-[#3C2A21] bg-[#FAF7F2] p-7 md:p-10">
              <Link
                to="/journey"
                className="mb-8 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors hover:text-[#C36B42]"
              >
                <ArrowLeft size={14} />
                Back to journey
              </Link>

              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8E7D72]">
                Current release campaign
              </p>
              <h1 className="mb-5 font-serif text-5xl leading-none md:text-7xl">
                {latestRelease?.name || 'Campaign signal pending'}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-[#3C2A21]/80">
                This route is the live destination for Journey&apos;s scenic release axis. It should
                feel like the campaign front door: current story beat first, compact signal metrics
                second, and deeper media/modules below the fold without clipping.
              </p>

              <div className="mt-8 grid gap-4 lg:grid-cols-[160px_160px_minmax(0,1fr)]">
                <div className="border border-[#3C2A21]/12 bg-[#F4EFE6] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#8E7D72]">Listeners</p>
                  <p className="mt-3 font-serif text-[2.15rem] leading-none">
                    {formatCompact(content.spotify.monthlyListeners)}
                  </p>
                </div>
                <div className="border border-[#3C2A21]/12 bg-[#F4EFE6] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#8E7D72]">Followers</p>
                  <p className="mt-3 font-serif text-[2.15rem] leading-none">
                    {content.instagram.followersLabel || '--'}
                  </p>
                </div>
                <div className="border border-[#3C2A21]/12 bg-[#F4EFE6] px-5 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#8E7D72]">Top track</p>
                  <p className="mt-3 font-serif text-[1.8rem] leading-[1.02]">
                    {topTrack?.name || 'Pending'}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                {latestRelease?.url ? (
                  <a
                    href={latestRelease.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 border border-[#3C2A21] bg-[#3C2A21] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#F4EFE6] transition-colors hover:border-[#C36B42] hover:bg-[#C36B42] sm:w-auto"
                  >
                    <Music4 size={14} />
                    Open on Spotify
                  </a>
                ) : null}
                <Link
                  to="/rankings"
                  className="inline-flex w-full items-center justify-center gap-2 border border-[#3C2A21] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-[#3C2A21] hover:text-[#F4EFE6] sm:w-auto"
                >
                  <Flame size={14} />
                  Fan rankings
                </Link>
                <Link
                  to="/store"
                  className="inline-flex w-full items-center justify-center gap-2 border border-[#3C2A21] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-[#3C2A21] hover:text-[#F4EFE6] sm:w-auto"
                >
                  <ArrowUpRight size={14} />
                  Merch wing
                </Link>
              </div>
            </section>

            <aside className="space-y-5 border border-[#3C2A21] bg-[#FCFBF9] p-6 md:p-7">
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                  Campaign state
                </p>
                <h2 className="font-serif text-4xl leading-none">
                  {content.freshness.ageDays === null ? 'Unsynced' : `${content.freshness.ageDays}d old`}
                </h2>
                <p className="mt-4 text-sm leading-6 text-[#3C2A21]/75">
                  {content.freshness.isStale
                    ? 'The payload is stale enough that the page should still render, but the campaign feed needs a visible refresh signal.'
                    : 'The shared artist payload is current enough to drive the live campaign surface.'}
                </p>
              </div>

              <div className="border border-[#3C2A21]/12 bg-[#F4EFE6] p-4">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                  Latest post
                </p>
                <p className="text-sm leading-6 text-[#3C2A21]/80">
                  {recentPosts[0]?.caption
                    ? trimCopy(recentPosts[0].caption, 120)
                    : isLoading
                      ? 'Loading the social signal.'
                      : 'No recent Instagram caption is available yet.'}
                </p>
              </div>

              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                  Related artists
                </p>
                <div className="flex flex-wrap gap-2">
                  {content.spotify.relatedArtists.slice(0, 8).map((artist) => (
                    <a
                      key={artist.id}
                      href={artist.url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="border border-[#3C2A21]/12 px-3 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors hover:border-[#C36B42] hover:text-[#C36B42]"
                    >
                      {artist.name}
                    </a>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <section className="border border-[#3C2A21] bg-[#FAF7F2] p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                    Release embed
                  </p>
                  <h3 className="mt-2 font-serif text-3xl leading-none">
                    {latestRelease?.type || 'Campaign board'}
                  </h3>
                </div>
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#8E7D72]">
                  {latestRelease?.year || 'Current era'}
                </span>
              </div>

              {latestRelease?.embedUrl ? (
                <div className="overflow-hidden border border-[#3C2A21]/12 bg-[#F4EFE6] p-3">
                  <iframe
                    title={`${latestRelease.name} Spotify embed`}
                    src={latestRelease.embedUrl}
                    className="h-[320px] w-full border-0 sm:h-[380px]"
                    loading="lazy"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  />
                </div>
              ) : (
                <div className="flex min-h-[320px] items-end border border-dashed border-[#3C2A21]/20 bg-[#F4EFE6] p-6 sm:min-h-[380px]">
                  <div className="max-w-md">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                      Embed fallback
                    </p>
                    <p className="mt-3 font-serif text-3xl leading-none">
                      {latestRelease?.name || 'Campaign board'}
                    </p>
                    <p className="mt-4 text-sm leading-6 text-[#3C2A21]/75">
                      The release module stays visible even when Spotify embed content is missing or
                      blocked. Text context should never collapse with the iframe.
                    </p>
                  </div>
                </div>
              )}
            </section>

            <section className="border border-[#3C2A21] bg-[#FCFBF9] p-6 md:p-7">
              <div className="mb-6 flex items-center gap-2">
                <Instagram size={16} />
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                  Recent social proof
                </p>
              </div>

              <div className="space-y-4">
                {recentPosts.length > 0 ? (
                  recentPosts.map((post) => (
                    <article key={post.id} className="overflow-hidden border border-[#3C2A21]/12 bg-[#F4EFE6]">
                      <PrototypeSafeImage
                        src={post.thumbnailUrl}
                        alt={post.description || `${content.artistName} post`}
                        kind="social"
                        className="h-44 w-full object-cover"
                        description="The campaign module keeps its rhythm even when the original image host is unavailable."
                      />
                      <div className="p-4">
                        <p className="text-sm leading-6 text-[#3C2A21]/80">
                          {trimCopy(post.caption || post.description || 'No caption available.')}
                        </p>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="border border-dashed border-[#3C2A21]/12 bg-[#F4EFE6] px-4 py-6 text-sm leading-6 text-[#3C2A21]/70">
                    No recent social proof has been synced into the current payload yet.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
