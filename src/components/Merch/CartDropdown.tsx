import { useState } from 'react'
import { useCart } from '../../contexts/CartContext'
import { useNavigate } from 'react-router-dom'

export function CartDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const { items, itemCount, total } = useCart()
  const navigate = useNavigate()

  return (
    <div className="relative">
      {/* Cart button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
      >
        <iconify-icon icon="solar:cart-large-linear" width="20" height="20" class="text-cyan-400"></iconify-icon>
        {itemCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {itemCount > 9 ? '9+' : itemCount}
          </span>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="font-semibold text-white">Shopping Cart</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <iconify-icon icon="solar:close-circle-linear" width="16" height="16"></iconify-icon>
            </button>
          </div>

          {/* Items */}
          {items.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="max-h-64 overflow-y-auto p-4 space-y-3">
                {items.slice(0, 3).map((item) => (
                  <div key={item.variantId} className="text-sm">
                    <div className="flex justify-between mb-1">
                      <p className="text-gray-300 truncate">
                        {item.productName}
                      </p>
                      <p className="text-cyan-400 font-semibold">
                        ${((item.currentPrice * item.quantity) / 100).toFixed(2)}
                      </p>
                    </div>
                    <p className="text-gray-500 text-xs">
                      Qty: {item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              {/* Show more indicator */}
              {items.length > 3 && (
                <div className="px-4 py-2 text-center text-sm text-gray-500">
                  +{items.length - 3} more item{items.length - 3 !== 1 ? 's' : ''}
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-gray-800 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total:</span>
                  <span className="text-lg font-bold text-cyan-400">
                    ${(total / 100).toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigate('/merch/cart')
                    setIsOpen(false)
                  }}
                  className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded transition-colors"
                >
                  View Cart
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
