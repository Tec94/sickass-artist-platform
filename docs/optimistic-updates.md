# Optimistic Updates

Optimistic UI pattern for likes and interactions with rollback and offline queue.

## Implementation

### Like/Unlike Pattern

```typescript
// Optimistic update
setLiked(true)
setCount(count + 1)

try {
  await likeContentMutation({ contentId, contentType })
} catch (error) {
  // Rollback on error
  setLiked(false)
  setCount(count)
  showToast("Failed to like content", "error")
}
```

### Offline Queue Integration

When offline, actions are queued in IndexedDB and synced when connection is restored.

```typescript
if (!navigator.onLine) {
  addToOfflineQueue({
    type: 'like_gallery',
    contentId,
    contentType,
    action: 'like'
  })
}
```

## Features

- **Instant UI feedback**: <100ms perceived latency
- **Automatic rollback**: Reverts on server error
- **Exponential backoff retry**: 1s, 2s, 4s, 8s (max 4 retries)
- **Offline persistence**: IndexedDB queue with auto-sync
- **No race conditions**: Debounced rapid clicks
- **Conflict resolution**: Server state wins on sync

## Error Handling

| Error | Behavior |
|-------|----------|
| Network timeout | Retry with backoff |
| Offline | Queue in IndexedDB, sync when online |
| Server error | Rollback UI, show error toast |
| Rate limit | Show retry button |

## Performance

- **Optimistic**: <100ms UI update
- **Server**: <1s round-trip
- **Offline queue**: <500ms per sync

## LikeButton Component

```typescript
import { LikeButton } from '@/components/Gallery/LikeButton'

<LikeButton
  contentId={item._id}
  contentType="gallery"
  initialLiked={isLiked}
  initialCount={likeCount}
  size="md"
  showCount={true}
/>
```

## State Flow

1. User clicks like button
2. **Immediate**: Update UI (optimistic)
3. **Async**: Send mutation to server
4. **Success**: Keep optimistic state
5. **Error**: Rollback to previous state + show error
6. **Offline**: Queue action, show pending badge

## Best Practices

- Always provide initial state from server
- Rollback on any error
- Show loading/pending indicators
- Queue actions when offline
- Use debouncing for rapid interactions
