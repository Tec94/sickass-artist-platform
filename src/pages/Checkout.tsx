import { useNavigate } from 'react-router-dom'
import { useCheckout, type ShippingAddress } from '../hooks/useCheckout'
import { useCart } from '../contexts/CartContext'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ShippingForm } from '../components/Merch/ShippingForm'
import { OrderReview } from '../components/Merch/OrderReview'
import { MerchErrorBoundary } from '../components/Merch/ErrorBoundary'
import { useAutoRetry } from '../hooks/useAutoRetry'
import { parseConvexError, logError } from '../utils/convexErrorHandler'
import { showToast } from '../lib/toast'
import { useState, useEffect } from 'react'
import { useAnalytics } from '../hooks/useAnalytics'
import { trackCheckoutStart, trackCheckoutComplete } from '../utils/analytics'

export function Checkout() {
  useAnalytics() // Track page views
  const navigate = useNavigate()
  const checkout = useCheckout()
  const { isEmpty, total, itemCount } = useCart()
  const createOrderMutation = useMutation(api.orders.createOrder)
  const { retryWithBackoff } = useAutoRetry()
  const [isProcessing, setIsProcessing] = useState(false)

  // Track checkout start when page loads
  useEffect(() => {
    if (!isEmpty && total > 0) {
      trackCheckoutStart(total, itemCount)
    }
  }, [isEmpty, total, itemCount])

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Your cart is empty</h1>
        <button
          onClick={() => navigate('/store')}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Back to Shop
        </button>
      </div>
    )
  }

  const handleShippingSubmit = async (data: ShippingAddress) => {
    checkout.setShippingData(data)
    checkout.nextStep()
  }

  const handleOrderConfirm = async () => {
    if (!checkout.shippingData) return

    setIsProcessing(true)
    try {
      const result = await retryWithBackoff(() =>
        createOrderMutation({
          shippingAddress: checkout.shippingData!,
        })
      )

      checkout.setOrderConfirmation({
        orderNumber: result.orderNumber,
        confirmationCode: result.confirmationCode,
        orderId: result.orderId,
      })

      // Track checkout complete
      trackCheckoutComplete(result.orderNumber, result.total)

      navigate('/store/confirmation', {
        state: {
          orderNumber: result.orderNumber,
          confirmationCode: result.confirmationCode,
          total: result.total,
          estimatedDeliveryDays: result.estimatedDeliveryDays,
        },
      })
    } catch (err) {
      const parsed = parseConvexError(err)
      logError(parsed, {
        component: 'Checkout',
        action: 'create_order',
      })
      showToast(parsed.userMessage, { type: 'error' })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <MerchErrorBoundary>
      <div className="app-surface-page min-h-screen bg-black">
        <div className="sticky top-0 z-10 bg-black/80 border-b border-gray-800 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <button
              onClick={() => navigate('/store/cart')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-4"
            >
              <iconify-icon icon="solar:alt-arrow-left-linear" width="16" height="16"></iconify-icon>
              Back to Cart
            </button>
            <h1 className="text-3xl font-bold text-white">Checkout</h1>
          </div>
        </div>

        <div className="bg-gray-900/30 border-b border-gray-800">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between text-sm">
              <div className={`flex items-center gap-2 ${checkout.step >= 1 ? 'text-red-400' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  checkout.step >= 1 ? 'bg-red-600' : 'bg-gray-800'
                }`}>
                  1
                </div>
                <span className="hidden sm:inline">Cart Review</span>
              </div>

              <div className={`h-1 flex-1 mx-2 ${checkout.step >= 2 ? 'bg-red-600' : 'bg-gray-800'}`} />

              <div className={`flex items-center gap-2 ${checkout.step >= 2 ? 'text-red-400' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  checkout.step >= 2 ? 'bg-red-600' : 'bg-gray-800'
                }`}>
                  2
                </div>
                <span className="hidden sm:inline">Shipping</span>
              </div>

              <div className={`h-1 flex-1 mx-2 ${checkout.step >= 3 ? 'bg-red-600' : 'bg-gray-800'}`} />

              <div className={`flex items-center gap-2 ${checkout.step >= 3 ? 'text-red-400' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  checkout.step >= 3 ? 'bg-red-600' : 'bg-gray-800'
                }`}>
                  3
                </div>
                <span className="hidden sm:inline">Review</span>
              </div>
            </div>
          </div>
        </div>

        <div className="app-surface-shell max-w-2xl mx-auto px-4 py-12">
          {checkout.step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Review Your Order</h2>
                <CartReviewStep onNext={checkout.nextStep} />
              </div>
            </div>
          )}

          {checkout.step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Shipping Information</h2>
                <ShippingForm
                  onSubmit={handleShippingSubmit}
                  initialData={checkout.shippingData}
                  loading={isProcessing}
                />
              </div>
            </div>
          )}

          {checkout.step === 3 && checkout.shippingData && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Review Your Order</h2>
                <OrderReview
                  shippingAddress={checkout.shippingData}
                  onEdit={() => checkout.prevStep()}
                  onConfirm={handleOrderConfirm}
                  loading={isProcessing}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </MerchErrorBoundary>
  )
}

function CartReviewStep({ onNext }: { onNext: () => void }) {
  const { items, total } = useCart()

  return (
    <div className="space-y-4">
      {items.map(item => (
        <div key={item.variantId} className="flex justify-between p-3 bg-gray-900/50 border border-gray-800 rounded">
          <div>
            <p className="text-white font-semibold">{item.productName}</p>
            <p className="text-gray-400 text-sm">{item.variantName} × {item.quantity}</p>
          </div>
          <p className="text-red-400 font-semibold">
            ${((item.currentPrice * item.quantity) / 100).toFixed(2)}
          </p>
        </div>
      ))}

      <div className="pt-4 mt-4 border-t border-gray-800 flex justify-between items-center">
        <span className="text-gray-300">Total</span>
        <span className="text-2xl font-bold text-red-400">
          ${(total / 100).toFixed(2)}
        </span>
      </div>

      <button
        onClick={onNext}
        className="w-full mt-6 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
      >
        Continue to Shipping
        <iconify-icon icon="solar:alt-arrow-right-linear" width="16" height="16"></iconify-icon>
      </button>
    </div>
  )
}
