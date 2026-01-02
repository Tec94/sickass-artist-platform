import React from 'react'
import { Clock, Search } from 'lucide-react'

interface RecentSearchesProps {
  searches: string[]
  onSelect: (search: string) => void
  onClear: () => void
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  searches,
  onSelect,
  onClear,
}) => {
  if (searches.length === 0) return null

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="h-4 w-4" />
          <span>Recent searches</span>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map((search, index) => (
          <button
            key={`${search}-${index}`}
            onClick={() => onSelect(search)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 text-sm text-gray-300 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors"
          >
            <Search className="h-3 w-3" />
            <span className="truncate max-w-[150px]">{search}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
