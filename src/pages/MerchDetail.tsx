import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState, useCallback, useMemo } from 'react'
import { Doc, Id } from '../../convex/_generated/dataModel'
import { MerchErrorBoundary } from '../components/Merch/ErrorBoundary'
import { useAutoRetry } from '../hooks/useAutoRetry'
import { parseConvexError, logError } from '../utils/convexErrorHandler'
import { showToast } from '../lib/toast'
import { FreeShippingBanner } from '../components/Merch/FreeShippingBanner'
import CartDrawer from '../../roa-wolves/components/CartDrawer'

export function MerchDetail() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  
  const product = useQuery(api.merch.getProductDetail,
    productId ? { productId: productId as Doc<'merchProducts'>['_id'] } : 'skip'
  )
  const cart = useQuery(api.cart.getCart)
  const wishlist = useQuery(api.merch.getWishlist)
  
  const { retryWithBackoff } = useAutoRetry()
  const addToCartMutation = useMutation(api.cart.addToCart)
  const toggleWishlistMutation = useMutation(api.merch.toggleWishlist)

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Auto-select first available variant
  const selectedVariant = useMemo(() => {
    if (!product) return null
    if (selectedVariantId) return product.variants.find(v => v._id === selectedVariantId) || null
    return product.variants.find(v => v.stock > 0) || product.variants[0] || null
  }, [product, selectedVariantId])

  const isInWishlist = wishlist?.some(item => item._id === productId)

  const handleAddToCart = useCallback(async () => {
    if (!selectedVariant) {
      showToast('Please select an option', { type: 'error' })
      return
    }

    setIsLoading(true)
    try {
      await retryWithBackoff(() =>
        addToCartMutation({
          variantId: selectedVariant._id,
          quantity,
        })
      )
      showToast('Added to cart!', { type: 'success' })
      setIsCartOpen(true)
    } catch (err) {
      const parsed = parseConvexError(err)
      logError(parsed, { component: 'MerchDetail', action: 'add_to_cart', metadata: { productId } })
      showToast(parsed.userMessage, { type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }, [selectedVariant, quantity, addToCartMutation, retryWithBackoff, productId])

  const handleToggleWishlist = async () => {
    if (!productId) return
    try {
      await toggleWishlistMutation({ productId: productId as Id<'merchProducts'> })
      showToast(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist', { type: 'success' })
    } catch {
      showToast('Login to wishlist items', { type: 'error' })
    }
  }

  if (product === null) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-bold uppercase tracking-widest mb-4">Product Not Found</h1>
        <button onClick={() => navigate('/store')} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-sm font-bold uppercase tracking-widest transition-colors">
          Back to Shop
        </button>
      </div>
    )
  }

  if (product === undefined) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <iconify-icon icon="solar:spinner-linear" width="32" height="32" class="animate-spin text-red-500"></iconify-icon>
        <p className="mt-4 text-zinc-400">Loading...</p>
      </div>
    )
  }

  const imageUrl = "/src/public/assets/test-image.jpg"
  const description = product.description || product.longDescription || 'Premium quality merchandise from ROA WOLVES.'

  // Extract unique sizes and colors from variants
  const sizes = [...new Set(product.variants.map(v => v.size).filter(Boolean))]
  const colors = [...new Set(product.variants.map(v => v.color).filter(Boolean))]
  const selectedSize = selectedVariant?.size || sizes[0] || ''
  const selectedColor = selectedVariant?.color || colors[0] || ''

  return (
    <MerchErrorBoundary>
      <div className="min-h-screen bg-zinc-950" style={{ fontFamily: 'var(--font-store, ui-monospace, monospace)' }}>
        <FreeShippingBanner />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
          <Link to="/store" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors">
            <iconify-icon icon="solar:alt-arrow-left-linear" width="16" height="16"></iconify-icon>
            Back to Shop
          </Link>

          <div className="flex flex-col md:flex-row gap-12">
            {/* Left Side - Image */}
            <div className="w-full md:w-3/5 bg-zinc-900 border border-zinc-800 relative flex items-center justify-center p-8 min-h-[500px]">
              <img 
                src={imageUrl} 
                alt={product.name} 
                className="max-h-[500px] w-auto object-contain shadow-2xl"
              />
            </div>

            {/* Right Side - Details */}
            <div className="w-full md:w-2/5 flex flex-col">
              
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl md:text-5xl font-display font-bold text-white uppercase tracking-wider leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-yellow-500">
                  <iconify-icon icon="solar:star-bold" width="16" height="16"></iconify-icon>
                  <iconify-icon icon="solar:star-bold" width="16" height="16"></iconify-icon>
                  <iconify-icon icon="solar:star-bold" width="16" height="16"></iconify-icon>
                  <iconify-icon icon="solar:star-bold" width="16" height="16"></iconify-icon>
                  <iconify-icon icon="solar:star-bold" width="16" height="16" class="opacity-50"></iconify-icon>
                </div>
                <span className="text-sm text-zinc-400 font-medium">4.5 (500 Reviews)</span>
              </div>

              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-3xl text-red-500 font-display font-bold">${(product.price / 100).toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-lg text-zinc-600 line-through">${(product.originalPrice / 100).toFixed(2)}</span>
                )}
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed mb-8 border-b border-zinc-800 pb-8">
                {description}
              </p>

              {/* Color Selection */}
              {colors.length > 0 && (
                <div className="mb-6">
                  <span className="text-xs text-zinc-500 uppercase tracking-widest block mb-3 font-bold">
                    Color: <span className="text-white">{selectedColor}</span>
                  </span>
                  <div className="flex gap-3">
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          const variant = product.variants.find(v => v.color === color)
                          if (variant) setSelectedVariantId(variant._id)
                        }}
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor === color ? 'border-red-600' : 'border-zinc-800 hover:border-zinc-500'}`}
                      >
                        <div className={`w-9 h-9 rounded-full ${color === 'Black' ? 'bg-black' : color === 'White' ? 'bg-white' : color === 'Scarlet' || color === 'Red' ? 'bg-red-600' : 'bg-zinc-400'}`}></div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {sizes.length > 0 && (
                <div className="mb-8">
                  <div className="flex justify-between mb-3">
                    <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Select Size</span>
                    <button className="text-xs text-zinc-500 underline hover:text-white">Size Guide</button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => {
                          const variant = product.variants.find(v => v.size === size)
                          if (variant) setSelectedVariantId(variant._id)
                        }}
                        className={`py-3 text-sm font-bold border transition-all ${selectedSize === size ? 'bg-white text-black border-white' : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Actions */}
              <div className="flex gap-4 mb-8">
                <div className="flex items-center w-32 border border-zinc-800 bg-zinc-950">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-12 flex items-center justify-center text-zinc-400 hover:text-white"
                  >
                    <iconify-icon icon="solar:minus-circle-linear" width="16" height="16"></iconify-icon>
                  </button>
                  <div className="flex-1 text-center text-white text-sm font-bold">{quantity}</div>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-12 flex items-center justify-center text-zinc-400 hover:text-white"
                  >
                    <iconify-icon icon="solar:add-circle-linear" width="16" height="16"></iconify-icon>
                  </button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  disabled={isLoading || !selectedVariant || selectedVariant.stock === 0}
                  className="flex-1 bg-red-700 hover:bg-red-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-sm font-bold uppercase tracking-widest transition-all"
                >
                  {isLoading ? 'Adding...' : selectedVariant?.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                </button>
                <button 
                  onClick={handleToggleWishlist}
                  className={`w-14 border border-zinc-800 flex items-center justify-center transition-colors ${isInWishlist ? 'text-red-600 border-red-900 bg-red-900/10' : 'text-zinc-400 hover:text-white hover:border-zinc-600'}`}
                >
                  <iconify-icon icon={isInWishlist ? "solar:heart-bold" : "solar:heart-linear"} width="24" height="24"></iconify-icon>
                </button>
              </div>

            </div>
          </div>
        </div>

        <CartDrawer 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          title="Shopping Cart"
          type="cart"
          items={cart?.items?.map(item => ({
            id: item.variantId as any,
            name: (item as any).product?.name || 'Product',
            price: ((item as any).currentPrice || item.priceAtAddTime || 0) / 100,
            quantity: item.quantity,
            image: "/src/public/assets/test-image.jpg",
            selectedSize: (item as any).variant?.size || '',
            selectedColor: (item as any).variant?.color || '',
            category: (item as any).product?.category || '',
            colors: [],
            sizes: [],
            description: ''
          })) || []}
          onRemoveItem={() => {}}
        />
      </div>
    </MerchErrorBoundary>
  )
}