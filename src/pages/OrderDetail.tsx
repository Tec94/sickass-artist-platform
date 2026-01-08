import { useQuery } from 'convex/react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../../convex/_generated/api'
import { OrderTracking } from '../components/Merch/OrderTracking'
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
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Order not found</h1>
        <button
          onClick={() => navigate('/merch/orders')}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded"
        >
          Back to Orders
        </button>
      </div>
    )
  }

  if (order === undefined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <iconify-icon icon="solar:spinner-linear" width="48" height="48" class="animate-spin text-cyan-500 mx-auto mb-4"></iconify-icon>
          <p className="text-gray-400">Loading order...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Order not found</h1>
        <button
          onClick={() => navigate('/merch/orders')}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded"
        >
          Back to Orders
        </button>
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
    <div className="min-h-screen bg-black">
      <div className="sticky top-0 z-10 bg-black/80 border-b border-gray-800 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/merch/orders')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-4"
          >
            <iconify-icon icon="solar:alt-arrow-left-linear" width="16" height="16"></iconify-icon>
            Back to Orders
          </button>
          <h1 className="text-3xl font-bold text-white">Order Details</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Order Number</p>
                  <p className="font-mono text-2xl font-bold text-white">
                    {order.orderNumber}
                  </p>
                </div>
                <button
                  onClick={handleCopyOrderNumber}
                  className="p-2 hover:bg-gray-800 rounded transition-colors"
                  title="Copy order number"
                >
                  <iconify-icon 
                    icon="solar:copy-linear" 
                    width="20" 
                    height="20" 
                    class={copied ? 'text-green-400' : 'text-gray-400'}
                  ></iconify-icon>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Order Date</p>
                  <p className="text-white">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Status</p>
                  <p className="text-cyan-400 font-semibold capitalize">
                    {order.status}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Tracking</h2>
              <OrderTracking order={order} />
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Items</h2>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between p-3 bg-gray-800/30 rounded border border-gray-800"
                  >
                    <div>
                      <p className="text-white font-semibold">{item.productName}</p>
                      <p className="text-gray-400 text-sm">
                        {item.variantName} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-cyan-400 font-semibold">
                      ${(item.totalPrice / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Shipping Address
              </h2>
              <div className="text-gray-300 space-y-1 text-sm">
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
                <p className="pt-2 text-gray-500">{order.shippingAddress.email}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4 sticky top-24">
              <h3 className="font-semibold text-white">Order Summary</h3>

              <div className="space-y-2 text-sm border-b border-gray-800 pb-4">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>${(order.subtotal / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tax</span>
                  <span>${(order.tax / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span>${(order.shipping / 100).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold text-white">Total</span>
                <span className="text-2xl font-bold text-cyan-400">
                  ${(order.total / 100).toFixed(2)}
                </span>
              </div>

              <button
                onClick={handlePrintReceipt}
                className="w-full mt-4 py-2 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded flex items-center justify-center gap-2 transition-colors"
              >
                <iconify-icon icon="solar:download-linear" width="16" height="16"></iconify-icon>
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
