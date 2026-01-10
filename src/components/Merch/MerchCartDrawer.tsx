import { useNavigate } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'

interface CartItem {
  _id: string
  name: string
  price: number
  quantity: number
  images: string[]
  selectedSize?: string
  selectedVariant?: string
}

interface MerchCartDrawerProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onRemove: (id: string) => void
}

export const MerchCartDrawer = ({ isOpen, onClose, items, onRemove }: MerchCartDrawerProps) => {
  const navigate = useNavigate()
  const removeFromCart = useMutation(api.cart.removeFromCart)
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const handleRemove = async (variantId: string) => {
    try {
      await removeFromCart({ variantId: variantId as Id<'merchVariants'> })
    } catch {
      onRemove(variantId) // Fallback to parent handler
    }
  }

  const handleCheckout = () => {
    onClose()
    navigate('/merch/checkout')
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`cart-backdrop ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>
            <span className="pulse-dot"></span>
            SHOPPING BAG ({itemCount})
          </h2>
          <button onClick={onClose} className="close-btn">
            <iconify-icon icon="solar:close-linear" width="18" height="18"></iconify-icon>
          </button>
        </div>

        <div className="drawer-content">
          {items.length === 0 ? (
            <div className="empty-state">
              <p>Your bag is empty.</p>
              <button onClick={onClose} className="start-shopping">
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item._id}-${idx}`} className="cart-item">
                <div className="item-image">
                  <img 
                    src={item.images[0] || '/placeholder.png'} 
                    alt={item.name}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                  />
                </div>
                <div className="item-info">
                  <div className="item-row">
                    <h3 className="item-name">{item.name}</h3>
                    <button 
                      onClick={() => handleRemove(item._id)}
                      className="remove-btn"
                    >
                      <iconify-icon icon="solar:trash-bin-2-linear" width="14" height="14"></iconify-icon>
                    </button>
                  </div>
                  <p className="item-price">${(item.price / 100).toFixed(2)}</p>
                  <div className="item-meta">
                    {item.selectedVariant && (
                      <span className="meta-tag">{item.selectedVariant.toUpperCase()}</span>
                    )}
                    {item.selectedSize && (
                      <span className="meta-tag">{item.selectedSize}</span>
                    )}
                    <span className="meta-tag">QTY: {item.quantity}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer-footer">
            <div className="subtotal-row">
              <span className="subtotal-label">SUBTOTAL</span>
              <span className="subtotal-value">${(subtotal / 100).toFixed(2)}</span>
            </div>
            <p className="shipping-note">SHIPPING & TAXES CALCULATED AT CHECKOUT</p>
            <button onClick={handleCheckout} className="checkout-btn">
              PROCEED TO CHECKOUT
            </button>
            <button onClick={onClose} className="continue-btn">
              CONTINUE SHOPPING
            </button>
          </div>
        )}
      </div>

      <style>{`
        .cart-backdrop {
          position: fixed;
          top: 64px;
          inset: 64px 0 0 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 1001;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }

        .cart-backdrop.visible {
          opacity: 1;
          pointer-events: auto;
        }

        .cart-drawer {
          position: fixed;
          top: 64px;
          right: 0;
          height: calc(100vh - 64px);
          width: 100%;
          max-width: 400px;
          background: #0a0a0a;
          border-left: 1px solid #1a1a1a;
          z-index: 1002;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.3s ease-out;
          font-family: var(--font-store, ui-monospace, monospace);
        }

        .cart-drawer.open {
          transform: translateX(0);
        }

        .drawer-header {
          padding: 20px 24px;
          border-bottom: 1px solid #1a1a1a;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .drawer-header h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: white;
          margin: 0;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #dc2626;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .close-btn {
          padding: 8px;
          background: transparent;
          border: none;
          color: #525252;
          cursor: pointer;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: white;
        }

        .drawer-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .empty-state {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: #525252;
        }

        .empty-state p {
          font-size: 13px;
        }

        .start-shopping {
          background: transparent;
          border: none;
          color: #dc2626;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          cursor: pointer;
          text-decoration: underline;
          font-family: inherit;
        }

        .cart-item {
          display: flex;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid #171717;
        }

        .cart-item:first-child {
          padding-top: 0;
        }

        .item-image {
          width: 72px;
          height: 90px;
          background: #111;
          flex-shrink: 0;
          overflow: hidden;
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .item-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }

        .item-name {
          font-size: 12px;
          font-weight: 600;
          color: white;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .remove-btn {
          background: transparent;
          border: none;
          color: #404040;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
        }

        .remove-btn:hover {
          color: #dc2626;
        }

        .item-price {
          font-size: 13px;
          color: #dc2626;
          margin: 4px 0 0 0;
          font-weight: 600;
        }

        .item-meta {
          margin-top: auto;
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          padding-top: 8px;
        }

        .meta-tag {
          font-size: 9px;
          color: #737373;
          padding: 4px 8px;
          background: #111;
          border: 1px solid #1a1a1a;
          font-weight: 500;
        }

        .drawer-footer {
          padding: 24px;
          border-top: 1px solid #1a1a1a;
          background: #080808;
        }

        .subtotal-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .subtotal-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: #737373;
        }

        .subtotal-value {
          font-size: 18px;
          font-weight: 700;
          color: white;
        }

        .shipping-note {
          font-size: 9px;
          letter-spacing: 0.1em;
          color: #dc2626;
          text-align: center;
          margin: 0 0 20px 0;
        }

        .checkout-btn {
          width: 100%;
          padding: 14px;
          background: #dc2626;
          border: none;
          color: white;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.15em;
          cursor: pointer;
          transition: background 0.2s;
          font-family: inherit;
        }

        .checkout-btn:hover {
          background: #ef4444;
        }

        .continue-btn {
          width: 100%;
          margin-top: 16px;
          background: transparent;
          border: none;
          color: #525252;
          font-size: 10px;
          letter-spacing: 0.15em;
          cursor: pointer;
          font-family: inherit;
          transition: color 0.2s;
        }

        .continue-btn:hover {
          color: white;
        }
      `}</style>
    </>
  )
}
