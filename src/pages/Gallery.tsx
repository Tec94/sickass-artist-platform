import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useSearchParams } from 'react-router-dom';
import { GalleryFYP } from '../components/Gallery/GalleryFYP';
import type { GalleryContentItem } from '../types/gallery';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const TABS = [
  { id: 'show', label: 'Show', icon: 'solar:play-circle-linear' },
  { id: 'bts', label: 'BTS', icon: 'solar:camera-linear' },
  { id: 'edit', label: 'Edits', icon: 'solar:magic-stick-linear' },
  { id: 'wip', label: 'WIPs', icon: 'solar:clining-square-linear' },
  { id: 'exclusive', label: 'Exclusive', icon: 'solar:star-linear' },
];

export const Gallery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'show';
  const sortBy = (searchParams.get('sort') || 'newest') as 'newest' | 'oldest' | 'mostLiked';
  const tierFilter = searchParams.get('tier') || 'all';
  const [page, setPage] = useState(0);
  const [accumulatedItems, setAccumulatedItems] = useState<GalleryContentItem[]>([]);
  const pageSize = 12;
  const animate = useScrollAnimation();

  const queryResult = useQuery(
    api.gallery.getGalleryContent,
    { 
      type: activeTab, 
      page, 
      pageSize,
      sortBy,
      tier: tierFilter
    }
  );

  const isLoading = queryResult === undefined;
  const data = queryResult ?? null;

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

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="gallery-layout h-full flex flex-col">
      <header ref={animate} data-animate className="gallery-header-v2">
        <div className="header-meta">
          <h1 className="h1-title">Visual Feed</h1>
          <p className="sub-text">Captured moments and exclusive insights</p>
        </div>
        
        <nav className="gallery-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`gallery-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              <iconify-icon icon={tab.icon}></iconify-icon>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="gallery-viewport">
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
      </main>

      <style>{`
        .gallery-layout {
          width: 100%;
        }

        .gallery-header-v2 {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
          gap: 20px;
          flex-wrap: wrap;
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

        .gallery-tab-btn:hover { color: white; background: rgba(255, 255, 255, 0.05); }

        .gallery-tab-btn.active {
          background: var(--color-primary);
          color: white;
          box-shadow: 0 4px 12px rgba(255, 0, 0, 0.3);
        }

        .gallery-viewport {
          flex: 1;
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
          .gallery-header-v2 { flex-direction: column; align-items: flex-start; }
          .gallery-tabs { width: 100%; overflow-x: auto; padding-bottom: 8px; }
        }
      `}</style>
    </div>
  );
};
