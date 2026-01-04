import { useState, useCallback, useEffect } from 'react'

export interface ShippingAddress {
  name: string
  email: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface CheckoutState {
  step: 1 | 2 | 3 | 4
  shippingData: ShippingAddress | null
  orderNumber: string | null
  confirmationCode: string | null
  orderId: string | null
}

const STORAGE_KEY = 'checkout_state'

export function useCheckout() {
  const [state, setState] = useState<CheckoutState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.step === 4) {
          return { step: 1, shippingData: null, orderNumber: null, confirmationCode: null, orderId: null }
        }
        return parsed
      } catch {
        return { step: 1, shippingData: null, orderNumber: null, confirmationCode: null, orderId: null }
      }
    }
    return { step: 1, shippingData: null, orderNumber: null, confirmationCode: null, orderId: null }
  })

  useEffect(() => {
    if (state.step !== 4) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state])

  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      step: Math.min(4, (prev.step + 1) as 1 | 2 | 3 | 4),
    }))
  }, [])

  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      step: Math.max(1, (prev.step - 1) as 1 | 2 | 3 | 4),
    }))
  }, [])

  const setShippingData = useCallback((data: ShippingAddress) => {
    setState(prev => ({
      ...prev,
      shippingData: data,
    }))
  }, [])

  const setOrderConfirmation = useCallback((data: {
    orderNumber: string
    confirmationCode: string
    orderId: string
  }) => {
    setState(prev => ({
      ...prev,
      ...data,
      step: 4,
    }))
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const reset = useCallback(() => {
    setState({
      step: 1,
      shippingData: null,
      orderNumber: null,
      confirmationCode: null,
      orderId: null,
    })
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    ...state,
    nextStep,
    prevStep,
    setShippingData,
    setOrderConfirmation,
    reset,
  }
}
