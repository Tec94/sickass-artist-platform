import { useState, useEffect, useCallback } from 'react'
import { useAction, useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useOnlineStatus } from './useOnlineStatus'
import type { Id } from '../../convex/_generated/dataModel'

interface UseSyncOfflineQueueResult {
  isSyncing: boolean
  pendingCount: number
  error: string | null
  lastSyncTime: number | null
  manuallyTriggerSync: () => Promise<void>
}

interface UseSyncOfflineQueueProps {
  userId?: Id<'users'>
}

export function useSyncOfflineQueue({
  userId,
}: UseSyncOfflineQueueProps): UseSyncOfflineQueueResult {
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null)

  const isOnline = useOnlineStatus()
  const processOfflineQueue = useAction(api.offlineQueue.processOfflineQueue)
  const retryFailedQueueItems = useAction(api.offlineQueue.retryFailedQueueItems)
  const cleanupOldQueue = useMutation(api.offlineQueue.cleanupOldQueue)

  // Get pending queue items count
  const pendingItems = useQuery(
    userId ? api.offlineQueue.getPendingItems : 'skip',
    userId ? { userId } : undefined
  )

  // Run cleanup every hour
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      if (isOnline) {
        cleanupOldQueue().catch(console.error)
      }
    }, 3600000) // 1 hour

    return () => clearInterval(cleanupInterval)
  }, [isOnline, cleanupOldQueue])

  const pendingCount = pendingItems?.length || 0

  const performSync = useCallback(async () => {
    if (!userId) {
      setError('User not authenticated')
      return
    }

    if (!isOnline) {
      setError('Cannot sync: offline')
      return
    }

    if (pendingCount === 0) {
      setError(null)
      return
    }

    setIsSyncing(true)
    setError(null)

    try {
      // First, retry any failed items that are ready
      await retryFailedQueueItems()

      // Then process the queue
      const result = await processOfflineQueue()

      if (result.processed > 0) {
        setLastSyncTime(Date.now())
      }

      if (result.failed > 0) {
        setError(`Failed to sync ${result.failed} items`)
        console.error('Queue sync errors:', result.errors)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed'
      setError(errorMessage)
      console.error('Queue sync failed:', error)
    } finally {
      setIsSyncing(false)
    }
  }, [userId, isOnline, pendingCount, processOfflineQueue, retryFailedQueueItems])

  // Auto-sync when coming online or when there are pending items
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) {
      // Use a small delay to avoid overwhelming the server
      const timer = setTimeout(() => {
        performSync()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [isOnline, pendingCount, performSync, isSyncing])

  // Periodic sync while online and having pending items
  useEffect(() => {
    if (!isOnline || pendingCount === 0) {
      return
    }

    const interval = setInterval(() => {
      if (!isSyncing) {
        performSync()
      }
    }, 5000) // Sync every 5 seconds while items are pending

    return () => clearInterval(interval)
  }, [isOnline, pendingCount, performSync, isSyncing])

  const manuallyTriggerSync = useCallback(async () => {
    await performSync()
  }, [performSync])

  return {
    isSyncing,
    pendingCount,
    error,
    lastSyncTime,
    manuallyTriggerSync,
  }
}