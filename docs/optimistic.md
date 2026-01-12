# Optimistic Updates

Pattern for providing instant UI feedback for user interactions while handling background synchronization and potential errors.

## Core Pattern

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

## Features
- **Low Latency:** Perceived latency < 100ms.
- **Resilience:** Automatic rollback to previous state on server error.
- **Offline Ready:** Integrated with the offline queue for deferred synchronization.
- **Race Condition Prevention:** Mutation queuing prevents issues from rapid-fire interactions (e.g., spam clicking).

## Implementation: `useOptimisticLike`
The `useOptimisticLike` hook encapsulates this pattern specifically for the gallery and UGC features.

```typescript
const { isLiked, likeCount, toggleLike } = useOptimisticLike(
  contentId,
  'gallery',
  initialLiked,
  initialCount
)
```

## UI Components
- **`<LikeButton />`**: Implements the optimistic pattern with a "pending" badge for offline states and a loading spinner for active retries.
