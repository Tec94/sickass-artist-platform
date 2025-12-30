import { memo } from 'react'
import type { Category, ThreadSortBy } from '../../types/forum'

interface CategoryFilterProps {
  category: Category | null
  sortBy: ThreadSortBy
  onSortChange: (sortBy: ThreadSortBy) => void
  onCreateThread: () => void
  onBackToCategories?: () => void
}

const SortButton = memo(function SortButton({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        `px-3 py-1.5 text-sm rounded-lg border transition-colors ` +
        `${isActive ? 'border-cyan-500/60 bg-cyan-500/20 text-cyan-100' : 'border-gray-700 bg-gray-900/30 text-gray-200 hover:bg-gray-800/50'}`
      }
      aria-pressed={isActive}
    >
      {label}
    </button>
  )
})

export const CategoryFilter = memo(function CategoryFilter({
  category,
  sortBy,
  onSortChange,
  onCreateThread,
  onBackToCategories,
}: CategoryFilterProps) {
  return (
    <div className="p-4 border-b border-gray-700 bg-gray-800/30">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {onBackToCategories && (
            <button
              type="button"
              onClick={onBackToCategories}
              className="md:hidden mb-2 text-sm text-gray-300 hover:text-white"
            >
              ← Categories
            </button>
          )}

          {category ? (
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-700 bg-gray-900/40 flex-shrink-0">
                <span className="text-lg" aria-hidden="true">{category.icon}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-white font-bold text-lg truncate">{category.name}</h2>
                  <span className="bg-gray-700/60 text-gray-200 text-xs px-2 py-0.5 rounded-full">
                    {category.threadCount} threads
                  </span>
                </div>
                <p className="text-gray-400 text-sm line-clamp-2">{category.description}</p>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-white font-bold text-lg">Select a category</h2>
              <p className="text-gray-400 text-sm">Choose a category to see threads</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SortButton label="Newest" isActive={sortBy === 'newest'} onClick={() => onSortChange('newest')} />
          <SortButton label="Top" isActive={sortBy === 'top'} onClick={() => onSortChange('top')} />
          <SortButton label="Most Replies" isActive={sortBy === 'mostReplies'} onClick={() => onSortChange('mostReplies')} />

          <button
            type="button"
            onClick={onCreateThread}
            disabled={!category}
            className={
              `ml-2 px-4 py-2 rounded-xl font-semibold border transition-colors ` +
              `${category ? 'border-cyan-500/60 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30' : 'border-gray-700 bg-gray-800/40 text-gray-500 cursor-not-allowed'}`
            }
          >
            + Create Thread
          </button>
        </div>
      </div>
    </div>
  )
})
