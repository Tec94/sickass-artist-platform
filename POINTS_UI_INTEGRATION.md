# Points System UI Integration Guide

## Quick Start

The points system is fully functional and integrated with the backend. Here's how to use it in your UI components.

## Available Components

### 1. PointsDisplay Component

Shows the user's available points in a badge.

```tsx
import { PointsDisplay } from '@/components/PointsDisplay'

function Navbar() {
  return (
    <nav>
      {/* Other nav items */}
      <PointsDisplay /> {/* Shows "⭐ 150" */}
    </nav>
  )
}
```

### 2. PointsEarned Component

Shows a toast notification when points are earned.

```tsx
import { PointsEarned } from '@/components/PointsDisplay'
import { AnimatePresence } from 'framer-motion'

function SomeFeature() {
  const [showPointsToast, setShowPointsToast] = useState(false)
  const [pointsAwarded, setPointsAwarded] = useState(0)

  const handleAction = async () => {
    // ... perform action ...
    
    // Show points earned notification
    setPointsAwarded(20)
    setShowPointsToast(true)
    setTimeout(() => setShowPointsToast(false), 3000)
  }

  return (
    <div>
      {/* Your content */}
      
      <AnimatePresence>
        {showPointsToast && (
          <PointsEarned amount={pointsAwarded} type="thread post" />
        )}
      </AnimatePresence>
    </div>
  )
}
```

## Available Hooks

### usePoints Hook

Get user's point balance, transaction history, and leaderboard data.

```tsx
import { usePoints } from '@/hooks/usePoints'

function PointsPage() {
  const { balance, transactions, leaderboard, isLoading } = usePoints()

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>Your Points</h1>
      <p>Available: {balance.availablePoints}</p>
      <p>Total Earned: {balance.totalPoints}</p>
      <p>Redeemed: {balance.redeemedPoints}</p>

      <h2>Recent Transactions</h2>
      <ul>
        {transactions.map(tx => (
          <li key={tx._id}>
            {tx.amount > 0 ? '+' : ''}{tx.amount} - {tx.description}
          </li>
        ))}
      </ul>

      <h2>Leaderboard</h2>
      <ol>
        {leaderboard.map(user => (
          <li key={user._id}>
            {user.totalPoints} points
          </li>
        ))}
      </ol>
    </div>
  )
}
```

### useAwardPoints Hook

Award points programmatically (if needed for custom integrations).

```tsx
import { useAwardPoints } from '@/hooks/usePoints'

function CustomFeature() {
  const { award } = useAwardPoints()

  const handleCustomAction = async () => {
    try {
      await award(
        'quest_complete',
        50,
        'Completed daily quest',
        { questId: 'quest_abc123' }
      )
      console.log('Points awarded!')
    } catch (error) {
      console.error('Failed to award points:', error)
    }
  }

  return <button onClick={handleCustomAction}>Complete Quest</button>
}
```

## Automatic Point Awards

Points are automatically awarded for:

### ✅ Forum Posts (+20 points)
When a user creates a thread, points are automatically awarded.
No UI changes needed - it just works!

### ✅ Forum Replies (+10 points)
When a user replies to a thread, points are automatically awarded.
No UI changes needed - it just works!

### ✅ Chat Messages (+3 points)
When a user sends a chat message, points are automatically awarded.
No UI changes needed - it just works!

## Styling

The components use Tailwind CSS and match your existing cyberpunk theme:

```tsx
// PointsDisplay uses:
- gradient from purple-600 to pink-600
- rounded-lg
- hover:scale animation
- white text

// PointsEarned uses:
- green-500 background
- fixed positioning (bottom-right)
- smooth fade in/out animations
```

## Example: Full Integration

Here's a complete example showing how to integrate points display and notifications:

```tsx
import { PointsDisplay, PointsEarned } from '@/components/PointsDisplay'
import { usePoints } from '@/hooks/usePoints'
import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'

function Dashboard() {
  const { balance, transactions } = usePoints()
  const [recentAward, setRecentAward] = useState<{amount: number, type: string} | null>(null)

  // Watch for new transactions and show notification
  useEffect(() => {
    if (transactions.length > 0) {
      const latest = transactions[0]
      if (latest.amount > 0) {
        // Only show for positive awards
        setRecentAward({
          amount: latest.amount,
          type: latest.type.replace('_', ' ')
        })
        setTimeout(() => setRecentAward(null), 3000)
      }
    }
  }, [transactions])

  return (
    <div className="dashboard">
      {/* Header with points display */}
      <header className="flex justify-between items-center">
        <h1>Dashboard</h1>
        <PointsDisplay />
      </header>

      {/* Your dashboard content */}
      <div className="content">
        {/* ... */}
      </div>

      {/* Points earned notification */}
      <AnimatePresence>
        {recentAward && (
          <PointsEarned 
            amount={recentAward.amount} 
            type={recentAward.type} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}
```

## Point Values Reference

```typescript
thread_post: 20       // Creating a forum thread
forum_reply: 10       // Replying to a forum thread
chat_message: 3       // Sending a chat message
gallery_like: 1       // Liking gallery content (ready to integrate)
ugc_like: 1           // Liking UGC content (ready to integrate)
event_checkin: 75     // Checking into an event (ready to integrate)
livestream_join: 25   // Joining a livestream (ready to integrate)
daily_bonus: 10       // Daily login bonus (ready to integrate)
```

## Backend Integration

If you need to add points for new features, use the Convex mutation:

```tsx
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

function NewFeature() {
  const awardPoints = useMutation(api.points.awardPoints)
  
  const handleNewAction = async (userId: Id<'users'>) => {
    await awardPoints({
      userId,
      type: 'gallery_like',
      amount: 1,
      description: 'Liked gallery content',
      idempotencyKey: `gallery-like-${contentId}`
    })
  }
  
  return <button onClick={handleNewAction}>Like</button>
}
```

## Important Notes

1. **Idempotency**: Always use unique idempotency keys to prevent double-awarding
   - Format: `{type}-{uniqueId}` (e.g., `thread-abc123`, `message-xyz789`)

2. **Error Handling**: Point awards are non-blocking - if they fail, the main action still succeeds

3. **Real-time Updates**: Use Convex's reactive queries - balance updates automatically

4. **Performance**: Leaderboard and transaction history are cached by Convex for fast access
