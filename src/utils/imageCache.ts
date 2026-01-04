const CACHE_DB_NAME = 'gallery-image-cache'
const CACHE_STORE_NAME = 'images'
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
const MAX_CACHE_SIZE = 50 * 1024 * 1024 // 50MB

interface CachedImage {
  url: string
  blob: Blob
  timestamp: number
  size: number
}

class ImageCache {
  private db: IDBDatabase | null = null
  private initPromise: Promise<void>

  constructor() {
    this.initPromise = this.initDB()
  }

  private async initDB(): Promise<void> {
    if (!('indexedDB' in window)) return

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(CACHE_DB_NAME, 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
          db.createObjectStore(CACHE_STORE_NAME, { keyPath: 'url' })
        }
      }
    })
  }

  async get(url: string): Promise<Blob | null> {
    await this.initPromise
    if (!this.db) return null

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_STORE_NAME], 'readonly')
      const store = transaction.objectStore(CACHE_STORE_NAME)
      const request = store.get(url)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const cached = request.result as CachedImage | undefined

        if (!cached) {
          resolve(null)
          return
        }

        // Check if expired
        const age = Date.now() - cached.timestamp
        if (age > CACHE_TTL_MS) {
          // Delete expired entry
          this.delete(url)
          resolve(null)
        } else {
          resolve(cached.blob)
        }
      }
    })
  }

  async set(url: string, blob: Blob): Promise<void> {
    await this.initPromise
    if (!this.db) return

    // Check cache size before storing
    const totalSize = await this.getTotalSize()
    if (totalSize + blob.size > MAX_CACHE_SIZE) {
      await this.evictOldest()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_STORE_NAME], 'readwrite')
      const store = transaction.objectStore(CACHE_STORE_NAME)

      const cached: CachedImage = {
        url,
        blob,
        timestamp: Date.now(),
        size: blob.size,
      }

      const request = store.put(cached)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async delete(url: string): Promise<void> {
    await this.initPromise
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_STORE_NAME], 'readwrite')
      const store = transaction.objectStore(CACHE_STORE_NAME)
      const request = store.delete(url)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  private async getTotalSize(): Promise<number> {
    await this.initPromise
    if (!this.db) return 0

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_STORE_NAME], 'readonly')
      const store = transaction.objectStore(CACHE_STORE_NAME)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const items = request.result as CachedImage[]
        const total = items.reduce((sum, item) => sum + item.size, 0)
        resolve(total)
      }
    })
  }

  private async evictOldest(): Promise<void> {
    await this.initPromise
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_STORE_NAME], 'readwrite')
      const store = transaction.objectStore(CACHE_STORE_NAME)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const items = request.result as CachedImage[]
        items.sort((a, b) => a.timestamp - b.timestamp)

        // Delete oldest 25% of cache
        const toDelete = Math.ceil(items.length * 0.25)
        for (let i = 0; i < toDelete; i++) {
          store.delete(items[i].url)
        }

        resolve()
      }
    })
  }

  async clear(): Promise<void> {
    await this.initPromise
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_STORE_NAME], 'readwrite')
      const store = transaction.objectStore(CACHE_STORE_NAME)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }
}

export const imageCache = new ImageCache()
