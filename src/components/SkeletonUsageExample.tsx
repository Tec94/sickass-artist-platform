import { useState, useEffect } from 'react'
import { LoadingSkeleton } from '../components/LoadingSkeleton'

/**
 * Complete example of using skeleton loading states
 * with timeout handling and zero CLS
 */
export function SkeletonUsageExample() {
  const [retryCount, setRetryCount] = useState(0)

  // Example 1: Basic usage with local state simulation (demo only)
  const [galleryItems, setGalleryItems] = useState<any[] | undefined>(undefined)
  const [galleryLoading, setGalleryLoading] = useState(true)
  const [galleryTimedOut, setGalleryTimedOut] = useState(false)
  const [galleryError, _setGalleryError] = useState<Error | null>(null)

  useEffect(() => {
    setGalleryLoading(true)
    setGalleryTimedOut(false)
    
    const timer = setTimeout(() => {
      if (!galleryItems) setGalleryTimedOut(true)
    }, 5000)

    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setGalleryItems(Array.from({ length: 8 }, (_, i) => ({
        id: `item-${i}`,
        title: `Gallery Item ${i + 1}`,
        creator: `@user${i}`,
        imageUrl: `/placeholder-${i}.jpg`,
        likeCount: Math.floor(Math.random() * 1000),
        viewCount: Math.floor(Math.random() * 5000)
      })))
      setGalleryLoading(false)
      clearTimeout(timer)
    }

    fetchData()
    return () => clearTimeout(timer)
  }, [retryCount])

  // Example 2: Product grid (simpler)
  const [products, setProducts] = useState<any[] | undefined>(undefined)
  const [productsLoading, setProductsLoading] = useState(true)

  useEffect(() => {
    setProductsLoading(true)
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setProducts(Array.from({ length: 12 }, (_, i) => ({
        id: `product-${i}`,
        name: `Product ${i + 1}`,
        price: (Math.random() * 100 + 10).toFixed(2),
        imageUrl: `/product-${i}.jpg`,
        inStock: Math.random() > 0.2
      })))
      setProductsLoading(false)
    }
    fetchData()
  }, [])

  const handleRetry = () => {
    setGalleryItems(undefined)
    setRetryCount(prev => prev + 1)
  }

  return (
    <div className="space-y-12 p-8 bg-gray-950 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Skeleton Loading States Demo
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Zero CLS loading states with 5s timeout and smooth shimmer animations.
            Resize window to see responsive behavior.
          </p>
        </header>

        {/* Gallery Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Gallery Grid</h2>
          
          {/* Show timeout error */}
          {galleryTimedOut && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6 mb-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-red-300 mb-2">
                  Request timed out after 5 seconds
                </h3>
                <p className="text-red-200/70 mb-4">
                  The server is taking too long to respond.
                </p>
                <button 
                  onClick={handleRetry}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Retry ({retryCount})
                </button>
              </div>
            </div>
          )}

          {/* Show error state */}
          {galleryError && !galleryTimedOut && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6 mb-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-red-300 mb-2">
                  Failed to load gallery
                </h3>
                <p className="text-red-200/70 mb-4">{galleryError.message}</p>
                <button 
                  onClick={handleRetry}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {galleryLoading && !galleryItems?.length && (
            <LoadingSkeleton 
              type="gallery" 
              count={8}
              className="mb-6"
            />
          )}

          {/* Content grid */}
          {galleryItems && galleryItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-enter">
              {galleryItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className="bg-gray-900/70 border border-gray-800 rounded-lg overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="aspect-square bg-gray-800">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNEE1NTYzIi8+CjxwYXRoIGQ9Ik0xMDAgNzBDOTQuNDc3MSA3MCA5MCA3NC40NzcxIDkwIDgwVjEyMEM5MCAxNS41MjI5IDk0LjQ3NzEgMTcwIDEwMCAxNzBDMTA1LjUyMyAxNzAgMTEwIDE2NS41MjMgMTEwIDE2MFYxNDBDOTAgMTQwIDk0LjQ3NzEgMTM1IDEwMCAxMzVIMTAwWiIgZmlsbD0iIzZCNzI4MCIvPgo8L3N2Zz4K'
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-white font-medium text-sm mb-1 truncate">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{item.creator}</span>
                      <div className="flex gap-2">
                        <span>❤️ {item.likeCount}</span>
                        <span>👁 {item.viewCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Loading more skeleton */}
          {galleryLoading && (galleryItems?.length ?? 0) > 0 && (
            <LoadingSkeleton 
              type="gallery" 
              count={4}
              className="mt-6"
            />
          )}

          {/* Empty state */}
          {!galleryLoading && !galleryError && !galleryTimedOut && galleryItems?.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🖼️</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Gallery Items</h3>
              <p className="text-gray-500">Gallery is empty</p>
            </div>
          )}
        </section>

        {/* Products Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Product Grid</h2>
          
          {productsLoading && !products?.length && (
            <LoadingSkeleton 
              type="product" 
              count={12}
            />
          )}

          {products && products.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 content-enter">
              {products.map((product, index) => (
                <div 
                  key={product.id}
                  className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="aspect-[3/4] bg-gray-800">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2NyIgdmlld0JveD0iMCAwIDIwMCAyNjciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjY3IiBmaWxsPSIjNEE1NTYzIi8+CjxwYXRoIGQ9Ik0xMDAgMTAwQzEwNS41MjMgMTAwIDExMCA5NS41MjMgMTEwIDkwVjEwMEMxMTAgMTA1LjUyMyAxMDUuNTIzIDExMCAxMDAgMTEwQzk1LjQ3NzEgMTEwIDkwIDEwNS41MjMgOTAgMTAwVjkwQzkwIDk1LjUyMyA5NC40NzcxIDEwMCAxMDAgMTAwWiIgZmlsbD0iIzZCNzI4MCIvPgo8L3N2Zz4K'
                      }}
                    />
                  </div>
                  <div className="p-3 space-y-2">
                    <h3 className="text-white font-medium text-sm truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 font-bold">
                        ${product.price}
                      </span>
                      <span className={`text-xs ${product.inStock ? 'text-green-400' : 'text-red-400'}`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Forum Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Forum Threads</h2>
          <LoadingSkeleton type="forum" count={5} />
        </section>

        {/* Chat Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Chat Messages</h2>
          <LoadingSkeleton type="chat" count={4} />
        </section>

        {/* Performance Info */}
        <footer className="text-center text-gray-500 space-y-2">
          <p>✨ Zero CLS (0.0) • 60fps shimmer animation • 5s timeout handling</p>
          <p>📱 Responsive design • ♿ Accessibility support • 🎨 Smooth transitions</p>
        </footer>
      </div>
    </div>
  )
}