import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useNavigate } from 'react-router-dom'
import { OrderCard } from '../components/Merch/OrderCard'
import { StoreTopRail } from '../components/Merch/StoreTopRail'
import { STORE_DESIGN_HERO_IMAGE } from '../features/store/storeDesignAssets'
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
          className="store-v2-route-hero"
          style={{
            backgroundImage: `linear-gradient(118deg, rgba(9,7,6,0.24), rgba(9,7,6,0.8)), url(${STORE_DESIGN_HERO_IMAGE})`,
          }}
        >
          <div className="store-v2-route-hero__content">
            <p className="store-v2-label">Orders / Private archive</p>
            <h1 className="store-v2-route-title">
              Every completed order should read like part of a collected body of work.
            </h1>
            <p className="store-v2-route-copy">
              Recent, active, and completed purchases stay legible in one quiet surface instead of falling into dashboard noise.
            </p>
          </div>
        </section>

        <div className="store-v2-page-columns">
          <div className="space-y-5">
            <div className="store-v2-utility">
              <div className="store-v2-utility-top">
                <label className="store-v2-search-wrap">
                  <span className="sr-only">Search orders</span>
                  <iconify-icon
                    icon="solar:magnifer-linear"
                    width="20"
                    height="20"
                    class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--store-v2-tone-text-muted)]"
                  ></iconify-icon>
                  <input
                    type="text"
                    placeholder="Search by order number or email..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="store-v2-control store-v2-search"
                  />
                </label>
              </div>
            </div>

            <div className="store-v2-segmented-filter">
              {statuses.map((status) => (
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
                <iconify-icon icon="solar:spinner-linear" width="40" height="40" class="animate-spin text-[var(--store-v2-tone-accent)]" />
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
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <OrderCard key={order._id} order={order} />
                ))}
              </div>
            )}
          </div>

          <aside className="store-v2-aside-stack">
            <div className="store-v2-surface-card p-5">
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

            <div className="store-v2-surface-card p-5">
              <p className="store-v2-label">Browse next</p>
              <h2 className="store-v2-h2 mt-3 text-[var(--store-v2-tone-text-main)]">
                Re-enter the collection without dropping the archive context.
              </h2>
              <p className="mt-3 store-v2-meta">
                Orders, cart, and browse all stay in the same visual system so account actions never feel detached from the store.
              </p>
              <button
                type="button"
                onClick={() => navigate('/store/browse')}
                className="store-v2-control store-v2-btn-secondary mt-5"
              >
                Browse Collection
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
