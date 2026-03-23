import { useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import SharedNavbar from '../../components/Navigation/SharedNavbar'
import { useArtistContent } from '../../features/artistContent'
import {
  OUTER_GROUNDS_PATHS,
  type CastleRegionId,
} from '../../features/castleNavigation/sceneConfig'
import { useAuth } from '../../hooks/useAuth'
import { LandingPage, type OuterGroundRegion } from '../LandingPage'

type JourneyEntry = OuterGroundRegion & {
  contextLine: string
  isLocked: boolean
  statusLabel: string
}

const trimCopy = (value: string, maxLength = 88) =>
  value.length > maxLength ? `${value.slice(0, maxLength - 1).trimEnd()}…` : value

const formatCompactNumber = (value: number | null | undefined) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '--'
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: value >= 10000 ? 1 : 0,
  }).format(value)
}

const formatPrice = (value: number | null | undefined) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value / 100)
}

const formatEventDate = (timestamp: number | null | undefined) => {
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) return null
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(timestamp)
}

const campaignFallback: JourneyEntry = {
  id: 'campaign',
  ...OUTER_GROUNDS_PATHS.campaign,
  contextLine: 'The current release cycle is the anchor point for the estate right now.',
  isLocked: false,
  statusLabel: 'Live now',
}

export default function Journey() {
  const navigate = useNavigate()
  const { content } = useArtistContent()
  const { isSignedIn } = useAuth()
  const dashboardData = useQuery(api.dashboard.getDashboardData, {})
  const [visibleRegion, setVisibleRegion] = useState<OuterGroundRegion | null>(null)
  const [previewRegionId, setPreviewRegionId] = useState<CastleRegionId | null>(null)

  const latestRelease = content.spotify.latestRelease
  const topTrack = content.spotify.topTrack
  const recentPost = content.instagram.posts[0] ?? null
  const nextEvent = dashboardData?.upcomingEvents?.[0] ?? null
  const featuredProduct = dashboardData?.topMerch?.[0] ?? null
  const featuredAnnouncement = dashboardData?.recentAnnouncements?.[0] ?? null
  const fanProgression = dashboardData?.fanProgression ?? null

  const journeyEntries = useMemo<JourneyEntry[]>(() => {
    const baseRegions = (
      Object.entries(OUTER_GROUNDS_PATHS) as [CastleRegionId, typeof OUTER_GROUNDS_PATHS[CastleRegionId]][]
    )
      .map(([id, region]) => ({
        id,
        ...region,
      }))
      .sort((left, right) => left.journeyOrder - right.journeyOrder)

    return baseRegions.map((region) => {
      const isLocked = region.authRequired && !isSignedIn

      if (region.id === 'campaign') {
        const releaseMeta = [latestRelease?.type, latestRelease?.year].filter(Boolean).join(' • ')
        return {
          ...region,
          isLocked,
          statusLabel: 'Live now',
          contextLine:
            latestRelease?.name
              ? [latestRelease.name, releaseMeta].filter(Boolean).join(' • ')
              : recentPost?.caption
                ? trimCopy(recentPost.caption)
                : 'The current release cycle is the anchor point for the estate right now.',
        }
      }

      if (region.id === 'events') {
        return {
          ...region,
          isLocked,
          statusLabel: nextEvent ? 'Upcoming' : region.journeyStatusFallback,
          contextLine: nextEvent
            ? [nextEvent.title, formatEventDate(nextEvent.startAtUtc), nextEvent.city]
                .filter(Boolean)
                .join(' • ')
            : 'The next public appearance will surface here as soon as the schedule updates.',
        }
      }

      if (region.id === 'store') {
        const priceLabel = formatPrice(featuredProduct?.price)
        return {
          ...region,
          isLocked,
          statusLabel: region.journeyStatusFallback,
          contextLine: featuredProduct
            ? [featuredProduct.name, priceLabel].filter(Boolean).join(' • ')
            : latestRelease?.name
              ? `The merch hall is orbiting ${latestRelease.name}.`
              : 'The merch hall is open with the current capsule and archive pieces.',
        }
      }

      if (region.id === 'ranking') {
        return {
          ...region,
          isLocked,
          statusLabel: region.journeyStatusFallback,
          contextLine: fanProgression
            ? `${formatCompactNumber(fanProgression.points.totalPoints)} points • ${fanProgression.points.currentStreak}-day streak`
            : topTrack?.name
              ? `${topTrack.name} is driving the current ranking conversation.`
              : 'Leaderboard and submission activity stay visible here for the live cycle.',
        }
      }

      return {
        ...region,
        isLocked,
        statusLabel: isLocked ? 'Locked' : region.journeyStatusFallback,
        contextLine: isLocked
          ? 'Sign in to reach the dashboard, gallery, forum, and live rooms.'
          : featuredAnnouncement?.content
            ? trimCopy(featuredAnnouncement.content)
            : 'Dashboard, gallery, forum, and live rooms are available now.',
      }
    })
  }, [
    fanProgression,
    featuredAnnouncement?.content,
    featuredProduct?.name,
    featuredProduct?.price,
    isSignedIn,
    latestRelease?.name,
    latestRelease?.type,
    latestRelease?.year,
    nextEvent,
    recentPost?.caption,
    topTrack?.name,
  ])

  const entryById = useMemo(
    () => new Map(journeyEntries.map((entry) => [entry.id, entry])),
    [journeyEntries],
  )

  const activeRegion =
    (previewRegionId ? entryById.get(previewRegionId) : null) ??
    (visibleRegion ? entryById.get(visibleRegion.id) : null) ??
    entryById.get('campaign') ??
    campaignFallback

  const openDestinations = journeyEntries.filter((entry) => !entry.isLocked).length
  const destinationProgress = `${openDestinations}/${journeyEntries.length}`
  const destinationProgressWidth = `${(openDestinations / Math.max(1, journeyEntries.length)) * 100}%`

  const openRegion = (region: JourneyEntry) => {
    navigate(region.isLocked ? '/login' : region.route)
  }

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#3C2A21] font-sans">
      <div className="fixed top-0 left-0 right-0 z-50">
        <SharedNavbar />
      </div>

      <main className="pt-[72px] min-h-screen grid lg:h-screen lg:min-h-0 lg:grid-cols-[400px_minmax(0,1fr)]">
        <aside className="border-r border-[#3C2A21] bg-[#FCFBF9] flex flex-col lg:h-[calc(100vh-72px)] lg:min-h-0 lg:overflow-hidden">
          <div className="h-10 shrink-0 px-6 md:px-8 border-b border-[#3C2A21] flex items-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#3C2A21] hover:text-[#C36B42] transition-colors"
            >
              <ArrowLeft size={16} />
              Return
            </Link>
          </div>

          <div className="px-6 md:px-8 py-8 md:py-10 flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <div className="mb-10">
              <h1 className="font-serif text-5xl leading-none mb-4">The Journey</h1>
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#8E7D72]">
                Outergrounds / Live Chapters
              </p>
              <p className="mt-5 text-sm leading-6 text-[#3C2A21]/80">
                A live estate directory for the current campaign, public events, merch hall,
                fan standings, and member wing.
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-end justify-between gap-4 mb-4">
                <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#3C2A21]">
                  Open destinations
                </span>
                <span className="text-[12px] font-bold text-[#3C2A21]">{destinationProgress}</span>
              </div>
              <div className="h-px w-full bg-[#3C2A21]/20 relative">
                <div
                  className="absolute inset-y-0 left-0 bg-[#C36B42]"
                  style={{ width: destinationProgressWidth }}
                />
              </div>
            </div>

            <div className="flex flex-col">
              {journeyEntries.map((entry) => {
                const isActive = activeRegion.id === entry.id
                const indicatorTone = entry.isLocked
                  ? 'text-[#8E7D72] border-[#3C2A21]/20 bg-transparent'
                  : isActive
                    ? 'text-[#C36B42] border-[#C36B42] bg-[#C36B42]/10'
                    : 'text-[#3C2A21] border-[#3C2A21]/30 bg-transparent'
                const badgeTone = entry.isLocked
                  ? 'text-[#8E7D72]'
                  : isActive
                    ? 'text-[#C36B42]'
                    : 'text-[#3C2A21]'

                return (
                  <button
                    key={entry.id}
                    type="button"
                    className={`group w-full px-3 md:px-4 py-6 text-left border-b border-[#3C2A21]/25 transition-colors ${
                      isActive ? 'bg-[#F4EFE6]' : 'bg-transparent hover:bg-[#FAF7F2]'
                    } ${entry.isLocked ? 'opacity-80' : ''}`}
                    onMouseEnter={() => setPreviewRegionId(entry.id)}
                    onMouseLeave={() => setPreviewRegionId(null)}
                    onFocus={() => setPreviewRegionId(entry.id)}
                    onBlur={() => setPreviewRegionId(null)}
                    onClick={() => openRegion(entry)}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-1 h-7 w-7 shrink-0 flex items-center justify-center border ${indicatorTone}`}
                      >
                        {entry.isLocked ? (
                          <Lock size={13} />
                        ) : (
                          <span
                            className={`block rounded-full ${
                              isActive ? 'h-2.5 w-2.5 bg-[#C36B42]' : 'h-2 w-2 bg-[#3C2A21]'
                            }`}
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h2 className="font-serif text-[2rem] leading-none">{entry.journeyLabel}</h2>
                            <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[#8E7D72]">
                              {entry.subtitle}
                            </p>
                          </div>
                          <span
                            className={`pt-1 text-[10px] font-bold uppercase tracking-[0.18em] whitespace-nowrap ${badgeTone}`}
                          >
                            {entry.statusLabel}
                          </span>
                        </div>

                        <p className="text-sm leading-6 text-[#3C2A21]/80">{entry.journeyPurpose}</p>

                        <div className="mt-4 flex items-start gap-2">
                          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#8E7D72] pt-[2px]">
                            Live detail:
                          </span>
                          <span className="text-sm leading-6 text-[#3C2A21]">
                            {entry.contextLine}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-6 border-t border-[#3C2A21] bg-[#FCFBF9] mt-auto shrink-0">
            <button
              type="button"
              onClick={() => openRegion(activeRegion)}
              className="w-full inline-flex items-center justify-center gap-3 border border-[#3C2A21] bg-[#1F1C19] text-[#F4EFE6] px-6 py-4 text-[12px] font-bold uppercase tracking-[0.22em] hover:bg-[#C36B42] hover:border-[#C36B42] transition-colors"
            >
              {activeRegion.isLocked ? <Lock size={15} /> : <ArrowRight size={15} />}
              Open {activeRegion.journeyLabel}
            </button>
          </div>
        </aside>

        <section className="bg-[#05070b] min-h-[70vh] lg:h-[calc(100vh-72px)] lg:min-h-0 overflow-hidden">
          <LandingPage fromScene="/journey" onVisibleRegionChange={setVisibleRegion} />
        </section>
      </main>
    </div>
  )
}
