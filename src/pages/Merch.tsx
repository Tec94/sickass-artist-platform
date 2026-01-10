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
    <div className="min-h-screen bg-[#050505] text-gray-200 selection:bg-red-600 selection:text-white">
      <MerchNavbar 
        cartCount={cartCount} 
        onOpenCart={() => setIsCartOpen(true)}
        onGoHome={() => setActiveCategory('')}
      />
      
      <main className="max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row px-4 sm:px-6 lg:px-8 pb-12">
            
            {/* Sidebar */}
            <div className="hidden md:block w-64 flex-shrink-0 pr-8 pt-8 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
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
                  <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight display-text text-white">
                    {activeCategory || 'All Products'}
                  </h2>
                  <span className="text-sm text-gray-500 font-mono">{filteredProducts.length} SIGNALS DETECTED</span>
                </div>
                <div className="w-full h-px bg-neutral-800"></div>
                
                {/* Mobile Filter Tabs */}
                <div className="md:hidden flex overflow-x-auto gap-4 py-4 scrollbar-hide">
                  {['All Products', 'apparel', 'accessories', 'music'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setActiveCategory(cat === 'All Products' ? '' : cat)}
                      className={`whitespace-nowrap px-4 py-2 rounded border text-xs font-bold uppercase ${
                        (cat === 'All Products' && !activeCategory) || activeCategory === cat 
                        ? 'bg-red-600 text-white border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.4)]' 
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
                          stock: 100, // Placeholder as we might not have stock in list view
                          category: product.category
                      }}
                       // Passing undefined to let card handle navigation default
                    />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center border border-dashed border-neutral-800 rounded-lg">
                  <p className="text-gray-500 text-lg font-mono">No signals found in this frequency.</p>
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
          name: item.productName || 'Product',
          price: item.price,
          quantity: item.quantity,
          images: item.imageUrl ? [item.imageUrl] : [],
          selectedSize: item.size,
          selectedVariant: item.color
        })) || []}
        onRemove={async (id) => {
           // Current API remove logic needs item Id, but our drawer passes variantId as Id usually. 
           // Let's assume we need to find the cart item ID.
           // Simplified for this port: we might need a specific mutation for removal by variantId or cartItemId
           showToast('Remove functionality requires API update', { type: 'error' })
        }}
      />
    </div>
  )
}
