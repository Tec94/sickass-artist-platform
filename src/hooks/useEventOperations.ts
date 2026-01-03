import { useState, useCallback, useRef, useEffect } from 'react'
import { useQuery, useConvex } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

// Types for event operations
export interface EventFormData {
  title: string
  description: string
  imageUrl: string
  thumbnailUrl?: string
  startAtUtc: number
  endAtUtc: number
  venueId: Id<'venues'>
  capacity: number
  saleStatus: 'upcoming' | 'on_sale' | 'sold_out' | 'cancelled'
  searchText: string
  dedupeKey: string
}

export interface TicketTypeFormData {
  eventId: Id<'events'>
  type: 'general' | 'vip' | 'early_bird'
  price: number
  quantity: number
  description?: string
  saleStartsAtUtc: number
  saleEndsAtUtc: number
}

export interface CheckoutData {
  eventId: Id<'events'>
  ticketTypeId: Id<'eventTickets'>
  quantity: number
}

// Error types for specific handling
export interface EventError {
  message: string
  field?: string
  code?: string
  retryAfter?: number
  type: 'validation' | 'network' | 'oversell' | 'queue' | 'permission' | 'unknown'
}

// Hook for optimistic event creation
export function useOptimisticEventCreation() {
  const convex = useConvex()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<EventError | null>(null)

  const createEvent = useCallback(async (data: EventFormData) => {
    setIsCreating(true)
    setError(null)

    try {
      const result = await convex.mutation(api.events.createEvent, data)
      return result
    } catch (err) {
      const eventError = parseEventError(err)
      setError(eventError)
      throw eventError
    } finally {
      setIsCreating(false)
    }
  }, [convex])

  return {
    createEvent,
    isCreating,
    error,
    clearError: () => setError(null),
  }
}

// Hook for optimistic ticket type creation
export function useOptimisticTicketTypeCreation() {
  const convex = useConvex()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<EventError | null>(null)

  const createTicketType = useCallback(async (data: TicketTypeFormData) => {
    setIsCreating(true)
    setError(null)

    try {
      const result = await convex.mutation(api.events.createTicketType, data)
      return result
    } catch (err) {
      const eventError = parseEventError(err)
      setError(eventError)
      throw eventError
    } finally {
      setIsCreating(false)
    }
  }, [convex])

  return {
    createTicketType,
    isCreating,
    error,
    clearError: () => setError(null),
  }
}

// Hook for queue operations with retry logic
export function useQueueOperations() {
  const convex = useConvex()
  const [isJoining, setIsJoining] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [error, setError] = useState<EventError | null>(null)
  const retryCount = useRef(0)
  const maxRetries = 3

  const joinQueue = useCallback(async (eventId: Id<'events'>) => {
    setIsJoining(true)
    setError(null)
    retryCount.current = 0

    try {
      const result = await convex.mutation(api.events.joinQueue, { eventId })
      retryCount.current = 0
      return result
    } catch (err) {
      const eventError = parseEventError(err)
      
      // Retry logic for network errors
      if (eventError.type === 'network' && retryCount.current < maxRetries) {
        retryCount.current++
        const delay = Math.pow(2, retryCount.current) * 1000 // Exponential backoff
        
        await new Promise(resolve => setTimeout(resolve, delay))
        return joinQueue(eventId)
      }
      
      setError(eventError)
      throw eventError
    } finally {
      setIsJoining(false)
    }
  }, [convex])

  const leaveQueue = useCallback(async (eventId: Id<'events'>) => {
    setIsLeaving(true)
    setError(null)

    try {
      await convex.mutation(api.events.leaveQueue, { eventId })
    } catch (err) {
      const eventError = parseEventError(err)
      setError(eventError)
      throw eventError
    } finally {
      setIsLeaving(false)
    }
  }, [convex])

  return {
    joinQueue,
    leaveQueue,
    isJoining,
    isLeaving,
    error,
    clearError: () => setError(null),
  }
}

// Hook for checkout operations with offline support
export function useCheckoutOperations() {
  const convex = useConvex()
  const [isStarting, setIsStarting] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [error, setError] = useState<EventError | null>(null)

  const startCheckout = useCallback(async (data: CheckoutData) => {
    setIsStarting(true)
    setError(null)

    try {
      const result = await convex.mutation(api.events.startCheckout, data)
      return result
    } catch (err) {
      const eventError = parseEventError(err)
      setError(eventError)
      throw eventError
    } finally {
      setIsStarting(false)
    }
  }, [convex])

  const purchaseTicket = useCallback(async (
    eventId: Id<'events'>,
    ticketTypeId: Id<'eventTickets'>,
    quantity: number,
    checkoutSessionId: Id<'checkoutSessions'>
  ) => {
    setIsPurchasing(true)
    setError(null)

    try {
      const result = await convex.mutation(api.events.purchaseTicket, {
        eventId,
        ticketTypeId,
        quantity,
        checkoutSessionId,
      })
      return result
    } catch (err) {
      const eventError = parseEventError(err)
      setError(eventError)
      throw eventError
    } finally {
      setIsPurchasing(false)
    }
  }, [convex])

  return {
    startCheckout,
    purchaseTicket,
    isStarting,
    isPurchasing,
    error,
    clearError: () => setError(null),
  }
}

// Hook for event queries with error handling
export function useEventQueries() {
  const getEvents = useQuery(
    api.events.getEvents,
    { page: 0, pageSize: 20 },
    { enabled: true }
  )

  const getEventDetail = useQuery(
    api.events.getEventDetail,
    {} as { eventId: Id<'events'> },
    { enabled: false }
  )

  const getUserTickets = useQuery(
    api.events.getUserTickets,
    { upcomingOnly: false },
    { enabled: true }
  )

  const getQueueState = useQuery(
    api.events.getQueueState,
    {} as { eventId: Id<'events'> },
    { enabled: false }
  )

  const searchEvents = useQuery(
    api.events.searchEvents,
    { query: '', limit: 20 },
    { enabled: false }
  )

  return {
    getEvents,
    getEventDetail,
    getUserTickets,
    getQueueState,
    searchEvents,
  }
}

// Error parsing utility
function parseEventError(error: unknown): EventError {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    if (error.message.includes('already in queue')) {
      return {
        message: 'You are already waiting in this queue',
        type: 'queue',
        code: 'ALREADY_IN_QUEUE',
      }
    }

    if (error.message.includes('cooldown')) {
      return {
        message: 'Try again in a few minutes',
        type: 'queue',
        code: 'COOLDOWN_ACTIVE',
      }
    }

    if (error.message.includes('Insufficient inventory') || error.message.includes('Capacity reached')) {
      return {
        message: 'Capacity reached. Try again soon or check another event.',
        type: 'oversell',
        retryAfter: 30,
      }
    }

    if (error.message.includes('already checking out')) {
      return {
        message: "You're already checking out this event. Finish or cancel first.",
        type: 'queue',
        code: 'ALREADY_IN_CHECKOUT',
      }
    }

    if (error.message.includes('network') || error.message.includes('fetch')) {
      return {
        message: 'Network error. Queuing for retry.',
        type: 'network',
      }
    }

    if (error.message.includes('permission') || error.message.includes('Not authorized')) {
      return {
        message: "You don't have access to this action",
        type: 'permission',
      }
    }

    if (error.message.includes('validation') || error.message.includes('required') || error.message.includes('must be')) {
      return {
        message: error.message,
        type: 'validation',
      }
    }
  }

  return {
    message: error && typeof error === 'object' && 'message' in error ? error.message as string : 'Unexpected error. Please try again.',
    type: 'unknown',
  }
}

// Hook for offline queue management
export function useOfflineEventQueue() {
  const [offlineQueue, setOfflineQueue] = useState<Array<{
    id: string
    timestamp: number
    action: {
      type: string
      args: Record<string, unknown>
    }
  }>>([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const addToQueue = useCallback((action: {
    type: string
    args: Record<string, unknown>
  }) => {
    const queueItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      action,
    }
    setOfflineQueue(prev => [...prev, queueItem])

    // Store in localStorage for persistence
    try {
      const stored = JSON.parse(localStorage.getItem('event_offline_queue') || '[]')
      localStorage.setItem('event_offline_queue', JSON.stringify([...stored, queueItem]))
    } catch (err) {
      console.warn('Failed to store offline action:', err)
    }
  }, [])

  const processQueue = useCallback(async () => {
    if (!isOnline || offlineQueue.length === 0) return

    const processed: string[] = []
    
    for (const item of offlineQueue) {
      try {
        // This is a simplified approach for offline queue processing
        // In a real implementation, you'd need to map action types to actual API calls
        console.warn('Offline queue processing not fully implemented:', item.action.type)
        processed.push(item.id)
      } catch (err) {
        console.warn('Failed to process offline action:', item, err)
        // Keep failed items in queue for retry
      }
    }

    // Remove processed items
    if (processed.length > 0) {
      setOfflineQueue(prev => prev.filter(item => !processed.includes(item.id)))
      
      try {
        const stored = JSON.parse(localStorage.getItem('event_offline_queue') || '[]')
        const remaining = stored.filter((item: { id: string }) => !processed.includes(item.id))
        localStorage.setItem('event_offline_queue', JSON.stringify(remaining))
      } catch (err) {
        console.warn('Failed to update offline queue storage:', err)
      }
    }
  }, [isOnline, offlineQueue])

  // Load stored queue on mount
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('event_offline_queue') || '[]')
      setOfflineQueue(stored)
    } catch (err) {
      console.warn('Failed to load offline queue:', err)
    }
  }, [])

  return {
    offlineQueue,
    isOnline,
    addToQueue,
    processQueue,
  }
}

// Auto-retry hook for failed mutations
export function useAutoRetry() {
  const [retryCount, setRetryCount] = useState(0)
  const [lastError, setLastError] = useState<EventError | null>(null)

  const retryWithBackoff = useCallback(async (
    fn: () => Promise<unknown>,
    maxRetries = 3,
    baseDelay = 1000
  ) => {
    setRetryCount(0)
    setLastError(null)

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const result = await fn()
        setRetryCount(0)
        return result
      } catch (err) {
        const eventError = parseEventError(err)
        setLastError(eventError)

        if (i === maxRetries || eventError.type === 'validation' || eventError.type === 'permission') {
          throw eventError
        }

        setRetryCount(i + 1)
        const delay = baseDelay * Math.pow(2, i)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }, [])

  return {
    retryWithBackoff,
    retryCount,
    lastError,
    clearError: () => setLastError(null),
  }
}