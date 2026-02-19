import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAnalytics } from '../hooks/useAnalytics'
import { useUser } from '../contexts/UserContext'
import { LiveLeaderboard } from '../components/Leaderboard/LiveLeaderboard'
import { SongRankingWidget } from '../components/Leaderboard/SongRankingWidget'
import { UserRankingsFeed } from '../components/Leaderboard/UserRankingsFeed'
import { RankingPeriodTabs } from '../components/Leaderboard/RankingPeriodTabs'
import { useTranslation } from '../hooks/useTranslation'
import type { LeaderboardPeriod } from '../utils/leaderboard'
import { LogoSlider } from '../components/ui/LogoSlider'
import { CinematicHero, type CinematicHeroVariant } from '../components/Dashboard/CinematicHero'
import {
  dashboardHeroAssets,
  dashboardSignalPlaceholders,
  type DashboardPromoType,
} from '../components/Dashboard/HeroAssetManifest'
import { withDashboardExperienceDefaults } from '../constants/dashboardFlags'
import { sanitizeDisplayText } from '../utils/contentHygiene'
import { trackContentFallback } from '../utils/analytics'

type PromoTone = 'crimson' | 'amber' | 'steel'
type PromoType = DashboardPromoType
type FallbackMetricKey = 'forum_title' | 'announcement_title' | 'announcement_author' | 'hero_signal'

type PromoItemBase = {
  key: string
  type: PromoType
  eyebrow: string
  title: string
  meta: string
  cta: string
  tone: PromoTone
  tag?: string
  image?: string | null
}

type PromoLinkItem = PromoItemBase & {
  href: string
  onClick?: never
}

type PromoActionItem = PromoItemBase & {
  onClick: () => void
  href?: never
}

type PromoItem = PromoLinkItem | PromoActionItem

type PromoRailItem = PromoItem & {
  railKey: string
}

export const Dashboard = () => {
  useAnalytics()

  const { t } = useTranslation()
  const { isSignedIn } = useUser()
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly')
  const [promoCopiedAt, setPromoCopiedAt] = useState<number | null>(null)
  const contentFallbackReportRef = useRef<string | null>(null)

  const dashboardData = useQuery(api.dashboard.getDashboardData)
  const dashboardExperienceFlags = withDashboardExperienceDefaults(useQuery(api.dashboard.getDashboardExperienceFlags, {}))
  const contentHygieneEnabled = dashboardExperienceFlags.contentHygieneV1

  const fallbackCounts: Record<FallbackMetricKey, number> = {
    forum_title: 0,
    announcement_title: 0,
    announcement_author: 0,
    hero_signal: 0,
  }

  const sanitizeLabel = (value: string | null | undefined, fallback: string, metricKey: FallbackMetricKey): string => {
    if (!contentHygieneEnabled) {
      return value?.trim() ? value.trim() : fallback
    }

    const sanitized = sanitizeDisplayText(value, fallback)
    if (sanitized.usedFallback) {
      fallbackCounts[metricKey] += 1
    }
    return sanitized.value
  }

  const nextEvent = dashboardData?.upcomingEvents?.[0]
  const topProduct = dashboardData?.topMerch?.[0]
  const forumPosts = dashboardData?.trendingForum || []
  const featuredAnnouncement = dashboardData?.recentAnnouncements?.[0]

  const heroSignalFallback = t('dashboard.hero.signalStatusFallback')
  const heroSignalSource = featuredAnnouncement?.content ?? ''
  const heroSignalText = sanitizeLabel(heroSignalSource, heroSignalFallback, 'hero_signal').slice(0, 120)

  const merchPromoItems = (dashboardData?.topMerch || []).slice(1, 4).map(
    (product): PromoLinkItem => ({
      key: `merch-${product._id}`,
      type: 'store',
      eyebrow: 'Merch Drop',
      title: product.name,
      meta: `$${(product.price / 100).toFixed(2)} · ${product.category}`,
      cta: 'Shop now',
      href: `/store/product/${product._id}`,
      tone: 'crimson',
      image: product.image,
      tag: 'Limited',
    }),
  )

  const eventPromoItems = (dashboardData?.upcomingEvents || []).slice(0, 3).map(
    (event): PromoLinkItem => ({
      key: `event-${event._id}`,
      type: 'event',
      eyebrow: 'Stage Call',
      title: event.title,
      meta: `${new Date(event.startAtUtc).toLocaleDateString()} · ${event.city}`,
      cta: 'View tickets',
      href: `/events/${event._id}`,
      tone: 'amber',
      image: event.imageUrl,
      tag: 'Upcoming',
    }),
  )

  const announcementPromoItems = (dashboardData?.recentAnnouncements || []).slice(0, 2).map(
    (note): PromoLinkItem => {
      const cleanTitle = sanitizeLabel(note.content, t('dashboard.fallbackAnnouncementTitle'), 'announcement_title')
      const cleanAuthor = sanitizeLabel(note.authorDisplayName, t('dashboard.fallbackAnnouncementAuthor'), 'announcement_author')
      const compactTitle = cleanTitle.length > 56 ? `${cleanTitle.slice(0, 56)}...` : cleanTitle

      return {
        key: `announce-${note._id}`,
        type: 'announcement',
        eyebrow: 'Wolfpack Wire',
        title: compactTitle,
        meta: `By ${cleanAuthor}`,
        cta: 'Open chat',
        href: '/chat',
        tone: 'steel',
        tag: 'Community',
      }
    },
  )

  const promoCodeItem: PromoActionItem = {
    key: 'promo-code',
    type: 'promo',
    eyebrow: 'Pack Perk',
    title: 'WOLVES10',
    meta: '10% off merch for 24h',
    cta: promoCopiedAt ? 'Copied!' : 'Copy code',
    onClick: () => {
      if (navigator?.clipboard) {
        navigator.clipboard.writeText('WOLVES10').catch(() => null)
      }
      setPromoCopiedAt(Date.now())
    },
    tone: 'crimson',
    tag: 'Today only',
  }

  const forumCardItems = forumPosts.slice(0, 3).map((post) => ({
    ...post,
    displayTitle: sanitizeLabel(post.title, t('dashboard.fallbackThreadTitle'), 'forum_title'),
  }))

  const promoItems: PromoItem[] = [
    ...merchPromoItems,
    ...eventPromoItems,
    ...announcementPromoItems,
    promoCodeItem,
  ]

  const promoRailItems: PromoRailItem[] = Array.from({ length: Math.max(promoItems.length, 8) }, (_, index) => {
    const item = promoItems[index % promoItems.length]
    return { ...item, railKey: `${item.key}-${index}` }
  })

  const fallbackTotal = Object.values(fallbackCounts).reduce((sum, count) => sum + count, 0)
  const fallbackSignature = JSON.stringify(fallbackCounts)

  useEffect(() => {
    if (!promoCopiedAt) return
    const timer = setTimeout(() => setPromoCopiedAt(null), 2000)
    return () => clearTimeout(timer)
  }, [promoCopiedAt])

  useEffect(() => {
    if (!contentHygieneEnabled || fallbackTotal === 0) return
    if (contentFallbackReportRef.current === fallbackSignature) return
    contentFallbackReportRef.current = fallbackSignature
    const parsed = JSON.parse(fallbackSignature) as Record<string, number>
    trackContentFallback('dashboard', parsed)
  }, [contentHygieneEnabled, fallbackSignature, fallbackTotal])

  const heroVariant: CinematicHeroVariant = dashboardExperienceFlags.hardeningV1 ? 'hardened' : 'baseline'
  const heroCopy = {
    reducedEyebrow: t('dashboard.hero.reducedEyebrow'),
    reducedTitle: t('dashboard.hero.reducedTitle'),
    reducedBody: t('dashboard.hero.reducedBody'),
    signalStatusFallback: t('dashboard.hero.signalStatusFallback'),
    beat1Title: t('dashboard.hero.beat1Title'),
    beat1Body: t('dashboard.hero.beat1Body'),
    beat2Label: t('dashboard.hero.beat2Label'),
    beat2Title: t('dashboard.hero.beat2Title'),
    beat2Body: t('dashboard.hero.beat2Body'),
    beat3Label: t('dashboard.hero.beat3Label'),
    beat3Title: t('dashboard.hero.beat3Title'),
    beat3Body: t('dashboard.hero.beat3Body'),
    beat4Title: t('dashboard.hero.beat4Title'),
    beat4Body: t('dashboard.hero.beat4Body'),
    handoffCue: t('dashboard.hero.handoffCue'),
    ctaSignedIn: t('dashboard.hero.ctaSignedIn'),
    ctaSignedOut: t('dashboard.hero.ctaSignedOut'),
  }

  return (
    <div className="animate-fade-in pb-20">
      <CinematicHero
        assets={dashboardHeroAssets}
        signalText={heroSignalText}
        isSignedIn={isSignedIn}
        variant={heroVariant}
        copy={heroCopy}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="dashboard-card rounded-2xl bg-[#111A24]/75 border border-[#2A3541] p-6 flex flex-col backdrop-blur-sm" data-card-tone="amber">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-semibold text-[#E8E1D5] uppercase flex items-center gap-2 whitespace-nowrap shrink min-w-0">
                <iconify-icon icon="solar:ticket-bold-duotone" width="22" height="22" class="text-amber-300/80 shrink-0"></iconify-icon>
                <span className="truncate">{t('dashboard.nextEvent')}</span>
              </h3>
              <Link to="/events" className="text-xs text-[#9AA7B5] hover:text-[#E8E1D5] uppercase tracking-wider">
                {t('common.viewAll')}
              </Link>
            </div>

            {nextEvent ? (
              <>
                <div className="dashboard-card__media relative aspect-video bg-[#0A1118] mb-4 overflow-hidden rounded-xl">
                  {nextEvent.imageUrl ? (
                    <img src={nextEvent.imageUrl} alt="Event" className="w-full h-full object-cover" />
                  ) : (
                    <img src={dashboardSignalPlaceholders.event} alt="Event placeholder" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-2 right-2 rounded-md bg-amber-200/90 text-[#081018] text-[10px] font-semibold px-2 py-1 uppercase tracking-[0.12em]">
                    {t('dashboard.upcoming')}
                  </div>
                </div>
                <h4 className="text-[#E8E1D5] font-semibold text-lg mb-1">{nextEvent.title}</h4>
                <p className="text-[#9AA7B5] text-sm mb-4">
                  {new Date(nextEvent.startAtUtc).toLocaleDateString()} • {nextEvent.city}
                </p>
                <Link
                  to={`/events/${nextEvent._id}`}
                  className="dashboard-card__cta mt-auto w-full rounded-full border border-[#405263] text-[#E8E1D5] py-2 text-center text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#E8E1D5] hover:text-[#091018] transition-colors"
                >
                  {t('dashboard.details')}
                </Link>
              </>
            ) : (
              <div className="text-[#8091A1] text-sm py-10 text-center">{t('dashboard.noUpcomingEvents')}</div>
            )}
          </div>

          <div className="dashboard-card rounded-2xl bg-[#111A24]/75 border border-[#2A3541] p-6 flex flex-col backdrop-blur-sm" data-card-tone="crimson">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-semibold text-[#E8E1D5] uppercase flex items-center gap-2 whitespace-nowrap shrink min-w-0">
                <iconify-icon icon="solar:fire-bold-duotone" width="22" height="22" class="text-[#A95B69] shrink-0"></iconify-icon>
                <span className="truncate">{t('dashboard.hotDrop')}</span>
              </h3>
              <Link to="/store" className="text-xs text-[#9AA7B5] hover:text-[#E8E1D5] uppercase tracking-wider">
                {t('dashboard.shopAll')}
              </Link>
            </div>

            {topProduct ? (
              <div className="flex gap-4 items-center">
                <div className="dashboard-card__media w-24 h-32 bg-[#0A1118] shrink-0 overflow-hidden rounded-xl">
                  {topProduct.image ? (
                    <img src={topProduct.image} alt="Product" className="w-full h-full object-cover" />
                  ) : (
                    <img src={dashboardSignalPlaceholders.store} alt="Merch placeholder" className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <h4 className="text-[#E8E1D5] font-semibold mb-1">{topProduct.name}</h4>
                  <p className="text-[#B86A78] font-semibold mb-2">${(topProduct.price / 100).toFixed(2)}</p>
                  <div className="text-xs text-[#9AA7B5] mb-3">{t('dashboard.limitedStock')}</div>
                  <Link
                    to={`/store/product/${topProduct._id}`}
                    className="dashboard-card__cta text-xs font-semibold uppercase tracking-[0.16em] text-[#E8E1D5] border-b border-[#A62B3A]/70 pb-1 hover:text-[#d18b96] transition-colors"
                  >
                    {t('dashboard.buyNow')}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-[#8091A1] text-sm py-10 text-center">{t('dashboard.noTrendingMerch')}</div>
            )}
          </div>

          <div className="dashboard-card rounded-2xl bg-[#111A24]/75 border border-[#2A3541] p-6 flex flex-col backdrop-blur-sm" data-card-tone="steel">
            <div className="flex items-center justify-between mb-4 gap-4">
              <h3 className="text-lg font-display font-semibold text-[#E8E1D5] uppercase flex items-center gap-2 whitespace-nowrap shrink min-w-0">
                <iconify-icon icon="solar:chat-line-bold-duotone" width="22" height="22" class="text-[#8EA0B3] shrink-0"></iconify-icon>
                <span className="truncate">{t('dashboard.wolfpackChatter')}</span>
              </h3>
              <Link
                to="/forum"
                className="text-xs text-[#9AA7B5] hover:text-[#E8E1D5] uppercase tracking-wider whitespace-nowrap shrink-0"
              >
                {t('dashboard.joinDiscussion')}
              </Link>
            </div>
            <div className="space-y-4">
              {forumCardItems.map((post) => (
                <Link key={post._id} to={`/forum/thread/${post._id}`} className="block group">
                  <div className="text-sm font-semibold text-[#D5DDE6] group-hover:text-[#AFC0D1] transition-colors line-clamp-1">
                    {post.displayTitle}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#8EA0B3] mt-1">
                    <span>
                      {post.replyCount || 0} {t('dashboard.replies')}
                    </span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
              {forumCardItems.length === 0 && <div className="text-[#8091A1] text-sm text-center">{t('dashboard.noActiveDiscussions')}</div>}
            </div>
            <Link to="/forum" className="dashboard-card__cta mt-auto flex items-center gap-2 text-sm text-[#9AA7B5] hover:text-[#E8E1D5] pt-4">
              {t('dashboard.viewAllThreads')}
              <iconify-icon icon="solar:alt-arrow-right-linear" width="14" height="14" class="ml-1"></iconify-icon>
            </Link>
          </div>
        </div>

        <div className="mt-16">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#9AA7B5] font-semibold whitespace-nowrap">
              {t('dashboard.liveSignalScreensTitle')}
            </p>
            <div className="h-px bg-[#2A3541] flex-1 min-w-[120px]"></div>
            <span className="text-[11px] text-[#8EA0B3]">{t('dashboard.liveSignalScreensSubtitle')}</span>
          </div>
          <div className="bg-[#0b131d]/70 border border-[#2A3541] rounded-2xl p-6">
            <LogoSlider
              logos={promoRailItems.map((item) => {
                const mediaSrc = item.image || dashboardSignalPlaceholders[item.type]

                const content = (
                  <div className="promo-screen">
                    <div className="promo-screen__media">
                      <img src={mediaSrc} alt={item.title} loading="lazy" />
                      <div className={`promo-screen__badge promo-eyebrow--${item.tone}`}>{item.eyebrow}</div>
                      {item.tag && <div className="promo-screen__tag">{item.tag}</div>}
                    </div>
                    <div className="promo-screen__content premium-glass-panel">
                      <div className="promo-title">{item.title}</div>
                      <div className="promo-meta">{item.meta}</div>
                      <div className="promo-cta">→ {item.cta}</div>
                    </div>
                  </div>
                )

                if (item.onClick) {
                  return (
                    <button
                      key={item.railKey}
                      className="promo-card premium-glass-card"
                      data-tone={item.tone}
                      data-type={item.type}
                      onClick={item.onClick}
                      type="button"
                    >
                      {content}
                    </button>
                  )
                }

                if (!item.href) {
                  return null
                }

                return (
                  <Link
                    key={item.railKey}
                    to={item.href}
                    className="promo-card premium-glass-card"
                    data-tone={item.tone}
                    data-type={item.type}
                  >
                    {content}
                  </Link>
                )
              })}
              speed={48}
              direction="left"
              showBlur={false}
              pauseOnHover
              className="promo-rail"
            />
          </div>
        </div>

        <div className="mt-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div className="flex items-center gap-6 min-w-0">
              <h2 className="text-3xl font-display font-semibold text-[#E8E1D5] uppercase whitespace-nowrap">{t('dashboard.songLeaderboard')}</h2>
              <div className="hidden lg:block h-px bg-[#2A3541] flex-1 min-w-[120px]"></div>
            </div>
            <RankingPeriodTabs period={period} onChange={setPeriod} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <UserRankingsFeed period={period} />
            </div>

            <div className="space-y-8">
              <SongRankingWidget period={period} />
              <div className="h-[600px]">
                <LiveLeaderboard period={period} onPeriodChange={setPeriod} showTabs={false} limit={12} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
