# Analytics & Monitoring Implementation

## Overview
Privacy-first analytics infrastructure with event tracking, consent management, and fallback logging.

## Files Created

### Core Analytics
- `src/utils/analytics.ts` - Analytics manager with event batching
- `src/hooks/useAnalytics.ts` - React hook for automatic page tracking
- `src/components/ConsentBanner.tsx` - GDPR consent banner component
- `src/styles/consent-banner.css` - Consent banner styles

## Features Implemented

### 1. Event Batching
- Events are batched and flushed every 30 seconds
- Auto-flush on critical events (page_unload, error) or when queue reaches 50 events
- Uses `fetch` with `keepalive: true` to ensure events are sent even on page unload

### 2. Privacy & PII Sanitization
- Blocks sensitive keys: email, password, token, auth, ssn, credit, card
- Only allows primitive values (string, number, boolean)
- Arrays converted to count only (not contents)
- Dates converted to ISO strings
- Objects converted to '[object]' placeholder

### 3. Event Throttling
- Maximum 1 event per 100ms to prevent spam
- Protects against performance issues from excessive tracking

### 4. Consent Management
- GDPR-compliant consent banner
- Consent stored in localStorage
- No events tracked until consent is given
- Banner dismissible with Accept/Decline options
- Responsive design (mobile/desktop)

### 5. IndexedDB Fallback
- Failed events stored in IndexedDB (database: 'sickass-analytics')
- Automatic retry on next flush
- Prevents data loss during network issues

### 6. Session Management
- Session ID generated once per session (stored in sessionStorage)
- Persists across page navigations within same session
- Resets on new tab/window or browser restart

### 7. User Context
- Tracks userId from UserContext (via Clerk)
- Tracks user tier (artist/admin/mod/fan)
- Automatically updated when user changes

## Event Types Tracked

### Page Events
- `page_view` - Automatic on route change (via useAnalytics hook)
- `page_unload` - Automatic on page leave

### User Actions
- `cta_click` - Call-to-action button clicks
- `like` / `unlike` - Content interactions
- `follow` / `unfollow` - User relationships
- `search` - Search queries and result counts
- `filter_applied` / `filter_cleared` - Filter interactions

### Content
- `item_view` - Content/product views
- `item_shared` - Social sharing actions

### E-commerce
- `cart_add` / `cart_remove` - Shopping cart operations
- `checkout_start` - Checkout initiated
- `checkout_complete` - Order completed

### System
- `error` - Error tracking
- `performance_metric` - Performance measurements
- `performance_regression` - Performance regressions detected

## Integration Examples

### Automatic Page Tracking
```tsx
// In any page component
import { useAnalytics } from '../hooks/useAnalytics'

export function Dashboard() {
  useAnalytics() // Automatically tracks page views
  // ... rest of component
}
```

### Manual Event Tracking
```tsx
import { trackCTA, trackLike, trackError } from '../utils/analytics'

// Track CTA click
<button onClick={() => {
  trackCTA('explore_gallery', 'hero_section')
  navigate('/gallery')
}}>
  Explore Gallery
</button>

// Track like action
const handleLike = async () => {
  await toggleLike()
  trackLike('gallery', contentId)
}

// Track errors
try {
  await somethingRisky()
} catch (error) {
  trackError(error.name, error.message)
}
```

### User Context Integration
```tsx
// Automatically handled by useAnalytics hook
// Updates analytics manager when user changes
useEffect(() => {
  if (userProfile) {
    analytics.setCurrentUser({
      id: userProfile._id,
      tier: userProfile.tier,
    })
  }
}, [userProfile])
```

## Pages with Analytics

### Automatic Page Tracking (useAnalytics)
- ✅ Dashboard (`src/pages/Dashboard.tsx`)
- ✅ Gallery (`src/pages/Gallery.tsx`)
- ✅ Forum (`src/pages/Forum.tsx`)
- ✅ Events (`src/pages/Events.tsx`)
- ✅ Checkout (`src/pages/Checkout.tsx`)

### Event Tracking Implementations
- ✅ HeroSection - CTA clicks (`src/components/Dashboard/HeroSection.tsx`)
- ✅ LikeButton - Like/unlike events (`src/components/Gallery/LikeButton.tsx`)
- ✅ Gallery - Filter applied/cleared (`src/pages/Gallery.tsx`)
- ✅ ProductInfo - Item shared (`src/components/Merch/ProductInfo.tsx`)
- ✅ ShoppingCart - Cart add/remove (`src/hooks/useShoppingCart.ts`)
- ✅ Checkout - Checkout start/complete (`src/pages/Checkout.tsx`)
- ✅ ErrorBoundary - Error tracking (`src/components/ErrorBoundary.tsx`)
- ✅ PerformanceMonitor - Performance metrics (`src/utils/performanceMonitor.ts`)

## Console Logging (Development)

All events are logged to console in development mode:
```
[Analytics] Flushing events: [
  {
    name: 'page_view',
    data: { page: '/dashboard', path: '/dashboard' },
    timestamp: 1234567890,
    sessionId: 'abc123',
    userId: 'user_xyz',
    tier: 'fan'
  }
]
```

## Data Flow

1. **Event Triggered** → User interaction or system event
2. **Sanitization** → PII removed, data cleaned
3. **Throttling Check** → Rate limit enforced (100ms)
4. **Consent Check** → Only proceed if consent given
5. **Queue** → Added to in-memory queue
6. **Batching** → Wait for 30s or 50 events
7. **Flush** → POST to `/api/analytics` with keepalive
8. **Fallback** → On failure, store in IndexedDB

## Configuration

### Batch Settings
```typescript
const BATCH_TIMEOUT = 30000 // 30 seconds
const EVENT_THROTTLE = 100 // Max 1 event per 100ms
```

### Blocked Keys (PII)
```typescript
const BLOCKED_KEYS = ['email', 'password', 'token', 'auth', 'ssn', 'credit', 'card']
```

### Database
```typescript
const DB_NAME = 'sickass-analytics'
const DB_VERSION = 1
const STORE_NAME = 'analyticsQueue'
```

## Browser Compatibility

- ✅ Chrome/Edge (IndexedDB, fetch keepalive)
- ✅ Firefox (IndexedDB, fetch keepalive)
- ✅ Safari 11.1+ (IndexedDB, fetch keepalive)
- ⚠️ IE11 (No IndexedDB - graceful degradation)

## Storage

### localStorage
- `analytics_consent` - User consent status (true/false)
- `consent_dismissed` - Banner dismissed status (true/false)

### sessionStorage
- `analytics_session` - Session ID (generated once per session)

### IndexedDB
- Database: `sickass-analytics`
- Store: `analyticsQueue`
- Structure: `{ id, ...event, status: 'pending', retries: 0 }`

## Testing

### Manual Testing
1. Open browser DevTools → Console
2. Navigate through pages
3. Interact with buttons (like, CTA, etc.)
4. Check console for `[Analytics] Flushing events:` logs
5. Verify events contain correct data
6. Check Network tab for POST to `/api/analytics`

### Consent Banner Testing
1. Clear localStorage
2. Refresh page
3. Consent banner should appear at bottom
4. Click Accept → banner disappears, events tracked
5. Click Decline → banner disappears, no events tracked

### IndexedDB Testing
1. Open DevTools → Application → IndexedDB
2. Find `sickass-analytics` database
3. Trigger events while offline
4. Check `analyticsQueue` store for pending events
5. Go back online
6. Events should be sent on next flush

## Performance Considerations

- **Event queue** - Max 50 events before auto-flush
- **Throttling** - Prevents excessive tracking (1/100ms)
- **Batching** - Reduces network requests
- **Keepalive** - Ensures events sent on page unload
- **IndexedDB** - Async, non-blocking storage
- **PII sanitization** - Minimal data processing overhead

## Security

- ✅ No PII collected (email, password, etc. blocked)
- ✅ GDPR compliant (consent required)
- ✅ Data sanitization (only primitives allowed)
- ✅ Client-side only (no server storage implemented)
- ✅ Session-based tracking (no cookies)

## Future Enhancements

- [ ] Server-side analytics endpoint (`/api/analytics`)
- [ ] Analytics dashboard for viewing metrics
- [ ] User journey visualization
- [ ] Funnel analysis
- [ ] A/B testing integration
- [ ] Real-time analytics streaming
- [ ] Export to CSV/JSON
- [ ] Integration with external analytics (GA4, Mixpanel, etc.)

## Notes

- Backend `/api/analytics` endpoint needs to be implemented
- Consider adding rate limiting on server-side
- Consider implementing data retention policies
- Consider adding data export functionality for GDPR compliance
