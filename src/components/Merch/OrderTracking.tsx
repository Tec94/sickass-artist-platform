import { Doc } from '../../../convex/_generated/dataModel'

interface OrderTrackingProps {
  order: Doc<'merchOrders'>
}

export function OrderTracking({ order }: OrderTrackingProps) {
  const stages = [
    {
      status: 'paid',
      label: 'Order Placed',
      icon: 'solar:box-linear',
      completed: ['paid', 'processing', 'shipped', 'delivered'].includes(order.status),
      date: order.createdAt,
    },
    {
      status: 'processing',
      label: 'Processing',
      icon: 'solar:clock-circle-linear',
      completed: ['processing', 'shipped', 'delivered'].includes(order.status),
      date: undefined,
    },
    {
      status: 'shipped',
      label: 'Shipped',
      icon: 'solar:delivery-linear',
      completed: ['shipped', 'delivered'].includes(order.status),
      date: order.shippedAt,
    },
    {
      status: 'delivered',
      label: 'Delivered',
      icon: 'solar:check-circle-linear',
      completed: order.status === 'delivered',
      date: order.deliveredAt,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="store-v2-tracking-stack">
        {stages.map((stage, index) => {
          const isLast = index === stages.length - 1

          return (
            <div key={stage.status} className="store-v2-tracking-step">
              <div className="store-v2-tracking-marker">
                <div className={`store-v2-tracking-dot ${stage.completed ? 'store-v2-tracking-dot--complete' : ''}`}>
                  <iconify-icon icon={stage.icon} width="20" height="20"></iconify-icon>
                </div>
                {!isLast ? (
                  <div className={`store-v2-tracking-line ${stage.completed ? 'store-v2-tracking-line--complete' : ''}`} />
                ) : null}
              </div>

              <div className="store-v2-tracking-body">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="store-v2-label">Stage {index + 1}</p>
                    <h4 className="store-v2-h2 mt-2 text-[var(--store-v2-tone-text-main)]">
                      {stage.label}
                    </h4>
                  </div>
                  <span className={`store-v2-status-copy ${stage.completed ? 'store-v2-status-copy--paid' : 'store-v2-status-copy--pending'}`}>
                    {stage.completed ? 'Complete' : 'Pending'}
                  </span>
                </div>

                {stage.date ? (
                  <p className="mt-2 text-sm text-[var(--store-v2-tone-text-meta)]">
                    {new Date(stage.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                ) : null}

                {stage.status === 'shipped' && order.trackingNumber ? (
                  <div className="store-v2-tracking-box">
                    <p className="store-v2-label">Tracking number</p>
                    <p className="mt-2 font-mono text-sm text-[var(--store-v2-tone-text-main)]">
                      {order.trackingNumber}
                    </p>
                    {order.trackingUrl ? (
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="store-v2-shell-link mt-3"
                      >
                        Track package
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      {order.status === 'processing' && Date.now() - order.updatedAt > 24 * 60 * 60 * 1000 ? (
        <div className="store-v2-tracking-alert">
          This order is taking longer than expected. Contact support if you need a manual status check.
        </div>
      ) : null}
    </div>
  )
}
