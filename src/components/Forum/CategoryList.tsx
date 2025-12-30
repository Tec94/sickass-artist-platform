import { memo, useMemo } from 'react'
import type { Category, Id } from '../../types/forum'

interface CategoryListProps {
  categories: Category[]
  selectedCategoryId: Id<'categories'> | null
  onSelectCategory: (categoryId: Id<'categories'>) => void
  isLoading?: boolean
}

const formatRelativeTime = (timestamp: number) => {
  const now = Date.now()
  const diff = Math.max(0, now - timestamp)
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return `${seconds}s ago`
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

export const CategoryList = memo(function CategoryList({
  categories,
  selectedCategoryId,
  onSelectCategory,
  isLoading = false,
}: CategoryListProps) {
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.order - b.order)
  }, [categories])

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center gap-3 text-gray-400">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-500" />
          <span>Loading categories...</span>
        </div>
      </div>
    )
  }

  if (sortedCategories.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-400">No categories available</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-white font-bold text-lg">Forum</h2>
        <p className="text-gray-400 text-sm">Browse categories</p>
      </div>

      <div className="divide-y divide-gray-700">
        {sortedCategories.map((category) => {
          const isSelected = selectedCategoryId === category._id
          const lastActivity = category.lastThreadAt ? formatRelativeTime(category.lastThreadAt) : 'No activity'

          return (
            <button
              key={category._id}
              type="button"
              onClick={() => onSelectCategory(category._id)}
              className={
                `w-full text-left cursor-pointer p-4 flex flex-col gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/60 ` +
                `${isSelected ? 'bg-cyan-600/20 border-l-2 border-cyan-500' : 'hover:bg-gray-700/50'}`
              }
              aria-current={isSelected ? 'true' : undefined}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-700 bg-gray-900/40 flex-shrink-0"
                    style={{ boxShadow: `0 0 0 1px ${category.color}33` }}
                    aria-hidden="true"
                  >
                    <span className="text-lg">{category.icon}</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold truncate">{category.name}</span>
                      <span className="bg-gray-700/60 text-gray-200 text-xs px-2 py-0.5 rounded-full">
                        {category.threadCount}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2">{category.description}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-gray-400">Last activity</div>
                  <div className="text-xs text-gray-200">{lastActivity}</div>
                </div>
              </div>

              <div className="flex gap-2">
                {category.requiredRole && (
                  <span className="text-xs px-2 py-1 rounded-full bg-red-600/20 text-red-200 border border-red-600/30">
                    {category.requiredRole}
                  </span>
                )}
                {category.requiredFanTier && (
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-600/20 text-amber-200 border border-amber-600/30">
                    {category.requiredFanTier}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
})
