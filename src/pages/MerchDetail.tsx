import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState, useCallback, useMemo } from 'react'
import { Doc } from '../../convex/_generated/dataModel'
import { MerchErrorBoundary } from '../components/Merch/ErrorBoundary'
import { useAutoRetry } from '../hooks/useAutoRetry'
import { parseConvexError, logError } from '../utils/convexErrorHandler'
import { showToast } from '../lib/toast'
import { MerchNavbar } from '../components/Merch/MerchNavbar'
import { MerchCartDrawer } from '../components/Merch/MerchCartDrawer'

// Sample tracklist data for vinyl/music products
const SAMPLE_TRACKLIST = [
  { id: '01', title: 'Static Dawn' },
  { id: '02', title: 'Neon Veins' },
  { id: '03', title: 'Midnight Frequency' },
  { id: '04', title: 'Analog Heart' },
]

export function MerchDetail() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const product = useQuery(api.merch.getProductDetail,
    productId ? { productId: productId as Doc<'merchProducts'>['_id'] } : 'skip'
  )
  const cart = useQuery(api.cart.getCart)
  
  const { retryWithBackoff } = useAutoRetry()
  const addToCartMutation = useMutation(api.cart.addToCart)

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Auto-select first available variant if not set
  const selectedVariant = useMemo(() => {
    if (!product) return null
    if (selectedVariantId) return product.variants.find(v => v._id === selectedVariantId) || null
    return product.variants.find(v => v.stock > 0) || product.variants[0] || null
  }, [product, selectedVariantId])

  const handleQuantityChange = useCallback((delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(99, prev + delta)))
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
      setIsCartOpen(true)
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
      <div className="merch-detail-page">
        <div className="error-container">
          <h1>PRODUCT NOT FOUND</h1>
          <button onClick={() => navigate('/merch')} className="back-btn">
            BACK TO SHOP
          </button>
        </div>
        <style>{styles}</style>
      </div>
    )
  }

  if (product === undefined) {
    return (
      <div className="merch-detail-page">
        <div className="loading-container">
          <iconify-icon icon="solar:spinner-linear" width="32" height="32" class="spinner"></iconify-icon>
          <p>Loading...</p>
        </div>
        <style>{styles}</style>
      </div>
    )
  }

  // Build images array with fallbacks
  const images = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls 
    : (product.thumbnailUrl ? [product.thumbnailUrl] : ['/placeholder.png'])
  
  const isMusic = product.category === 'vinyl' || product.category === 'limited' || 
    product.name.toLowerCase().includes('lp') || product.name.toLowerCase().includes('cd')

  const description = product.description || product.longDescription || 
    'Premium quality merchandise from ROA WOLVES. Designed with attention to detail and made to last.'

  return (
    <MerchErrorBoundary>
      <div className="merch-detail-page">
        <MerchNavbar 
          cartCount={cart?.itemCount || 0} 
          onOpenCart={() => setIsCartOpen(true)}
          onGoHome={() => navigate('/merch')}
        />

        <main className="detail-main">
          {/* Back Button */}
          <button onClick={() => navigate('/merch')} className="back-link">
            <iconify-icon icon="solar:alt-arrow-left-linear" width="12" height="12"></iconify-icon>
            BACK TO SHOP
          </button>

          <div className="product-grid">
            {/* Left Column: Images */}
            <div className="image-section">
              <div className="main-image-container">
                {/* NEW Badge */}
                <span className="new-badge">NEW</span>
                <img 
                  src={images[selectedImage] || '/placeholder.png'} 
                  alt={product.name}
                  className="main-image"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                />
              </div>
              
              {/* Thumbnail Gallery - Always show if multiple images */}
              {images.length > 1 && (
                <div className="thumbnail-row">
                  {images.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`thumbnail ${selectedImage === idx ? 'active' : ''}`}
                    >
                      <img 
                        src={img} 
                        alt={`${product.name} ${idx + 1}`}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Details */}
            <div className="details-section">
              <h1 className="product-title">{product.name}</h1>
              <p className="product-price">${(product.price / 100).toFixed(2)}</p>

              {/* Format/Variant Selection */}
              {product.variants.length > 0 && (
                <div className="option-group">
                  <label className="option-label">SELECT FORMAT</label>
                  <div className="variant-buttons">
                    {product.variants.map(variant => (
                      <button
                        key={variant._id}
                        onClick={() => {
                          setSelectedVariantId(variant._id)
                          setQuantity(1)
                        }}
                        disabled={variant.stock === 0}
                        className={`variant-btn ${selectedVariant?._id === variant._id ? 'selected' : ''} ${variant.stock === 0 ? 'sold-out' : ''}`}
                      >
                        {variant.size || variant.color || variant.style || 'Default'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="option-group">
                <label className="option-label">QUANTITY</label>
                <div className="quantity-picker">
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    className="qty-btn"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    className="qty-btn"
                    disabled={quantity >= 99}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="action-row">
                <button 
                  onClick={handleAddToCart}
                  disabled={isLoading || !selectedVariant || selectedVariant.stock === 0}
                  className={`add-to-cart-btn ${isLoading ? 'loading' : ''}`}
                >
                  {isLoading ? 'ADDING...' : (selectedVariant?.stock === 0 ? 'SOLD OUT' : 'ADD TO CART')}
                </button>
                <button className="wishlist-btn">
                  <iconify-icon icon="solar:heart-linear" width="18" height="18"></iconify-icon>
                </button>
              </div>

              {/* Tracklist (for music products) */}
              {isMusic && (
                <div className="tracklist-section">
                  <div className="section-header">
                    <iconify-icon icon="solar:music-note-linear" width="16" height="16" class="section-icon"></iconify-icon>
                    <span>TRACKLIST</span>
                  </div>
                  <div className="track-list">
                    {SAMPLE_TRACKLIST.map(track => (
                      <div key={track.id} className="track-item">
                        <span className="track-num">{track.id}</span>
                        <span className="track-title">{track.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="description-section">
                <label className="option-label">DESCRIPTION</label>
                <p className="description-text">{description}</p>
              </div>
            </div>
          </div>
        </main>

        <MerchCartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart?.items?.map(item => ({
            _id: item.variantId,
            name: (item as any).product?.name || 'Product',
            price: (item as any).currentPrice || item.priceAtAddTime || 0,
            quantity: item.quantity,
            images: (item as any).product?.imageUrls || [(item as any).product?.thumbnailUrl] || [],
            selectedSize: (item as any).variant?.size,
            selectedVariant: (item as any).variant?.color
          })) || []}
          onRemove={() => {
            showToast('Remove from cart coming soon', { type: 'info' })
          }}
        />
      </div>
      <style>{styles}</style>
    </MerchErrorBoundary>
  )
}

const styles = `
  .merch-detail-page {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    background: #050505;
    color: #e5e5e5;
    font-family: var(--font-store, ui-monospace, SFMono-Regular, monospace);
  }

  .error-container,
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 16px;
  }

  .error-container h1 {
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.1em;
  }

  .back-btn {
    padding: 12px 24px;
    background: #dc2626;
    border: none;
    color: white;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    cursor: pointer;
    font-family: inherit;
  }

  .spinner {
    animation: spin 1s linear infinite;
    color: #dc2626;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .detail-main {
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    padding: 32px 40px;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #525252;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.15em;
    background: none;
    border: none;
    cursor: pointer;
    margin-bottom: 32px;
    padding: 0;
    font-family: inherit;
    transition: color 0.2s;
  }

  .back-link:hover {
    color: #a3a3a3;
  }

  .product-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 48px;
  }

  @media (min-width: 768px) {
    .product-grid {
      grid-template-columns: 1fr 1fr;
      gap: 64px;
    }
  }

  .image-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .main-image-container {
    position: relative;
    aspect-ratio: 1;
    background: #0a0a0a;
    overflow: hidden;
  }

  .new-badge {
    position: absolute;
    top: 16px;
    left: 16px;
    z-index: 10;
    background: #dc2626;
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 6px 12px;
    letter-spacing: 0.1em;
  }

  .main-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumbnail-row {
    display: flex;
    gap: 12px;
  }

  .thumbnail {
    width: 80px;
    height: 80px;
    background: #0a0a0a;
    border: 2px solid transparent;
    padding: 0;
    cursor: pointer;
    opacity: 0.5;
    transition: all 0.2s;
    overflow: hidden;
  }

  .thumbnail:hover {
    opacity: 0.8;
  }

  .thumbnail.active {
    border-color: #dc2626;
    opacity: 1;
  }

  .thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .details-section {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .product-title {
    font-size: 32px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    margin: 0;
    color: #dc2626;
    line-height: 1;
  }

  @media (min-width: 768px) {
    .product-title {
      font-size: 42px;
    }
  }

  .product-price {
    font-size: 20px;
    font-weight: 600;
    color: #dc2626;
    margin: 0;
  }

  .option-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .option-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.15em;
    color: #525252;
  }

  .variant-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .variant-btn {
    padding: 12px 24px;
    background: transparent;
    border: 1px solid #262626;
    color: #a3a3a3;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }

  .variant-btn:hover:not(.sold-out) {
    border-color: #525252;
    color: white;
  }

  .variant-btn.selected {
    background: #dc2626;
    border-color: #dc2626;
    color: white;
  }

  .variant-btn.sold-out {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .quantity-picker {
    display: inline-flex;
    align-items: center;
    border: 1px solid #262626;
    background: #0a0a0a;
    width: auto;
  }

  .qty-btn {
    width: 36px;
    height: 36px;
    background: transparent;
    border: none;
    color: #a3a3a3;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .qty-btn:hover:not(:disabled) {
    color: white;
    background: #171717;
  }

  .qty-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .qty-value {
    width: 40px;
    text-align: center;
    font-size: 13px;
    font-weight: 600;
    color: white;
  }

  .action-row {
    display: flex;
    gap: 12px;
    margin-top: 8px;
  }

  .add-to-cart-btn {
    flex: 1;
    padding: 14px 24px;
    background: #dc2626;
    border: none;
    color: white;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.15em;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }

  .add-to-cart-btn:hover:not(:disabled) {
    background: #ef4444;
  }

  .add-to-cart-btn:disabled {
    background: #171717;
    color: #525252;
    cursor: not-allowed;
  }

  .add-to-cart-btn.loading {
    opacity: 0.7;
  }

  .wishlist-btn {
    width: 48px;
    height: 48px;
    background: transparent;
    border: 1px solid #262626;
    color: #737373;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .wishlist-btn:hover {
    border-color: #dc2626;
    color: #dc2626;
  }

  .tracklist-section {
    padding-top: 24px;
    border-top: 1px solid #171717;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: white;
  }

  .section-icon {
    color: #dc2626;
  }

  .track-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .track-item {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .track-num {
    font-size: 10px;
    color: #525252;
    min-width: 20px;
  }

  .track-title {
    font-size: 13px;
    color: #a3a3a3;
  }

  .description-section {
    padding-top: 24px;
    border-top: 1px solid #171717;
  }

  .description-text {
    font-size: 13px;
    line-height: 1.6;
    color: #737373;
    margin: 0;
  }
`