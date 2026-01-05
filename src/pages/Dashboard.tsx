import { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ErrorBoundary, WidgetErrorBoundary } from '../components/ErrorBoundary'
import { HeroSection } from '../components/Dashboard/HeroSection'
import { TrendingWidget } from '../components/Dashboard/TrendingWidget'
import { EventsWidget } from '../components/Dashboard/EventsWidget'
import { ForumWidget } from '../components/Dashboard/ForumWidget'
import { MerchWidget } from '../components/Dashboard/MerchWidget'
import { CreatorsWidget } from '../components/Dashboard/CreatorsWidget'
import '../components/Dashboard/dashboard.css'

type WidgetName = 'hero' | 'trending' | 'events' | 'forum' | 'merch' | 'creators'

export const Dashboard = () => {
  const [renderedWidgets, setRenderedWidgets] = useState<Set<WidgetName>>(new Set(['hero']))

  // Progressive rendering: Priority 1 widgets render on mount
  const trendingData = useQuery(
    api.recommendations.getTrendingContent,
    { 
      page: 0, 
      pageSize: 6, 
      sortBy: 'trending',
      dateRange: '30d'
    }
  )

  const eventsData = useQuery(
    api.events.getEvents,
    { 
      page: 0, 
      pageSize: 3, 
      sortBy: 'asc',
      startDate: Date.now()
    }
  )

  // Progressive rendering: Priority 2 widgets render after 200ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setRenderedWidgets(prev => new Set([...prev, 'forum', 'merch', 'creators']))
    }, 200)

    return () => clearTimeout(timer)
  }, [])

  // Mark priority 1 widgets as rendered when their queries start
  useEffect(() => {
    if (trendingData !== undefined || eventsData !== undefined) {
      setRenderedWidgets(prev => new Set([...prev, 'trending', 'events']))
    }
  }, [trendingData, eventsData])

  const handleWidgetRetry = (widgetName: string) => {
    // Force re-render of the widget
    setRenderedWidgets(prev => {
      const newSet = new Set(prev)
      newSet.delete(widgetName)
      return newSet
    })
  }

  return (
    <div className="dashboard-container">
      {/* Hero Section - Always renders first */}
        <ErrorBoundary level="section" componentName="HeroSection">
          <HeroSection />
        </ErrorBoundary>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Priority 1 Widgets - Trending */}
        {renderedWidgets.has('trending') && (
          <WidgetErrorBoundary componentName="TrendingWidget">
            <TrendingWidget 
              data={trendingData}
              onRetry={() => handleWidgetRetry('trending')}
            />
          </WidgetErrorBoundary>
        )}

        {/* Priority 1 Widgets - Events */}
        {renderedWidgets.has('events') && (
          <WidgetErrorBoundary componentName="EventsWidget">
            <EventsWidget 
              data={eventsData}
              onRetry={() => handleWidgetRetry('events')}
            />
          </WidgetErrorBoundary>
        )}

        {/* Priority 2 Widgets - Forum (deferred) */}
        {renderedWidgets.has('forum') && (
          <WidgetErrorBoundary componentName="ForumWidget">
            <ForumWidget onRetry={() => handleWidgetRetry('forum')} />
          </WidgetErrorBoundary>
        )}

        {/* Priority 2 Widgets - Merch (deferred) */}
        {renderedWidgets.has('merch') && (
          <WidgetErrorBoundary componentName="MerchWidget">
            <MerchWidget onRetry={() => handleWidgetRetry('merch')} />
          </WidgetErrorBoundary>
        )}

        {/* Priority 2 Widgets - Creators (deferred) */}
        {renderedWidgets.has('creators') && (
          <WidgetErrorBoundary componentName="CreatorsWidget">
            <CreatorsWidget onRetry={() => handleWidgetRetry('creators')} />
          </WidgetErrorBoundary>
        )}
      </div>

      <style>{`
        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #1a0000 100%);
          padding: 0;
          margin: 0;
          width: 100%;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Tablet: 2 columns */
        @media (min-width: 768px) and (max-width: 1199px) {
          .dashboard-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 32px;
            padding: 32px;
          }
        }

        /* Desktop: 2-3 columns */
        @media (min-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 40px;
            padding: 40px;
          }
        }

        /* Ensure hero section spans full width */
        .dashboard-grid > :first-child {
          grid-column: 1 / -1;
        }

        /* Mobile optimizations */
        @media (max-width: 767px) {
          .dashboard-container {
            padding: 0;
          }
          
          .dashboard-grid {
            padding: 16px;
            gap: 20px;
          }
        }
      `}</style>
    </div>
  )
}