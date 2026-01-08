
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
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
      {/* Totals */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-400">
          <span>Subtotal ({itemCount} items)</span>
          <span>${(subtotal / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Tax (10%)</span>
          <span>${(tax / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Shipping</span>
          <span>${(shipping / 100).toFixed(2)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-gray-800 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-white">Total</span>
          <span className="text-2xl font-bold text-cyan-400">
            ${(total / 100).toFixed(2)}
          </span>
        </div>

        {/* Checkout button */}
        <button
          onClick={onCheckout}
          disabled={loading || itemCount === 0}
          className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? 'Processing...' : 'Proceed to Checkout'}
          {!loading && <iconify-icon icon="solar:arrow-right-linear" width="16" height="16"></iconify-icon>}
        </button>
      </div>
    </div>
  )
}
