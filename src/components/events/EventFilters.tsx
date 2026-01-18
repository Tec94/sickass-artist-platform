import { useState, useCallback } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { EventFilters as EventFiltersType } from '../../types/events'

interface EventFiltersProps {
  filters: EventFiltersType
  onChange: (filters: EventFiltersType) => void
  availableCities?: string[]
  eventCount?: number
}

export function EventFilters({
  filters,
  onChange,
  availableCities = [],
}: EventFiltersProps) {
  const { t } = useTranslation()
  const [sections, setSections] = useState({
    dates: true,
    location: true,
    status: true,
    sort: true
  })
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all')

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleCityChange = useCallback((city: string) => {
    onChange({
      ...filters,
      city: city === 'all' ? undefined : city,
    })
  }, [filters, onChange])

  const handleStatusChange = useCallback((status: string) => {
    onChange({
      ...filters,
      saleStatus: status === 'all' ? undefined : status as 'upcoming' | 'on_sale',
    })
  }, [filters, onChange])

  const handleSortChange = useCallback((sort: string) => {
    onChange({
      ...filters,
      sortBy: sort as 'asc' | 'desc',
    })
  }, [filters, onChange])

  const handleDateRangeChange = useCallback((range: string) => {
    setSelectedDateRange(range)
    const now = Date.now()
    let startDate: number | undefined
    let endDate: number | undefined

    switch (range) {
      case 'today':
        startDate = now
        endDate = now + 24 * 60 * 60 * 1000
        break
      case 'week':
        startDate = now
        endDate = now + 7 * 24 * 60 * 60 * 1000
        break
      case 'month':
        startDate = now
        endDate = now + 30 * 24 * 60 * 60 * 1000
        break
      case 'all':
      default:
        startDate = undefined
        endDate = undefined
        break
    }

    onChange({
      ...filters,
      startDate,
      endDate,
    })
  }, [filters, onChange])

  return (
    <div className="event-filters-sidebar">
      {/* Dates Section */}
      <div className="sidebar-section">
        <button className="section-header" onClick={() => toggleSection('dates')}>
          <h3>{t('events.dateRange')}</h3>
          <iconify-icon icon={sections.dates ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"} width="14" height="14"></iconify-icon>
        </button>
        {sections.dates && (
          <div className="section-content">
            {[
              { label: t('events.allDates'), value: 'all' },
              { label: t('events.today'), value: 'today' },
              { label: t('events.thisWeek'), value: 'week' },
              { label: t('events.thisMonth'), value: 'month' }
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => handleDateRangeChange(range.value)}
                className={`filter-item ${selectedDateRange === range.value ? 'active' : ''}`}
              >
                {range.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Location Section */}
      {availableCities.length > 0 && (
        <div className="sidebar-section">
          <button className="section-header" onClick={() => toggleSection('location')}>
            <h3>{t('events.location')}</h3>
            <iconify-icon icon={sections.location ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"} width="14" height="14"></iconify-icon>
          </button>
          {sections.location && (
            <div className="section-content">
              <button
                onClick={() => handleCityChange('all')}
                className={`filter-item ${!filters.city ? 'active' : ''}`}
              >
                {t('events.allCities')}
              </button>
              {availableCities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCityChange(city)}
                  className={`filter-item ${filters.city === city ? 'active' : ''}`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status Section */}
      <div className="sidebar-section">
        <button className="section-header" onClick={() => toggleSection('status')}>
          <h3>{t('events.saleStatus')}</h3>
          <iconify-icon icon={sections.status ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"} width="14" height="14"></iconify-icon>
        </button>
        {sections.status && (
          <div className="section-content">
            {[
              { value: 'all', label: t('events.allStatus') },
              { value: 'on_sale', label: t('events.onSale') },
              { value: 'upcoming', label: t('events.upcoming') },
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => handleStatusChange(status.value)}
                className={`filter-item ${(!filters.saleStatus && status.value === 'all') || filters.saleStatus === status.value ? 'active' : ''}`}
              >
                {status.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sort Section */}
      <div className="sidebar-section">
        <button className="section-header" onClick={() => toggleSection('sort')}>
          <h3>{t('events.sortBy')}</h3>
          <iconify-icon icon={sections.sort ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"} width="14" height="14"></iconify-icon>
        </button>
        {sections.sort && (
          <div className="section-content">
            <button
              onClick={() => handleSortChange('asc')}
              className={`filter-item ${filters.sortBy === 'asc' ? 'active' : ''}`}
            >
              {t('events.soonestFirst')}
            </button>
            <button
              onClick={() => handleSortChange('desc')}
              className={`filter-item ${filters.sortBy === 'desc' ? 'active' : ''}`}
            >
              {t('events.latestFirst')}
            </button>
          </div>
        )}
      </div>

      <style>{`
        .event-filters-sidebar {
          width: 100%;
          padding-right: 1.5rem;
        }

        .sidebar-section {
          margin-bottom: 1.5rem;
          border-left: 2px solid #1a1a1a;
          padding-left: 1rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.5rem 0;
          color: #808080;
          transition: color 0.2s;
        }

        .section-header:hover {
          color: white;
        }

        .section-header h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .section-content {
          margin-top: 0.75rem;
          display: flex;
          flex-direction: column;
        }

        .filter-item {
          display: block;
          width: 100%;
          padding: 0.5rem 0;
          background: transparent;
          border: none;
          border-left: 2px solid transparent;
          text-align: left;
          font-size: 13px;
          color: #737373;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }

        .filter-item:hover {
          color: white;
          padding-left: 0.5rem;
        }

        .filter-item.active {
          color: #dc2626;
          font-weight: 700;
          border-left-color: #dc2626;
          padding-left: 0.5rem;
        }
      `}</style>
    </div>
  )
}
