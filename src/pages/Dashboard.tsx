import { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ErrorBoundary, WidgetErrorBoundary } from '../components/ErrorBoundary'
import { HeroSection } from '../components/Dashboard/HeroSection'
import { 
  TopMerchWidget,
  TrendingForumWidget,
  AnnouncementsWidget,
  TrendingGalleryWidget,
  ArtistMomentsWidget,
  UpcomingEventsWidget
} from '../components/Dashboard/DashboardWidgets'
import { useAnalytics } from '../hooks/useAnalytics'
import '../components/Dashboard/dashboard.css'

export const Dashboard = () => {
  useAnalytics() // Track page views
  const [isLoaded, setIsLoaded] = useState(false)

  // Use the optimized dashboard data query
  const dashboardData = useQuery(api.dashboard.getDashboardData)

  // Progressive rendering - delay secondary widgets
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="dashboard-container">
      {/* Hero Section - Always renders first */}
      <ErrorBoundary level="section" componentName="HeroSection">
        <HeroSection />
      </ErrorBoundary>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Top Row - Key Widgets */}
        <WidgetErrorBoundary componentName="UpcomingEventsWidget">
          <UpcomingEventsWidget data={dashboardData?.upcomingEvents} />
        </WidgetErrorBoundary>

        <WidgetErrorBoundary componentName="TrendingGalleryWidget">
          <TrendingGalleryWidget data={dashboardData?.trendingGallery} />
        </WidgetErrorBoundary>

        <WidgetErrorBoundary componentName="TopMerchWidget">
          <TopMerchWidget data={dashboardData?.topMerch} />
        </WidgetErrorBoundary>

        {/* Second Row - Deferred */}
        {isLoaded && (
          <>
            <WidgetErrorBoundary componentName="TrendingForumWidget">
              <TrendingForumWidget data={dashboardData?.trendingForum} />
            </WidgetErrorBoundary>

            <WidgetErrorBoundary componentName="AnnouncementsWidget">
              <AnnouncementsWidget data={dashboardData?.recentAnnouncements} />
            </WidgetErrorBoundary>

            <WidgetErrorBoundary componentName="ArtistMomentsWidget">
              <ArtistMomentsWidget data={dashboardData?.artistMoments} />
            </WidgetErrorBoundary>
          </>
        )}
      </div>

      <style>{`
        .dashboard-container {
          height: 100%;
          overflow-y: auto;
          background: linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #1a0000 100%);
          padding: 0;
          margin: 0;
          width: 100%;
          scrollbar-width: thin;
          scrollbar-color: var(--color-primary) transparent;
        }

        .dashboard-container::-webkit-scrollbar {
          width: 6px;
        }

        .dashboard-container::-webkit-scrollbar-thumb {
          background: var(--color-primary);
          border-radius: 3px;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Tablet: 2 columns */
        @media (min-width: 768px) and (max-width: 1199px) {
          .dashboard-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            padding: 20px;
          }
        }

        /* Mobile: 1 column */
        @media (max-width: 767px) {
          .dashboard-container {
            padding: 0;
          }
          
          .dashboard-grid {
            grid-template-columns: 1fr;
            padding: 16px;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  )
}