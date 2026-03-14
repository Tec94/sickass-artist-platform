import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { AnimatePresence, motion } from 'framer-motion'
import { api } from '../../convex/_generated/api'
import type { GalleryContentItem, GalleryViewPreferences } from '../types/gallery'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { useGalleryFilters } from '../hooks/useGalleryFilters'
import { usePerformanceMetrics, usePerformanceOperation } from '../hooks/usePerformanceMetrics'
import { useAnalytics } from '../hooks/useAnalytics'
import { trackFilterApplied, trackFilterCleared } from '../utils/analytics'
import { perfMonitor } from '../utils/performanceMonitor'
import { AdvancedFilters } from '../components/Gallery/AdvancedFilters'
import { FilterChips } from '../components/Gallery/FilterChips'
import { GalleryFYP } from '../components/Gallery/GalleryFYP'
import { LightboxContainer } from '../components/Gallery/LightboxContainer'
import { PerformanceDashboard } from '../components/Performance/PerformanceDashboard'
import { SocialGallery } from '../components/SocialGallery'
import { useTranslation } from '../hooks/useTranslation'
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference'
import {
  closeGalleryLightbox,
  hydrateGalleryPreferences,
  navigateGalleryLightbox,
  openGalleryLightbox,
  toPersistedGalleryLayoutMode,
  toggleGalleryLayoutMode,
} from './galleryState'

export const Gallery = () => {
  useAnalytics()
  usePerformanceMetrics()

  const { t } = useTranslation()
  const animate = useScrollAnimation()
  const { motionClassName, prefersReducedMotion } = useReducedMotionPreference()

  const [accumulatedItems, setAccumulatedItems] = useState<GalleryContentItem[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showPerfDashboard, setShowPerfDashboard] = useState(false)
  const [activeTab, setActiveTab] = useState<'artist' | 'community'>('artist')
  const [layoutMode, setLayoutMode] = useState<'feed' | 'grid' | 'masonry'>('feed')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [seedResult, setSeedResult] = useState<string | null>(null)
  const [hasHydratedPreferences, setHasHydratedPreferences] = useState(false)

  const seedDirect = useMutation(api.socialGallery.seedDirect)
  const upsertPreferences = useMutation(api.gallery.upsertGalleryViewPreferences)
  const preferenceQuery = useQuery(api.gallery.getGalleryViewPreferences, {}) as GalleryViewPreferences | undefined

  const filterOperation = usePerformanceOperation('gallery-filter-apply')

  const { filters, setFilter, clearFilter, queryResult, appliedCount, isActive } = useGalleryFilters()
  const isLoading = queryResult === undefined
  const data = queryResult ?? null

  const TABS = [
    { id: 'show', label: t('gallery.show'), icon: 'solar:play-circle-linear' },
    { id: 'bts', label: t('gallery.bts'), icon: 'solar:camera-linear' },
    { id: 'edit', label: t('gallery.edits'), icon: 'solar:magic-stick-linear' },
    { id: 'wip', label: t('gallery.wips'), icon: 'solar:clining-square-linear' },
    { id: 'exclusive', label: t('gallery.exclusive'), icon: 'solar:star-linear' },
  ]

  useEffect(() => {
    if (!preferenceQuery) return
    const hydrated = hydrateGalleryPreferences({ activeTab: 'artist', layoutMode: 'feed' }, preferenceQuery)
    setActiveTab(hydrated.activeTab)
    setLayoutMode(hydrated.layoutMode)
    setHasHydratedPreferences(true)
  }, [preferenceQuery])

  useEffect(() => {
    if (!preferenceQuery || !hasHydratedPreferences) return
    const nextPersistedMode = toPersistedGalleryLayoutMode(layoutMode)
    if (preferenceQuery.activeTab === activeTab && preferenceQuery.layoutMode === nextPersistedMode) return

    upsertPreferences({ activeTab, layoutMode: nextPersistedMode }).catch(() => undefined)
  }, [activeTab, hasHydratedPreferences, layoutMode, preferenceQuery, upsertPreferences])

  useEffect(() => {
    if (data?.items) {
      setAccumulatedItems((prev) => {
        const newItems = data.items.filter((item) => !prev.some((oldItem) => oldItem.contentId === item.contentId))
        return filters.page === 0 ? data.items : [...prev, ...newItems]
      })
    }
  }, [data, filters.page])

  useEffect(() => {
    setAccumulatedItems([])
  }, [filters.types, filters.dateRange, filters.creatorId, filters.fanTier, filters.tags, filters.sortBy])

  useEffect(() => {
    if (queryResult) {
      const activeFilters = [
        filters.types.length,
        filters.dateRange !== 'all' ? 1 : 0,
        filters.creatorId ? 1 : 0,
        filters.fanTier !== 'all' ? 1 : 0,
        filters.tags.length,
      ].reduce((sum, next) => sum + next, 0)

      if (activeFilters > 0) {
        perfMonitor.trackFilterApply(activeFilters, 100)
      }
    }
  }, [queryResult, filters])

  const handleTabChange = (tabId: string) => {
    filterOperation.start()

    const contentType = tabId as 'show' | 'bts' | 'edit' | 'wip' | 'exclusive'
    if (filters.types.includes(contentType)) {
      setFilter(
        'types',
        filters.types.filter((item) => item !== tabId),
      )
      trackFilterCleared('contentType')
    } else {
      setFilter('types', [...filters.types, contentType])
      trackFilterApplied('contentType', contentType)
    }
  }

  const handleLoadMore = () => {
    setFilter('page', filters.page + 1)
  }

  const handleItemClick = useCallback(
    (index: number) => {
      setLightboxIndex(openGalleryLightbox(index, accumulatedItems.length))
    },
    [accumulatedItems.length],
  )

  const handleCloseLightbox = useCallback(() => {
    setLightboxIndex(closeGalleryLightbox())
  }, [])

  useEffect(() => {
    if (lightboxIndex === null) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const nextIndex = navigateGalleryLightbox(lightboxIndex, event.key, accumulatedItems.length)
      if (nextIndex === lightboxIndex) return
      setLightboxIndex(nextIndex)
      event.preventDefault()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [accumulatedItems.length, lightboxIndex])

  const artistContentEmpty = (data?.items?.length ?? 0) === 0 && !isLoading
  const featuredItems = useMemo(
    () => accumulatedItems.filter((item) => item.pinned).slice(0, 3),
    [accumulatedItems],
  )

  return (
    <div className={`gallery-layout app-surface-page mx-auto h-full w-full max-w-[1500px] ${motionClassName}`}>
      {showMobileFilters ? (
        <AdvancedFilters onClose={() => setShowMobileFilters(false)} isModal={true} />
      ) : null}

      <div className="gallery-surface-shell motion-panel-enter flex h-full min-h-[760px]">
        {showFilters ? (
          <aside className="hidden border-r border-slate-800/80 bg-slate-950/70 md:block">
            <AdvancedFilters onClose={() => setShowFilters(false)} />
          </aside>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header ref={animate} data-animate className="px-4 pb-3 pt-8 sm:px-6">
            <div className="mb-6 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Signal Gallery</p>
              <h1 className="mt-3 text-4xl font-display font-semibold text-slate-100">{t('gallery.title')}</h1>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex rounded-xl border border-slate-700/70 bg-slate-950/80 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('artist')}
                  className={`rounded-lg px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                    activeTab === 'artist' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t('gallery.artistExclusive')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('community')}
                  className={`rounded-lg px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                    activeTab === 'community' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t('gallery.community')}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-full border border-slate-700 bg-slate-950/80 p-1">
                  {([
                    { id: 'feed', label: t('gallery.feedMode') },
                    { id: 'grid', label: t('gallery.gridMode') },
                    { id: 'masonry', label: t('gallery.masonryMode') },
                  ] as const).map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setLayoutMode(mode.id)}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                        layoutMode === mode.id
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {activeTab === 'artist' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        setShowMobileFilters(true)
                      } else {
                        setShowFilters((current) => !current)
                      }
                    }}
                    className={`relative rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                      isActive
                        ? 'border-blue-400/70 bg-blue-500/15 text-blue-200'
                        : 'border-slate-700 bg-slate-950/80 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {t('gallery.filtersLabel')}
                    {appliedCount > 0 ? (
                      <span className="ml-2 rounded-full border border-blue-300/50 bg-blue-500/25 px-2 py-0.5 text-[10px]">
                        {appliedCount}
                      </span>
                    ) : null}
                  </button>
                ) : null}

                {activeTab === 'community' ? (
                  <button
                    type="button"
                    onClick={async () => {
                      setSeedResult('Seeding...')
                      try {
                        const result = await seedDirect()
                        setSeedResult(`Seeded ${result.spotifyInserted}`)
                      } catch (error) {
                        setSeedResult(`Error: ${String(error)}`)
                      }
                    }}
                    className="rounded-lg border border-emerald-400/60 bg-emerald-500/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100 transition hover:bg-emerald-500/30"
                  >
                    {seedResult || t('gallery.seedData')}
                  </button>
                ) : null}
              </div>
            </div>

            {activeTab === 'artist' ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {TABS.map((tab) => {
                  const active = filters.types.includes(tab.id as any)
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleTabChange(tab.id)}
                    className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                      active
                          ? 'relative border-red-400/70 bg-red-500/20 text-red-100 after:absolute after:-bottom-1 after:left-2 after:right-2 after:h-[2px] after:rounded-full after:bg-red-300'
                          : 'border-slate-700 bg-slate-950/80 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <iconify-icon icon={tab.icon}></iconify-icon>
                        {tab.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : null}

            {activeTab === 'artist' && isActive ? (
              <div className="mt-3 border-t border-slate-800/70 pt-3">
                <FilterChips filters={filters} onRemove={clearFilter} />
              </div>
            ) : null}
          </header>

          <main className="flex-1 overflow-y-auto px-4 pb-6 sm:px-6">
            <AnimatePresence mode="wait">
              {activeTab === 'community' ? (
                <motion.div
                  key="community-view"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.28 }}
                >
                  <SocialGallery />
                </motion.div>
              ) : artistContentEmpty ? (
                <motion.div
                  key="artist-empty"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.24 }}
                  className="gallery-surface-card flex min-h-[340px] flex-col items-center justify-center p-10 text-center"
                >
                  <iconify-icon icon="solar:filter-linear" class="mb-3 text-4xl text-slate-500"></iconify-icon>
                  <h3 className="text-xl font-semibold text-slate-100">{t('gallery.noContentFound')}</h3>
                  <p className="mt-2 text-sm text-slate-400">{t('gallery.adjustFilters')}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setAccumulatedItems([])
                      clearFilter('types')
                      clearFilter('dateRange')
                      clearFilter('creatorId')
                      clearFilter('fanTier')
                      clearFilter('tags')
                    }}
                    className="mt-4 rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-100 transition hover:border-slate-400"
                  >
                    {t('gallery.clearAllFilters')}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key={`artist-${layoutMode}`}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.26 }}
                >
                  {featuredItems.length > 0 ? (
                    <section className="store-hero-banner mb-4 overflow-hidden p-4">
                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">{t('gallery.featuredStrip')}</p>
                          <h2 className="mt-1 text-xl font-display font-semibold text-slate-100">{t('gallery.pinnedHighlights')}</h2>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLayoutMode((current) => toggleGalleryLayoutMode(current))}
                          className="rounded-full border border-slate-600 bg-slate-900/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-200 transition hover:border-slate-400"
                        >
                          {t('gallery.cycleLayout')}
                        </button>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        {featuredItems.map((item) => {
                          const featuredIndex = accumulatedItems.findIndex((candidate) => candidate.contentId === item.contentId)
                          return (
                            <button
                              key={item.contentId}
                              type="button"
                              onClick={() => handleItemClick(Math.max(0, featuredIndex))}
                              className="group relative overflow-hidden rounded-xl border border-slate-600/70 bg-slate-950/70 text-left transition hover:border-slate-300"
                            >
                              <img src={item.thumbnailUrl || item.imageUrl} alt={item.title} className="h-32 w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                              <div className="absolute bottom-2 left-2 right-2">
                                <p className="line-clamp-1 text-sm font-semibold text-slate-100">{item.title}</p>
                                <p className="line-clamp-1 text-xs text-slate-300">{item.creator.displayName}</p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </section>
                  ) : null}

                  {layoutMode === 'feed' ? (
                    <GalleryFYP items={accumulatedItems} isLoading={isLoading} onItemClick={handleItemClick} />
                  ) : (
                    <div className={layoutMode === 'masonry' ? 'gallery-masonry motion-stagger-grid' : 'motion-stagger-grid grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'}>
                      {accumulatedItems.map((item, index) => (
                        <button
                          key={item.contentId}
                          type="button"
                          onClick={() => handleItemClick(index)}
                          className={`gallery-surface-card overflow-hidden text-left transition hover:border-slate-400 ${layoutMode === 'masonry' ? 'inline-block w-full' : ''}`}
                          style={
                            prefersReducedMotion
                              ? undefined
                              : { animationDelay: `${Math.min(index * 28, 220)}ms` }
                          }
                        >
                          <div className="relative aspect-[4/3]">
                            <img src={item.thumbnailUrl || item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <div className="absolute bottom-2 left-2 right-2">
                              <p className="line-clamp-1 text-sm font-semibold text-slate-100">{item.title}</p>
                              <p className="text-xs text-slate-300">{item.creator.displayName}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {data?.hasMore && !isLoading ? (
                    <div className="mt-8 flex justify-center">
                      <button
                        type="button"
                        onClick={handleLoadMore}
                        className="rounded-full border border-slate-600 bg-slate-900/80 px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-100 transition hover:border-slate-400"
                      >
                        {t('gallery.syncMore')}
                      </button>
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {import.meta.env.DEV ? (
        <PerformanceDashboard isOpen={showPerfDashboard} onClose={() => setShowPerfDashboard(false)} />
      ) : null}

      {lightboxIndex !== null ? (
        <LightboxContainer
          items={accumulatedItems}
          currentIndex={lightboxIndex}
          isOpen={true}
          onClose={handleCloseLightbox}
        />
      ) : null}
    </div>
  )
}
