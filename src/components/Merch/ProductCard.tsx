import { useState } from 'react'
import { Doc } from '../../../convex/_generated/dataModel'

interface ProductCardProps {
  product: Doc<'merchProducts'> & {
    variants: Doc<'merchVariants'>[]
    inStock: boolean
    lowestPrice: number
  }
  onAddToCart: (variantId: string, quantity: number) => Promise<void>
  loading?: boolean
}

export function ProductCard({ product, onAddToCart, loading }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const imageUrl = imageError ? '/images/placeholder.jpg' : product.thumbnailUrl

  const handleAddToCart = async () => {
    setError(null)
    setIsAdding(true)

    try {
      // Add first available variant
      const variant = product.variants.find((v) => v.stock > 0)
      if (!variant) {
        setError('Out of stock')
        return
      }

      await onAddToCart(variant._id, 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to cart')
    } finally {
      setIsAdding(false)
    }
  }

  const priceDisplay = product.discount
    ? `$${((product.lowestPrice * (100 - product.discount)) / 100 / 100).toFixed(2)}`
    : `$${(product.lowestPrice / 100).toFixed(2)}`

  return (
    <div className="group bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden hover:border-cyan-500/50 transition-colors">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-800">
        <img
          src={imageUrl}
          alt={product.name}
          onError={() => setImageError(true)}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {product.discount && product.discount > 0 && (
            <div className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
              -{product.discount}%
            </div>
          )}
          {product.isDropProduct && (
            <div className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded">
              DROP
            </div>
          )}
          {product.isPreOrder && (
            <div className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded">
              PRE-ORDER
            </div>
          )}
          {!product.inStock && (
            <div className="px-2 py-1 bg-gray-700 text-white text-xs font-bold rounded">
              OUT OF STOCK
            </div>
          )}
        </div>

        {/* Stock indicator */}
        {product.inStock && (
          <div className="absolute bottom-2 left-2 text-xs text-green-400">
            ✓ In stock
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Name */}
        <h3 className="font-semibold text-white truncate hover:text-cyan-400">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-400 line-clamp-2">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-cyan-400">
            {priceDisplay}
          </span>
          {product.discount && (
            <span className="text-sm text-gray-500 line-through">
              ${(product.lowestPrice / 100).toFixed(2)}
            </span>
          )}
        </div>

        {/* Category */}
        <div className="text-xs text-gray-500 capitalize">
          {product.category}
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-400">
            <iconify-icon icon="solar:danger-circle-linear" width="12" height="12"></iconify-icon>
            {error}
          </div>
        )}

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock || isAdding || loading}
          className="w-full py-2 px-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-semibold rounded flex items-center justify-center gap-2 transition-colors"
        >
          <iconify-icon icon="solar:cart-large-linear" width="16" height="16"></iconify-icon>
          {isAdding ? 'Adding...' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  )
}
