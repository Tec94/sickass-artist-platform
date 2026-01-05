import { useState, useCallback } from 'react'
import type { EventFilters } from '../../types/events'

interface EventFiltersProps {
  filters: EventFilters
  onChange: (filters: EventFilters) => void
  availableCities?: string[]
  eventCount?: number
}

export function EventFilters({
  filters,
  onChange,
  availableCities = [],
  eventCount = 0,
}: EventFiltersProps) {
  const [showFilters, setShowFilters] = useState(true)
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all')

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

  const handleResetAll = useCallback(() => {
    onChange({
      sortBy: 'asc',
    })
  }, [onChange])

  const activeFilterCount = [
    filters.city,
    filters.saleStatus,
    filters.startDate,
  ].filter(Boolean).length

  return (
    <div className="bg-gray-900/70 border border-gray-800 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-bold text-sm">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="bg-cyan-500/20 text-cyan-400 text-xs px-2 py-0.5 rounded-full font-bold">
              {activeFilterCount}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <iconify-icon icon={showFilters ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'}></iconify-icon>
        </button>
      </div>

      {showFilters && (
        <div className="space-y-4">
          {/* Date Range */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['all', 'today', 'week', 'month'].map((range) => (
                <button
                  key={range}
                  onClick={() => handleDateRangeChange(range)}
                  className={`px-3 py-2 rounded text-xs font-bold transition-colors ${
                    selectedDateRange === range
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                      : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* City Filter */}
          {availableCities.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                City
              </label>
              <select
                value={filters.city || 'all'}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Cities</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sale Status */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Sale Status
            </label>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'All Events' },
                { value: 'on_sale', label: 'On Sale' },
                { value: 'upcoming', label: 'Coming Soon' },
              ].map((status) => (
                <label key={status.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="saleStatus"
                    value={status.value}
                    checked={
                      (!filters.saleStatus && status.value === 'all') ||
                      filters.saleStatus === status.value
                    }
                    onChange={() => handleStatusChange(status.value)}
                    className="text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-sm text-gray-300">{status.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy || 'asc'}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="asc">Soonest First</option>
              <option value="desc">Latest First</option>
            </select>
          </div>

          {/* Active Filters & Reset */}
          {activeFilterCount > 0 && (
            <div className="pt-4 border-t border-gray-800">
              <button
                onClick={handleResetAll}
                className="w-full bg-red-500/20 text-red-400 px-4 py-2 rounded text-sm font-bold hover:bg-red-500/30 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Event Count */}
          <div className="pt-2 text-center">
            <span className="text-xs text-gray-400">
              {eventCount} {eventCount === 1 ? 'event' : 'events'} found
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
