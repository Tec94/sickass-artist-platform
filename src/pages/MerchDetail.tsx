import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState, useCallback } from 'react'
import { Doc } from '../../convex/_generated/dataModel'
import { ImageGallery } from '../components/Merch/ImageGallery'
import { VariantSelector } from '../components/Merch/VariantSelector'
import { ProductInfo } from '../components/Merch/ProductInfo'
import { RelatedProducts } from '../components/Merch/RelatedProducts'
import { MerchErrorBoundary } from '../components/Merch/ErrorBoundary'
import { useAutoRetry } from '../hooks/useAutoRetry'
import { parseConvexError, logError } from '../utils/convexErrorHandler'
import { showToast } from '../lib/toast'
import { showToast } from '../lib/toast'

export function MerchDetail() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const product = useQuery(api.merch.getProductDetail,
    productId ? { productId: productId as Doc<'merchProducts'>['_id'] } : 'skip'
  )
  
  const { retryWithBackoff } = useAutoRetry()
  const addToCartMutation = useMutation(api.cart.addToCart)

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Auto-select first available variant
  const selectedVariant = product?.variants.find(v => v._id === selectedVariantId) ||
    product?.variants.find(v => v.stock > 0) ||
    product?.variants[0] || null

  const handleSelectVariant = useCallback((variantId: string) => {
    setSelectedVariantId(variantId)
    setQuantity(1)
  }, [])

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
    } catch (err) {
      const parsed = parseConvexError(err)
      logError(parsed, {
        component: 'MerchDetail',
        action: 'add_to_cart',
        metadata: { productId },
      })
      showToast(parsed.userMessage, { type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }, [selectedVariant, quantity, addToCartMutation, retryWithBackoff, productId])

  if (product === null) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Product not found</h1>
        <button
          onClick={() => navigate('/merch')}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded"
        >
          Back to Shop
        </button>
      </div>
    )
  }

  if (product === undefined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <iconify-icon icon="solar:spinner-linear" width="48" height="48" class="animate-spin text-cyan-500 mx-auto mb-4"></iconify-icon>
          <p className="text-gray-400">Loading product...</p>
        </div>
      </div>
    )
  }

  return (
    <MerchErrorBoundary>
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black/80 border-b border-gray-800 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <button
              onClick={() => navigate('/merch')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <iconify-icon icon="solar:alt-arrow-left-linear" width="16" height="16"></iconify-icon>
              Back to Shop
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Image gallery */}
            <div>
              <ImageGallery
                images={product.imageUrls}
                alt={product.name}
              />
            </div>

            {/* Right: Product info & variants */}
            <div className="space-y-6">
              <ProductInfo
                product={product}
                selectedVariant={selectedVariant}
                quantity={quantity}
                onAddToCart={handleAddToCart}
                loading={isLoading}
              />

              <div className="border-t border-gray-800 pt-6">
                <VariantSelector
                  variants={product.variants}
                  selectedVariantId={selectedVariant?._id || null}
                  onSelectVariant={handleSelectVariant}
                  onSelectQuantity={setQuantity}
                  quantity={quantity}
                />
              </div>
            </div>
          </div>

          {/* Related products */}
          {product.relatedProducts.length > 0 && (
            <RelatedProducts
              productId={product._id}
              category={product.category}
              onAddToCart={async (variantId, qty) => {
               try {
                 await addToCartMutation({
                   variantId: variantId as Doc<'merchVariants'>['_id'],
                   quantity: qty
                 })
                 showToast('Added to cart!', { type: 'success' })
               } catch (err) {
                 const parsed = parseConvexError(err)
                 showToast(parsed.userMessage, { type: 'error' })
               }
              }}
            />
          )}
        </div>
      </div>
    </MerchErrorBoundary>
  )
}