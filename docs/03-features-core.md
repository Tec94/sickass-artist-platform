# Core Features

Infrastructure features including analytics, offline support, loading skeletons, optimistic updates, and performance monitoring.

---

## Analytics & Privacy

Privacy-first event tracking system with batching and consent management.

### Core Features
- **Privacy:** PII sanitization (blocks emails, passwords, tokens, etc.)
- **Consent:** GDPR-compliant banner; no tracking until user accepts
- **Batching:** Events batched (30s / 50 events) using `fetch` `keepalive` for delivery
- **Resilience:** Failed events stored in IndexedDB and retried

### Implementation

```typescript
// Automatic page tracking
import { useAnalytics } from '../hooks/useAnalytics'

export function Dashboard() {
  useAnalytics() // Auto-tracks page_view
  return <div>Dashboard</div>
}

// Manual event tracking
import { trackCTA, trackLike, trackError } from '../utils/analytics'

trackCTA('explore_gallery', 'hero_section')
trackLike('gallery', contentId)
trackError('NetworkError', 'Failed to fetch')
```

### Event Types

| Category | Events |
|----------|--------|
| **Page** | `page_view`, `page_unload` |
| **User Actions** | `cta_click`, `like`, `unlike`, `follow`, `search`, `filter_applied` |
| **Content** | `item_view`, `item_shared` |
| **E-commerce** | `cart_add`, `cart_remove`, `checkout_start`, `checkout_complete` |
| **System** | `error`, `performance_metric`, `performance_regression` |

### Data Flow
1. **Trigger** → User interaction occurs
2. **Sanitize** → PII and non-primitives removed
3. **Consent Check** → Verified against `localStorage.analytics_consent`
4. **Queue** → Added to in-memory batch
5. **Flush** → POST to `/api/analytics` or fallback to IndexedDB

### Configuration
```typescript
const BATCH_TIMEOUT = 30000        // 30 seconds
const EVENT_THROTTLE = 100         // Max 1 event per 100ms
const BLOCKED_KEYS = ['email', 'password', 'token', 'auth', 'ssn', 'credit', 'card']
```

### Files
- `src/utils/analytics.ts` - Analytics manager with batching
- `src/hooks/useAnalytics.ts` - React hook for page tracking
- `src/components/ConsentBanner.tsx` - GDPR consent banner

---

## Offline Support

Infrastructure for offline-first experiences with service worker caching, queue management, and conflict resolution.

### Architecture

| Component | Purpose |
|-----------|---------|
| **Service Worker** (`public/sw.js`) | Caches critical assets, serves offline fallback |
| **Status Indicator** (`<OfflineIndicator />`) | Real-time connectivity status |
| **Queue Management** (`useOfflineQueue`) | IndexedDB persistence with retry logic |
| **Conflict Resolution** (`<ConflictModal />`) | Side-by-side version comparison |

### Queue Management

| Setting | Value |
|---------|-------|
| Storage | IndexedDB |
| Queue Limit | 100 items (drops oldest when full) |
| Retry Logic | Exponential backoff (1s, 2s, 4s, 8s) |
| Max Retries | 4 |
| Timeout | 1 hour expiry |
| Statuses | pending, synced, failed, expired, conflict |

### Supported Operations
- **Forum**: Thread creation, replies, voting
- **Chat**: Message sending, reactions
- **Gallery**: Likes, UGC interactions

### Configuration
```typescript
const RETRY_DELAYS = [1000, 2000, 4000, 8000]  // Exponential backoff
const MAX_QUEUE_SIZE = 100                      // Queue limit
const QUEUE_TIMEOUT = 3600000                   // 1 hour
```

### Conflict Resolution
- Detects conflicts via error message parsing
- Shows modal with side-by-side version comparison
- User chooses server or local version

### Files
- `public/sw.js` - Service worker
- `public/offline.html` - Offline fallback page
- `src/components/OfflineIndicator.tsx` - Status indicator
- `src/components/ConflictModal.tsx` - Conflict resolution UI
- `src/hooks/useOnlineStatus.ts` - Online detection hook
- `src/hooks/useOfflineQueue.ts` - Queue management hook

---

## Loading Skeletons

Zero-CLS skeleton system with shimmer animations for all content types.

### Core Features
- **Zero CLS:** Exact dimensions prevent layout shift during loading
- **Shimmer:** Smooth 60fps GPU-accelerated CSS animations
- **Timeout:** 5-second automatic timeout with retry/error state
- **Responsive:** Mobile-first designs for all skeleton types

### Skeleton Types

| Type | Specification | Default Count |
|------|---------------|---------------|
| `gallery` | Square (1:1), title, creator, stats | 4 |
| `forum` | Avatar (32x32), title (2 lines), preview (3 lines) | 5 |
| `product` | Portrait (3:4), name, price, rating | 12 |
| `chat` | Avatar, variable-width message bubble | 3 |

### Usage

```typescript
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { useQueryWithTimeout } from '../hooks/useQueryWithTimeout'

const { data, isLoading, timedOut, retry } = useQueryWithTimeout(
  api.gallery.getItems,
  { limit: 12 },
  { timeoutMs: 5000 }
)

if (timedOut) {
  return (
    <div className="error-state">
      <h3>Request timed out</h3>
      <button onClick={retry}>Try Again</button>
    </div>
  )
}

if (isLoading) return <LoadingSkeleton type="gallery" count={12} />
return <GalleryGrid items={data} />
```

### Accessibility
- **Reduced Motion:** Animation disabled if `prefers-reduced-motion` detected
- **High Contrast:** Base colors adjust for accessibility modes

### Files
- `src/components/LoadingSkeleton.tsx` - Generic skeleton wrapper
- `src/components/Skeletons/*.tsx` - Type-specific skeletons
- `src/hooks/useQueryWithTimeout.ts` - Query hook with timeout
- `src/styles/skeletons.css` - CSS with shimmer animations

---

## Optimistic Updates

Pattern for providing instant UI feedback while handling background synchronization.

### Core Pattern

```typescript
// 1. Update UI immediately
setLiked(true)
setCount(prev => prev + 1)

try {
  // 2. Perform background mutation
  await likeMutation({ id })
} catch (error) {
  // 3. Rollback on failure
  setLiked(false)
  setCount(prev => prev - 1)
  showToast("Action failed", "error")
}
```

### Features
- **Low Latency:** Perceived latency < 100ms
- **Resilience:** Automatic rollback on server error
- **Offline Ready:** Integrated with offline queue for deferred sync
- **Race Prevention:** Mutation queuing prevents rapid-fire issues

### Implementation: `useOptimisticLike`

```typescript
const { isLiked, likeCount, toggleLike } = useOptimisticLike(
  contentId,
  'gallery',
  initialLiked,
  initialCount
)
```

### UI Components
- **`<LikeButton />`**: Optimistic pattern with "pending" badge for offline states

---

## Performance Monitoring

Comprehensive monitoring for Core Web Vitals and custom operations.

### Core Web Vitals (Automatic)

| Metric | Target | Needs Improvement | Poor |
|--------|--------|------------------|------|
| LCP (Largest Paint) | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| FID (Input Delay) | ≤ 100ms | ≤ 300ms | > 300ms |
| CLS (Layout Shift) | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| TTFB (Server Time) | ≤ 800ms | ≤ 1800ms | > 1800ms |
| FCP (First Paint) | ≤ 1.8s | ≤ 3.0s | > 3.0s |

### Custom Operations

| Operation | Target | Alert Threshold |
|-----------|--------|-----------------|
| Image Load | < 800ms avg | > 800ms |
| Lightbox Open | < 300ms | > 300ms |
| Filter Apply | < 500ms | > 500ms |
| Like Response | < 200ms | > 1000ms |
| Scroll Render | < 100ms | > 100ms |
| Query Fetch | < 500ms | > 500ms |

### Usage

```typescript
import { usePerformanceMetrics, usePerformanceOperation } from '../hooks/usePerformanceMetrics'

// Auto-track Web Vitals
usePerformanceMetrics()

// Track custom operation
const operation = usePerformanceOperation('custom-op')
await operation.measure(async () => {
  /* your logic */
})
```

### Developer Tools

**Performance Dashboard (Dev Mode):**
- **Access:** Click Activity icon (📊) in header or `Ctrl/Cmd + Shift + P`
- **Features:** Real-time metrics, alerts, summary stats (avg/p95), JSON export

**Console Commands:**
```javascript
console.table(window.__perfMonitor.getReport().summary)  // Quick summary
const data = window.__perfMonitor.export()               // Export full report
```

### Regression Detection
- System establishes baseline on first load
- 20% slowdown relative to baseline triggers console warning and analytics event

### Integration Points
- **Gallery Page** - Web Vitals, filter operations
- **OptimizedImage** - Image load times, cache status
- **LikeButton** - Like response times
- **LightboxContainer** - Lightbox open times

### Files
- `src/utils/performanceMonitor.ts` - Performance monitor singleton
- `src/hooks/usePerformanceMetrics.ts` - Web Vitals and operation hooks
- `src/components/Performance/PerformanceDashboard.tsx` - Visual dashboard

### Console Output Examples
```
[PERF] image-load: 456.78ms {"cached": true}
[WEB VITAL] ✅ LCP: 1234.56ms (target: ≤2500ms)
[PERF] PERFORMANCE REGRESSION: filter-apply is 25% slower than baseline
```
