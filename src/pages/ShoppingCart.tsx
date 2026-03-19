import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { CartItem } from '../components/Merch/CartItem'
import { CartSummary } from '../components/Merch/CartSummary'
import { StoreSectionNav } from '../components/Merch/StoreSectionNav'
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
      <div className="mx-auto w-full max-w-[1700px] px-4 py-4 sm:px-6 lg:px-8">
        <section className="store-surface-shell store-v2-shell motion-panel-enter p-4 lg:p-5">
          <header className="space-y-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <p className="store-v2-shell-kicker">Store App Mode</p>
                <StoreSectionNav activeId="cart" className="w-full xl:w-auto" />
              </div>
              <div className="store-v2-rail-actions">
                <button type="button" onClick={() => navigate('/store')} className="store-v2-scene-pill">
                  <iconify-icon icon="solar:buildings-3-linear" width="16" height="16"></iconify-icon>
                  View Store Scene
                </button>
                <button type="button" onClick={() => navigate('/store/browse')} className="store-v2-shell-link">
                  Browse Collection
                </button>
              </div>
            </div>

            <section className="store-v2-page-hero p-5 lg:p-6">
              <div className="store-v2-page-hero-grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]">
                <div className="store-v2-page-hero-copy">
                  <div className="store-v2-hero-copy-panel">
                    <p className="store-v2-label">Cart staging</p>
                    <h1 className="store-v2-page-title">Review the collection before it crosses into checkout.</h1>
                    <p className="store-v2-page-copy">
                      The cart stays inside the same Store system: scenic entry remains optional, your operational checkout flow remains direct, and the collection context stays visible while you adjust quantity and timing.
                    </p>
                  </div>
                </div>

                <div className="store-v2-page-hero-panel">
                  <p className="store-v2-label">Cart summary</p>
                  <div className="store-v2-page-stats mt-4">
                    <div className="store-v2-page-stat">
                      <span className="store-v2-label">Items</span>
                      <span className="store-v2-page-stat-value">{itemCount}</span>
                      <p className="store-v2-page-stat-copy">Ready for checkout or further refinement.</p>
                    </div>
                    <div className="store-v2-page-stat">
                      <span className="store-v2-label">Total</span>
                      <span className="store-v2-page-stat-value">${(total / 100).toFixed(2)}</span>
                      <p className="store-v2-page-stat-copy">Shipping and tax stay visible before you commit.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </header>

          <div className="mt-6">
            {isLoading ? (
              <div className="store-v2-surface-card store-v2-empty-state">
                <iconify-icon icon="solar:spinner-linear" width="40" height="40" class="animate-spin text-[var(--store-v2-tone-accent)]"></iconify-icon>
                <p className="store-v2-page-copy text-center">Loading cart...</p>
              </div>
            ) : isEmpty ? (
              <div className="store-v2-surface-card store-v2-empty-state">
                <p className="store-v2-page-title text-center !text-[1.8rem]">Your cart is empty.</p>
                <p className="store-v2-page-copy text-center">Enter the collection directly and bring pieces back here when you are ready to stage checkout.</p>
                <button
                  onClick={() => navigate('/store/browse')}
                  className="store-v2-control store-v2-btn-primary"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
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

                  <div className="flex flex-wrap gap-4">
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
        </section>
      </div>
    </div>
  )
}
export default ShoppingCart;
