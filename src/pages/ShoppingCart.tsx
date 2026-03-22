import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { CartItem } from '../components/Merch/CartItem'
import { CartSummary } from '../components/Merch/CartSummary'
import { StoreTopRail } from '../components/Merch/StoreTopRail'
import { STORE_DESIGN_HERO_IMAGE } from '../features/store/storeDesignAssets'
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
      navigate('/store/checkout')
    } catch {
      showToast('Failed to proceed to checkout', { type: 'error' })
    } finally {
      setIsProceedingToCheckout(false)
    }
  }

  return (
    <div className="app-surface-page store-v2-root min-h-screen bg-black">
      <div className="store-v2-page-frame">
        <StoreTopRail
          activeId="cart"
          actions={[
            {
              label: 'View Store Scene',
              onClick: () => navigate('/store'),
              icon: 'solar:buildings-3-linear',
              variant: 'pill',
            },
            {
              label: 'Browse Collection',
              onClick: () => navigate('/store/browse'),
            },
          ]}
        />

        <section
          className="store-v2-route-hero store-v2-route-hero--compact"
          style={{
            backgroundImage: `linear-gradient(118deg, rgba(9,7,6,0.24), rgba(9,7,6,0.78)), url(${STORE_DESIGN_HERO_IMAGE})`,
          }}
        >
          <div className="store-v2-route-hero__content">
            <p className="store-v2-label">Cart / Final selection</p>
            <h1 className="store-v2-route-title store-v2-route-title--compact">
              Keep the cart calm, readable, and ready to close.
            </h1>
          </div>
        </section>

        {isLoading ? (
          <div className="store-v2-surface-card store-v2-empty-state">
            <iconify-icon icon="solar:spinner-linear" width="40" height="40" class="animate-spin text-[var(--store-v2-tone-accent)]" />
            <p className="store-v2-page-copy text-center">Loading cart...</p>
          </div>
        ) : isEmpty ? (
          <div className="store-v2-surface-card store-v2-empty-state">
            <p className="store-v2-page-title text-center !text-[1.8rem]">Your cart is empty.</p>
            <p className="store-v2-page-copy text-center">
              Enter the collection directly and bring pieces back here when you are ready to stage checkout.
            </p>
            <button
              onClick={() => navigate('/store/browse')}
              className="store-v2-control store-v2-btn-primary"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="store-v2-page-columns">
            <div className="space-y-4">
              {items.map((item) => (
                <CartItem
                  key={item.variantId}
                  item={item}
                  onUpdateQuantity={(qty) => updateQuantity(item.variantId, qty)}
                  onRemove={() => removeItem(item.variantId)}
                  loading={isLoading}
                />
              ))}

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => navigate('/store/orders')}
                  className="store-v2-shell-link"
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
                  className="store-v2-shell-link"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            <div>
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

export default ShoppingCart
