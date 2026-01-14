import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { CartItem } from '../components/Merch/CartItem'
import { CartSummary } from '../components/Merch/CartSummary'
import { showToast } from '../lib/toast'
import { useState } from 'react'

export function ShoppingCart() {
  const navigate = useNavigate()
  const {
    items,
    itemCount,
    subtotal,
    tax,
    shipping,
    total,
    isEmpty,
    updateQuantity,
    removeItem,
    clearCart,
    isLoading,
  } = useCart()

  const [isProceedingToCheckout, setIsProceedingToCheckout] = useState(false)

  const handleCheckout = async () => {
    if (isEmpty) {
      showToast('Your cart is empty', { type: 'error' })
      return
    }

    setIsProceedingToCheckout(true)
    try {
      navigate('/merch/checkout')
    } catch {
      showToast('Failed to proceed to checkout', { type: 'error' })
    } finally {
      setIsProceedingToCheckout(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 border-b border-gray-800 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/merch')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-4"
          >
            <iconify-icon icon="solar:alt-arrow-left-linear" width="16" height="16"></iconify-icon>
            Continue Shopping
          </button>
          <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <iconify-icon icon="solar:spinner-linear" width="48" height="48" class="animate-spin text-red-500 mx-auto mb-4"></iconify-icon>
            <p className="text-gray-400">Loading cart...</p>
          </div>
        ) : isEmpty ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate('/merch')}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <CartItem
                  key={item.variantId}
                  item={item}
                  onUpdateQuantity={(qty) => updateQuantity(item.variantId, qty)}
                  onRemove={() => removeItem(item.variantId)}
                  loading={isLoading}
                />
              ))}

              {/* Clear cart button */}
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/merch/orders')}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  View Order History
                </button>
                <button
                  onClick={async () => {
                    if (confirm('Clear your entire cart?')) {
                      try {
                        await clearCart()
                        showToast('Cart cleared', { type: 'success' })
                      } catch {
                        showToast('Failed to clear cart', { type: 'error' })
                      }
                    }
                  }}
                  className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Summary sidebar */}
            <div className="lg:col-span-1">
              <CartSummary
                subtotal={subtotal}
                tax={tax}
                shipping={shipping}
                total={total}
                itemCount={itemCount}
                onCheckout={handleCheckout}
                loading={isProceedingToCheckout}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default ShoppingCart;
