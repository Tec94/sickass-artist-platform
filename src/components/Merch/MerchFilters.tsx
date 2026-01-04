import { useState, useEffect } from 'react'
import { Filter, X } from 'lucide-react'
import { MerchFilters as MerchFilterState } from '../../hooks/useMerchFilters'

interface MerchFiltersProps {
  filters: MerchFilterState
  onFilterChange: (key: string, value: string | number | null) => void
  onReset: () => void
}

const CATEGORIES = [
  { value: 'apparel', label: 'Apparel' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'vinyl', label: 'Vinyl' },
  { value: 'limited', label: 'Limited Edition' },
  { value: 'other', label: 'Other' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'stock', label: 'In Stock' },
]

export function MerchFilters({ filters, onFilterChange, onReset }: MerchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(filters.search || '')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== (filters.search || '')) {
        onFilterChange('search', searchValue || null)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchValue, onFilterChange, filters.search])

  // Sync internal state with external filters (e.g. on reset)
  useEffect(() => {
    setSearchValue(filters.search || '')
  }, [filters.search])

  const hasActiveFilters =
    filters.category || filters.search || filters.minPrice || filters.maxPrice

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-300 hover:text-white transition-colors"
      >
        <Filter className="w-4 h-4" />
        Filters
        {hasActiveFilters && (
          <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
        )}
      </button>

      {/* Filters panel */}
      <div
        className={`${
          isOpen ? 'block' : 'hidden'
        } md:block p-4 bg-gray-900/50 border border-gray-800 rounded-lg space-y-4`}
      >
        {/* Search */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Search
          </label>
          <input
            type="text"
            placeholder="Search products..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => onFilterChange('category', e.target.value || null)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-300">
            Price Range
          </label>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Min ($)"
              value={filters.minPrice ? filters.minPrice / 100 : ''}
              onChange={(e) =>
                onFilterChange(
                  'minPrice',
                  e.target.value ? parseInt(e.target.value) * 100 : null
                )
              }
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Max ($)"
              value={filters.maxPrice ? filters.maxPrice / 100 : ''}
              onChange={(e) =>
                onFilterChange(
                  'maxPrice',
                  e.target.value ? parseInt(e.target.value) * 100 : null
                )
              }
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-cyan-500 focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="w-full py-2 px-3 bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        )}
      </div>
    </>
  )
}
