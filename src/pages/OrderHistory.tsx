import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useNavigate } from 'react-router-dom'
import { OrderCard } from '../components/Merch/OrderCard'
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
    <div className="app-surface-page min-h-screen bg-black">
      <div className="bg-gradient-to-b from-black to-transparent py-12 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-2">Order History</h1>
          <p className="text-gray-400">
            {orders?.length || 0} order{orders?.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="app-surface-shell max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-4 mb-8">
          <div className="relative">
            <iconify-icon icon="solar:magnifer-linear" width="20" height="20" class="absolute left-3 top-3 text-gray-500"></iconify-icon>
            <input
              type="text"
              placeholder="Search by order number or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statuses.map(status => (
              <button
                key={status.value || 'all'}
                onClick={() => setFilterStatus(status.value)}
                className={`px-4 py-2 rounded transition-colors ${
                  filterStatus === status.value
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {!orders ? (
          <div className="text-center py-12">
            <iconify-icon icon="solar:spinner-linear" width="48" height="48" class="animate-spin text-red-500 mx-auto mb-4"></iconify-icon>
            <p className="text-gray-400">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">
              {searchTerm || filterStatus ? 'No orders found' : 'You have no orders yet'}
            </p>
            <button
              onClick={() => navigate('/store')}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.map(order => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
