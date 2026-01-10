import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface MerchProductCardProps {
  product: {
    _id: string
    name: string
    price: number
    originalPrice?: number
    images: string[]
    isNew?: boolean
    stock?: number
    category?: string
  }
  onAddToCart?: (productId: string) => void
}

export const MerchProductCard = ({ product, onAddToCart }: MerchProductCardProps) => {
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)
  const isOutOfStock = product.stock === 0

  const handleClick = () => {
    navigate(`/merch/${product._id}`)
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onAddToCart && !isOutOfStock) {
      onAddToCart(product._id)
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
          src={product.images[0] || '/placeholder.png'} 
          alt={product.name}
          className={`card-image primary ${isHovered && product.images[1] ? 'hidden' : ''}`}
        />
        {product.images[1] && (
          <img 
            src={product.images[1]} 
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
          className={`wishlist-btn ${isHovered ? 'visible' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <iconify-icon icon="solar:heart-linear" width="16" height="16"></iconify-icon>
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
          onClick={handleQuickAdd}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? 'Out of Stock' : 'View Details'}
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
          border-color: rgba(34, 211, 238, 0.3);
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
          opacity: 0.9;
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
          top: 0.5rem;
          left: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          z-index: 5;
        }

        .badge {
          padding: 0.25rem 0.5rem;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .badge.new {
          background: #22d3ee;
          color: black;
          box-shadow: 0 0 10px rgba(34, 211, 238, 0.4);
        }

        .badge.sold-out {
          background: #1a1a1a;
          color: #808080;
          border: 1px solid #333;
        }

        .wishlist-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          padding: 0.5rem;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          border: 1px solid #333;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          opacity: 0;
          transition: all 0.3s;
          z-index: 5;
        }

        .wishlist-btn.visible {
          opacity: 1;
        }

        .wishlist-btn:hover {
          background: #22d3ee;
          border-color: #22d3ee;
        }

        .quick-view-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 0.75rem 1rem;
          background: rgba(34, 211, 238, 0.95);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          transform: translateY(100%);
          transition: transform 0.3s;
          border-top: 1px solid rgba(34, 211, 238, 0.5);
        }

        .quick-view-overlay.visible {
          transform: translateY(0);
        }

        .quick-view-overlay span {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: black;
        }

        .card-content {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .card-title {
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          color: white;
          margin-bottom: 0.25rem;
          transition: color 0.2s;
        }

        .merch-product-card:hover .card-title {
          color: #22d3ee;
        }

        .card-price {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .current-price {
          font-size: 14px;
          font-family: monospace;
          color: #808080;
        }

        .original-price {
          font-size: 12px;
          font-family: monospace;
          color: #404040;
          text-decoration: line-through;
        }

        .mobile-add-btn {
          display: none;
          width: 100%;
          padding: 0.75rem;
          margin-top: auto;
          background: #1a1a1a;
          border: 1px solid #333;
          color: white;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
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
