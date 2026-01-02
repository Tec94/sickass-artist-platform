import React from 'react'
import type { ExploreFilters } from '../../../types'

interface FilterBarProps {
  filters: ExploreFilters
  onChange: (filters: Partial<ExploreFilters>) => void
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange }) => {
  return (
    <div className="mb-8 flex flex-wrap gap-4">
      {/* Category Filter */}
      <select
        value={filters.category}
        onChange={(e) => onChange({ category: e.target.value as ExploreFilters['category'] })}
        className="rounded border border-cyan-500/30 bg-slate-900 px-4 py-2 text-white outline-none focus:border-cyan-400 transition-colors"
      >
        <option value="all">All Categories</option>
        <option value="gallery">Gallery</option>
        <option value="ugc">UGC</option>
        <option value="users">Users</option>
      </select>

      {/* Date Range Filter */}
      <select
        value={filters.dateRange}
        onChange={(e) => onChange({ dateRange: e.target.value as ExploreFilters['dateRange'] })}
        className="rounded border border-cyan-500/30 bg-slate-900 px-4 py-2 text-white outline-none focus:border-cyan-400 transition-colors"
      >
        <option value="7d">Last 7 Days</option>
        <option value="30d">Last 30 Days</option>
        <option value="90d">Last 90 Days</option>
        <option value="all">All Time</option>
      </select>

      {/* Fan Tier Filter */}
      <select
        value={filters.tier}
        onChange={(e) => onChange({ tier: e.target.value as ExploreFilters['tier'] })}
        className="rounded border border-cyan-500/30 bg-slate-900 px-4 py-2 text-white outline-none focus:border-cyan-400 transition-colors"
      >
        <option value="all">All Tiers</option>
        <option value="bronze">Bronze+</option>
        <option value="silver">Silver+</option>
        <option value="gold">Gold+</option>
        <option value="platinum">Platinum</option>
      </select>

      {/* Sort By Filter */}
      <select
        value={filters.sort}
        onChange={(e) => onChange({ sort: e.target.value as ExploreFilters['sort'] })}
        className="rounded border border-cyan-500/30 bg-slate-900 px-4 py-2 text-white outline-none focus:border-cyan-400 transition-colors"
      >
        <option value="trending">Trending</option>
        <option value="newest">Newest</option>
        <option value="mostLiked">Most Liked</option>
        <option value="mostViewed">Most Viewed</option>
      </select>
    </div>
  )
}
