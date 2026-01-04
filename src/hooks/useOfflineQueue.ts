import { useState, useEffect, useCallback, useRef } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

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
  status: 'pending' | 'synced' | 'failed'
  retryCount: number
  lastError?: string
  lastRetryAt?: number
  createdAt: number
  processedAt?: number
}

interface UseOfflineQueueResult {
  queue: QueueItem[]
  isOnline: boolean
  addToQueue: (item: Omit<QueueItem, 'id' | 'status' | 'retryCount' | 'createdAt'>) => Promise<QueueItem>
  syncQueue: () => Promise<void>
}

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
  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine)
  const dbRef = useRef<IDBDatabase | null>(null)

  const apiUnknown = api as unknown as {
    chat: {
      sendMessage: (args: { channelId: Id<'channels'>; content: string; idempotencyKey: string }) => Promise<unknown>
      addReaction: (args: { messageId: Id<'messages'>; emoji: string }) => Promise<unknown>
    }
    forum: {
      castThreadVote: (args: { threadId: Id<'threads'>; direction: 'up' | 'down' }) => Promise<unknown>
      castReplyVote: (args: { replyId: Id<'replies'>; direction: 'up' | 'down' }) => Promise<unknown>
    }
    gallery: {
      likeGalleryContent: (args: { contentId: string }) => Promise<unknown>
      unlikeGalleryContent: (args: { contentId: string }) => Promise<unknown>
    }
    ugc: {
      likeUGC: (args: { ugcId: string }) => Promise<unknown>
      unlikeUGC: (args: { ugcId: string }) => Promise<unknown>
    }
  }

  const sendMessageMutation = useMutation(apiUnknown.chat.sendMessage)
  const addReactionMutation = useMutation(apiUnknown.chat.addReaction)
  const castThreadVoteMutation = useMutation(apiUnknown.forum.castThreadVote)
  const castReplyVoteMutation = useMutation(apiUnknown.forum.castReplyVote)
  const likeGalleryMutation = useMutation(apiUnknown.gallery.likeGalleryContent)
  const unlikeGalleryMutation = useMutation(apiUnknown.gallery.unlikeGalleryContent)
  const likeUGCMutation = useMutation(apiUnknown.ugc.likeUGC)
  const unlikeUGCMutation = useMutation(apiUnknown.ugc.unlikeUGC)

  const handleOnline = useCallback(() => {
    setIsOnline(true)
  }, [])

  const handleOffline = useCallback(() => {
    setIsOnline(false)
  }, [])

  useEffect(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

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
      const newItem: QueueItem = {
        ...item,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        status: 'pending',
        retryCount: 0,
        createdAt: Date.now(),
      }

      try {
        const db = await getDB()
        const transaction = db.transaction(STORE_NAME, 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        store.put(newItem)

        setQueue((prev) => [...prev, newItem])

        return newItem
      } catch (error) {
        console.error('Failed to add to queue:', error)
        setQueue((prev) => [...prev, newItem])
        return newItem
      }
    },
    []
  )

  const syncQueue = useCallback(async () => {
    if (!isOnline || !dbRef.current) {
      return
    }

    try {
      const db = dbRef.current
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('by_status')
      const request = index.getAll('pending')

      request.onsuccess = async () => {
        const pendingItems = request.result as IndexedDBQueueItem[]

        for (const item of pendingItems) {
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

            setQueue((prev) =>
              prev.filter((q) => q.id !== item.id)
            )
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error'

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
    } catch (error) {
      console.error('Failed to sync queue:', error)
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

  return {
    queue,
    isOnline,
    addToQueue,
    syncQueue,
  }
}
