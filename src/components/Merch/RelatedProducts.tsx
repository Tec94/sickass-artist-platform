import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { ProductCard } from './ProductCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'

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
    category,
    sortBy: 'newest',
  })

  const scrollRef = useRef<HTMLDivElement>(null)

  if (!result?.items.length) return null

  const relatedProducts = result.items.filter(p => p._id !== productId).slice(0, 4)

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
              />
            </div>
          ))}
        </div>

        {/* Scroll buttons (desktop only) */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-0 top-1/3 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full items-center justify-center text-gray-300 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-0 top-1/3 -translate-y-1/2 translate-x-4 w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full items-center justify-center text-gray-300 hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}