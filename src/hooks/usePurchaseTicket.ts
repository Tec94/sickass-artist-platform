import { useState, useCallback } from 'react'
import { useConvex } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { queuePurchaseTicket } from '../utils/eventOfflineQueue'
import { useAutoRetry } from './useEventOperations'

export interface PurchasePayload {
  eventId: Id<'events'>
  ticketTypeId: Id<'eventTickets'>
  quantity: number
  checkoutSessionId: Id<'checkoutSessions'>
}

export const usePurchaseTicket = () => {
  const convex = useConvex()
  const { retryWithBackoff, retryCount, lastError: retryError, clearError: clearRetryError } = useAutoRetry()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const purchase = useCallback(async (payload: PurchasePayload) => {
    setLoading(true)
    setError(null)
    clearRetryError()

    const purchaseFn = async () => {
      return await convex.mutation(api.events.purchaseTicket, payload)
    }

    try {
      const result = await retryWithBackoff(purchaseFn)
      return result
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)

      if (msg.includes('sold out') || msg.includes('Insufficient inventory') || msg.includes('Capacity reached')) {
        setError('Event sold out. Try another event.')
      } else if (msg.includes('expired') || msg.includes('Queue entry expired')) {
        setError('Your queue spot expired. Re-queue?')
      } else if (msg.includes('network') || msg.includes('fetch')) {
        setError('Network error. Check your connection and retry.')
        // Save to offline queue
        await queuePurchaseTicket(
          payload.eventId,
          payload.ticketTypeId,
          payload.quantity,
          payload.checkoutSessionId
        )
      } else {
        setError(msg || 'Purchase failed. Please try again.')
      }

      throw err
    } finally {
      setLoading(false)
    }
  }, [convex, retryWithBackoff, clearRetryError])

  return { 
    purchase, 
    loading, 
    error: error || (retryError ? retryError.message : null), 
    retryCount,
    clearError: () => {
      setError(null)
      clearRetryError()
    }
  }
}
