import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { HeroSection } from '../components/Dashboard/HeroSection'
import { useAnalytics } from '../hooks/useAnalytics'
import { LiveLeaderboard } from '../components/Leaderboard/LiveLeaderboard'
import { SongRankingWidget } from '../components/Leaderboard/SongRankingWidget'
import { UserRankingsFeed } from '../components/Leaderboard/UserRankingsFeed'
import { RankingPeriodTabs } from '../components/Leaderboard/RankingPeriodTabs'
import { useTranslation } from '../hooks/useTranslation'
import type { LeaderboardPeriod } from '../utils/leaderboard'

export const Dashboard = () => {
  useAnalytics() // Track page views
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isLoaded, setIsLoaded] = useState(false)
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly')
  const { t } = useTranslation()

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

  return (
    <div className="animate-fade-in pb-20">
      {/* Hero Section - Always renders first */}
      <ErrorBoundary level="section" componentName="HeroSection">
        <HeroSection />
      </ErrorBoundary>

      {/* Widgets Grid - New Layout */}
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
