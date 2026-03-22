
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
    <div className="store-v2-surface-card store-v2-detail-purchase-card sticky top-24 space-y-6">
      <div>
        <p className="store-v2-label">Checkout summary</p>
        <h2 className="store-v2-h2 mt-3 text-[var(--store-v2-tone-text-main)]">
          Final totals stay visible before the checkout handoff.
        </h2>
      </div>

      <div className="store-v2-summary-stack">
        <div className="store-v2-summary-row">
          <span>Subtotal ({itemCount} items)</span>
          <span>${(subtotal / 100).toFixed(2)}</span>
        </div>
        <div className="store-v2-summary-row">
          <span>Tax (10%)</span>
          <span>${(tax / 100).toFixed(2)}</span>
        </div>
        <div className="store-v2-summary-row">
          <span>Shipping</span>
          <span>${(shipping / 100).toFixed(2)}</span>
        </div>
      </div>

      <div className="store-v2-summary-total">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="store-v2-label">Order total</p>
            <p className="mt-2 text-sm text-[var(--store-v2-tone-text-meta)]">
              Shipping and tax are staged here before secure checkout.
            </p>
          </div>
          <span className="text-3xl font-semibold text-[var(--store-v2-tone-accent)]">
            ${(total / 100).toFixed(2)}
          </span>
        </div>
      </div>

      <p className="store-v2-summary-note">
        Free domestic shipping unlocks automatically when order thresholds are met.
      </p>

      <button
        onClick={onCheckout}
        disabled={loading || itemCount === 0}
        className="store-v2-control store-v2-btn-primary w-full"
      >
        {loading ? 'Processing...' : 'Proceed to Checkout'}
        {!loading ? <iconify-icon icon="solar:arrow-right-linear" width="16" height="16"></iconify-icon> : null}
      </button>
    </div>
  )
}
