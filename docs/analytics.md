# Analytics & Monitoring

Privacy-first analytics infrastructure with event tracking, consent management, and fallback logging.

## System Architecture

- **Event Batching**: Events batched and flushed every 30s or 50 events
- **Privacy**: PII sanitization, GDPR consent required
- **Fallback**: IndexedDB storage for failed events
- **Session**: Session ID persisted in sessionStorage

## Key Features

### Event Tracking
- **Page Events**: `page_view`, `page_unload`
- **User Actions**: `cta_click`, `like/unlike`, `follow/unfollow`, `search`
- **Content**: `item_view`, `item_shared`
- **E-commerce**: `cart_add/remove`, `checkout_start/complete`
- **System**: `error`, `performance_metric`, `performance_regression`

### PII Sanitization
Blocks sensitive keys: email, password, token, auth, ssn, credit, card. Only primitive values allowed.

### Consent Management
GDPR-compliant banner with Accept/Decline options. No tracking until consent given.

## Implementation

### Files
- `src/utils/analytics.ts` - Analytics manager
- `src/hooks/useAnalytics.ts` - React hook for page tracking
- `src/components/ConsentBanner.tsx` - Consent UI
- `src/styles/consent-banner.css` - Styles

### Usage

```typescript
// Automatic page tracking
import { useAnalytics } from '../hooks/useAnalytics'
useAnalytics()

// Manual events
import { trackCTA, trackLike, trackError } from '../utils/analytics'
trackCTA('explore_gallery', 'hero_section')
trackLike('gallery', contentId)
trackError(error.name, error.message)
```

## Configuration

```typescript
const BATCH_TIMEOUT = 30000 // 30 seconds
const EVENT_THROTTLE = 100  // Max 1 event per 100ms
const MAX_QUEUE = 50        // Auto-flush threshold
```

## Storage

- **localStorage**: `analytics_consent`, `consent_dismissed`
- **sessionStorage**: `analytics_session`
- **IndexedDB**: Database `sickass-analytics`, store `analyticsQueue`

## Future Enhancements

- Server-side analytics endpoint
- Analytics dashboard
- Funnel analysis
- A/B testing integration
