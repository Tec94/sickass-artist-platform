import { memo } from 'react'

interface ProductSkeletonProps {
  count?: number
}

/**
 * Product skeleton component with zero CLS
 * Matches exact dimensions of ProductCard component
 */
export const ProductSkeleton = memo(function ProductSkeleton({ count = 12 }: ProductSkeletonProps) {
  return (
    <div className="skeleton-product-grid content-enter">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-container"
        >
          {/* Product image (aspect-ratio: 3/4 for products) - prevents CLS */}
          <div className="relative aspect-[3/4] overflow-hidden">
            <div className="skeleton-image product" />
            
            {/* Badges placeholder */}
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              <div className="skeleton-text h-5 w-12 rounded" />
              <div className="skeleton-text h-5 w-16 rounded" />
            </div>
            
            {/* Stock indicator */}
            <div className="absolute bottom-2 left-2 skeleton-text h-4 w-20 rounded" />
          </div>
          
          {/* Content area - matches ProductCard layout exactly */}
          <div className="p-4 space-y-3">
            {/* Product name (1 line, 100%) */}
            <div className="skeleton-text h-4 w-full" />
            
            {/* Description (2 lines) */}
            <div className="space-y-2">
              <div className="skeleton-text h-3 w-full" />
              <div className="skeleton-text h-3 w-4/5" />
            </div>
            
            {/* Price section */}
            <div className="flex items-baseline gap-2">
              <div className="skeleton-text h-5 w-16" />
              <div className="skeleton-text h-4 w-12 line-through" />
            </div>
            
            {/* Category */}
            <div className="skeleton-text h-3 w-20" />
            
            {/* Add to cart button */}
            <div className="skeleton-text h-9 w-full rounded" />
          </div>
        </div>
      ))}
    </div>
  )
})