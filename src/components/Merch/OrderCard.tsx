import { useNavigate } from 'react-router-dom'
import { Doc } from '../../../convex/_generated/dataModel'

interface OrderCardProps {
  order: Doc<'merchOrders'>
}

export function OrderCard({ order }: OrderCardProps) {
  const navigate = useNavigate()

  const statusColor = {
    pending: 'text-yellow-400',
    paid: 'text-cyan-400',
    processing: 'text-blue-400',
    shipped: 'text-purple-400',
    delivered: 'text-green-400',
    cancelled: 'text-red-400',
  }

  const statusLabel = {
    pending: 'Pending',
    paid: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }

  return (
    <button
      onClick={() => navigate(`/merch/orders/${order.orderNumber}`)}
      className="w-full text-left p-4 bg-gray-900/50 border border-gray-800 hover:border-cyan-500/50 rounded-lg transition-colors group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <iconify-icon icon="solar:box-linear" width="20" height="20" class="text-gray-400 mt-1 flex-shrink-0"></iconify-icon>
          <div>
            <p className="font-mono text-white font-semibold">
              {order.orderNumber}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
        <iconify-icon icon="solar:alt-arrow-right-linear" width="20" height="20" class="text-gray-600 group-hover:text-cyan-400 transition-colors flex-shrink-0"></iconify-icon>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
        <div>
          <p className="text-gray-500 text-xs">Total</p>
          <p className="text-cyan-400 font-semibold">
            ${(order.total / 100).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Items</p>
          <p className="text-white font-semibold">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-800">
        <span className={`text-sm font-semibold capitalize ${statusColor[order.status as keyof typeof statusColor]}`}>
          {statusLabel[order.status as keyof typeof statusLabel]}
        </span>
        <span className="text-xs text-gray-500">
          View details →
        </span>
      </div>
    </button>
  )
}
