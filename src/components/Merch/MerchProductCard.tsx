import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { showToast } from '../../lib/toast'
import { useUser } from '../../contexts/UserContext'

interface MerchProductCardProps {
  product: {
    _id: string
    name: string
    price: number
    originalPrice?: number
    imageUrls: string[]
    thumbnailUrl?: string
    isNew?: boolean
    totalStock?: number
    category?: string
    variants?: any[]
  }
}

export const MerchProductCard = ({ product }: MerchProductCardProps) => {
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)
  const isOutOfStock = product.totalStock === 0

  const toggleWishlist = useMutation(api.merch.toggleWishlist)
  const addToCart = useMutation(api.cart.addToCart)
  const { isSignedIn } = useUser()
  const wishlist = useQuery(api.merch.getWishlist, isSignedIn ? {} : 'skip')
  
  const isWishlisted = wishlist?.some(item => item._id === product._id)

  const handleClick = () => {
    navigate(`/store/product/${product._id}`)
  }

  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await toggleWishlist({ productId: product._id as Id<'merchProducts'> })
      showToast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', { type: 'success' })
    } catch (err) {
      showToast('Login to wishlist items', { type: 'error' })
    }
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isOutOfStock) return

    // If product has variants, we should probably navigate to detail to let them choose
    if (product.variants && product.variants.length > 1) {
      navigate(`/store/product/${product._id}`)
      return
    }

    // Default to first variant if available
    const variantId = product.variants?.[0]?._id
    if (!variantId) {
      navigate(`/store/product/${product._id}`)
      return
    }

    try {
      await addToCart({ variantId, quantity: 1 })
      showToast('Added to cart', { type: 'success' })
    } catch (err) {
      showToast('Failed to add to cart', { type: 'error' })
    }
  }

  return (
    <div 
      className="merch-product-card"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-image-container">
        <img 
          src="/src/public/assets/test-image.jpg" 
          alt={product.name}
          className={`card-image primary ${isHovered && product.imageUrls[1] ? 'hidden' : ''}`}
        />
        {product.imageUrls[1] && (
          <img 
            src="/src/public/assets/test-image.jpg" 
            alt={product.name}
            className={`card-image secondary ${isHovered ? 'visible' : ''}`}
          />
        )}
        
        {/* Badges */}
        <div className="card-badges">
          {product.isNew && (
            <span className="badge new">New</span>
          )}
          {isOutOfStock && (
            <span className="badge sold-out">Sold Out</span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          className={`wishlist-btn ${isHovered || isWishlisted ? 'visible' : ''} ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlist}
        >
          <iconify-icon 
            icon={isWishlisted ? "solar:heart-bold" : "solar:heart-linear"} 
            width="16" 
            height="16"
          ></iconify-icon>
        </button>

        {/* Quick View Overlay */}
        <div className={`quick-view-overlay ${isHovered ? 'visible' : ''}`}>
          <span>Quick View</span>
        </div>
      </div>

      <div className="card-content">
        <h3 className="card-title">{product.name}</h3>
        <div className="card-price">
          <span className="current-price">${(product.price / 100).toFixed(2)}</span>
          {product.originalPrice && (
            <span className="original-price">${(product.originalPrice / 100).toFixed(2)}</span>
          )}
        </div>
        
        {/* Mobile Quick Add */}
        <button 
          className="mobile-add-btn"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? 'Sold Out' : (product.variants && product.variants.length > 1 ? 'Select Options' : 'Add to Cart')}
        </button>
      </div>

      <style>{`
        .merch-product-card {
          display: flex;
          flex-direction: column;
          cursor: pointer;
          height: 100%;
        }

        .card-image-container {
          position: relative;
          aspect-ratio: 4/5;
          background: #111;
          margin-bottom: 1rem;
          overflow: hidden;
          border: 1px solid #1a1a1a;
          transition: border-color 0.3s;
        }

        .merch-product-card:hover .card-image-container {
          border-color: rgba(220, 38, 38, 0.4);
        }

        .card-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.5s, transform 0.7s;
        }

        .card-image.primary {
          opacity: 1;
        }

        .card-image.primary.hidden {
          opacity: 0;
        }

        .card-image.secondary {
          opacity: 0;
        }

        .card-image.secondary.visible {
          opacity: 1;
        }

        .merch-product-card:hover .card-image {
          transform: scale(1.05);
        }

        .card-badges {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          z-index: 5;
        }

        .badge {
          padding: 0.35rem 0.6rem;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        .badge.new {
          background: #dc2626;
          color: white;
          box-shadow: 0 0 15px rgba(220, 38, 38, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .badge.sold-out {
          background: #0a0a0a;
          color: #737373;
          border: 1px solid #262626;
        }

        .wishlist-btn {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          padding: 0.5rem;
          background: rgba(5, 5, 5, 0.7);
          backdrop-filter: blur(4px);
          border: 1px solid #262626;
          color: white;
          cursor: pointer;
          opacity: 0;
          transition: all 0.3s;
          z-index: 5;
        }

        .wishlist-btn.visible {
          opacity: 1;
        }

        .wishlist-btn.active {
          color: #dc2626;
          border-color: #dc2626;
          background: rgba(220, 38, 38, 0.1);
        }

        .wishlist-btn:hover {
          background: #dc2626;
          border-color: #dc2626;
          color: white;
          box-shadow: 0 0 15px rgba(220, 38, 38, 0.5);
        }

        .quick-view-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 0.75rem 1rem;
          background: #dc2626;
          display: flex;
          justify-content: center;
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 -5px 20px rgba(220, 38, 38, 0.4);
        }

        .quick-view-overlay.visible {
          transform: translateY(0);
        }

        .quick-view-overlay span {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: white;
        }

        .card-content {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          padding-top: 0.5rem;
        }

        .card-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 16px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: -0.01em;
          color: white;
          margin-bottom: 0.25rem;
          transition: all 0.2s;
        }

        .merch-product-card:hover .card-title {
          color: #dc2626;
          text-shadow: 0 0 10px rgba(220, 38, 38, 0.3);
        }

        .card-price {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .current-price {
          font-size: 14px;
          font-family: monospace;
          color: #dc2626;
          font-weight: 700;
        }

        .original-price {
          font-size: 12px;
          font-family: monospace;
          color: #525252;
          text-decoration: line-through;
        }

        .mobile-add-btn {
          display: none;
          width: 100%;
          padding: 0.85rem;
          margin-top: auto;
          background: #171717;
          border: 1px solid #262626;
          color: white;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mobile-add-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .quick-view-overlay {
            display: none;
          }

          .mobile-add-btn {
            display: block;
          }

          .merch-product-card:hover .mobile-add-btn {
            opacity: 1;
          }
        }

        @media (min-width: 769px) {
          .mobile-add-btn {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
