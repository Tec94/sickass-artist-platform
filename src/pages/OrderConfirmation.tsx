import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, Copy } from 'lucide-react'
import { useState } from 'react'
import { showToast } from '../lib/toast'

export function OrderConfirmation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { orderNumber, confirmationCode, total, estimatedDeliveryDays } = location.state || {}
  const [copied, setCopied] = useState(false)

  if (!orderNumber) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-white mb-4">No order found</h1>
        <button
          onClick={() => navigate('/merch')}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded"
        >
          Back to Shop
        </button>
      </div>
    )
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(orderNumber)
    setCopied(true)
    showToast('Order number copied!', { type: 'success' })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (platform: 'twitter' | 'whatsapp') => {
    const message = `I just ordered from the artist merch store! Order: ${orderNumber}`
    
    if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
        '_blank'
      )
    } else if (platform === 'whatsapp') {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(message)}`,
        '_blank'
      )
    }
  }

  const deliveryDate = new Date()
  deliveryDate.setDate(deliveryDate.getDate() + (estimatedDeliveryDays || 7))

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 py-16 flex flex-col items-center">
        <div className="mb-8">
          <CheckCircle className="w-24 h-24 text-green-400 animate-bounce" />
        </div>

        <h1 className="text-4xl font-bold text-white mb-2 text-center">
          Order Confirmed!
        </h1>
        <p className="text-gray-400 text-lg mb-8 text-center">
          Thank you for your purchase. Your order has been received.
        </p>

        <div className="w-full bg-gray-900/50 border border-gray-800 rounded-lg p-8 mb-8 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-gray-400 text-sm">Order Number</p>
            <p className="font-mono text-2xl font-bold text-white mb-3">
              {orderNumber}
            </p>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded text-sm transition-colors"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Order Number'}
            </button>
          </div>

          <div className="border-t border-gray-800" />

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 text-sm mb-1">Order Total</p>
              <p className="text-2xl font-bold text-cyan-400">
                ${((total || 0) / 100).toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm mb-1">Confirmation Code</p>
              <p className="text-xl font-mono text-white">
                {confirmationCode}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm mb-1">Estimated Delivery</p>
              <p className="text-white">
                {deliveryDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm mb-1">Status</p>
              <p className="text-green-400 font-semibold">Order Placed</p>
            </div>
          </div>

          <div className="border-t border-gray-800" />

          <div className="bg-blue-500/10 border border-blue-500/30 rounded p-4">
            <p className="text-blue-400 text-sm">
              <strong>What's next?</strong> You'll receive an email confirmation with tracking information as soon as your order ships.
            </p>
          </div>
        </div>

        <div className="w-full text-center mb-8">
          <p className="text-gray-400 text-sm mb-4">Share your order</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => handleShare('twitter')}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded font-semibold transition-colors"
            >
              Share on Twitter
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded font-semibold transition-colors"
            >
              Share on WhatsApp
            </button>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => navigate('/merch')}
            className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
          >
            Continue Shopping
          </button>
        </div>

        <div className="w-full mt-12 pt-8 border-t border-gray-800">
          <p className="text-gray-400 text-sm text-center mb-4">
            Have questions? Check out our FAQ or contact support
          </p>
          <div className="flex gap-4 justify-center">
            <button className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
              FAQ
            </button>
            <span className="text-gray-600">•</span>
            <button className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
