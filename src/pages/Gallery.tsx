import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useSearchParams } from 'react-router-dom';
import { GalleryGrid } from '../components/Gallery/GalleryGrid';
import { GalleryContentItem } from '../types/gallery';

const TABS = [
  { id: 'show', label: 'Show' },
  { id: 'bts', label: 'BTS' },
  { id: 'edit', label: 'Edits' },
  { id: 'wip', label: 'WIPs' },
  { id: 'exclusive', label: 'Exclusive' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'mostLiked', label: 'Most Liked' },
];

const FILTER_OPTIONS = [
  { id: 'all', label: 'All Tiers' },
  { id: 'bronze', label: 'Bronze+' },
  { id: 'silver', label: 'Silver+' },
  { id: 'gold', label: 'Gold+' },
  { id: 'platinum', label: 'Platinum' },
];

export const Gallery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'show';
  const sortBy = (searchParams.get('sort') || 'newest') as 'newest' | 'oldest' | 'mostLiked';
  const tierFilter = searchParams.get('tier') || 'all';
  const [page, setPage] = useState(0);
  const [accumulatedItems, setAccumulatedItems] = useState<GalleryContentItem[]>([]);
  const pageSize = 12;

  const { data, isLoading, error } = useQuery(
    api.gallery.getGalleryContent,
    { 
      type: activeTab, 
      page, 
      pageSize,
      sortBy,
      tier: tierFilter
    }
  );

  // Reset page and accumulated items when tab, sort, or tier changes
  useEffect(() => {
    setPage(0);
    setAccumulatedItems([]);
  }, [activeTab, sortBy, tierFilter]);

  useEffect(() => {
    if (data?.items) {
      setAccumulatedItems(prev => {
        const newItems = data.items.filter(
          item => !prev.some(p => p.contentId === item.contentId)
        );
        return page === 0 ? data.items : [...prev, ...newItems];
      });
    }
  }, [data, page]);

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId, sort: sortBy, tier: tierFilter });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchParams({ tab: activeTab, sort: e.target.value, tier: tierFilter });
  };

  const handleTierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchParams({ tab: activeTab, sort: sortBy, tier: e.target.value });
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleRetry = () => {
    // Convex useQuery automatically retries, but we can trigger a state change if needed
    // or just rely on it. Here we just re-render by setting page to same value
    setPage(p => p);
  };

  return (
    <div className="gallery-page-container">
      <header className="gallery-header">
        <div className="header-top">
          <h1 className="page-title">Gallery</h1>
          <div className="controls-container">
            <div className="control-group">
              <label htmlFor="sort-select">Sort:</label>
              <select 
                id="sort-select" 
                value={sortBy} 
                onChange={handleSortChange}
                className="select-input"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="control-group">
              <label htmlFor="filter-select">Filter:</label>
              <select 
                id="filter-select" 
                value={tierFilter} 
                onChange={handleTierChange}
                className="select-input"
              >
                {FILTER_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <nav className="tab-navigation">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="gallery-content">
        <GalleryGrid
          items={accumulatedItems}
          isLoading={isLoading}
          error={error}
          onRetry={handleRetry}
        />

        {data?.hasMore && !isLoading && !error && (
          <div className="load-more-container">
            <button onClick={handleLoadMore} className="load-more-button">
              Load More
            </button>
          </div>
        )}
      </main>

      <style>{`
        .gallery-page-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          color: var(--color-text);
        }

        .gallery-header {
          margin-bottom: 32px;
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .page-title {
          font-size: 32px;
          margin: 0;
          color: var(--color-primary);
          text-transform: uppercase;
          letter-spacing: 2px;
          text-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
        }

        .controls-container {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .select-input {
          background: rgba(28, 31, 46, 0.8);
          border: 1px solid var(--color-accent);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          outline: none;
          font-size: 14px;
        }

        .select-input:focus {
          border-color: var(--color-primary);
        }

        .tab-navigation {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid rgba(139, 15, 255, 0.3);
          padding-bottom: 1px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .tab-navigation::-webkit-scrollbar {
          display: none;
        }

        .tab-button {
          background: transparent;
          border: none;
          color: #888;
          padding: 12px 24px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 2px solid transparent;
          white-space: nowrap;
        }

        .tab-button:hover {
          color: var(--color-primary);
        }

        .tab-button.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
          background: rgba(0, 217, 255, 0.1);
        }

        .gallery-content {
          min-height: 400px;
        }

        .error-state {
          text-align: center;
          padding: 48px;
          color: var(--color-secondary);
        }

        .retry-button {
          margin-top: 16px;
          background: var(--color-secondary);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 4px;
          cursor: pointer;
        }

        .load-more-container {
          display: flex;
          justify-content: center;
          margin-top: 40px;
        }

        .load-more-button {
          background: transparent;
          border: 1px solid var(--color-primary);
          color: var(--color-primary);
          padding: 12px 32px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: bold;
        }

        .load-more-button:hover {
          background: var(--color-primary);
          color: black;
          box-shadow: 0 0 15px rgba(0, 217, 255, 0.5);
        }

        @media (max-width: 768px) {
          .header-top {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .tab-navigation {
            flex-wrap: wrap;
          }

          .tab-button {
            padding: 10px 16px;
            font-size: 14px;
            flex: 1 1 auto;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};
