import { memo, useMemo } from 'react'
import type { Category, Id } from '../../types/forum'

interface CategoryListProps {
  categories: Category[]
  selectedCategoryId: Id<'categories'> | null
  onSelectCategory: (categoryId: Id<'categories'>) => void
  isLoading?: boolean
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
      <div className="hub-sidebar-loading">
        <iconify-icon icon="solar:spinner-bold" className="spin"></iconify-icon>
        <span>Syncing Hub...</span>
      </div>
    )
  }

  return (
    <div className="hub-sidebar">
      <div className="hub-sidebar-header">
        <h2 className="hub-title">The Hub</h2>
        <div className="hub-status"><span className="dot"></span> Online</div>
      </div>

      <div className="hub-channels">
        {sortedCategories.map((category) => {
          const isSelected = selectedCategoryId === category._id
          return (
            <button
              key={category._id}
              type="button"
              onClick={() => onSelectCategory(category._id)}
              className={`hub-channel-btn ${isSelected ? 'active' : ''}`}
              aria-current={isSelected ? 'true' : undefined}
            >
              <div className="channel-icon-wrapper">
                 <iconify-icon icon={category.icon?.includes(':') ? category.icon : 'solar:hashtag-square-linear'}></iconify-icon>
              </div>
              <div className="channel-info">
                <span className="channel-name">{category.name}</span>
                <span className="channel-meta">{category.threadCount} active</span>
              </div>
              {isSelected && <div className="active-indicator" />}
            </button>
          )
        })}
      </div>

      <style>{`
        .hub-sidebar {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: rgba(5, 5, 5, 0.5);
        }

        .hub-sidebar-header {
          padding: 24px;
          border-bottom: 1px solid var(--color-card-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .hub-title {
          font-size: 18px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0;
        }

        .hub-status {
          font-size: 10px;
          font-weight: 700;
          color: #39FF14;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .hub-status .dot {
          width: 6px;
          height: 6px;
          background: currentColor;
          border-radius: 50%;
          box-shadow: 0 0 10px currentColor;
        }

        .hub-channels {
          flex: 1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .hub-channel-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          background: transparent;
          border: none;
          color: var(--color-text-dim);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          text-align: left;
        }

        .hub-channel-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .hub-channel-btn.active {
          background: rgba(255, 0, 0, 0.1);
          color: white;
        }

        .channel-icon-wrapper {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: var(--color-primary);
        }

        .channel-info {
          display: flex;
          flex-direction: column;
        }

        .channel-name {
          font-size: 14px;
          font-weight: 600;
        }

        .channel-meta {
          font-size: 11px;
          opacity: 0.5;
        }

        .active-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: var(--color-primary);
          border-radius: 0 4px 4px 0;
          box-shadow: 0 0 10px var(--color-primary);
        }

        .hub-sidebar-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          gap: 12px;
          color: var(--color-text-dim);
        }

        .spin { animation: rotate 2s linear infinite; font-size: 24px; color: var(--color-primary); }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
})
