import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EventCard } from '../components/events/EventCard'
import { EventFilters } from '../components/events/EventFilters'
import { EventSearch } from '../components/events/EventSearch'
import { useEventList } from '../hooks/useEventList'
import { useAnalytics } from '../hooks/useAnalytics'
import type { EventFilters as EventFiltersType } from '../types/events'
import { useTranslation } from '../hooks/useTranslation'

export function Events() {
  useAnalytics() // Track page views
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const { t } = useTranslation()

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
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 animate-fade-in pb-10">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Sidebar Filters - Preserved */}
        <aside className="lg:w-72 shrink-0">
          <div className="sticky top-24">
            <EventFilters
              filters={filters}
              onChange={setFilters}
              availableCities={availableCities}
              eventCount={total}
            />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
               <h1 className="text-4xl font-display font-bold text-white uppercase tracking-tighter">{t('events.title')}</h1>
               <p className="text-zinc-500 mt-2 font-medium">{t('events.subtitle')}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-1 flex">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-sm transition-all ${viewMode === 'grid' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <iconify-icon icon="solar:widget-2-linear" width="18" height="18"></iconify-icon>
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-sm transition-all ${viewMode === 'list' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <iconify-icon icon="solar:list-linear" width="18" height="18"></iconify-icon>
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-10 max-w-2xl">
             <EventSearch placeholder={t('events.searchPlaceholder')} />
          </div>

          {loading && events.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-zinc-900/50 border border-zinc-800 animate-pulse rounded-sm" />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-8" : "flex flex-col gap-6"}>
              {events.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  compact={viewMode === 'list'}
                  showQuickAction={true}
                />
              ))}
            </div>
          ) : (
            <div className="py-32 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
              <iconify-icon icon="solar:calendar-broken" class="text-6xl text-zinc-700 mb-4 mx-auto block"></iconify-icon>
              <h3 className="text-white font-bold text-xl mb-2">{t('events.noResults')}</h3>
              <p className="text-zinc-500 text-sm max-w-xs mx-auto mb-6">
                {t('events.noEventsMatch')}
              </p>
              <button
                onClick={() => setFilters({ sortBy: 'asc' })}
                className="inline-flex items-center gap-2 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
              >
                <iconify-icon icon="solar:restart-bold" width="14"></iconify-icon>
                {t('common.resetFilters')}
              </button>
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-12 pt-12 border-t border-zinc-900">
              <button
                onClick={loadMore}
                disabled={loading}
                className="text-zinc-500 hover:text-white uppercase text-xs tracking-[0.3em] font-bold border-b border-transparent hover:border-red-600 transition-all pb-1 disabled:opacity-50"
              >
                {loading ? t('events.synchronizing') : t('events.loadMoreExperiences')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
