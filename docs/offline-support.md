# Offline Support & Service Worker

Comprehensive offline support with service worker caching, offline queue management, and conflict resolution.

## System Architecture

- **Service Worker**: Asset caching with offline fallback
- **Online Detection**: Smart detection with navigator.onLine + test fetch
- **Offline Queue**: IndexedDB persistence with exponential backoff
- **Conflict Resolution**: Version comparison UI for user choice

## Key Features

### Service Worker (Asset Caching)
- Caches critical assets: /, /index.html, /favicon.ico, /offline.html
- Cache name: `sickass-v1`
- Serves cached content when offline
- Fallback to `/offline.html` on network error

### Offline Queue Management
- **Storage**: IndexedDB persistence
- **Queue Limit**: 100 items (drops oldest when full)
- **Retry Logic**: Exponential backoff (1s/2s/4s/8s, max 4 retries)
- **Timeout**: 1-hour expiry for stale items
- **Status Tracking**: pending, synced, failed, expired, conflict
- **Supported Operations**: message, vote_thread, vote_reply, reaction, like_gallery, like_ugc

### Conflict Detection & Resolution
- Detects conflicts via error message parsing
- Shows modal with side-by-side version comparison
- User chooses server or local version

## Implementation

### Files
- `public/sw.js` - Service worker
- `public/offline.html` - Offline fallback page
- `src/components/OfflineIndicator.tsx` - Status indicator
- `src/components/ConflictModal.tsx` - Conflict resolution UI
- `src/hooks/useOnlineStatus.ts` - Online detection hook
- `src/hooks/useOfflineQueue.ts` - Queue management hook
- `src/styles/offline-indicator.css` - Indicator styles
- `src/styles/conflict-modal.css` - Modal styles

### Integration
Service worker registered in `src/main.tsx`. Offline components integrated in `src/App.tsx`.

## Configuration

```typescript
const RETRY_DELAYS = [1000, 2000, 4000, 8000] // Exponential backoff
const MAX_QUEUE_SIZE = 100                     // Queue limit
const QUEUE_TIMEOUT = 3600000                  // 1 hour
```

## Testing Checklist

- [ ] Service worker registers correctly
- [ ] Offline mode detected accurately
- [ ] Queue stores operations in IndexedDB
- [ ] Queue retries on reconnect with exponential backoff
- [ ] Queue size limited, oldest items dropped
- [ ] Items expire after 1 hour
- [ ] Conflicts detected and modal shown
- [ ] Conflict resolution works for both choices

## Browser Compatibility

- ✅ Chrome/Edge, Firefox, Safari 11.1+
- ⚠️ IE11 - No service worker, graceful degradation

## Future Enhancements

- Background Sync API integration
- Delta sync for conflict resolution
- Queue item priority system
- Queue compression for large payloads
