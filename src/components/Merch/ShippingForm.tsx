import { useState, useEffect } from 'react'
import type { ShippingAddress } from '../../hooks/useCheckout'

interface ShippingFormProps {
  onSubmit: (data: ShippingAddress) => void
  initialData?: ShippingAddress | null
  loading?: boolean
}

const COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'Other',
]

export function ShippingForm({ onSubmit, initialData, loading }: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingAddress>(initialData || {
    name: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('checkout_form', JSON.stringify(formData))
    }, 500)
    return () => clearTimeout(timer)
  }, [formData])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State/Province is required'
    if (!formData.zipCode.trim()) newErrors.zipCode = 'Postal code is required'
    else if (!/^[a-z0-9\s-]{3,20}$/i.test(formData.zipCode)) {
      newErrors.zipCode = 'Postal code must be 3-20 alphanumeric characters'
    }
    if (!formData.country.trim()) newErrors.country = 'Country is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    setErrors(prev => ({
      ...prev,
      [name]: '',
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Full Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          disabled={loading}
          className={`w-full px-4 py-2 bg-gray-800 border rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors ${
            errors.name ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
            <iconify-icon icon="solar:danger-circle-linear" width="12" height="12"></iconify-icon>
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Email *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john@example.com"
          disabled={loading}
          className={`w-full px-4 py-2 bg-gray-800 border rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors ${
            errors.email ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
            <iconify-icon icon="solar:danger-circle-linear" width="12" height="12"></iconify-icon>
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Address *
        </label>
        <input
          type="text"
          name="addressLine1"
          value={formData.addressLine1}
          onChange={handleChange}
          placeholder="123 Main Street"
          disabled={loading}
          className={`w-full px-4 py-2 bg-gray-800 border rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors ${
            errors.addressLine1 ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.addressLine1 && (
          <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
            <iconify-icon icon="solar:danger-circle-linear" width="12" height="12"></iconify-icon>
            {errors.addressLine1}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Apartment, suite, etc. (optional)
        </label>
        <input
          type="text"
          name="addressLine2"
          value={formData.addressLine2}
          onChange={handleChange}
          placeholder="Apt 4B"
          disabled={loading}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="New York"
            disabled={loading}
            className={`w-full px-4 py-2 bg-gray-800 border rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors ${
              errors.city ? 'border-red-500' : 'border-gray-700'
            }`}
          />
          {errors.city && (
            <p className="mt-1 text-xs text-red-400">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            State/Province *
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="NY"
            disabled={loading}
            className={`w-full px-4 py-2 bg-gray-800 border rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors ${
              errors.state ? 'border-red-500' : 'border-gray-700'
            }`}
          />
          {errors.state && (
            <p className="mt-1 text-xs text-red-400">{errors.state}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Postal Code *
        </label>
        <input
          type="text"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleChange}
          placeholder="10001"
          disabled={loading}
          className={`w-full px-4 py-2 bg-gray-800 border rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors ${
            errors.zipCode ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.zipCode && (
          <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
            <iconify-icon icon="solar:danger-circle-linear" width="12" height="12"></iconify-icon>
            {errors.zipCode}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Country *
        </label>
        <select
          name="country"
          value={formData.country}
          onChange={handleChange}
          disabled={loading}
          className={`w-full px-4 py-2 bg-gray-800 border rounded text-white focus:outline-none focus:border-cyan-500 transition-colors ${
            errors.country ? 'border-red-500' : 'border-gray-700'
          }`}
        >
          <option value="">Select a country</option>
          {COUNTRIES.map(country => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        {errors.country && (
          <p className="mt-1 text-xs text-red-400">{errors.country}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors"
      >
        {loading ? 'Validating...' : 'Continue to Review'}
      </button>
    </form>
  )
}
