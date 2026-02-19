import { useCallback, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

// Components
import { MerchSidebar } from '../components/Merch/MerchSidebar'
import { MerchProductCard } from '../components/Merch/MerchProductCard'
import { FreeShippingBanner } from '../components/Merch/FreeShippingBanner'
import { useTranslation } from '../hooks/useTranslation'
import { getMerchSlugCandidates } from '../utils/merchImages'
import { resolveMerchManifestEntries } from '../utils/merchManifestClient'

export function Merch() {
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()
  
  // State
  const [activeCategory, setActiveCategory] = useState('')
  const [maxPrice, setMaxPrice] = useState(200)
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'alpha'>('newest')
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all')
  
  // Search query from URL
  const searchQuery = searchParams.get('search') || ''
  
  // Fetch all products
  const productsQuery = useQuery(api.merch.getProducts, { 
    page: 0, 
    pageSize: 100,
    sortBy: 'newest' as const
  })
  const handleCollectionToggle = useCallback((collection: string) => {
    setSelectedCollections(prev => 
      prev.includes(collection)
        ? prev.filter(c => c !== collection)
        : [...prev, collection]
    )
  }, [])

  // Filter Logic
  const filteredProducts = useMemo(() => {
    if (!productsQuery?.items) return []
    
    let filtered = productsQuery.items

    // Search Filtering
    if (searchQuery) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }

    // Category Filtering
    if (activeCategory === 'new arrivals') {
        // Show all
    } else if (activeCategory) {
      filtered = filtered.filter(p => p.category === activeCategory)
    }

    // Collection (Tags) Filtering
    if (selectedCollections.length > 0) {
      filtered = filtered.filter(p => 
        p.tags.some(tag => selectedCollections.includes(tag.toLowerCase()))
      )
    }

    // Price Filtering
    filtered = filtered.filter(p => (p.price / 100) <= maxPrice)

    // Stock Status Filtering
    if (stockFilter === 'in-stock') {
      filtered = filtered.filter(p => p.variants?.some(v => v.stock > 0) ?? true)
    } else if (stockFilter === 'out-of-stock') {
      filtered = filtered.filter(p => p.variants?.every(v => v.stock === 0) ?? false)
    }

    // Sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'alpha':
          return a.name.localeCompare(b.name)
        case 'newest':
        default:
          return (b._creationTime || 0) - (a._creationTime || 0)
      }
    })

    return filtered
  }, [productsQuery, activeCategory, maxPrice, selectedCollections, searchQuery, sortBy, stockFilter])

  const manifestSlugs = useMemo(() => {
    if (!filteredProducts.length) return []
    const slugs = filteredProducts.flatMap((product) => getMerchSlugCandidates({
      name: product.name,
      imageUrls: product.imageUrls,
      thumbnailUrl: product.thumbnailUrl,
      category: product.category,
      tags: product.tags,
      variants: product.variants,
    }))
    return Array.from(new Set(slugs))
  }, [filteredProducts])

  const merchManifestEntries = useQuery(
    api.merchManifest.getMerchImageManifestEntries,
    manifestSlugs.length ? { slugs: manifestSlugs } : 'skip'
  )
  const resolvedManifestEntries = useMemo(
    () => resolveMerchManifestEntries(manifestSlugs, merchManifestEntries?.entries ?? null),
    [manifestSlugs, merchManifestEntries?.entries]
  )

  // Category labels for mobile tabs
  const categoryLabels: Record<string, string> = {
    'All Products': t('store.allProducts'),
    'apparel': t('store.apparel'),
    'accessories': t('store.accessories'),
    'music': t('store.music'),
  }

  return (
    <div className="merch-page" style={{ fontFamily: 'var(--font-store, ui-monospace, monospace)' }}>
      {/* Free Shipping Banner */}
      <FreeShippingBanner />

      <main className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-fade-in">
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Sidebar */}
            <div className="hidden md:block w-64 flex-shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
                <MerchSidebar 
                    activeCategory={activeCategory} 
                    onCategoryChange={setActiveCategory} 
                    maxPrice={maxPrice}
                    onPriceChange={setMaxPrice}
                    selectedCollections={selectedCollections}
                    onCollectionToggle={handleCollectionToggle}
                />
            </div>
            
            {/* Main Content */}
            <div className="flex-1">
              {/* Virtual Queue Banner (from roa-wolves) */}
              <div className="bg-gradient-to-r from-red-900/20 to-zinc-900 border border-red-900/30 p-4 mb-8 flex items-center justify-between">
                <div>
                  <h3 className="text-red-500 font-display font-bold uppercase tracking-wider text-sm">{t('store.upcomingDrop')}</h3>
                  <p className="text-zinc-400 text-xs mt-1">{t('store.virtualQueue')}</p>
                </div>
                <button className="bg-zinc-800 text-white text-xs font-bold uppercase px-4 py-2 hover:bg-red-700 transition-colors">
                  {t('store.setReminder')}
                </button>
              </div>

              {/* Filters & Sort Bar */}
              <div className="flex flex-wrap items-center gap-6 mb-8 py-4 border-b border-neutral-800">
                {/* Sort Dropdown */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">{t('store.sortBy')}</label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="appearance-none bg-zinc-950 border border-zinc-700 text-white text-xs font-medium pl-3 pr-8 py-2.5 focus:outline-none focus:border-red-600 hover:border-zinc-500 cursor-pointer transition-colors min-w-[160px]"
                    >
                      <option value="newest">{t('store.newestArrivals')}</option>
                      <option value="price-asc">{t('store.priceLowHigh')}</option>
                      <option value="price-desc">{t('store.priceHighLow')}</option>
                      <option value="alpha">{t('store.alphabetical')}</option>
                    </select>
                    <iconify-icon icon="solar:alt-arrow-down-linear" class="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" width="14" height="14"></iconify-icon>
                  </div>
                </div>

                {/* Stock Status Filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">{t('store.availability')}</label>
                  <div className="relative">
                    <select
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)}
                      className="appearance-none bg-zinc-950 border border-zinc-700 text-white text-xs font-medium pl-3 pr-8 py-2.5 focus:outline-none focus:border-red-600 hover:border-zinc-500 cursor-pointer transition-colors min-w-[130px]"
                    >
                      <option value="all">{t('store.allItems')}</option>
                      <option value="in-stock">{t('store.inStock')}</option>
                      <option value="out-of-stock">{t('store.outOfStock')}</option>
                    </select>
                    <iconify-icon icon="solar:alt-arrow-down-linear" class="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" width="14" height="14"></iconify-icon>
                  </div>
                </div>

                <div className="ml-auto text-xs text-zinc-500 font-medium">{filteredProducts.length} {t('common.items')}</div>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline justify-between mb-2">
                  <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white">
                    {searchQuery ? `${t('common.search')}: "${searchQuery}"` : (activeCategory || t('store.allProducts'))}
                  </h2>
                </div>
                
                {/* Mobile Filter Tabs */}
                <div className="md:hidden flex overflow-x-auto gap-4 py-4 scrollbar-hide">
                  {['All Products', 'apparel', 'accessories', 'music'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setActiveCategory(cat === 'All Products' ? '' : cat)}
                      className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold uppercase transition-all ${
                        (cat === 'All Products' && !activeCategory) || activeCategory === cat 
                        ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      {categoryLabels[cat] || cat}
                    </button>
                  ))}
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                  {filteredProducts.map(product => (
                    <MerchProductCard 
                      key={product._id} 
                      product={product as any}
                      manifest={resolvedManifestEntries}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-32 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                  <iconify-icon icon="solar:box-minimalistic-broken" width="48" height="48" class="text-zinc-600 mb-4 mx-auto block"></iconify-icon>
                  <h3 className="text-white font-bold text-xl mb-2">{t('store.noProductsFound')}</h3>
                  <p className="text-zinc-500 text-sm max-w-xs mx-auto mb-6">
                    {t('store.tryAdjustingFilters')}
                  </p>
                  <button 
                    onClick={() => { setMaxPrice(200); setActiveCategory(''); setStockFilter('all'); setSelectedCollections([]); }} 
                    className="inline-flex items-center gap-2 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                  >
                    <iconify-icon icon="solar:restart-bold" width="14"></iconify-icon>
                    {t('common.resetFilters')}
                  </button>
                </div>
              )}
              
              {/* Pagination / Load More (Visual only for now matching roa-wolves style) */}
              <div className="mt-16 flex justify-center">
                 <button className="text-zinc-500 hover:text-white uppercase text-xs tracking-[0.2em] border-b border-transparent hover:border-red-600 transition-all pb-1">
                   {t('store.loadMoreProducts')}
                 </button>
              </div>
            </div>
          </div>
      </main>



      <style>{`
        .merch-page {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow-y: auto;
          background: #050505;
          color: #e5e5e5;
        }
      `}</style>
    </div>
  )
}
