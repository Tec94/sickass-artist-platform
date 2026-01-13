import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Grid, List } from 'lucide-react'
import { EventCard } from '../components/events/EventCard'
import { EventFilters } from '../components/events/EventFilters'
import { EventSearch } from '../components/events/EventSearch'
import { useEventList } from '../hooks/useEventList'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { useAnalytics } from '../hooks/useAnalytics'
import type { EventFilters as EventFiltersType } from '../types/events'

export function Events() {
  useAnalytics() // Track page views
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const animate = useScrollAnimation()

  // Parse filters from URL
  const [filters, setFilters] = useState<EventFiltersType>(() => {
    const city = searchParams.get('city') || undefined
    const startDate = searchParams.get('startDate') ? parseInt(searchParams.get('startDate')!) : undefined
    const endDate = searchParams.get('endDate') ? parseInt(searchParams.get('endDate')!) : undefined
    const saleStatus = searchParams.get('status') as 'upcoming' | 'on_sale' | undefined
    const sortBy = (searchParams.get('sort') || 'asc') as 'asc' | 'desc'

    return {
      city,
      startDate,
      endDate,
      saleStatus,
      sortBy,
    }
  })

  const { events, total, loading, hasMore, loadMore } = useEventList(filters, 12)

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (filters.city) params.set('city', filters.city)
    if (filters.startDate) params.set('startDate', filters.startDate.toString())
    if (filters.endDate) params.set('endDate', filters.endDate.toString())
    if (filters.saleStatus) params.set('status', filters.saleStatus)
    if (filters.sortBy) params.set('sort', filters.sortBy)
    
    setSearchParams(params, { replace: true })
  }, [filters, setSearchParams])

  // Extract unique cities from events for filter
  const availableCities = Array.from(new Set(events.map(e => e.city))).sort()

  return (
    <div className="events-layout h-full flex flex-col">
      {/* Header */}
      {/* Header */}
      <header ref={animate} data-animate className="events-header mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
             <h1 className="text-4xl font-display font-bold text-white uppercase tracking-wide">Tour & Events</h1>
             <p className="text-zinc-400 mt-2">Catch ROA WOLVES live in a city near you.</p>
          </div>
          
          <div className="flex items-center gap-4">
             {/* View Toggle */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-1 flex">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-sm transition-colors ${viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Grid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-sm transition-colors ${viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar - Moved below title */}
        <div className="max-w-xl">
           <EventSearch placeholder="Search events by title, venue, or city..." />
        </div>
        
        {/* Active Filters Summary */}
        <div className="flex items-center gap-2 mt-4">
           <span className="text-sm text-gray-400">{total} events</span>
           {filters.city && (
             <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded-full font-bold">
               in {filters.city}
             </span>
           )}
        </div>
      </header>

      {/* Main Content */}
      <div className="events-content flex-1 flex gap-6">
        {/* Sidebar Filters */}
        <aside className="events-sidebar hidden lg:block w-64 flex-shrink-0">
          <EventFilters
            filters={filters}
            onChange={setFilters}
            availableCities={availableCities}
            eventCount={total}
          />
        </aside>

        {/* Events Grid/List */}
        <main className="events-main flex-1">
          {loading && events.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-900/70 border border-gray-800 rounded-lg overflow-hidden animate-pulse">
                  <div className="aspect-video bg-gray-950"></div>
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-800 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-4'
                }
              >
                {events.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    compact={viewMode === 'list'}
                    showQuickAction={true}
                  />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="bg-red-500/20 text-red-500 px-8 py-3 rounded-full font-bold hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
                        Loading...
                      </span>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <iconify-icon icon="solar:calendar-minimalistic-bold" class="text-6xl text-gray-700 mb-4"></iconify-icon>
              <h3 className="text-white font-bold text-xl mb-2">No events found</h3>
              <p className="text-gray-400 text-sm mb-6">
                Try adjusting your filters or check back later
              </p>
              <button
                onClick={() => setFilters({ sortBy: 'asc' })}
                className="bg-red-500/20 text-red-500 px-6 py-2 rounded-full font-bold hover:bg-red-500/30 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .events-layout {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .h1-title {
          font-size: 32px;
          font-weight: 800;
          color: white;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin: 0;
        }

        .sub-text {
          font-size: 14px;
          color: var(--color-text-dim);
          font-weight: 600;
          margin: 4px 0 0 0;
        }

        @media (max-width: 1024px) {
          .events-sidebar {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .h1-title {
            font-size: 24px;
          }
          
          .events-header {
            margin-bottom: 24px;
          }
        }
      `}</style>
    </div>
  )
}
