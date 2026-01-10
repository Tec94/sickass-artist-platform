import { useState, useEffect, useCallback, useRef } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { useOnlineStatus } from './useOnlineStatus'

type QueueItemType =
  | 'message'
  | 'vote_thread'
  | 'vote_reply'
  | 'reaction'
  | 'like_gallery'
  | 'like_ugc'

interface QueueItem {
  id: string
  type: QueueItemType
  action?: 'like' | 'unlike'
  payload: {
    channelId?: Id<'channels'>
    threadId?: Id<'threads'>
    replyId?: Id<'replies'>
    messageId?: Id<'messages'>
    content?: string
    emoji?: string
    direction?: 'up' | 'down'
    contentId?: string
    ugcId?: string
  }
  idempotencyKey?: string
  status: 'pending' | 'synced' | 'failed' | 'expired' | 'conflict'
  retryCount: number
  lastError?: string
  lastRetryAt?: number
  createdAt: number
  processedAt?: number
  serverVersion?: unknown
  localVersion?: unknown
}

interface UseOfflineQueueResult {
  queue: QueueItem[]
  isOnline: boolean
  conflicts: QueueItem[]
  addToQueue: (item: Omit<QueueItem, 'id' | 'status' | 'retryCount' | 'createdAt'>) => Promise<QueueItem>
  syncQueue: () => Promise<void>
  resolveConflict: (itemId: string, choice: 'server' | 'local') => Promise<void>
  queuedCount: number
}

const MAX_QUEUE_SIZE = 100
const RETRY_DELAYS = [1000, 2000, 4000, 8000] // Exponential backoff
const QUEUE_TIMEOUT = 3600000 // 1 hour

interface IndexedDBQueueItem extends QueueItem {
  id: string
}

let dbInstance: IDBDatabase | null = null

const DB_NAME = 'sickass-artist-platform'
const DB_VERSION = 1
const STORE_NAME = 'offlineQueue'

async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('by_status', 'status', { unique: false })
      }
    }
  })
}

export function useOfflineQueue(): UseOfflineQueueResult {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [conflicts, setConflicts] = useState<QueueItem[]>([])
  const { isOnline } = useOnlineStatus()
  const dbRef = useRef<IDBDatabase | null>(null)
  const isSyncingRef = useRef(false)
  const queueRef = useRef<QueueItem[]>([])
  
  // Keep queueRef in sync with queue state
  queueRef.current = queue

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sendMessageMutation = useMutation(api.chat.sendMessage as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addReactionMutation = useMutation(api.chat.addReaction as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const castThreadVoteMutation = useMutation(api.forum.castThreadVote as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const castReplyVoteMutation = useMutation(api.forum.castReplyVote as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const likeGalleryMutation = useMutation(api.gallery.likeGalleryContent as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unlikeGalleryMutation = useMutation(api.gallery.unlikeGalleryContent as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const likeUGCMutation = useMutation(api.ugc.likeUGC as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unlikeUGCMutation = useMutation(api.ugc.unlikeUGC as any)

  useEffect(() => {
    const initDB = async () => {
      try {
        const db = await getDB()
        dbRef.current = db

        const transaction = db.transaction(STORE_NAME, 'readonly')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.getAll()

        request.onsuccess = () => {
          const items = request.result as IndexedDBQueueItem[]
          const pendingItems = items.filter((item) => item.status === 'pending')
          setQueue(pendingItems)
        }
      } catch (error) {
        console.error('Failed to initialize IndexedDB:', error)
      }
    }

    initDB()
  }, [])

  const addToQueue = useCallback(
    async (
      item: Omit<QueueItem, 'id' | 'status' | 'retryCount' | 'createdAt'>
    ): Promise<QueueItem> => {
      try {
        const db = await getDB()
        const transaction = db.transaction(STORE_NAME, 'readwrite')
        const store = transaction.objectStore(STORE_NAME)

        // Check queue size and remove oldest item if at max
        if (queueRef.current.length >= MAX_QUEUE_SIZE) {
          console.warn('Queue full; dropping oldest item')
          const oldest = queueRef.current[0]
          if (oldest) {
            store.delete(oldest.id)
            setQueue((prev) => prev.slice(1))
          }
        }

        const newItem: QueueItem = {
          ...item,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          status: 'pending',
          retryCount: 0,
          createdAt: Date.now(),
        }

        store.put(newItem)
        setQueue((prev) => [...prev, newItem])

        return newItem
      } catch (error) {
        console.error('Failed to add to queue:', error)
        const newItem: QueueItem = {
          ...item,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          status: 'pending',
          retryCount: 0,
          createdAt: Date.now(),
        }
        setQueue((prev) => [...prev, newItem])
        return newItem
      }
    },
    []
  )

  const syncQueue = useCallback(async () => {
    if (!isOnline || !dbRef.current || isSyncingRef.current) {
      return
    }

    isSyncingRef.current = true

    try {
      const db = dbRef.current
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('by_status')
      const request = index.getAll('pending')

      request.onsuccess = async () => {
        const pendingItems = request.result as IndexedDBQueueItem[]

        for (const item of pendingItems) {
          // Check if timed out (1 hour)
          if (Date.now() - item.createdAt > QUEUE_TIMEOUT) {
            const updatedItem: IndexedDBQueueItem = {
              ...item,
              status: 'expired',
            }
            store.put(updatedItem)
            setQueue((prev) =>
              prev.map((q) => (q.id === item.id ? { ...q, status: 'expired' } : q))
            )
            continue
          }

          // Check if max retries exceeded
          if (item.retryCount >= RETRY_DELAYS.length) {
            const updatedItem: IndexedDBQueueItem = {
              ...item,
              status: 'failed',
            }
            store.put(updatedItem)
            setQueue((prev) =>
              prev.map((q) => (q.id === item.id ? { ...q, status: 'failed' } : q))
            )
            continue
          }

          // Wait with exponential backoff
          if (item.retryCount > 0) {
            const delay = RETRY_DELAYS[item.retryCount - 1]
            await new Promise((resolve) => setTimeout(resolve, delay))
          }

          try {
            switch (item.type) {
              case 'message':
                await sendMessageMutation({
                  channelId: item.payload.channelId!,
                  content: item.payload.content!,
                  idempotencyKey: item.id,
                })
                break
              case 'vote_thread':
                await castThreadVoteMutation({
                  threadId: item.payload.threadId!,
                  direction: item.payload.direction!,
                })
                break
              case 'vote_reply':
                await castReplyVoteMutation({
                  replyId: item.payload.replyId!,
                  direction: item.payload.direction!,
                })
                break
              case 'reaction':
                await addReactionMutation({
                  messageId: item.payload.messageId!,
                  emoji: item.payload.emoji!,
                })
                break
              case 'like_gallery':
                if (item.action === 'unlike') {
                  await unlikeGalleryMutation({ contentId: item.payload.contentId! })
                } else {
                  await likeGalleryMutation({ contentId: item.payload.contentId! })
                }
                break
              case 'like_ugc':
                if (item.action === 'unlike') {
                  await unlikeUGCMutation({ ugcId: item.payload.ugcId! })
                } else {
                  await likeUGCMutation({ ugcId: item.payload.ugcId! })
                }
                break
            }

            const updatedItem: IndexedDBQueueItem = {
              ...item,
              status: 'synced',
              processedAt: Date.now(),
            }
            store.put(updatedItem)

            setQueue((prev) => prev.filter((q) => q.id !== item.id))
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'

            // Check for conflict errors
            if (
              errorMessage.includes('CONFLICT') ||
              errorMessage.includes('version') ||
              errorMessage.includes('conflict')
            ) {
              const conflictItem: IndexedDBQueueItem = {
                ...item,
                status: 'conflict',
                lastError: errorMessage,
              }
              store.put(conflictItem)
              setQueue((prev) =>
                prev.map((q) => (q.id === item.id ? { ...q, status: 'conflict' } : q))
              )
              setConflicts((prev) => [...prev, conflictItem])
            } else {
              const updatedItem: IndexedDBQueueItem = {
                ...item,
                retryCount: item.retryCount + 1,
                lastError: errorMessage,
                lastRetryAt: Date.now(),
              }
              store.put(updatedItem)

              setQueue((prev) =>
                prev.map((q) =>
                  q.id === item.id
                    ? {
                        ...q,
                        retryCount: item.retryCount + 1,
                        lastError: errorMessage,
                        lastRetryAt: Date.now(),
                      }
                    : q
                )
              )
            }
          }
        }

        isSyncingRef.current = false
      }

      request.onerror = () => {
        isSyncingRef.current = false
      }
    } catch (error) {
      console.error('Failed to sync queue:', error)
      isSyncingRef.current = false
    }
  }, [
    isOnline,
    sendMessageMutation,
    castThreadVoteMutation,
    castReplyVoteMutation,
    addReactionMutation,
    likeGalleryMutation,
    unlikeGalleryMutation,
    likeUGCMutation,
    unlikeUGCMutation,
  ])

  useEffect(() => {
    if (isOnline) {
      syncQueue()
    }
  }, [isOnline, syncQueue])

  const resolveConflict = useCallback(
    async (itemId: string, choice: 'server' | 'local') => {
      try {
        const db = await getDB()
        const transaction = db.transaction(STORE_NAME, 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        const conflict = conflicts.find((c) => c.id === itemId)

        if (!conflict) return

        if (choice === 'server') {
          // Accept server version; discard local changes
          store.delete(itemId)
          setQueue((prev) => prev.filter((i) => i.id !== itemId))
        } else {
          // Keep local version; retry
          const item = queue.find((i) => i.id === itemId)
          if (item) {
            const updated: IndexedDBQueueItem = { ...item, status: 'pending', retryCount: 0 }
            store.put(updated)
            setQueue((prev) =>
              prev.map((i) => (i.id === itemId ? { ...i, status: 'pending', retryCount: 0 } : i))
            )
          }
        }

        setConflicts((prev) => prev.filter((c) => c.id !== itemId))
      } catch (error) {
        console.error('Failed to resolve conflict:', error)
      }
    },
    [conflicts, queue]
  )

  return {
    queue,
    isOnline,
    conflicts,
    addToQueue,
    syncQueue,
    resolveConflict,
    queuedCount: queue.filter((i) => i.status === 'pending').length,
  }
}
