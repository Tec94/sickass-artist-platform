import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { ProductCard } from './ProductCard'
import { useRef } from 'react'
import { getMerchSlugCandidates } from '../../utils/merchImages'

interface RelatedProductsProps {
  productId: string
  category: string
  onAddToCart: (variantId: string, quantity: number) => Promise<void>
}

export function RelatedProducts({
  productId,
  category,
  onAddToCart,
}: RelatedProductsProps) {
  const result = useQuery(api.merch.getProducts, {
    page: 0,
    pageSize: 8,
    category: category as 'apparel' | 'accessories' | 'vinyl' | 'limited' | 'other' | undefined,
    sortBy: 'newest',
  })
  const relatedProducts = result?.items
    ? result.items.filter(p => p._id !== productId).slice(0, 4)
    : []
  const manifestSlugs = Array.from(new Set(
    relatedProducts.flatMap((product) => getMerchSlugCandidates({
      name: product.name,
      imageUrls: product.imageUrls,
      thumbnailUrl: product.thumbnailUrl,
      category: product.category,
      tags: product.tags,
      variants: product.variants,
    }))
  ))
  const merchManifestEntries = useQuery(
    api.merchManifest.getMerchImageManifestEntries,
    manifestSlugs.length ? { slugs: manifestSlugs } : 'skip'
  )

  const scrollRef = useRef<HTMLDivElement>(null)

  if (!result?.items.length) return null

  if (!relatedProducts.length) return null

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = 300
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  return (
    <div className="space-y-4 mt-12 pt-8 border-t border-gray-800">
      <h3 className="text-2xl font-bold text-white">You might also like</h3>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
        >
          {relatedProducts.map(product => (
            <div key={product._id} className="flex-shrink-0 w-64">
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                manifest={merchManifestEntries?.entries ?? null}
              />
            </div>
          ))}
        </div>

        {/* Scroll buttons (desktop only) */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-0 top-1/3 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full items-center justify-center text-gray-300 hover:text-white transition-colors"
        >
          <iconify-icon icon="solar:alt-arrow-left-linear" width="20" height="20"></iconify-icon>
        </button>
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-0 top-1/3 -translate-y-1/2 translate-x-4 w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full items-center justify-center text-gray-300 hover:text-white transition-colors"
        >
          <iconify-icon icon="solar:alt-arrow-right-linear" width="20" height="20"></iconify-icon>
        </button>
      </div>
    </div>
  )
}
