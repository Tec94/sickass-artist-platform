import { Check, Clock, Truck, Package } from 'lucide-react'
import { Doc } from '../../../convex/_generated/dataModel'

interface OrderTrackingProps {
  order: Doc<'merchOrders'>
}

export function OrderTracking({ order }: OrderTrackingProps) {
  const stages = [
    {
      status: 'paid',
      label: 'Order Placed',
      icon: Package,
      completed: ['paid', 'processing', 'shipped', 'delivered'].includes(order.status),
      date: order.createdAt,
    },
    {
      status: 'processing',
      label: 'Processing',
      icon: Clock,
      completed: ['processing', 'shipped', 'delivered'].includes(order.status),
      date: undefined,
    },
    {
      status: 'shipped',
      label: 'Shipped',
      icon: Truck,
      completed: ['shipped', 'delivered'].includes(order.status),
      date: order.shippedAt,
    },
    {
      status: 'delivered',
      label: 'Delivered',
      icon: Check,
      completed: order.status === 'delivered',
      date: order.deliveredAt,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const Icon = stage.icon
          const isLast = index === stages.length - 1

          return (
            <div key={stage.status} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    stage.completed
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {!isLast && (
                  <div
                    className={`w-1 h-8 mt-2 transition-colors ${
                      stage.completed ? 'bg-green-600' : 'bg-gray-800'
                    }`}
                  />
                )}
              </div>

              <div className="pt-2 pb-4">
                <h4 className={`font-semibold ${
                  stage.completed ? 'text-white' : 'text-gray-400'
                }`}>
                  {stage.label}
                </h4>
                {stage.date && (
                  <p className="text-sm text-gray-500">
                    {new Date(stage.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
                {stage.status === 'shipped' && order.trackingNumber && (
                  <div className="mt-2 p-2 bg-gray-900/50 border border-gray-800 rounded">
                    <p className="text-xs text-gray-500">Tracking Number</p>
                    <p className="text-sm text-cyan-400 font-mono">
                      {order.trackingNumber}
                    </p>
                    {order.trackingUrl && (
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-400 hover:text-cyan-300 mt-1 block"
                      >
                        Track package →
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {order.status === 'processing' && Date.now() - order.updatedAt > 24 * 60 * 60 * 1000 && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-400 text-sm">
          ⚠️ This order is taking longer than expected. Please contact support if you have concerns.
        </div>
      )}
    </div>
  )
}
