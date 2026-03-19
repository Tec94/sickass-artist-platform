import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useNavigate } from 'react-router-dom'
import { OrderCard } from '../components/Merch/OrderCard'
import { StoreSectionNav } from '../components/Merch/StoreSectionNav'
import { useState, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'

export function OrderHistory() {
  const navigate = useNavigate()
  const { isSignedIn, isLoading: _isLoading } = useAuth()
  // Skip query when not authenticated to prevent "Not authenticated" errors
  const orders = useQuery(
    api.orders.getUserOrders,
    isSignedIn ? { limit: 100 } : 'skip'
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)

  const filteredOrders = useMemo(() => {
    if (!orders) return []

    return orders.filter(order => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = !filterStatus || order.status === filterStatus

      return matchesSearch && matchesStatus
    })
  }, [orders, searchTerm, filterStatus])

  const statuses = [
    { value: null, label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <div className="app-surface-page store-v2-root min-h-screen bg-black">
      <div className="mx-auto w-full max-w-[1700px] px-4 py-4 sm:px-6 lg:px-8">
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
              <div className="store-v2-page-hero-grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]">
                <div className="store-v2-page-hero-copy">
                  <div className="store-v2-hero-copy-panel">
                    <p className="store-v2-label">Order archive</p>
                    <h1 className="store-v2-page-title">Track every collection purchase inside the same Store system.</h1>
                    <p className="store-v2-page-copy">
                      Orders remain part of the Store flow rather than a detached account page. Search, filter, and reopen any purchase without losing the sense of current location.
                    </p>
                  </div>
                </div>

                <div className="store-v2-page-hero-panel">
                  <p className="store-v2-label">Archive scope</p>
                  <div className="store-v2-page-stats mt-4">
                    <div className="store-v2-page-stat">
                      <span className="store-v2-label">Orders</span>
                      <span className="store-v2-page-stat-value">{orders?.length || 0}</span>
                      <p className="store-v2-page-stat-copy">Completed and in-flight collection purchases.</p>
                    </div>
                    <div className="store-v2-page-stat">
                      <span className="store-v2-label">Visible</span>
                      <span className="store-v2-page-stat-value">{filteredOrders.length}</span>
                      <p className="store-v2-page-stat-copy">Filtered by status and search criteria below.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </header>

          <div className="mt-6 space-y-5">
            <div className="store-v2-utility">
              <div className="store-v2-utility-top">
                <label className="store-v2-search-wrap">
                  <span className="sr-only">Search orders</span>
                  <iconify-icon icon="solar:magnifer-linear" width="20" height="20" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--store-v2-tone-text-muted)]"></iconify-icon>
                  <input
                    type="text"
                    placeholder="Search by order number or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="store-v2-control store-v2-search"
                  />
                </label>
              </div>
            </div>

            <div className="store-v2-segmented-filter">
              {statuses.map(status => (
                <button
                  key={status.value || 'all'}
                  onClick={() => setFilterStatus(status.value)}
                  className={`store-v2-segmented-filter-button ${filterStatus === status.value ? 'store-v2-segmented-filter-button--active' : ''}`}
                >
                  {status.label}
                </button>
              ))}
            </div>

            {!orders ? (
              <div className="store-v2-surface-card store-v2-empty-state">
                <iconify-icon icon="solar:spinner-linear" width="40" height="40" class="animate-spin text-[var(--store-v2-tone-accent)]"></iconify-icon>
                <p className="store-v2-page-copy text-center">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="store-v2-surface-card store-v2-empty-state">
                <p className="store-v2-page-title text-center !text-[1.8rem]">
                  {searchTerm || filterStatus ? 'No orders found.' : 'You have no orders yet.'}
                </p>
                <p className="store-v2-page-copy text-center">
                  Start from the collection and the rest of the Store flow will route here naturally.
                </p>
                <button
                  onClick={() => navigate('/store/browse')}
                  className="store-v2-control store-v2-btn-primary"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {filteredOrders.map(order => (
                  <OrderCard key={order._id} order={order} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
