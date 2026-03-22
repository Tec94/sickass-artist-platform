import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../../convex/_generated/api'
import { OrderTracking } from '../components/Merch/OrderTracking'
import { StoreTopRail } from '../components/Merch/StoreTopRail'
import { STORE_DESIGN_HERO_IMAGE } from '../features/store/storeDesignAssets'
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

  const placedLabel = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const statusStripCopy = order.status === 'shipped'
    ? `Tracking ${order.trackingNumber ? `· ${order.trackingNumber}` : 'in progress'}`
    : order.status === 'processing'
      ? 'Payment confirmed · Studio fulfillment'
      : 'Payment recorded · Archive updated'

  return (
    <div className="app-surface-page store-v2-root min-h-screen bg-black">
      <div className="store-v2-page-frame">
        <StoreTopRail
          activeId="orders"
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
            backgroundImage: `linear-gradient(118deg, rgba(9,7,6,0.24), rgba(9,7,6,0.8)), url(${STORE_DESIGN_HERO_IMAGE})`,
          }}
        >
          <div className="store-v2-route-hero__content">
            <button
              onClick={() => navigate('/store/orders')}
              className="store-v2-back-link mb-4"
            >
              <iconify-icon icon="solar:alt-arrow-left-linear" width="16" height="16"></iconify-icon>
              Back to Orders
            </button>
            <p className="store-v2-label">Order detail / {order.status} state</p>
            <h1 className="store-v2-route-title store-v2-route-title--compact">
              Order {order.orderNumber} keeps clarity, status, and support inside one warm system.
            </h1>
          </div>
        </section>

        <section className="store-v2-status-strip">
          <div className="store-v2-status-strip__group">
            <span className="store-v2-pill">Placed</span>
            <p className="store-v2-meta">{placedLabel}</p>
          </div>
          <span className="store-v2-label">{statusStripCopy}</span>
        </section>

        <div className="store-v2-page-columns">
          <div className="space-y-5">
            <div className="store-v2-surface-card p-6">
              <div className="mb-4 flex items-center justify-between">
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
                  <p className="text-[var(--store-v2-tone-text-main)]">{placedLabel}</p>
                </div>
                <div>
                  <p className="mb-1 text-[var(--store-v2-tone-text-muted)]">Status</p>
                  <p className="font-semibold capitalize text-[var(--store-v2-tone-accent)]">{order.status}</p>
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
                {order.items.map((item, index) => (
                  <div
                    key={index}
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
          </div>

          <aside className="store-v2-aside-stack">
            <div className="store-v2-surface-card p-6">
              <h3 className="font-semibold text-[var(--store-v2-tone-text-main)]">Order Summary</h3>

              <div className="mt-4 space-y-2 border-b border-[rgba(216,184,152,0.14)] pb-4 text-sm">
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

              <div className="mt-4 flex items-center justify-between">
                <span className="font-semibold text-[var(--store-v2-tone-text-main)]">Total</span>
                <span className="text-2xl font-bold text-[var(--store-v2-tone-accent)]">
                  ${(order.total / 100).toFixed(2)}
                </span>
              </div>

              <button
                onClick={handlePrintReceipt}
                className="store-v2-control store-v2-btn-secondary mt-5 w-full justify-center gap-2"
              >
                <iconify-icon icon="solar:download-linear" width="16" height="16"></iconify-icon>
                Print Receipt
              </button>
            </div>

            <div className="store-v2-surface-card p-6">
              <p className="store-v2-label">Shipping address</p>
              <div className="mt-4 space-y-1 text-sm text-[var(--store-v2-tone-text-meta)]">
                <p className="font-semibold">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 ? <p>{order.shippingAddress.addressLine2}</p> : null}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="pt-2 text-[var(--store-v2-tone-text-muted)]">{order.shippingAddress.email}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
