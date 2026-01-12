# Offline Support

Infrastructure for offline-first experiences, including asset caching, queue management, and conflict resolution.

## Core Components

### 1. Service Worker (`public/sw.js`)
Caches critical assets (HTML, CSS, basic JS) and serves an offline fallback page (`offline.html`) when connectivity is lost.

### 2. Status Indicator (`<OfflineIndicator />`)
Fixed UI element showing real-time connectivity status and the number of pending items in the offline queue.

### 3. Queue Management (`useOfflineQueue`)
- **Storage:** IndexedDB persistence.
- **Retry Logic:** Exponential backoff (1s, 2s, 4s, 8s) with max 4 retries.
- **Timeout:** Items expire after 1 hour if not synced.
- **Sync:** Automatically flushes the queue when the data connection is restored.

### 4. Conflict Resolution (`<ConflictModal />`)
Detects server-side version conflicts. Provides a side-by-side UI for the user to choose between the "Server Version" and their "Local Version."

## Supported Operations
- Forum: Thread creation, replies, voting.
- Chat: Message sending, reactions.
- Gallery: Likes, UGC interactions.

## Configuration
```typescript
const MAX_QUEUE_SIZE = 100; // Drops oldest items when full
const QUEUE_TIMEOUT = 3600000; // 1 hour expiry
```
