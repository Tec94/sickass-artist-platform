/* eslint-disable @typescript-eslint/no-explicit-any */
// Analytics Event Types
export type AnalyticsEventName =
  | 'page_view'
  | 'page_unload'
  | 'cta_click'
  | 'content_fallback'
  | 'like'
  | 'unlike'
  | 'follow'
  | 'unfollow'
  | 'search'
  | 'filter_applied'
  | 'filter_cleared'
  | 'item_view'
  | 'item_shared'
  | 'cart_add'
  | 'cart_remove'
  | 'checkout_start'
  | 'checkout_complete'
  | 'error'
  | 'performance_metric'
  | 'performance_regression'

export interface AnalyticsEvent {
  name: AnalyticsEventName
  data: Record<string, any>
  timestamp: number
  sessionId: string
  userId?: string
  tier?: 'artist' | 'admin' | 'mod' | 'fan'
}

type AnalyticsTransport = (events: AnalyticsEvent[]) => Promise<void>

const BATCH_TIMEOUT = 30000 // 30 seconds
const EVENT_THROTTLE = 100 // Max 1 event per 100ms
const BLOCKED_KEYS = ['email', 'password', 'token', 'auth', 'ssn', 'credit', 'card']
const DB_NAME = 'sickass-analytics'
const DB_VERSION = 1
const STORE_NAME = 'analyticsQueue'

let dbInstance: IDBDatabase | null = null

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
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
        store.createIndex('by_status', 'status', { unique: false })
      }
    }
  })
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

class AnalyticsManager {
  private eventQueue: AnalyticsEvent[] = []
  private batchTimer: ReturnType<typeof setTimeout> | null = null
  private hasConsent = this.checkConsent()
  private lastEventTime = 0
  private sessionId = this.generateSessionId()
  private currentUser: { id?: string; tier?: 'artist' | 'admin' | 'mod' | 'fan' } | null = null
  private transport: AnalyticsTransport | null = null

  constructor() {
    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush())
    }
  }

  private checkConsent(): boolean {
    if (typeof localStorage === 'undefined') return false
    return localStorage.getItem('analytics_consent') === 'true'
  }

  private generateSessionId(): string {
    if (typeof sessionStorage === 'undefined') return generateId()

    const stored = sessionStorage.getItem('analytics_session')
    if (stored) return stored

    const id = generateId()
    sessionStorage.setItem('analytics_session', id)
    return id
  }

  setCurrentUser(user: { id?: string; tier?: 'artist' | 'admin' | 'mod' | 'fan' } | null) {
    this.currentUser = user
  }

  setTransport(transport: AnalyticsTransport | null) {
    this.transport = transport
  }

  // Track event with throttling
  trackEvent(name: AnalyticsEventName, data: Record<string, any> = {}) {
    if (!this.hasConsent) return

    // Throttle: max 1 event per 100ms
    const now = Date.now()
    if (now - this.lastEventTime < EVENT_THROTTLE) {
      return
    }
    this.lastEventTime = now

    // Sanitize data
    const sanitized = this.sanitizeData(data)

    const event: AnalyticsEvent = {
      name,
      data: sanitized,
      timestamp: now,
      sessionId: this.sessionId,
      userId: this.getCurrentUserId(),
      tier: this.getCurrentUserTier(),
    }

    this.eventQueue.push(event)

    // Auto-flush on certain events or queue full
    if (name === 'page_unload' || name === 'error' || this.eventQueue.length >= 50) {
      this.flush()
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flush(), BATCH_TIMEOUT)
    }
  }

  private sanitizeData(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}

    for (const [key, value] of Object.entries(data)) {
      // Block sensitive keys
      if (BLOCKED_KEYS.some(k => key.toLowerCase().includes(k))) {
        continue
      }

      // Only allow primitives
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value
      } else if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          sanitized[key] = value.length // Count, not contents
        } else if (value instanceof Date) {
          sanitized[key] = value.toISOString()
        } else {
          sanitized[key] = '[object]'
        }
      }
    }

    return sanitized
  }

  private getCurrentUserId(): string | undefined {
    return this.currentUser?.id
  }

  private getCurrentUserTier(): 'artist' | 'admin' | 'mod' | 'fan' | undefined {
    return this.currentUser?.tier
  }

  private async flush() {
    if (this.eventQueue.length === 0) return
    if (!this.hasConsent) return

    const events = [...this.eventQueue]
    this.eventQueue = []

    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }

    // Log in dev
    if (import.meta.env.DEV) {
      console.log('[Analytics] Flushing events:', events)
    }

    if (!this.transport) {
      if (import.meta.env.DEV) {
        console.warn('[Analytics] No transport configured. Skipping flush.')
      }
      return
    }

    try {
      await this.transport(events)
    } catch (error) {
      console.error('Analytics flush failed:', error)

      // Fallback: store in IndexedDB for retry
      try {
        const db = await getDB()
        const transaction = db.transaction(STORE_NAME, 'readwrite')
        const store = transaction.objectStore(STORE_NAME)

        for (const event of events) {
          store.add({
            ...event,
            status: 'pending',
            retries: 0,
          })
        }
      } catch (dbError) {
        console.error('Failed to store events in IndexedDB:', dbError)
      }
    }
  }

  setConsent(consent: boolean) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('analytics_consent', String(consent))
    }
    this.hasConsent = consent
  }

  getConsent(): boolean {
    return this.hasConsent
  }

  clear() {
    this.eventQueue = []
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }
  }
}

export const analytics = new AnalyticsManager()

// Helper functions
export const trackPageView = (pageName: string) => {
  analytics.trackEvent('page_view', { page: pageName, path: window.location.pathname })
}

export const trackCTA = (ctaName: string, section: string) => {
  analytics.trackEvent('cta_click', { cta: ctaName, section })
}

export const trackContentFallback = (section: string, fallbackCounts: Record<string, number>) => {
  const fallbackTotal = Object.values(fallbackCounts).reduce((sum, count) => sum + count, 0)
  analytics.trackEvent('content_fallback', {
    section,
    fallback_total: fallbackTotal,
    ...fallbackCounts,
  })
}

export const trackLike = (contentType: string, contentId: string) => {
  analytics.trackEvent('like', { contentType, contentId })
}

export const trackUnlike = (contentType: string, contentId: string) => {
  analytics.trackEvent('unlike', { contentType, contentId })
}

export const trackFollow = (targetUserId: string) => {
  analytics.trackEvent('follow', { targetUserId })
}

export const trackUnfollow = (targetUserId: string) => {
  analytics.trackEvent('unfollow', { targetUserId })
}

export const trackError = (errorName: string, errorMessage: string) => {
  analytics.trackEvent('error', { error: errorName, message: errorMessage })
}

export const trackSearch = (query: string, resultCount: number) => {
  analytics.trackEvent('search', { query, resultCount })
}

export const trackFilterApplied = (filterType: string, filterValue: string) => {
  analytics.trackEvent('filter_applied', { filterType, filterValue })
}

export const trackFilterCleared = (filterType: string) => {
  analytics.trackEvent('filter_cleared', { filterType })
}

export const trackItemView = (itemType: string, itemId: string) => {
  analytics.trackEvent('item_view', { itemType, itemId })
}

export const trackItemShared = (itemType: string, itemId: string, method: string) => {
  analytics.trackEvent('item_shared', { itemType, itemId, method })
}

export const trackCartAdd = (productId: string, quantity: number) => {
  analytics.trackEvent('cart_add', { productId, quantity })
}

export const trackCartRemove = (productId: string, quantity: number) => {
  analytics.trackEvent('cart_remove', { productId, quantity })
}

export const trackCheckoutStart = (cartValue: number, itemCount: number) => {
  analytics.trackEvent('checkout_start', { cartValue, itemCount })
}

export const trackCheckoutComplete = (orderId: string, totalValue: number) => {
  analytics.trackEvent('checkout_complete', { orderId, totalValue })
}

export const trackPerformanceMetric = (metricName: string, value: number) => {
  analytics.trackEvent('performance_metric', { metricName, value })
}

export const trackPerformanceRegression = (metricName: string, currentValue: number, baselineValue: number) => {
  analytics.trackEvent('performance_regression', { metricName, currentValue, baselineValue })
}
