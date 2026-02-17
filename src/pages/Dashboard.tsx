 import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { HeroSection } from '../components/Dashboard/HeroSection'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import RelicAssemblyScroll from '../components/Landing/RelicAssemblyScroll'
import { useAnalytics } from '../hooks/useAnalytics'
import { LiveLeaderboard } from '../components/Leaderboard/LiveLeaderboard'
import { SongRankingWidget } from '../components/Leaderboard/SongRankingWidget'
import { UserRankingsFeed } from '../components/Leaderboard/UserRankingsFeed'
import { RankingPeriodTabs } from '../components/Leaderboard/RankingPeriodTabs'
import { useTranslation } from '../hooks/useTranslation'
import type { LeaderboardPeriod } from '../utils/leaderboard'
import { LogoSlider } from '../components/ui/LogoSlider'

type PromoTone = 'red' | 'amber' | 'blue' | 'emerald'
type PromoType = 'store' | 'event' | 'announcement' | 'promo'

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
type PromoRailItem = PromoItem & { railKey: string }

export const Dashboard = () => {
  useAnalytics() // Track page views
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isLoaded, setIsLoaded] = useState(false)
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly')
  const { t } = useTranslation()
  const [promoCopiedAt, setPromoCopiedAt] = useState<number | null>(null)

  // --- Frame-scroll hero setup ---
  const pageRef = useRef<HTMLDivElement>(null)
  const heroScrollSectionRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLElement>(null)

  // Find the App's actual scroll container on mount
  useEffect(() => {
    const el = document.querySelector('[data-scroll-container]') as HTMLElement | null
    if (el) {
      ;(scrollContainerRef as React.MutableRefObject<HTMLElement | null>).current = el
    }
  }, [])

  // Track only the frame-scroll hero section so keyframes complete before normal page flow.
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroScrollSectionRef,
    container: scrollContainerRef as React.RefObject<HTMLElement>,
    offset: ['start start', 'end end'],
  })

  // --- Text overlay transforms (threshold-based snap transitions) ---
  // Text 1: visible at 0%, fades out by ~5%.
  const opacity1 = useTransform(heroScrollProgress, [0, 0.04, 0.05], [1, 1, 0])
  const y1 = useTransform(heroScrollProgress, [0, 0.05], [0, -20])

  // Text 2: appears around 25%, fades out by ~30%.
  const opacity2 = useTransform(heroScrollProgress, [0.245, 0.25, 0.29, 0.3], [0, 1, 1, 0])
  const x2 = useTransform(heroScrollProgress, [0.245, 0.26], [-30, 0])

  // Text 3: appears around 50%, fades out by ~55%.
  const opacity3 = useTransform(heroScrollProgress, [0.495, 0.5, 0.54, 0.55], [0, 1, 1, 0])
  const x3 = useTransform(heroScrollProgress, [0.495, 0.51], [30, 0])

  // Text 4: appears around 75% and stays until the end of the frame sequence.
  const opacity4 = useTransform(heroScrollProgress, [0.745, 0.75, 1], [0, 1, 1])
  const scale4 = useTransform(heroScrollProgress, [0.745, 0.76], [0.95, 1])

  // Add easing/inertia so frames don't halt instantly when scroll input stops.
  const frameScrollProgress = useSpring(heroScrollProgress, {
    stiffness: 180,
    damping: 34,
    mass: 0.35,
  })

  // Use the optimized dashboard data query
  const dashboardData = useQuery(api.dashboard.getDashboardData)

  // Progressive rendering
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Safely access data
  const nextEvent = dashboardData?.upcomingEvents?.[0]
  const topProduct = dashboardData?.topMerch?.[0]
  // Trending forum posts might be in trendingForum array
  const forumPosts = dashboardData?.trendingForum || []

  const merchPromoItems = (dashboardData?.topMerch || [])
    .slice(0, 3)
    .map(
      (product): PromoLinkItem => ({
        key: `merch-${product._id}`,
        type: 'store',
        eyebrow: 'Merch Drop',
        title: product.name,
        meta: `$${(product.price / 100).toFixed(2)} · ${product.category}`,
        cta: 'Shop now',
        href: `/store/product/${product._id}`,
        tone: 'red',
        image: product.image,
        tag: 'Limited drop',
      })
    )

  const eventPromoItems = (dashboardData?.upcomingEvents || [])
    .slice(0, 3)
    .map(
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
        tag: 'On sale now',
      })
    )

  const announcementPromoItems = (dashboardData?.recentAnnouncements || [])
    .slice(0, 2)
    .map(
      (note): PromoLinkItem => ({
        key: `announce-${note._id}`,
        type: 'announcement',
        eyebrow: 'Wolfpack Wire',
        title: note.content.length > 40 ? `${note.content.slice(0, 40)}…` : note.content,
        meta: `by ${note.authorDisplayName}`,
        cta: 'Open chat',
        href: '/chat',
        tone: 'blue',
        tag: 'Community',
      })
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
    tone: 'emerald',
    tag: 'Today only',
  }

  const promoItems: PromoItem[] = [
    ...merchPromoItems,
    ...eventPromoItems,
    ...announcementPromoItems,
    promoCodeItem,
  ]

  const promoRailItems: PromoRailItem[] = Array.from(
    { length: Math.max(promoItems.length, 8) },
    (_, index) => {
      const item = promoItems[index % promoItems.length]
      return { ...item, railKey: `${item.key}-${index}` }
    }
  )

  useEffect(() => {
    if (!promoCopiedAt) return
    const timer = setTimeout(() => setPromoCopiedAt(null), 2000)
    return () => clearTimeout(timer)
  }, [promoCopiedAt])

  return (
    <div ref={pageRef} className="animate-fade-in pb-20">
      {/* ═══ Frame-Scroll Hero Section ═══ */}
      <div ref={heroScrollSectionRef} className="relative" style={{ height: '400vh' }}>
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-[#050505]">
          <RelicAssemblyScroll scrollYProgress={frameScrollProgress} />
          {/* ─── Text Overlays (bound to sticky hero only) ─── */}
          <motion.div
            style={{ pointerEvents: 'none' }}
            className="absolute inset-0 z-40 flex flex-col justify-center items-center p-6 md:p-12"
          >
            <motion.div
              style={{ opacity: opacity1, y: y1 }}
              className="absolute inset-0 flex items-center justify-center text-center"
            >
              <h1 className="text-4xl md:text-7xl font-bold tracking-tighter text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                PRIVATE SUITE.
              </h1>
            </motion.div>

            <motion.div
              style={{ opacity: opacity2, x: x2 }}
              className="absolute inset-0 flex items-center justify-start px-[10%] md:px-[15%]"
            >
              <div className="max-w-md space-y-4">
                <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white/90">THE RELICS RETURN.</h2>
                <p className="text-lg md:text-xl text-white/60 leading-relaxed font-light">
                  Armor forged in silence. <br />A legacy reassembled piece by piece.
                </p>
                <div className="h-px w-24 bg-gradient-to-r from-red-800 to-transparent opacity-50" />
              </div>
            </motion.div>

            <motion.div
              style={{ opacity: opacity3, x: x3 }}
              className="absolute inset-0 flex items-center justify-end px-[10%] md:px-[15%] text-right"
            >
              <div className="max-w-md space-y-4 flex flex-col items-end">
                <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white/90">STEEL, SIN, AND GRACE.</h2>
                <p className="text-lg md:text-xl text-white/60 leading-relaxed font-light">
                  From the shadows of the old world <br />into the neon glare of the new.
                </p>
                <div className="h-px w-24 bg-gradient-to-l from-blue-900 to-transparent opacity-50" />
              </div>
            </motion.div>

            <motion.div
              style={{ opacity: opacity4, scale: scale4 }}
              className="absolute inset-0 flex flex-col items-center justify-center space-y-8"
            >
              <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-white/95 drop-shadow-[0_0_30px_rgba(255,255,255,0.15)] text-center">
                LISTEN NOW.
              </h2>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ═══ Original Carousel Hero (now Section 2) ═══ */}
      <div className="w-full pt-16">
        <ErrorBoundary level="section" componentName="HeroSection">
          <HeroSection />
        </ErrorBoundary>
      </div>

      {/* Widgets Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Next Event Widget */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col group hover:border-amber-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-bold text-white uppercase flex items-center gap-2 whitespace-nowrap shrink min-w-0">
                <iconify-icon icon="solar:ticket-bold-duotone" width="24" height="24" class="text-amber-500 shrink-0"></iconify-icon> 
                <span className="truncate">{t('dashboard.nextEvent')}</span>
              </h3>
              <Link to="/events" className="text-xs text-zinc-500 hover:text-white uppercase tracking-wider">{t('common.viewAll')}</Link>
            </div>
            
            {nextEvent ? (
              <>
                <div className="relative aspect-video bg-zinc-800 mb-4 overflow-hidden group">
                   {nextEvent.imageUrl ? (
                     <img src={nextEvent.imageUrl} alt="Event" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                   ) : (
                     <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600">{t('common.noImage')}</div>
                   )}
                   <div className="absolute top-2 right-2 bg-amber-500 text-black text-xs font-bold px-2 py-1">
                     {t('dashboard.upcoming')}
                   </div>
                </div>
                <h4 className="text-white font-bold text-lg mb-1">{nextEvent.title}</h4>
                <p className="text-zinc-400 text-sm mb-4">{new Date(nextEvent.startAtUtc).toLocaleDateString()} • {nextEvent.city}</p>
                <Link to={`/events/${nextEvent._id}`} className="mt-auto w-full border border-zinc-700 text-zinc-300 py-2 text-center text-sm font-bold uppercase hover:bg-white hover:text-black transition-colors">
                  {t('dashboard.details')}
                </Link>
              </>
            ) : (
              <div className="text-zinc-500 text-sm py-10 text-center">{t('dashboard.noUpcomingEvents')}</div>
            )}
          </div>

          {/* Trending Merch Widget */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col group hover:border-red-600/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-bold text-white uppercase flex items-center gap-2 whitespace-nowrap shrink min-w-0">
                <iconify-icon icon="solar:fire-bold-duotone" width="24" height="24" class="text-red-600 shrink-0"></iconify-icon> 
                <span className="truncate">{t('dashboard.hotDrop')}</span>
              </h3>
              <Link to="/store" className="text-xs text-zinc-500 hover:text-white uppercase tracking-wider">{t('dashboard.shopAll')}</Link>
            </div>
            
            {topProduct ? (
              <div className="flex gap-4 items-center">
                <div className="w-24 h-32 bg-zinc-800 shrink-0 overflow-hidden">
                  {topProduct.image ? (
                    <img src={topProduct.image} alt="Product" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-zinc-800"></div>
                  )}
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">{topProduct.name}</h4>
                  <p className="text-red-500 font-bold mb-2">${(topProduct.price / 100).toFixed(2)}</p>
                  <div className="text-xs text-zinc-500 mb-3">{t('dashboard.limitedStock')}</div>
                  <Link to={`/store/product/${topProduct._id}`} className="text-xs font-bold uppercase text-white border-b border-red-600 pb-1 hover:text-red-500 transition-colors">
                    {t('dashboard.buyNow')}
                  </Link>
                </div>
              </div>
            ) : (
               <div className="text-zinc-500 text-sm py-10 text-center">{t('dashboard.noTrendingMerch')}</div>
            )}
          </div>

          {/* Community Buzz Widget */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col group hover:border-blue-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4 gap-4">
              <h3 className="text-lg font-display font-bold text-white uppercase flex items-center gap-2 whitespace-nowrap shrink min-w-0">
                <iconify-icon icon="solar:chat-line-bold-duotone" width="24" height="24" class="text-blue-500 shrink-0"></iconify-icon> 
                <span className="truncate">{t('dashboard.wolfpackChatter')}</span>
              </h3>
              <Link to="/forum" className="text-xs text-zinc-500 hover:text-white uppercase tracking-wider whitespace-nowrap shrink-0">{t('dashboard.joinDiscussion')}</Link>
            </div>
            <div className="space-y-4">
              {forumPosts.slice(0, 3).map(post => (
                <Link key={post._id} to={`/forum/thread/${post._id}`} className="block group">
                  <div className="text-sm font-bold text-zinc-200 group-hover:text-blue-500 transition-colors line-clamp-1">{post.title}</div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                    <span>{post.replyCount || 0} {t('dashboard.replies')}</span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
              {forumPosts.length === 0 && (
                 <div className="text-zinc-500 text-sm text-center">{t('dashboard.noActiveDiscussions')}</div>
              )}
            </div>
            <Link to="/forum" className="mt-auto flex items-center gap-2 text-sm text-zinc-400 hover:text-white pt-4">
              {t('dashboard.viewAllThreads')} <iconify-icon icon="solar:alt-arrow-right-linear" width="14" height="14" class="ml-1"></iconify-icon>
            </Link>
          </div>

        </div>

        {/* Live Screen Rail */}
        <div className="mt-16">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500 font-bold whitespace-nowrap">
              Live Signal Screens
            </p>
            <div className="h-px bg-zinc-800 flex-1 min-w-[120px]"></div>
            <span className="text-[11px] text-zinc-500">Sliding banners for announcements, drops, and events.</span>
          </div>
          <div className="bg-zinc-950/60 border border-zinc-800/70 rounded-2xl p-6">
            <LogoSlider
              logos={promoRailItems.map((item) => {
                const content = (
                  <>
                    <div className="promo-screen">
                      <div className="promo-screen__media">
                        {item.image ? (
                          <img src={item.image} alt={item.title} loading="lazy" />
                        ) : (
                          <div className="promo-screen__pattern" />
                        )}
                        <div className={`promo-screen__badge promo-eyebrow--${item.tone}`}>
                          {item.eyebrow}
                        </div>
                        {item.tag && (
                          <div className="promo-screen__tag">{item.tag}</div>
                        )}
                      </div>
                      <div className="promo-screen__content">
                        <div className="promo-title">{item.title}</div>
                        <div className="promo-meta">{item.meta}</div>
                        <div className="promo-cta">→ {item.cta}</div>
                      </div>
                    </div>
                  </>
                )

                if (item.onClick) {
                  return (
                    <button
                      key={item.railKey}
                      className="promo-card"
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
                  <Link key={item.railKey} to={item.href} className="promo-card" data-tone={item.tone} data-type={item.type}>
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

        {/* Music Leaderboard Section */}
        <div className="mt-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div className="flex items-center gap-6 min-w-0">
              <h2 className="text-3xl font-display font-bold text-white uppercase whitespace-nowrap">
                {t('dashboard.songLeaderboard')}
              </h2>
              <div className="hidden lg:block h-px bg-zinc-800 flex-1 min-w-[120px]"></div>
            </div>
            <RankingPeriodTabs period={period} onChange={setPeriod} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Community Feed (Left - 2 Cols) */}
            <div className="lg:col-span-2 space-y-8">
              <UserRankingsFeed period={period} />
            </div>

            {/* Live Rankings & Actions (Right - 1 Col) */}
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
