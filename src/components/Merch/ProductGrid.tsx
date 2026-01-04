import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { ProductCard } from './ProductCard'
import { useEffect, useRef, useState } from 'react'
import { MerchFilters } from '../../hooks/useMerchFilters'
import { Doc } from '../../../convex/_generated/dataModel'

type EnrichedProduct = Doc<'merchProducts'> & {
  variants: Doc<'merchVariants'>[]
  inStock: boolean
  lowestPrice: number
}

interface ProductGridProps {
  filters: MerchFilters
  onPageChange: (page: number) => void
  onAddToCart: (variantId: string, quantity: number) => Promise<void>
}

export function ProductGrid({
  filters,
  onPageChange,
  onAddToCart,
}: ProductGridProps) {
  const [accumulatedItems, setAccumulatedItems] = useState<EnrichedProduct[]>([])
  
  const result = useQuery(api.merch.getProducts, {
    page: filters.page,
    pageSize: filters.pageSize,
    category: filters.category || undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    search: filters.search || undefined,
    sortBy: filters.sortBy || undefined,
  })

  // Reset accumulation when filters change
  useEffect(() => {
    setAccumulatedItems([])
  }, [filters.category, filters.minPrice, filters.maxPrice, filters.search, filters.sortBy])

  // Accumulate items
  useEffect(() => {
    if (result?.items) {
      setAccumulatedItems(prev => {
        // Avoid duplicates
        const existingIds = new Set(prev.map(i => i._id))
        const newItems = result.items.filter(i => !existingIds.has(i._id))
        
        if (filters.page === 0) {
          return result.items
        }
        return [...prev, ...newItems]
      })
    }
  }, [result?.items, filters.page])

  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Infinite scroll: detect when user scrolls near bottom
  useEffect(() => {
    if (!loadMoreRef.current || !result?.hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onPageChange(filters.page + 1)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [result?.hasMore, filters.page, onPageChange])

  if (result === undefined && accumulatedItems.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (result !== undefined && accumulatedItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No products found</p>
        <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <>
      {/* Product grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {accumulatedItems.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onAddToCart={onAddToCart}
            loading={result === undefined}
          />
        ))}
      </div>

      {/* Load more trigger */}
      {result.hasMore && (
        <div ref={loadMoreRef} className="mt-8 text-center">
          <p className="text-gray-500 text-sm">Loading more...</p>
        </div>
      )}

      {/* End of results */}
      {!result.hasMore && result.items.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">No more products to load</p>
        </div>
      )}
    </>
  )
}
