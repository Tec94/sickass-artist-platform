import { useCallback } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Doc } from '../../convex/_generated/dataModel'
import { MerchFilters } from '../components/Merch/MerchFilters'
import { ProductGrid } from '../components/Merch/ProductGrid'
import { useMerchFilters } from '../hooks/useMerchFilters'
import { useAutoRetry } from '../hooks/useAutoRetry'
import { parseConvexError, logError } from '../utils/convexErrorHandler'
import { showToast } from '../lib/toast'
import { ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function Merch() {
  const navigate = useNavigate()
  const { filters, setFilter, resetFilters } = useMerchFilters()
  const { retryWithBackoff } = useAutoRetry()
  const addToCartMutation = useMutation(api.cart.addToCart)
  const cart = useQuery(api.cart.getCart)
  
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-black to-black/80 border-b border-gray-800 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Merchandise</h1>
            <p className="text-gray-400 text-sm">
              Exclusive artist merch collection
            </p>
          </div>

          {/* Cart button */}
          <button
            onClick={() => navigate('/merch/cart')}
            className="relative p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-6 h-6 text-cyan-400" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters sidebar */}
          <div className="md:col-span-1">
            <MerchFilters
              filters={filters}
              onFilterChange={setFilter}
              onReset={resetFilters}
            />
          </div>

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
    </div>
  )
}
