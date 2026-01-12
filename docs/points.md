# Points System

Gamification system for user engagement, rewarding interactions with spendable points.

## Point Values

| Action | Points | Description |
|--------|--------|-------------|
| `thread_post` | 20 | Creating a new forum thread |
| `forum_reply` | 10 | Replying to a thread |
| `chat_message` | 3 | Sending a chat message |
| `gallery_like` | 1 | Liking a gallery item |
| `event_checkin` | 75 | Physical/digital event check-in |

## Quick Start

### Frontend Hooks

```typescript
import { usePoints, useAwardPoints } from '@/hooks/usePoints'

// Get balances and history
const { balance, transactions, leaderboard } = usePoints()

// Award points programmatically
const { award } = useAwardPoints()
await award('thread_post', 20, 'Post bonus')
```

### UI Components

- `<PointsDisplay />`: Badge showing available points (e.g., "⭐ 150").
- `<PointsEarned amount={20} type="thread post" />`: Toast notification for awards.

## Testing & Integrity

### Idempotency
All awards require an `idempotencyKey` (format: `type-id`) to prevent double-awarding during retries.

### Manual Verification
1.  **Convex Dashboard:** Run `awardPoints` with a unique key.
2.  **Validation:** Check `userRewards` for balance updates and `pointTransactions` for the audit trail.
3.  **Leaderboard:** Verify user appears in `getPointsLeaderboard`.
