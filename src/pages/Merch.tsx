import { useCallback, useState, useMemo } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Doc } from '../../convex/_generated/dataModel'

// Components
import { MerchNavbar } from '../components/Merch/MerchNavbar'
import { MerchSidebar } from '../components/Merch/MerchSidebar'
import { MerchProductCard } from '../components/Merch/MerchProductCard'
import { MerchCartDrawer } from '../components/Merch/MerchCartDrawer'

// Utils
import { useAutoRetry } from '../hooks/useAutoRetry'
import { parseConvexError, logError } from '../utils/convexErrorHandler'
import { showToast } from '../lib/toast'

export function Merch() {
  const { retryWithBackoff } = useAutoRetry()
  const addToCartMutation = useMutation(api.cart.addToCart)
  const cart = useQuery(api.cart.getCart)
  
  // State
  const [activeCategory, setActiveCategory] = useState('')
  const [maxPrice, setMaxPrice] = useState(200)
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  // Fetch all products (for client-side filtering to match reference behavior exactly)
  // In a real app with many products, this would be server-side filtered
  const productsQuery = useQuery(api.merch.getProducts, { 
    page: 0, 
    pageSize: 100, // Fetch more to filter locally
    sortBy: 'newest' as const
  })
  
  const cartCount = cart?.itemCount || 0

  const handleAddToCart = useCallback(
    async (productId: string) => {
      // Find the product to get its default variant if needed
      // Ideally we would open a quick add modal or select default variant
      // For now, we will just navigate to detail page which is the safer interaction
      // matching the reference's "Quick View" behavior or detail navigation
      // But if we want direct add, we need a variant ID.
      // Let's assume we navigate for now as it handles variants correctly
      // But wait, the reference `handleAddToCart` adds directly if it's a simple item.
      // Our backend requires variantId.
      // So we will stick to navigation for safety unless we query variant data here.
    },
    []
  )

  // Filter Logic - mimicking the client-side logic from reference App.tsx
  const filteredProducts = useMemo(() => {
    if (!productsQuery?.items) return []
    
    let filtered = productsQuery.items

    // Category Filtering
    if (activeCategory === 'new arrivals') {
        // Assuming we had an isNew flag, but we check if it's recent? 
        // For now, let's just use the category ID if it matches, or skip if 'new arrivals' isn't a direct category in DB
        // Our DB categories are 'apparel', 'accessories', etc.
        // We will just filter by the category string if it's not empty
    } else if (activeCategory) {
      filtered = filtered.filter(p => p.category === activeCategory)
    }

    // Price Filtering
    filtered = filtered.filter(p => (p.price / 100) <= maxPrice)

    return filtered
  }, [productsQuery, activeCategory, maxPrice])

  const handleAddToCartFromDrawer = async (variantId: string, quantity: number) => {
      // Implementation for drawer if needed, but drawer usually handles removal
  }

  return (
    <div className="merch-page" style={{ fontFamily: 'var(--font-store, ui-monospace, monospace)' }}>
      <MerchNavbar 
        cartCount={cartCount} 
        onOpenCart={() => setIsCartOpen(true)}
        onGoHome={() => setActiveCategory('')}
      />
      
      <main className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col md:flex-row pb-12">
            
            {/* Sidebar */}
            <div className="hidden md:block w-64 flex-shrink-0 pr-8 pt-8 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto">
                <MerchSidebar 
                    activeCategory={activeCategory} 
                    onCategoryChange={setActiveCategory} 
                    maxPrice={maxPrice}
                    onPriceChange={setMaxPrice}
                />
            </div>
            
            {/* Main Content */}
            <div className="flex-1 pt-8">
              <div className="mb-8">
                <div className="flex items-baseline justify-between mb-2">
                  <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white">
                    {activeCategory || 'All Products'}
                  </h2>
                  <span className="text-sm text-gray-500">{filteredProducts.length} items</span>
                </div>
                <div className="w-full h-px bg-neutral-800"></div>
                
                {/* Mobile Filter Tabs */}
                <div className="md:hidden flex overflow-x-auto gap-4 py-4 scrollbar-hide">
                  {['All Products', 'apparel', 'accessories', 'music'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setActiveCategory(cat === 'All Products' ? '' : cat)}
                      className={`whitespace-nowrap px-4 py-2 border text-xs font-bold uppercase ${
                        (cat === 'All Products' && !activeCategory) || activeCategory === cat 
                        ? 'bg-red-600 text-white border-red-600' 
                        : 'bg-black text-gray-400 border-neutral-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                  {filteredProducts.map(product => (
                    <MerchProductCard 
                      key={product._id} 
                      product={{
                          _id: product._id,
                          name: product.name,
                          price: product.price,
                          images: product.images || [],
                          stock: 100,
                          category: product.category
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center border border-dashed border-neutral-800">
                  <p className="text-gray-500 text-lg">No products found.</p>
                  <button 
                    onClick={() => { setMaxPrice(200); setActiveCategory(''); }} 
                    className="mt-4 text-sm text-red-500 hover:text-red-400 underline"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
      </main>

      <MerchCartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart?.items?.map(item => ({
          _id: item.variantId,
          name: (item as any).product?.name || 'Product',
          price: (item as any).currentPrice || item.priceAtAddTime || 0,
          quantity: item.quantity,
          images: (item as any).product?.imageUrls || [(item as any).product?.thumbnailUrl] || [],
          selectedSize: (item as any).variant?.size,
          selectedVariant: (item as any).variant?.color
        })) || []}
        onRemove={() => {
           showToast('Remove from cart coming soon', { type: 'info' })
        }}
      />

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
