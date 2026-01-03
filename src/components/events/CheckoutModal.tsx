import React, { useState } from 'react'
import { Id } from '../../../convex/_generated/dataModel'
import { PaymentForm, PaymentInfo } from './PaymentForm'
import { usePurchaseTicket } from '../../hooks/usePurchaseTicket'
import { QueueErrorRecovery } from './QueueErrorRecovery'
import { formatPrice } from '../../utils/eventFormatters'

interface TicketType {
  _id: Id<'eventTickets'>
  type: 'general' | 'vip' | 'early_bird'
  price: number
  availableQuantity: number
  description?: string
}

interface CheckoutModalProps {
  eventId: Id<'events'>
  eventTitle: string
  ticketTypes: TicketType[]
  checkoutSessionId: Id<'checkoutSessions'>
  isOpen: boolean
  onClose: () => void
  onSuccess: (orderId: string) => void
  onRequeue: () => void
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  eventId,
  eventTitle,
  ticketTypes,
  checkoutSessionId,
  isOpen,
  onClose,
  onSuccess,
  onRequeue,
}) => {
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<Id<'eventTickets'>>(ticketTypes[0]?._id)
  const [quantity, setQuantity] = useState(1)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardHolderName: '',
    email: '',
    address: '',
  })

  const { purchase, loading, error, retryCount } = usePurchaseTicket()

  const selectedTicket = ticketTypes.find((t) => t._id === selectedTicketTypeId)
  const totalPrice = (selectedTicket?.price || 0) * quantity

  const handlePurchase = async () => {
    if (!termsAccepted) return
    if (!paymentInfo.cardHolderName || !paymentInfo.email || !paymentInfo.address) {
      alert('Please fill in all payment information.')
      return
    }

    try {
      const result = await purchase({
        eventId,
        ticketTypeId: selectedTicketTypeId,
        quantity,
        checkoutSessionId,
      })
      if (result && result.ticketId) {
        onSuccess(result.ticketId)
      }
    } catch (err) {
      // Error is handled by the hook
      console.error('Purchase failed:', err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 sm:p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Checkout</h2>
            <p className="text-zinc-400 text-sm">{eventTitle}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-8">
          {error && (
            <QueueErrorRecovery 
              error={error}
              retryCount={retryCount}
              onRetry={handlePurchase}
              onRequeue={onRequeue}
              onViewSimilar={() => {
                onClose()
                window.location.href = '/events'
              }}
            />
          )}

          <section>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">1</span>
              Select Tickets
            </h3>
            <div className="space-y-3">
              {ticketTypes.map((tt) => (
                <button
                  key={tt._id}
                  onClick={() => setSelectedTicketTypeId(tt._id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedTicketTypeId === tt._id
                      ? 'bg-blue-500/10 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white capitalize">{tt.type.replace('_', ' ')}</span>
                    <span className="font-bold text-blue-400">{formatPrice(tt.price)}</span>
                  </div>
                  {tt.description && <p className="text-zinc-400 text-sm mb-2">{tt.description}</p>}
                  <div className="text-xs text-zinc-500">
                    {tt.availableQuantity} tickets remaining
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">2</span>
              Quantity
            </h3>
            <div className="flex items-center gap-4 bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
              <span className="text-zinc-400 flex-grow">Number of tickets</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border border-zinc-600 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
                >
                  -
                </button>
                <span className="text-xl font-bold text-white w-6 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(10, Math.min(selectedTicket?.availableQuantity || 1, quantity + 1)))}
                  className="w-10 h-10 rounded-full border border-zinc-600 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">3</span>
              Payment Information
            </h3>
            <PaymentForm onPaymentInfoChange={setPaymentInfo} />
          </section>

          <section className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-800">
            <div className="flex justify-between items-center mb-4 text-zinc-400">
              <span>Subtotal ({quantity} × {formatPrice(selectedTicket?.price || 0)})</span>
              <span className="text-white font-semibold">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between items-center mb-6 pt-4 border-t border-zinc-800">
              <span className="text-lg font-bold text-white">Total</span>
              <span className="text-2xl font-bold text-blue-400">{formatPrice(totalPrice)}</span>
            </div>

            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-zinc-900"
                />
                <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                  I agree to the Terms of Service and Privacy Policy. I understand that all sales are final and tickets are non-refundable.
                </span>
              </label>
            </div>

            <button
              onClick={handlePurchase}
              disabled={loading || !termsAccepted}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                loading || !termsAccepted
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                'Confirm & Pay'
              )}
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}
