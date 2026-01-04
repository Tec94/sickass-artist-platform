import { useCart } from '../../contexts/CartContext'
import type { ShippingAddress } from '../../hooks/useCheckout'

interface OrderReviewProps {
  shippingAddress: ShippingAddress
  onEdit: () => void
  onConfirm: () => void
  loading?: boolean
}

export function OrderReview({
  shippingAddress,
  onEdit,
  onConfirm,
  loading,
}: OrderReviewProps) {
  const { items, subtotal, tax, shipping, total } = useCart()

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Shipping Address</h3>
          <button
            onClick={onEdit}
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Edit
          </button>
        </div>

        <div className="space-y-1 text-gray-300">
          <p className="font-semibold">{shippingAddress.name}</p>
          <p>{shippingAddress.email}</p>
          <p>{shippingAddress.addressLine1}</p>
          {shippingAddress.addressLine2 && (
            <p>{shippingAddress.addressLine2}</p>
          )}
          <p>
            {shippingAddress.city}, {shippingAddress.state}{' '}
            {shippingAddress.zipCode}
          </p>
          <p>{shippingAddress.country}</p>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>

        <div className="space-y-3 mb-4">
          {items.map(item => (
            <div key={item.variantId} className="flex justify-between text-sm">
              <div>
                <p className="text-gray-300">{item.productName}</p>
                <p className="text-gray-500 text-xs">
                  {item.variantName} × {item.quantity}
                </p>
              </div>
              <p className="text-cyan-400 font-semibold">
                ${((item.currentPrice * item.quantity) / 100).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>Subtotal</span>
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
          <div className="flex justify-between items-center border-t border-gray-800 pt-4">
            <span className="font-semibold text-white">Total</span>
            <span className="text-2xl font-bold text-cyan-400">
              ${(total / 100).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onEdit}
          className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-3 px-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? 'Processing...' : 'Complete Purchase'}
        </button>
      </div>
    </div>
  )
}
