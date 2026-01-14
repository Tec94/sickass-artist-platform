import React from 'react'

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
          <iconify-icon icon="solar:clock-circle-linear" width="16" height="16"></iconify-icon>
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 text-sm text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-colors"
          >
            <iconify-icon icon="solar:magnifer-linear" width="12" height="12"></iconify-icon>
            <span className="truncate max-w-[150px]">{search}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
