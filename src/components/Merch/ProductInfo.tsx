import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Doc } from '../../../convex/_generated/dataModel'

interface ProductInfoProps {
  product: Doc<'merchProducts'>
  selectedVariant: Doc<'merchVariants'> | null
  quantity: number
  onAddToCart: () => Promise<void>
  loading?: boolean
}

export function ProductInfo({
  product,
  selectedVariant,
  quantity,
  onAddToCart,
  loading,
}: ProductInfoProps) {
  const [copied, setCopied] = useState(false)

  const basePrice = selectedVariant?.price || product.price
  const finalPrice = product.discount
    ? Math.round(basePrice * (100 - product.discount) / 100)
    : basePrice

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (platform: 'twitter' | 'instagram') => {
    const text = `Check out ${product.name} on the artist merch store`
    const url = window.location.href

    if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        '_blank'
      )
    } else if (platform === 'instagram') {
      // Instagram doesn't support direct web share, copy link
      handleCopyLink()
    }
  }

  return (
    <div className="space-y-6">
      {/* Name & category */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">{product.name}</h1>
        <p className="text-gray-400 capitalize">{product.category}</p>
      </div>

      {/* Pricing */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-cyan-400">
            ${(finalPrice / 100).toFixed(2)}
          </span>
          {product.discount && (
            <span className="text-lg text-gray-500 line-through">
              ${(basePrice / 100).toFixed(2)}
            </span>
          )}
        </div>
        {product.discount && (
          <p className="text-red-400 font-semibold">
            Save {product.discount}% - Limited time!
          </p>
        )}
      </div>

      {/* Total for quantity */}
      <div className="p-3 bg-gray-900/50 border border-gray-800 rounded">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>{quantity} × ${(finalPrice / 100).toFixed(2)}</span>
        </div>
        <div className="text-xl font-bold text-white">
          Total: ${((finalPrice * quantity) / 100).toFixed(2)}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <h3 className="font-semibold text-white">About this item</h3>
        <p className="text-gray-400 leading-relaxed">
          {product.longDescription || product.description}
        </p>
      </div>

      {/* Tags */}
      {product.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.tags.map(tag => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Add to cart button */}
      <button
        onClick={onAddToCart}
        disabled={!selectedVariant || selectedVariant.stock === 0 || loading}
        className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-lg transition-colors text-lg"
      >
        {loading ? 'Adding...' : selectedVariant?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>

      {/* Share buttons */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-400">Share this product</p>
        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            className="flex-1 py-2 px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded flex items-center justify-center gap-2 transition-colors text-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Link
              </>
            )}
          </button>
          <button
            onClick={() => handleShare('twitter')}
            className="flex-1 py-2 px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-sm transition-colors"
          >
            Twitter
          </button>
        </div>
      </div>

      {/* Stock warning */}
      {selectedVariant && selectedVariant.stock < 5 && selectedVariant.stock > 0 && (
        <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded text-orange-400 text-sm">
          ⚠️ Only {selectedVariant.stock} left! Order soon.
        </div>
      )}
    </div>
  )
}