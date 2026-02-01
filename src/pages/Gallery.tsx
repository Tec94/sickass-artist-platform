import { useState, useEffect, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { GalleryContentItem } from '../types/gallery';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useGalleryFilters } from '../hooks/useGalleryFilters';
import { usePerformanceMetrics, usePerformanceOperation } from '../hooks/usePerformanceMetrics';
import { useAnalytics } from '../hooks/useAnalytics';
import { trackFilterApplied, trackFilterCleared } from '../utils/analytics';
import { perfMonitor } from '../utils/performanceMonitor';
import { AdvancedFilters } from '../components/Gallery/AdvancedFilters';
import { FilterChips } from '../components/Gallery/FilterChips';
import { GalleryFYP } from '../components/Gallery/GalleryFYP';
import { LightboxContainer } from '../components/Gallery/LightboxContainer';
import { PerformanceDashboard } from '../components/Performance/PerformanceDashboard';
import { SocialGallery } from '../components/SocialGallery';
import { useTranslation } from '../hooks/useTranslation';

export const Gallery = () => {
  useAnalytics() // Track page views
  const [accumulatedItems, setAccumulatedItems] = useState<GalleryContentItem[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showPerfDashboard, setShowPerfDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState<'artist' | 'community'>('artist');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const animate = useScrollAnimation();
  const { t } = useTranslation();
  
  // Seed mutation for populating gallery
  const seedDirect = useMutation(api.socialGallery.seedDirect);

  // Track Web Vitals
  usePerformanceMetrics();

  // Track filter operations
  const filterOperation = usePerformanceOperation('gallery-filter-apply');

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

  const TABS = [
    { id: 'show', label: t('gallery.show'), icon: 'solar:play-circle-linear' },
    { id: 'bts', label: t('gallery.bts'), icon: 'solar:camera-linear' },
    { id: 'edit', label: t('gallery.edits'), icon: 'solar:magic-stick-linear' },
    { id: 'wip', label: t('gallery.wips'), icon: 'solar:clining-square-linear' },
    { id: 'exclusive', label: t('gallery.exclusive'), icon: 'solar:star-linear' },
  ];

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

  // Track filter operations
  useEffect(() => {
    if (queryResult) {
      const activeFilters = [
        filters.types.length,
        filters.dateRange !== 'all' ? 1 : 0,
        filters.creatorId ? 1 : 0,
        filters.fanTier !== 'all' ? 1 : 0,
        filters.tags.length,
      ].reduce((a, b) => a + b, 0);

      if (activeFilters > 0) {
        // Track filter application (time would be measured from actual filter start)
        // For now, we estimate based on query completion
        perfMonitor.trackFilterApply(activeFilters, 100);
      }
    }
  }, [queryResult, filters.types, filters.dateRange, filters.creatorId, filters.fanTier, filters.tags]);

  const handleTabChange = (tabId: string) => {
    // Start timing filter operation
    filterOperation.start();

    // Toggle tab selection
    const contentType = tabId as 'show' | 'bts' | 'edit' | 'wip' | 'exclusive';
    if (filters.types.includes(contentType)) {
      setFilter('types', filters.types.filter(t => t !== tabId));
      trackFilterCleared('contentType');
    } else {
      setFilter('types', [...filters.types, contentType]);
      trackFilterApplied('contentType', contentType);
    }
  };

  const handleLoadMore = () => {
    setFilter('page', filters.page + 1);
  };

  const handleItemClick = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

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
        <header ref={animate} data-animate className="gallery-header-v2 bg-transparent border-none pb-0 pt-8 px-8">
           <div className="w-full text-center mb-12">
             <h1 className="text-4xl font-display font-bold text-white uppercase tracking-tighter mb-8">{t('gallery.title')}</h1>
             
             {/* Main Tabs (Artist vs Community) */}
             <div className="inline-flex bg-zinc-900/50 p-1 rounded-sm border border-zinc-800 mb-8">
               <button 
                 onClick={() => {
                   setActiveTab('artist');
                   // Optional: reset filters or keep strictly separate
                 }}
                 className={`px-8 py-2.5 text-xs font-bold uppercase tracking-[0.2em] rounded-sm transition-all ${activeTab === 'artist' ? 'bg-red-700 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
               >
                 {t('gallery.artistExclusive')}
               </button>
               <button 
                 onClick={() => setActiveTab('community')}
                 className={`px-8 py-2.5 text-xs font-bold uppercase tracking-[0.2em] rounded-sm transition-all ${activeTab === 'community' ? 'bg-red-700 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
               >
                 {t('gallery.community')}
               </button>
               {activeTab === 'community' && (
                 <button 
                   onClick={async () => {
                     setSeedResult('Seeding...');
                     try {
                       const result = await seedDirect();
                       setSeedResult(`Seeded! Spotify: ${result.spotifyInserted}`);
                     } catch (e) {
                       setSeedResult(`Error: ${e}`);
                     }
                   }}
                   className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-green-600 text-white rounded-sm hover:bg-green-500 transition-all"
                 >
                   {seedResult || t('gallery.seedData')}
                 </button>
               )}
             </div>

             {/* Artist Sub Tabs */}
             {activeTab === 'artist' && (
               <div className="flex flex-wrap justify-center gap-3">
                 {TABS.map((tab) => (
                   <button
                     key={tab.id}
                     onClick={() => {
                        handleTabChange(tab.id);
                     }}
                     className={`flex items-center gap-2 px-5 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${
                       filters.types.includes(tab.id as any)
                         ? 'bg-red-600/10 border-red-600 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]'
                         : 'bg-zinc-900/30 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                     }`}
                   >
                     <iconify-icon icon={tab.icon} />
                     {tab.label}
                   </button>
                 ))}
               </div>
             )}
           </div>
           
           {/* Secondary Controls Row (Filters, Perf) - Hide if community tab ?? Actually SocialGallery has its own filters. Let's hide this row if community */}
           {activeTab === 'artist' && (
             <div className="w-full flex justify-end gap-2 mb-4 px-4">
                {/* Performance dashboard button (dev only) */}
                {import.meta.env.DEV && (
                  <button
                    onClick={() => setShowPerfDashboard(!showPerfDashboard)}
                    className="filter-toggle-btn"
                    title="Performance Dashboard"
                  >
                    <iconify-icon icon="solar:chart-square-linear" width="20" height="20"></iconify-icon>
                  </button>
                )}

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
                  aria-label="Toggle filters"
                >
                  <iconify-icon icon="solar:filter-linear" width="20" height="20"></iconify-icon>
                  {appliedCount > 0 && (
                    <span className="filter-badge">{appliedCount}</span>
                  )}
                </button>
             </div>
           )}
        </header>

        {/* Active filter chips - Only for Artist */}
        {activeTab === 'artist' && isActive && (
          <div className="px-4 py-3 border-b border-gray-800">
            <FilterChips filters={filters} onRemove={clearFilter} />
          </div>
        )}

        {/* Results count - Only for Artist */}
        {activeTab === 'artist' && data && (
          <div className="px-4 py-2 text-sm text-gray-400">
            {(data.items?.length ?? 0) === 0 ? (
              <span>{t('gallery.noResults')}</span>
            ) : (
              <span>
                {t('gallery.showing')} {accumulatedItems.length} {t('gallery.of')} {data.items?.length ?? 0} {t('common.items')}
              </span>
            )}
          </div>
        )}

        <main className="gallery-viewport flex-1">
          {activeTab === 'community' ? (
             <SocialGallery />
          ) : (
            (data?.items?.length ?? 0) === 0 && !isLoading ? (
              <div className="empty-state">
                <iconify-icon icon="solar:filter-linear" width="64" height="64" class="text-gray-600 mb-4"></iconify-icon>
                <h3 className="text-xl font-bold text-white mb-2">{t('gallery.noContentFound')}</h3>
                <p className="text-gray-400 mb-4">
                  {t('gallery.adjustFilters')}
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
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
                >
                  {t('gallery.clearAllFilters')}
                </button>
              </div>
            ) : (
              <>
                <GalleryFYP
                  items={accumulatedItems}
                  isLoading={isLoading}
                  onItemClick={handleItemClick}
                />

                {data?.hasMore && !isLoading && (
                  <div className="gallery-footer-actions">
                    <button onClick={handleLoadMore} className="load-more-btn border-beam">
                      <span>{t('gallery.syncMore')}</span>
                      <iconify-icon icon="solar:round-alt-arrow-down-linear"></iconify-icon>
                    </button>
                  </div>
                )}
              </>
            )
          )}
        </main>
      </div>

      {/* Performance Dashboard (dev only) */}
      {import.meta.env.DEV && (
        <PerformanceDashboard
          isOpen={showPerfDashboard}
          onClose={() => setShowPerfDashboard(false)}
        />
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <LightboxContainer
          items={accumulatedItems}
          currentIndex={lightboxIndex}
          isOpen={true}
          onClose={handleCloseLightbox}
        />
      )}

      <style>{`
        .gallery-layout {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          height: 100%;
        }

        .gallery-header-v2 {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 0 20px 20px 20px;
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
          border-color: #dc2626;
        }

        .filter-toggle-btn.has-filters {
          border-color: #dc2626;
          color: #dc2626;
        }

        .filter-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #dc2626;
          color: white;
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
