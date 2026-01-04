import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import type { GalleryContentItem } from '../types/gallery';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useGalleryFilters } from '../hooks/useGalleryFilters';
import { AdvancedFilters } from '../components/Gallery/AdvancedFilters';
import { FilterChips } from '../components/Gallery/FilterChips';
import { GalleryFYP } from '../components/Gallery/GalleryFYP';

const TABS = [
  { id: 'show', label: 'Show', icon: 'solar:play-circle-linear' },
  { id: 'bts', label: 'BTS', icon: 'solar:camera-linear' },
  { id: 'edit', label: 'Edits', icon: 'solar:magic-stick-linear' },
  { id: 'wip', label: 'WIPs', icon: 'solar:clining-square-linear' },
  { id: 'exclusive', label: 'Exclusive', icon: 'solar:star-linear' },
];

export const Gallery = () => {
  const [accumulatedItems, setAccumulatedItems] = useState<GalleryContentItem[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const animate = useScrollAnimation();
  
  const { 
    filters, 
    setFilter, 
    clearFilter, 
    queryResult, 
    appliedCount, 
    isActive 
  } = useGalleryFilters();

  const isLoading = queryResult === undefined;
  const data = queryResult ?? null;

  // Accumulate items for infinite scroll
  useEffect(() => {
    if (data?.items) {
      setAccumulatedItems(prev => {
        const newItems = data.items.filter(
          item => !prev.some(p => p.contentId === item.contentId)
        );
        return filters.page === 0 ? data.items : [...prev, ...newItems];
      });
    }
  }, [data, filters.page]);

  // Reset accumulated items when filters change
  useEffect(() => {
    setAccumulatedItems([]);
  }, [filters.types, filters.dateRange, filters.creatorId, filters.fanTier, filters.tags, filters.sortBy]);

  const handleTabChange = (tabId: string) => {
    // Toggle tab selection
    const contentType = tabId as 'show' | 'bts' | 'edit' | 'wip' | 'exclusive';
    if (filters.types.includes(contentType)) {
      setFilter('types', filters.types.filter(t => t !== tabId));
    } else {
      setFilter('types', [...filters.types, contentType]);
    }
  };

  const handleLoadMore = () => {
    setFilter('page', filters.page + 1);
  };

  return (
    <div className="gallery-layout h-full flex">
      {/* Desktop filter sidebar */}
      {showFilters && (
        <aside className="hidden md:block">
          <AdvancedFilters onClose={() => setShowFilters(false)} />
        </aside>
      )}

      {/* Mobile filter modal */}
      {showMobileFilters && (
        <AdvancedFilters 
          onClose={() => setShowMobileFilters(false)} 
          isModal={true}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header ref={animate} data-animate className="gallery-header-v2">
          <div className="header-meta">
            <h1 className="h1-title">Visual Feed</h1>
            <p className="sub-text">Captured moments and exclusive insights</p>
          </div>
          
          <div className="flex items-center gap-3">
            <nav className="gallery-tabs">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  className={`gallery-tab-btn ${filters.types.includes(tab.id as 'show' | 'bts' | 'edit' | 'wip' | 'exclusive') ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  <iconify-icon icon={tab.icon}></iconify-icon>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Filter toggle button */}
            <button
              onClick={() => {
                if (window.innerWidth < 768) {
                  setShowMobileFilters(true);
                } else {
                  setShowFilters(!showFilters);
                }
              }}
              className={`filter-toggle-btn ${isActive ? 'has-filters' : ''}`}
              title="Toggle filters"
            >
              <Filter className="w-5 h-5" />
              {appliedCount > 0 && (
                <span className="filter-badge">{appliedCount}</span>
              )}
            </button>
          </div>
        </header>

        {/* Active filter chips */}
        {isActive && (
          <div className="px-4 py-3 border-b border-gray-800">
            <FilterChips filters={filters} onRemove={clearFilter} />
          </div>
        )}

        {/* Results count */}
        {data && (
          <div className="px-4 py-2 text-sm text-gray-400">
            {data.total === 0 ? (
              <span>No results found</span>
            ) : (
              <span>
                Showing {accumulatedItems.length} of {data.total} items
              </span>
            )}
          </div>
        )}

        <main className="gallery-viewport flex-1">
          {data?.total === 0 && !isLoading ? (
            <div className="empty-state">
              <Filter className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No content found</h3>
              <p className="text-gray-400 mb-4">
                Try adjusting your filters to see more content
              </p>
              <button
                onClick={() => {
                  setAccumulatedItems([]);
                  clearFilter('types');
                  clearFilter('dateRange');
                  clearFilter('creatorId');
                  clearFilter('fanTier');
                  clearFilter('tags');
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <GalleryFYP
                items={accumulatedItems}
                isLoading={isLoading}
              />

              {data?.hasMore && !isLoading && (
                <div className="gallery-footer-actions">
                  <button onClick={handleLoadMore} className="load-more-btn border-beam">
                    <span>Sync More</span>
                    <iconify-icon icon="solar:round-alt-arrow-down-linear"></iconify-icon>
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <style>{`
        .gallery-layout {
          width: 100%;
          height: 100%;
        }

        .gallery-header-v2 {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 20px;
          gap: 20px;
          flex-wrap: wrap;
          border-bottom: 1px solid var(--color-card-border);
        }

        .h1-title {
          font-size: 28px;
          font-weight: 800;
          color: white;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin: 0;
        }

        .sub-text {
          font-size: 13px;
          color: var(--color-text-dim);
          font-weight: 600;
          margin: 4px 0 0 0;
        }

        .gallery-tabs {
          display: flex;
          gap: 8px;
          background: rgba(255, 255, 255, 0.03);
          padding: 4px;
          border-radius: 12px;
          border: 1px solid var(--color-card-border);
        }

        .gallery-tab-btn {
          background: transparent;
          border: none;
          color: var(--color-text-dim);
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .gallery-tab-btn:hover { 
          color: white; 
          background: rgba(255, 255, 255, 0.05); 
        }

        .gallery-tab-btn.active {
          background: var(--color-primary);
          color: white;
          box-shadow: 0 4px 12px rgba(255, 0, 0, 0.3);
        }

        .filter-toggle-btn {
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--color-card-border);
          color: var(--color-text-dim);
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .filter-toggle-btn:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
          border-color: cyan;
        }

        .filter-toggle-btn.has-filters {
          border-color: cyan;
          color: cyan;
        }

        .filter-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: cyan;
          color: black;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
        }

        .gallery-viewport {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
        }

        .gallery-footer-actions {
          display: flex;
          justify-content: center;
          padding: 40px 0;
        }

        .load-more-btn {
          background: rgba(10, 10, 10, 0.4);
          border: 1px solid var(--color-card-border);
          color: white;
          padding: 12px 32px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s ease;
        }

        .load-more-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--color-primary);
        }

        @media (max-width: 768px) {
          .gallery-header-v2 { 
            flex-direction: column; 
            align-items: flex-start; 
          }
          .gallery-tabs { 
            width: 100%; 
            overflow-x: auto; 
            padding-bottom: 8px; 
          }
        }
      `}</style>
    </div>
  );
};
