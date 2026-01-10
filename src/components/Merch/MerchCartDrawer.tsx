import { useNavigate } from 'react-router-dom'

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
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleCheckout = () => {
    onClose()
    navigate('/merch/checkout')
  }

  const handleViewCart = () => {
    onClose()
    navigate('/merch/cart')
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`cart-drawer-backdrop ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>
            <span className="pulse-dot"></span>
            Shopping Bag ({items.length})
          </h2>
          <button onClick={onClose} className="close-btn">
            <iconify-icon icon="solar:close-circle-linear" width="20" height="20"></iconify-icon>
          </button>
        </div>

        <div className="drawer-content">
          {items.length === 0 ? (
            <div className="empty-state">
              <p>Your bag is empty.</p>
              <button onClick={onClose} className="continue-link">
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item._id}-${idx}`} className="cart-item">
                <div className="item-image">
                  <img src={item.images[0] || '/placeholder.png'} alt={item.name} />
                </div>
                <div className="item-details">
                  <div className="item-header">
                    <h3>{item.name}</h3>
                    <button 
                      onClick={() => onRemove(item._id)}
                      className="remove-btn"
                    >
                      <iconify-icon icon="solar:trash-bin-2-linear" width="16" height="16"></iconify-icon>
                    </button>
                  </div>
                  <p className="item-price">${(item.price / 100).toFixed(2)}</p>
                  
                  <div className="item-meta">
                    {item.selectedSize && (
                      <span className="meta-tag">SIZE: {item.selectedSize}</span>
                    )}
                    {item.selectedVariant && (
                      <span className="meta-tag">{item.selectedVariant.toUpperCase()}</span>
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
            <div className="subtotal">
              <span className="subtotal-label">Subtotal</span>
              <span className="subtotal-value">${(subtotal / 100).toFixed(2)}</span>
            </div>
            <p className="shipping-note">Shipping & taxes calculated at checkout.</p>
            <button onClick={handleCheckout} className="checkout-btn">
              Proceed to Checkout
            </button>
            <button onClick={handleViewCart} className="view-cart-btn">
              View Full Cart
            </button>
            <button onClick={onClose} className="continue-btn">
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      <style>{`
        .cart-drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
          z-index: 100;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }

        .cart-drawer-backdrop.visible {
          opacity: 1;
          pointer-events: auto;
        }

        .cart-drawer {
          position: fixed;
          top: 0;
          right: 0;
          height: 100%;
          width: 100%;
          max-width: 450px;
          background: #0a0a0a;
          border-left: 1px solid #1a1a1a;
          z-index: 101;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.3s;
          box-shadow: -10px 0 40px rgba(0, 0, 0, 0.5);
        }

        .cart-drawer.open {
          transform: translateX(0);
        }

        .drawer-header {
          padding: 1.5rem;
          border-bottom: 1px solid #1a1a1a;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .drawer-header h2 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 16px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          color: white;
          margin: 0;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #22d3ee;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .close-btn {
          padding: 0.5rem;
          background: transparent;
          border: none;
          color: #808080;
          cursor: pointer;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .close-btn:hover {
          color: white;
          background: #1a1a1a;
        }

        .drawer-content {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
        }

        .empty-state {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          color: #808080;
        }

        .empty-state p {
          font-family: monospace;
          font-size: 14px;
        }

        .continue-link {
          background: transparent;
          border: none;
          color: #22d3ee;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          text-decoration: underline;
        }

        .continue-link:hover {
          color: #67e8f9;
        }

        .cart-item {
          display: flex;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid #1a1a1a;
          animation: fadeIn 0.3s;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .item-image {
          width: 80px;
          height: 96px;
          background: #111;
          border: 1px solid #1a1a1a;
          flex-shrink: 0;
          overflow: hidden;
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.8;
          transition: opacity 0.2s;
        }

        .cart-item:hover .item-image img {
          opacity: 1;
        }

        .item-details {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .item-header h3 {
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          color: white;
          margin: 0;
          padding-right: 1rem;
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
          color: #ef4444;
        }

        .item-price {
          font-size: 14px;
          font-family: monospace;
          color: #22d3ee;
          margin: 0.25rem 0;
        }

        .item-meta {
          margin-top: auto;
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .meta-tag {
          font-size: 10px;
          font-family: monospace;
          color: #808080;
          padding: 0.25rem 0.5rem;
          background: #111;
          border: 1px solid #1a1a1a;
        }

        .drawer-footer {
          padding: 1.5rem;
          border-top: 1px solid #1a1a1a;
        }

        .subtotal {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .subtotal-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #808080;
        }

        .subtotal-value {
          font-size: 18px;
          font-family: monospace;
          color: white;
        }

        .shipping-note {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #404040;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .checkout-btn {
          width: 100%;
          padding: 1rem;
          background: #22d3ee;
          border: none;
          color: black;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 0 15px rgba(34, 211, 238, 0.3);
        }

        .checkout-btn:hover {
          background: #67e8f9;
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.5);
        }

        .view-cart-btn {
          width: 100%;
          padding: 0.75rem;
          margin-top: 0.5rem;
          background: transparent;
          border: 1px solid #333;
          color: white;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-cart-btn:hover {
          border-color: #22d3ee;
          color: #22d3ee;
        }

        .continue-btn {
          width: 100%;
          margin-top: 1rem;
          background: transparent;
          border: none;
          color: #808080;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          cursor: pointer;
          transition: color 0.2s;
        }

        .continue-btn:hover {
          color: white;
        }
      `}</style>
    </>
  )
}
