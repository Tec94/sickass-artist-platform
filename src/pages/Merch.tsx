import { useCallback, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Doc } from '../../convex/_generated/dataModel'
import { MerchFilters } from '../components/Merch/MerchFilters'
import { ProductGrid } from '../components/Merch/ProductGrid'
import { ProductCard } from '../components/Merch/ProductCard'
import { useMerchFilters } from '../hooks/useMerchFilters'
import { useAutoRetry } from '../hooks/useAutoRetry'
import { parseConvexError, logError } from '../utils/convexErrorHandler'
import { showToast } from '../lib/toast'
import { 
  ShoppingCart, 
  Package, 
  Flame, 
  Sparkles, 
  Star,
  ChevronRight,
  Filter,
  X,
  Cross
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Category data for visual sections
const categories = [
  { id: 'apparel', name: 'Apparel', icon: '👕', description: 'T-shirts, hoodies & more', gradient: 'from-[#8b0000] to-[#5a0000]' },
  { id: 'accessories', name: 'Accessories', icon: '🎧', description: 'Hats, bags & essentials', gradient: 'from-[#1a1a1a] to-[#0a0a0a]' },
  { id: 'vinyl', name: 'Vinyl', icon: '📀', description: 'Limited edition records', gradient: 'from-[#2d1810] to-[#1a0f0a]' },
  { id: 'limited', name: 'Limited Edition', icon: '⭐', description: 'Exclusive collectibles', gradient: 'from-[#3d1818] to-[#1a0a0a]' },
]

export function Merch() {
  const navigate = useNavigate()
  const { filters, setFilter, resetFilters } = useMerchFilters()
  const { retryWithBackoff } = useAutoRetry()
  const addToCartMutation = useMutation(api.cart.addToCart)
  const cart = useQuery(api.cart.getCart)
  const [showFilters, setShowFilters] = useState(false)
  
  // Fetch trending products for the featured section
  const trendingProducts = useQuery(api.merch.getProducts, { 
    page: 0, 
    pageSize: 6,
    sortBy: 'newest' as const
  })
  
  const cartCount = cart?.itemCount || 0

  const handleAddToCart = useCallback(
    async (variantId: string, quantity: number) => {
      try {
        await retryWithBackoff(() =>
          addToCartMutation({
            variantId: variantId as Doc<'merchVariants'>['_id'],
            quantity,
          })
        )
        showToast('Added to cart!', { type: 'success' })
      } catch (err) {
        const parsed = parseConvexError(err)
        logError(parsed, {
          component: 'Merch',
          action: 'add_to_cart',
        })
        showToast(parsed.userMessage, { type: 'error' })
      }
    },
    [addToCartMutation, retryWithBackoff]
  )

  const handleCategoryClick = (categoryId: string) => {
    setFilter('category', categoryId)
    // Scroll to products section
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Premium Header with Glass Effect */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                STORE
              </h1>
              <span className="hidden sm:inline-block text-xs text-[#808080] border-l border-[#2a2a2a] pl-4">
                Official Artist Merchandise
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden p-2.5 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg transition-colors"
              >
                <Filter className="w-5 h-5 text-gray-300" />
              </button>

              {/* Orders button */}
              <button
                onClick={() => navigate('/merch/orders')}
                className="p-2.5 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg transition-all duration-200 group"
                title="Order History"
              >
                <Package className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </button>

              {/* Cart button */}
              <button
                onClick={() => navigate('/merch/cart')}
                className="relative p-2.5 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg transition-all duration-200 group"
              >
                <ShoppingCart className="w-5 h-5 text-[#c41e3a] group-hover:text-[#ff3355] transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#c41e3a] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Featured Product */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0505] via-[#0a0a0a] to-[#0a0a0a]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8b0000] rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#5a0000] rounded-full blur-[100px]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#c41e3a]/10 border border-[#c41e3a]/30 rounded-full text-[#c41e3a] text-sm">
                <Cross className="w-4 h-4" />
                New Collection Available
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black leading-tight">
                Exclusive
                <span className="block text-[#c41e3a]">Artist Merch</span>
              </h2>
              
              <p className="text-gray-400 text-lg max-w-md">
                Limited edition pieces crafted for true fans. Each item tells a story.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-3 bg-[#c41e3a] hover:bg-[#a01830] rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                >
                  Shop Now
                </button>
                <button 
                  onClick={() => handleCategoryClick('limited')}
                  className="px-8 py-3 bg-transparent border border-[#2a2a2a] hover:border-[#c41e3a] rounded-lg font-semibold transition-all duration-200"
                >
                  View Limited Drops
                </button>
              </div>
            </div>
            
            {/* Featured Product Visual */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-[#1a1a1a] to-[#111] rounded-3xl border border-[#2a2a2a] flex items-center justify-center overflow-hidden group">
                {trendingProducts?.items?.[0]?.images?.[0] ? (
                  <img 
                    src={trendingProducts.items[0].images[0]} 
                    alt={trendingProducts.items[0].name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">🎸</div>
                    <p className="text-gray-500">Featured Product</p>
                  </div>
                )}
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-4 -right-4 px-4 py-2 bg-[#c41e3a] rounded-lg shadow-lg shadow-[#c41e3a]/30">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Flame className="w-4 h-4" />
                  Best Seller
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Products Carousel */}
      <section className="py-16 border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Flame className="w-6 h-6 text-[#c41e3a]" />
              <h2 className="text-2xl font-bold">Trending Now</h2>
            </div>
            <button 
              onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-1 text-[#c41e3a] hover:text-[#ff3355] text-sm font-medium transition-colors"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {trendingProducts?.items?.slice(0, 6).map((product) => (
              <div 
                key={product._id}
                onClick={() => navigate(`/merch/${product._id}`)}
                className="group cursor-pointer"
              >
                <div className="aspect-square bg-[#1a1a1a] rounded-xl overflow-hidden border border-[#2a2a2a] group-hover:border-[#c41e3a]/50 transition-all duration-300">
                  {product.images?.[0] ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">👕</div>
                  )}
                </div>
                <div className="mt-3">
                  <h3 className="font-medium text-sm truncate group-hover:text-[#c41e3a] transition-colors">{product.name}</h3>
                  <p className="text-[#c41e3a] font-bold text-sm">${(product.price / 100).toFixed(2)}</p>
                </div>
              </div>
            ))}
            
            {(!trendingProducts?.items || trendingProducts.items.length === 0) && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No trending products yet
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-16 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Star className="w-6 h-6 text-[#c41e3a]" />
            <h2 className="text-2xl font-bold">Shop by Category</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${category.gradient} border border-[#2a2a2a] hover:border-[#c41e3a]/50 transition-all duration-300 group text-left`}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="font-bold text-lg">{category.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{category.description}</p>
                
                <ChevronRight className="absolute bottom-4 right-4 w-5 h-5 text-gray-500 group-hover:text-[#c41e3a] group-hover:translate-x-1 transition-all duration-300" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a0505] via-[#2d0a0a] to-[#1a0505] border border-[#3d1818] p-8 md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#c41e3a]/10 rounded-full blur-[80px]" />
            
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-[#c41e3a] text-sm font-semibold mb-2">
                  <Sparkles className="w-4 h-4" />
                  LIMITED TIME OFFER
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">Free Shipping on Orders $75+</h3>
                <p className="text-gray-400">Use code FREESHIP at checkout</p>
              </div>
              
              <button 
                onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex-shrink-0 px-8 py-3 bg-[#c41e3a] hover:bg-[#a01830] rounded-lg font-semibold transition-all duration-200 hover:scale-105"
              >
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Products Section */}
      <section id="products-section" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">All Products</h2>
            {filters.category && (
              <button
                onClick={() => setFilter('category', undefined)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full text-sm hover:border-[#c41e3a] transition-colors"
              >
                {categories.find(c => c.id === filters.category)?.name || filters.category}
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Filters sidebar - Desktop */}
            <div className="hidden md:block md:col-span-1">
              <div className="sticky top-24">
                <MerchFilters
                  filters={filters}
                  onFilterChange={setFilter}
                  onReset={resetFilters}
                />
              </div>
            </div>

            {/* Mobile Filters Overlay */}
            {showFilters && (
              <div className="fixed inset-0 z-50 md:hidden">
                <div className="absolute inset-0 bg-black/80" onClick={() => setShowFilters(false)} />
                <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-[#111] border-l border-[#1a1a1a] p-4 overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Filters</h3>
                    <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-[#1a1a1a] rounded-lg">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <MerchFilters
                    filters={filters}
                    onFilterChange={setFilter}
                    onReset={resetFilters}
                  />
                </div>
              </div>
            )}

            {/* Product grid */}
            <div className="md:col-span-3">
              <ProductGrid
                filters={filters}
                onPageChange={(page) => setFilter('page', page)}
                onAddToCart={handleAddToCart}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gradient-to-t from-[#1a0505] to-transparent">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join the Community</h2>
          <p className="text-gray-400 mb-8">
            Get exclusive access to limited drops, early releases, and members-only discounts.
          </p>
          <button className="px-8 py-3 bg-[#c41e3a] hover:bg-[#a01830] rounded-lg font-semibold transition-all duration-200 hover:scale-105">
            Sign Up for Updates
          </button>
        </div>
      </section>
    </div>
  )
}
