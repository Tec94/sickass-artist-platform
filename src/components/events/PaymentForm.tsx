import React from 'react'

interface PaymentFormProps {
  onPaymentInfoChange: (info: PaymentInfo) => void
}

export interface PaymentInfo {
  cardHolderName: string
  email: string
  address: string
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ onPaymentInfoChange }) => {
  const [info, setInfo] = React.useState<PaymentInfo>({
    cardHolderName: '',
    email: '',
    address: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const newInfo = { ...info, [name]: value }
    setInfo(newInfo)
    onPaymentInfoChange(newInfo)
  }

  return (
    <div className="space-y-4">
      <h4 className="text-white font-semibold mb-2">Payment Details (MVP - No actual charge)</h4>
      
      <div>
        <label htmlFor="cardHolderName" className="block text-zinc-400 text-sm mb-1">
          Cardholder Name
        </label>
        <input
          type="text"
          id="cardHolderName"
          name="cardHolderName"
          value={info.cardHolderName}
          onChange={handleChange}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
          placeholder="John Doe"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-zinc-400 text-sm mb-1">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={info.email}
          onChange={handleChange}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
          placeholder="john@example.com"
          required
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-zinc-400 text-sm mb-1">
          Billing Address
        </label>
        <textarea
          id="address"
          name="address"
          value={info.address}
          onChange={handleChange}
          rows={3}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
          placeholder="123 Street, City, Country"
          required
        />
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p className="text-blue-400 text-xs">
          <strong>Note:</strong> During Phase 2B, this is a placeholder form. No real payment will be processed. Stripe integration will be added in Phase 3.
        </p>
      </div>
    </div>
  )
}
