import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useGalleryFilters } from '../../hooks/useGalleryFilters'
import { FilterChips } from './FilterChips'

const CONTENT_TYPES = [
  { value: 'show', label: 'Show' },
  { value: 'bts', label: 'BTS' },
  { value: 'edit', label: 'Edits' },
  { value: 'wip', label: 'WIP' },
  { value: 'exclusive', label: 'Exclusive' },
] as const

const DATE_RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
] as const

const FAN_TIERS = [
  { value: 'all', label: 'All tiers' },
  { value: 'bronze', label: 'Bronze+' },
  { value: 'silver', label: 'Silver+' },
  { value: 'gold', label: 'Gold+' },
  { value: 'platinum', label: 'Platinum' },
] as const

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'mostLiked', label: 'Most Liked' },
  { value: 'mostViewed', label: 'Most Viewed' },
  { value: 'trending', label: 'Trending' },
] as const

interface AdvancedFiltersProps {
  onClose?: () => void
  isModal?: boolean
}

export const AdvancedFilters = ({ onClose, isModal = false }: AdvancedFiltersProps) => {
  const { filters, setFilter, clearFilter, clearAll, appliedCount, isActive } = useGalleryFilters()
  const [expandedSection, setExpandedSection] = useState<string | null>('sort')

  // Fetch available creators
  const creators = useQuery(api.gallery.getAvailableCreators, {}) || []

  // Fetch available tags (autocomplete)
  const [tagInput, setTagInput] = useState('')
  const availableTags = useQuery(
    api.gallery.getAvailableTags,
    { search: tagInput, limit: 10 }
  ) || []

  // Toggle filter section
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  // Handle type toggle
  const handleTypeToggle = (type: string) => {
    const contentType = type as 'show' | 'bts' | 'edit' | 'wip' | 'exclusive'
    const newTypes = filters.types.includes(contentType)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, contentType]
    setFilter('types', newTypes)
  }

  // Handle tag toggle
  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag]
    setFilter('tags', newTags)
  }

  const FilterSection = ({
    title,
    children,
    sectionKey,
  }: {
    title: string
    children: React.ReactNode
    sectionKey: string
  }) => (
    <div className="border-b border-gray-800">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-900/50 transition"
      >
        <h3 className="font-semibold text-white">{title}</h3>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            expandedSection === sectionKey ? 'rotate-180' : ''
          }`}
        />
      </button>
      {expandedSection === sectionKey && (
        <div className="px-4 pb-4 space-y-3 bg-gray-900/20">{children}</div>
      )}
    </div>
  )

  const CheckboxOption = ({
    label,
    checked,
    onChange,
  }: {
    label: string
    checked: boolean
    onChange: (checked: boolean) => void
  }) => (
    <label className="flex items-center gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
      />
      <span className="text-sm text-gray-300 group-hover:text-white transition">{label}</span>
    </label>
  )

  return (
    <div className={`${isModal ? 'fixed inset-0 z-50' : ''}`}>
      {/* Modal backdrop */}
      {isModal && (
        <div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
      )}

      {/* Filter panel */}
      <div
        className={`${
          isModal
            ? 'fixed bottom-0 left-0 right-0 rounded-t-xl'
            : 'w-full md:w-80 border-r border-gray-800'
        } bg-black max-h-[80vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-black border-b border-gray-800 p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-bold text-white">Filters</h2>
            {appliedCount > 0 && (
              <p className="text-xs text-cyan-400 mt-1">{appliedCount} active</p>
            )}
          </div>
          {isModal && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-800 rounded transition"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Active filters chips */}
        {isActive && (
          <div className="px-4 pt-4">
            <FilterChips filters={filters} onRemove={clearFilter} />
            <button
              onClick={clearAll}
              className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Filter sections */}
        <div>
          {/* Sort */}
          <FilterSection title="Sort By" sectionKey="sort">
            <div className="space-y-2">
              {SORT_OPTIONS.map(option => (
                <CheckboxOption
                  key={option.value}
                  label={option.label}
                  checked={filters.sortBy === option.value}
                  onChange={() => setFilter('sortBy', option.value)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Content type */}
          <FilterSection title="Content Type" sectionKey="type">
            <div className="space-y-2">
              {CONTENT_TYPES.map(type => (
                <CheckboxOption
                  key={type.value}
                  label={type.label}
                  checked={filters.types.includes(type.value)}
                  onChange={() => handleTypeToggle(type.value)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Date range */}
          <FilterSection title="Date Range" sectionKey="date">
            <div className="space-y-2">
              {DATE_RANGES.map(range => (
                <CheckboxOption
                  key={range.value}
                  label={range.label}
                  checked={filters.dateRange === range.value}
                  onChange={() => setFilter('dateRange', range.value)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Creator */}
          <FilterSection title="Creator" sectionKey="creator">
            <select
              value={filters.creatorId || ''}
              onChange={e => setFilter('creatorId', e.target.value || null)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="">All creators</option>
              {creators.map(creator => (
                <option key={creator._id} value={creator._id}>
                  {creator.displayName}
                </option>
              ))}
            </select>
          </FilterSection>

          {/* Fan tier */}
          <FilterSection title="Fan Tier" sectionKey="tier">
            <div className="space-y-2">
              {FAN_TIERS.map(tier => (
                <CheckboxOption
                  key={tier.value}
                  label={tier.label}
                  checked={filters.fanTier === tier.value}
                  onChange={() => setFilter('fanTier', tier.value)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Tags */}
          <FilterSection title="Tags" sectionKey="tags">
            <input
              type="text"
              placeholder="Search tags..."
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded text-sm focus:outline-none focus:border-cyan-500"
            />
            <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-2 py-1 rounded text-xs font-medium transition ${
                    filters.tags.includes(tag)
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {tag}
                  {filters.tags.includes(tag) && (
                    <span className="ml-1">✓</span>
                  )}
                </button>
              ))}
            </div>
            {filters.tags.length > 0 && (
              <button
                onClick={() => setFilter('tags', [])}
                className="mt-2 text-xs text-gray-400 hover:text-gray-300"
              >
                Clear selected tags
              </button>
            )}
          </FilterSection>
        </div>

        {/* Apply button */}
        <div className="sticky bottom-0 p-4 border-t border-gray-800 bg-black flex gap-2">
          <button
            onClick={clearAll}
            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition font-medium"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
