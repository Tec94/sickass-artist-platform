import { useNavigate } from 'react-router-dom'
import { Doc } from '../../../convex/_generated/dataModel'

interface OrderCardProps {
  order: Doc<'merchOrders'>
}

export function OrderCard({ order }: OrderCardProps) {
  const navigate = useNavigate()

  const statusLabel = {
    pending: 'Pending',
    paid: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }

  const statusTone = {
    pending: 'store-v2-status-copy store-v2-status-copy--pending',
    paid: 'store-v2-status-copy store-v2-status-copy--paid',
    processing: 'store-v2-status-copy store-v2-status-copy--processing',
    shipped: 'store-v2-status-copy store-v2-status-copy--shipped',
    delivered: 'store-v2-status-copy store-v2-status-copy--delivered',
    cancelled: 'store-v2-status-copy store-v2-status-copy--cancelled',
  }

  return (
    <button
      onClick={() => navigate(`/store/orders/${order.orderNumber}`)}
      className="store-v2-surface-card store-v2-record-card group w-full p-5 text-left"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <iconify-icon icon="solar:box-linear" width="20" height="20" class="mt-1 flex-shrink-0 text-[var(--store-v2-tone-text-muted)]"></iconify-icon>
          <div>
            <p className="font-mono font-semibold text-[var(--store-v2-tone-text-main)]">
              {order.orderNumber}
            </p>
            <p className="mt-1 text-xs text-[var(--store-v2-tone-text-muted)]">
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
        <iconify-icon icon="solar:alt-arrow-right-linear" width="20" height="20" class="flex-shrink-0 text-[var(--store-v2-tone-text-muted)] transition-colors group-hover:text-[var(--store-v2-tone-accent)]"></iconify-icon>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
        <div>
          <p className="text-xs text-[var(--store-v2-tone-text-muted)]">Total</p>
          <p className="font-semibold text-[var(--store-v2-tone-accent)]">
            ${(order.total / 100).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--store-v2-tone-text-muted)]">Items</p>
          <p className="font-semibold text-[var(--store-v2-tone-text-main)]">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[rgba(216,184,152,0.14)] pt-3">
        <span className={statusTone[order.status as keyof typeof statusTone]}>
          {statusLabel[order.status as keyof typeof statusLabel]}
        </span>
        <span className="text-xs text-[var(--store-v2-tone-text-muted)]">
          View details →
        </span>
      </div>
    </button>
  )
}
