// IndexedDB wrapper for offline event queue storage
// Provides robust offline support for event operations

interface StoredAction {
  id: string
  timestamp: number
  type: 'joinQueue' | 'leaveQueue' | 'startCheckout' | 'purchaseTicket' | 'createEvent' | 'createTicketType'
  args: Record<string, unknown>
  priority: 'high' | 'medium' | 'low'
  retryCount: number
  maxRetries: number
  metadata?: {
    eventId?: string
    userId?: string
    [key: string]: unknown
  }
}

interface QueueStats {
  totalActions: number
  pendingActions: number
  failedActions: number
  oldestPending: number | null
}

class EventOfflineQueue {
  private db: IDBDatabase | null = null
  private dbName = 'event-offline-queue'
  private dbVersion = 1

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains('actions')) {
          const store = db.createObjectStore('actions', { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('type', 'type', { unique: false })
          store.createIndex('priority', 'priority', { unique: false })
          store.createIndex('retryCount', 'retryCount', { unique: false })
        }
      }
    })
  }

  async addAction(action: Omit<StoredAction, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    if (!this.db) await this.init()

    const id = `${action.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const storedAction: StoredAction = {
      ...action,
      id,
      timestamp: Date.now(),
      retryCount: 0,
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite')
      const store = transaction.objectStore('actions')
      const request = store.add(storedAction)

      request.onsuccess = () => resolve(id)
      request.onerror = () => reject(request.error)
    })
  }

  async getPendingActions(): Promise<StoredAction[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readonly')
      const store = transaction.objectStore('actions')
      const request = store.getAll()

      request.onsuccess = () => {
        const actions = (request.result as StoredAction[]).filter(
          action => action.retryCount < action.maxRetries
        ).sort((a, b) => {
          // Sort by priority, then by timestamp
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
          if (priorityDiff !== 0) return priorityDiff
          return a.timestamp - b.timestamp
        })
        resolve(actions)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async markActionFailed(id: string, reason?: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite')
      const store = transaction.objectStore('actions')
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const action = getRequest.result as StoredAction
        if (action) {
          action.retryCount++
          const updateRequest = store.put(action)
          updateRequest.onsuccess = () => resolve()
          updateRequest.onerror = () => reject(updateRequest.error)
        } else {
          resolve()
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async markActionCompleted(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite')
      const store = transaction.objectStore('actions')
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite')
      const store = transaction.objectStore('actions')
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getStats(): Promise<QueueStats> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readonly')
      const store = transaction.objectStore('actions')
      const request = store.getAll()

      request.onsuccess = () => {
        const actions = request.result as StoredAction[]
        const pendingActions = actions.filter(a => a.retryCount < a.maxRetries)
        const failedActions = actions.filter(a => a.retryCount >= a.maxRetries)
        const oldestPending = pendingActions.length > 0
          ? Math.min(...pendingActions.map(a => a.timestamp))
          : null

        resolve({
          totalActions: actions.length,
          pendingActions: pendingActions.length,
          failedActions: failedActions.length,
          oldestPending,
        })
      }
      request.onerror = () => reject(request.error)
    })
  }
}

// Export singleton instance
export const eventOfflineQueue = new EventOfflineQueue()

// Convenience functions for common actions
export async function queueJoinQueue(eventId: string): Promise<string> {
  return eventOfflineQueue.addAction({
    type: 'joinQueue',
    args: { eventId },
    priority: 'high',
    maxRetries: 3,
    metadata: { eventId },
  })
}

export async function queueStartCheckout(
  eventId: string,
  ticketTypeId: string,
  quantity: number
): Promise<string> {
  return eventOfflineQueue.addAction({
    type: 'startCheckout',
    args: { eventId, ticketTypeId, quantity },
    priority: 'high',
    maxRetries: 3,
    metadata: { eventId, ticketTypeId },
  })
}

export async function queuePurchaseTicket(
  eventId: string,
  ticketTypeId: string,
  quantity: number,
  checkoutSessionId: string
): Promise<string> {
  return eventOfflineQueue.addAction({
    type: 'purchaseTicket',
    args: { eventId, ticketTypeId, quantity, checkoutSessionId },
    priority: 'high',
    maxRetries: 3,
    metadata: { eventId, ticketTypeId },
  })
}

// Sync utilities
export async function processOfflineQueue(
  convex: { mutation: (name: string, args: Record<string, unknown>) => Promise<unknown> },
  onProgress?: (completed: number, total: number) => void
): Promise<{ completed: number; failed: number; errors: string[] }> {
  const pendingActions = await eventOfflineQueue.getPendingActions()
  let completed = 0
  let failed = 0
  const errors: string[] = []

  for (const action of pendingActions) {
    try {
      let mutationName: string
      switch (action.type) {
        case 'joinQueue':
          mutationName = 'api.events.joinQueue'
          break
        case 'leaveQueue':
          mutationName = 'api.events.leaveQueue'
          break
        case 'startCheckout':
          mutationName = 'api.events.startCheckout'
          break
        case 'purchaseTicket':
          mutationName = 'api.events.purchaseTicket'
          break
        case 'createEvent':
          mutationName = 'api.events.createEvent'
          break
        case 'createTicketType':
          mutationName = 'api.events.createTicketType'
          break
        default:
          throw new Error(`Unknown action type: ${action.type}`)
      }

      await convex.mutation(mutationName, action.args)
      await eventOfflineQueue.markActionCompleted(action.id)
      completed++

      onProgress?.(completed, pendingActions.length)
    } catch (error) {
      await eventOfflineQueue.markActionFailed(action.id, error instanceof Error ? error.message : 'Unknown error')
      errors.push(`${action.type}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      failed++

      onProgress?.(completed + failed, pendingActions.length)
    }
  }

  return { completed, failed, errors }
}

// Network status utilities
export function isOnline(): boolean {
  return navigator.onLine
}

export function addNetworkListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  const handleOnline = () => onOnline()
  const handleOffline = () => onOffline()

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

// Storage quota utilities
export async function getStorageUsage(): Promise<{
  used: number
  quota: number
  percentage: number
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate()
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0,
        percentage: estimate.quota ? (estimate.usage || 0) / estimate.quota * 100 : 0,
      }
    } catch (error) {
      console.warn('Failed to get storage estimate:', error)
    }
  }

  return { used: 0, quota: 0, percentage: 0 }
}

// Cleanup utilities
export async function cleanupOldActions(maxAge = 7 * 24 * 60 * 60 * 1000): Promise<number> {
  const actions = await eventOfflineQueue.getPendingActions()
  const now = Date.now()
  const cutoff = now - maxAge
  let cleaned = 0

  for (const action of actions) {
    if (action.timestamp < cutoff) {
      await eventOfflineQueue.markActionCompleted(action.id)
      cleaned++
    }
  }

  return cleaned
}

// Debug utilities (development only)
export function debugOfflineQueue(): void {
  if (!import.meta.env.DEV) return

  eventOfflineQueue.getStats().then(stats => {
    console.group('🔄 Event Offline Queue Debug')
    console.log('Stats:', stats)
    console.log('Online:', navigator.onLine)
    console.groupEnd()
  })
}