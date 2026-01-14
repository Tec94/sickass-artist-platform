import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useEventSearch } from '../../hooks/useEventSearch'
import { formatEventDate, getSaleStatusBadge } from '../../utils/eventFormatters'

interface EventSearchProps {
  placeholder?: string
  city?: string
  saleStatus?: 'upcoming' | 'on_sale'
  onResultSelect?: () => void
}

export function EventSearch({
  placeholder = 'Search events...',
  city,
  saleStatus,
  onResultSelect,
}: EventSearchProps) {
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  
  const { results, loading, hasSearched } = useEventSearch(query, {
    debounceMs: 300,
    limit: 10,
    city,
    saleStatus,
  })

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Show results when query changes and has results
  useEffect(() => {
    if (query.length >= 2 && hasSearched) {
      setShowResults(true)
    } else {
      setShowResults(false)
    }
  }, [query, hasSearched])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const handleClear = () => {
    setQuery('')
    setShowResults(false)
  }

  const handleResultClick = () => {
    setShowResults(false)
    setQuery('')
    onResultSelect?.()
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && hasSearched && setShowResults(true)}
          placeholder={placeholder}
          className="w-full bg-gray-900/70 border border-gray-800 text-white rounded-lg pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors"
        />
        
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <iconify-icon icon="solar:magnifer-linear"></iconify-icon>
        </div>

        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <iconify-icon icon="solar:close-circle-linear"></iconify-icon>
          </button>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-800 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
          {results.length > 0 ? (
            <div className="py-2">
              {results.map((event) => {
                const statusBadge = getSaleStatusBadge(event.saleStatus)
                return (
                  <Link
                    key={event._id}
                    to={`/events/${event._id}`}
                    onClick={handleResultClick}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors"
                  >
                    {/* Event Image */}
                    <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-950">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Event Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-sm truncate mb-1">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <iconify-icon icon="solar:map-point-bold" class="text-red-500"></iconify-icon>
                          {event.city}
                        </span>
                        <span>•</span>
                        <span>{formatEventDate(event.startAtUtc, 'America/New_York')}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`flex-shrink-0 ${statusBadge.bgColor} ${statusBadge.color} px-2 py-1 rounded text-xs font-bold`}>
                      {statusBadge.text}
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : hasSearched && query.length >= 2 ? (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              No events found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
