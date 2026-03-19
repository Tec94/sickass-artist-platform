
interface CartSummaryProps {
  subtotal: number
  tax: number
  shipping: number
  total: number
  itemCount: number
  onCheckout: () => void
  loading?: boolean
}

export function CartSummary({
  subtotal,
  tax,
  shipping,
  total,
  itemCount,
  onCheckout,
  loading,
}: CartSummaryProps) {
  return (
    <div className="store-v2-surface-card sticky top-24 space-y-4 p-6">
      {/* Totals */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-[var(--store-v2-tone-text-meta)]">
          <span>Subtotal ({itemCount} items)</span>
          <span>${(subtotal / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[var(--store-v2-tone-text-meta)]">
          <span>Tax (10%)</span>
          <span>${(tax / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[var(--store-v2-tone-text-meta)]">
          <span>Shipping</span>
          <span>${(shipping / 100).toFixed(2)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-[rgba(216,184,152,0.14)] pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-[var(--store-v2-tone-text-main)]">Total</span>
          <span className="text-2xl font-bold text-[var(--store-v2-tone-accent)]">
            ${(total / 100).toFixed(2)}
          </span>
        </div>

        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--store-v2-tone-text-muted)]">
          Free domestic shipping unlocks automatically at checkout thresholds.
        </p>

        {/* Checkout button */}
        <button
          onClick={onCheckout}
          disabled={loading || itemCount === 0}
          className="store-v2-control store-v2-btn-primary w-full justify-center gap-2"
        >
          {loading ? 'Processing...' : 'Proceed to Checkout'}
          {!loading && <iconify-icon icon="solar:arrow-right-linear" width="16" height="16"></iconify-icon>}
        </button>
      </div>
    </div>
  )
}
