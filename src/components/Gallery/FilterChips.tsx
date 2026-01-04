import { X } from 'lucide-react'
import type { GalleryFilters } from '../../types/gallery'

interface FilterChipsProps {
  filters: GalleryFilters
  onRemove: (key: keyof GalleryFilters) => void
}

export const FilterChips = ({ filters, onRemove }: FilterChipsProps) => {
  const chips: { label: string; key: keyof GalleryFilters }[] = []

  if (filters.types.length > 0) {
    chips.push({ label: `Type: ${filters.types.join(', ')}`, key: 'types' })
  }
  if (filters.dateRange !== 'all') {
    chips.push({ label: `Date: ${filters.dateRange}`, key: 'dateRange' })
  }
  if (filters.creatorId) {
    chips.push({ label: `Creator filter`, key: 'creatorId' })
  }
  if (filters.fanTier !== 'all') {
    chips.push({ label: `Tier: ${filters.fanTier}`, key: 'fanTier' })
  }
  if (filters.tags.length > 0) {
    chips.push({ label: `Tags: ${filters.tags.join(', ')}`, key: 'tags' })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map(chip => (
        <button
          key={chip.key}
          onClick={() => onRemove(chip.key)}
          className="flex items-center gap-2 px-3 py-1 bg-cyan-600/20 border border-cyan-600/50 text-cyan-300 rounded-full text-sm hover:bg-cyan-600/30 transition"
        >
          {chip.label}
          <X className="w-3 h-3" />
        </button>
      ))}
    </div>
  )
}
