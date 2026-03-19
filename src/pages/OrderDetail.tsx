import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../../convex/_generated/api'
import { OrderTracking } from '../components/Merch/OrderTracking'
import { StoreSectionNav } from '../components/Merch/StoreSectionNav'
import { useState } from 'react'
import { showToast } from '../lib/toast'

export function OrderDetail() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()
  const order = useQuery(
    api.orders.getOrder,
    isSignedIn && orderNumber ? { orderNumber } : 'skip'
  )
  const [copied, setCopied] = useState(false)

  if (!orderNumber) {
    return (
      <div className="app-surface-page store-v2-root flex min-h-screen items-center justify-center bg-black p-4">
        <div className="store-v2-surface-card store-v2-empty-state max-w-lg">
          <h1 className="store-v2-page-title text-center !text-[1.8rem]">Order not found.</h1>
          <button
            onClick={() => navigate('/store/orders')}
            className="store-v2-control store-v2-btn-primary"
          >
            Back to Orders
          </button>
        </div>
      </div>
    )
  }

  if (order === undefined) {
    return (
      <div className="app-surface-page store-v2-root flex min-h-screen items-center justify-center bg-black p-4">
        <div className="store-v2-surface-card store-v2-empty-state max-w-lg">
          <iconify-icon icon="solar:spinner-linear" width="48" height="48" class="animate-spin text-[var(--store-v2-tone-accent)]"></iconify-icon>
          <p className="store-v2-page-copy text-center">Loading order...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="app-surface-page store-v2-root flex min-h-screen items-center justify-center bg-black p-4">
        <div className="store-v2-surface-card store-v2-empty-state max-w-lg">
          <h1 className="store-v2-page-title text-center !text-[1.8rem]">Order not found.</h1>
          <button
            onClick={() => navigate('/store/orders')}
            className="store-v2-control store-v2-btn-primary"
          >
            Back to Orders
          </button>
        </div>
      </div>
    )
  }

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber)
    setCopied(true)
    showToast('Order number copied!', { type: 'success' })
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrintReceipt = () => {
    window.print()
  }

  return (
    <div className="app-surface-page store-v2-root min-h-screen bg-black">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-4 sm:px-6 lg:px-8">
        <section className="store-surface-shell store-v2-shell motion-panel-enter p-4 lg:p-5">
          <header className="space-y-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <p className="store-v2-shell-kicker">Store App Mode</p>
                <StoreSectionNav activeId="orders" className="w-full xl:w-auto" />
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
              <div className="store-v2-page-hero-grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)]">
                <div className="store-v2-page-hero-copy">
                  <div className="store-v2-hero-copy-panel">
                    <button
                      onClick={() => navigate('/store/orders')}
                      className="store-v2-back-link mb-4"
                    >
                      <iconify-icon icon="solar:alt-arrow-left-linear" width="16" height="16"></iconify-icon>
                      Back to Orders
                    </button>
                    <p className="store-v2-label">Order detail</p>
                    <h1 className="store-v2-page-title">Order {order.orderNumber}</h1>
                    <p className="store-v2-page-copy">
                      Track shipping, review line items, and keep the same Store context while moving between your archive and the working collection.
                    </p>
                  </div>
                </div>

                <div className="store-v2-page-hero-panel">
                  <p className="store-v2-label">Summary</p>
                  <div className="store-v2-page-stats mt-4">
                    <div className="store-v2-page-stat">
                      <span className="store-v2-label">Status</span>
                      <span className="store-v2-page-stat-value text-[1.15rem] capitalize">{order.status}</span>
                      <p className="store-v2-page-stat-copy">Latest order state for this purchase.</p>
                    </div>
                    <div className="store-v2-page-stat">
                      <span className="store-v2-label">Total</span>
                      <span className="store-v2-page-stat-value">${(order.total / 100).toFixed(2)}</span>
                      <p className="store-v2-page-stat-copy">All taxes and shipping included.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </header>

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-8">
              <div className="store-v2-surface-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="mb-1 text-sm text-[var(--store-v2-tone-text-muted)]">Order Number</p>
                  <p className="font-mono text-2xl font-bold text-[var(--store-v2-tone-text-main)]">
                    {order.orderNumber}
                  </p>
                </div>
                <button
                  onClick={handleCopyOrderNumber}
                  className="store-v2-detail-icon-button p-2"
                  title="Copy order number"
                >
                  <iconify-icon 
                    icon="solar:copy-linear" 
                    width="20" 
                    height="20" 
                    class={copied ? 'text-[var(--store-v2-tone-accent)]' : 'text-[var(--store-v2-tone-text-muted)]'}
                  ></iconify-icon>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="mb-1 text-[var(--store-v2-tone-text-muted)]">Order Date</p>
                  <p className="text-[var(--store-v2-tone-text-main)]">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-[var(--store-v2-tone-text-muted)]">Status</p>
                  <p className="font-semibold capitalize text-[var(--store-v2-tone-accent)]">
                    {order.status}
                  </p>
                </div>
              </div>
            </div>

            <div className="store-v2-surface-card p-6">
              <h2 className="store-v2-h2 mb-6 text-[var(--store-v2-tone-text-main)]">Tracking</h2>
              <OrderTracking order={order} />
            </div>

            <div className="store-v2-surface-card p-6">
              <h2 className="store-v2-h2 mb-4 text-[var(--store-v2-tone-text-main)]">Items</h2>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="store-v2-surface-card store-v2-surface-card--soft flex justify-between gap-4 p-4"
                  >
                    <div>
                      <p className="font-semibold text-[var(--store-v2-tone-text-main)]">{item.productName}</p>
                      <p className="text-sm text-[var(--store-v2-tone-text-meta)]">
                        {item.variantName} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-[var(--store-v2-tone-accent)]">
                      ${(item.totalPrice / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="store-v2-surface-card p-6">
              <h2 className="store-v2-h2 mb-4 text-[var(--store-v2-tone-text-main)]">
                Shipping Address
              </h2>
              <div className="space-y-1 text-sm text-[var(--store-v2-tone-text-meta)]">
                <p className="font-semibold">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="pt-2 text-[var(--store-v2-tone-text-muted)]">{order.shippingAddress.email}</p>
              </div>
            </div>
            </div>

            <div className="lg:col-span-1">
              <div className="store-v2-surface-card sticky top-24 space-y-4 p-6">
                <h3 className="font-semibold text-[var(--store-v2-tone-text-main)]">Order Summary</h3>

                <div className="space-y-2 border-b border-[rgba(216,184,152,0.14)] pb-4 text-sm">
                  <div className="flex justify-between text-[var(--store-v2-tone-text-meta)]">
                  <span>Subtotal</span>
                  <span>${(order.subtotal / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--store-v2-tone-text-meta)]">
                  <span>Tax</span>
                  <span>${(order.tax / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--store-v2-tone-text-meta)]">
                  <span>Shipping</span>
                  <span>${(order.shipping / 100).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--store-v2-tone-text-main)]">Total</span>
                  <span className="text-2xl font-bold text-[var(--store-v2-tone-accent)]">
                    ${(order.total / 100).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handlePrintReceipt}
                  className="store-v2-control store-v2-btn-secondary mt-4 w-full justify-center gap-2"
                >
                  <iconify-icon icon="solar:download-linear" width="16" height="16"></iconify-icon>
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
