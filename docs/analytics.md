# Analytics & Privacy

Privacy-first event tracking system with batching and consent management.

## Core Features
- **Privacy:** PII sanitization (blocks emails, passwords, etc.).
- **Consent:** GDPR-compliant banner; no tracking until user accepts.
- **Batching:** Events are batched (30s / 50 events) using `fetch` `keepalive` to ensure delivery.
- **Resilience:** Failed events are stored in IndexedDB and retried.

## Implementation Guide

### Page Tracking
Use the `useAnalytics` hook in any page component.
```typescript
import { useAnalytics } from '../hooks/useAnalytics'

export function Dashboard() {
  useAnalytics() // Auto-tracks page_view
  return <div>Dashboard</div>
}
```

### Manual Events
```typescript
import { trackCTA, trackLike, trackError } from '../utils/analytics'

trackCTA('explore_gallery', 'hero_section')
trackLike('gallery', contentId)
trackError('NetworkError', 'Failed to fetch')
```

## Internal Data Flow
1. **Trigger:** Interaction occurs.
2. **Sanitize:** PII and non-primitives are removed.
3. **Consent Check:** Verified against `localStorage.analytics_consent`.
4. **Queue:** Added to in-memory batch.
5. **Flush:** POST to `/api/analytics` or fallback to **IndexedDB**.
