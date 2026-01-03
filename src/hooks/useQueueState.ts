import { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

export const useQueueState = (eventId: Id<'events'>) => {
  const queueEntry = useQuery(api.events.getQueueState, {
    eventId,
  })

  const [position, setPosition] = useState<number | null>(null)
  const [expiresAt, setExpiresAt] = useState<number | null>(null)

  useEffect(() => {
    if (queueEntry === undefined || queueEntry === null) {
      setPosition(null)
      setExpiresAt(null)
      return
    }

    setPosition(queueEntry.position ?? null)
    setExpiresAt(queueEntry.expiresAtUtc ?? null)
  }, [queueEntry])

  return {
    isInQueue: !!queueEntry && (queueEntry.status === 'waiting' || queueEntry.status === 'admitted'),
    position,
    expiresAt,
    status: queueEntry?.status ?? null, // 'waiting' | 'admitted' | 'expired' | 'left'
    isLoading: queueEntry === undefined,
    checkoutSessionExists: queueEntry?.checkoutSessionExists ?? false,
    cooldownUntilUtc: queueEntry?.cooldownUntilUtc ?? null,
  }
}
