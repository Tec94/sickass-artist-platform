# Phase 1.4: Error Mitigations for Events & Ticketing System

This document outlines the comprehensive error handling, validation, and resilience patterns implemented in Phase 1.4 to prevent overselling, queue corruption, timezone bugs, and offline sync failures.

## 🛡️ Error Mitigation Strategies

### 1. Data Validation (Convex + Frontend)

#### Convex Validation (Server-Side)
All mutations include comprehensive validation:

```typescript
// M1: createEvent validation
- title: 1-200 characters
- startAtUtc < endAtUtc 
- capacity > 0
- venue exists and is valid
- dedupeKey uniqueness check

// M2: createTicketType validation  
- price >= 0
- quantity >= 1
- saleEndsAtUtc <= event.startAtUtc
- user authorization check

// M3: joinQueue validation
- event exists
- user not already in queue
- cooldownUntilUtc < now
- atomic sequence allocation

// M4: leaveQueue validation
- user is in queue
- status is 'waiting'
- cleanup checkout session

// M5: startCheckout validation
- qty between 1-10
- ticketType valid enum
- user has queue admission
- concurrent checkout limit check

// M6: purchaseTicket validation
- server-side inventory recheck
- qty matches session
- idempotency safeguard
- atomic transaction
```

#### Frontend Validation (Client-Side)
Pre-mutation validation with user-friendly messages:

```typescript
// Form validation with real-time feedback
- Qty input: min/max bounds (1–10)
- Date pickers: disable past dates  
- Price inputs: non-negative, max 2 decimals
- Text inputs: max length with char counter

// Error messages
- Oversell: "Capacity reached. Try again soon or check another event."
- Cooldown: "You can rejoin in {minutesRemaining} minutes."
- Checkout: "You're already checking out this event. Finish or cancel first."
- Validation: Specific field error with clear guidance
```

### 2. Atomic Transactions & Server-Side Rechecks

#### Oversell Prevention (purchaseTicket)
```typescript
export const purchaseTicket = mutation(async (ctx, args) => {
  // 1. Server-side inventory recheck (never trust client)
  const currentTicketType = await ctx.db.get(args.ticketTypeId)
  const availableQuantity = currentTicketType.quantity - currentTicketType.quantitySold
  
  if (availableQuantity < args.quantity) {
    throw new OversellError('Insufficient inventory. Try again soon.', 30)
  }
  
  // 2. Atomic transaction: All-or-nothing
  const ticketId = await ctx.db.insert("userTickets", {...})
  await ctx.db.patch(args.ticketTypeId, {
    quantitySold: currentTicketType.quantitySold + args.quantity
  })
  await ctx.db.delete(queueEntryId)
  await ctx.db.delete(checkoutSessionId)
  
  return { ticketId, confirmationCode }
})
```

#### Idempotency Safeguard
```typescript
// Check for existing tickets before creating new ones
const existingTickets = await ctx.db.query('userTickets')
  .withIndex('by_event_user', q => q.eq('eventId', args.eventId).eq('userId', user._id))
  .collect()

const duplicateTicket = existingTickets.find(t => 
  t.ticketType === ticketType.type && 
  t.quantity === args.quantity &&
  t.status === 'valid'
)

if (duplicateTicket) {
  console.warn('[Events] Duplicate purchase attempt detected')
  return { ticketId: duplicateTicket._id, confirmationCode: duplicateTicket.confirmationCode }
}
```

### 3. Cron Cleanup (5-minute interval)

#### Cleanup Tasks
```typescript
// Clean expired queue entries (> 30 min old)
const expiredQueueEntries = await ctx.db.query('eventQueue')
  .withIndex('by_expires', q => q.lt('expiresAtUtc', now))
  .collect()

for (const entry of expiredQueueEntries) {
  await ctx.db.patch(entry._id, { status: 'expired' })
}

// Clean expired checkout sessions (> 10 min old)  
const expiredCheckoutSessions = await ctx.db.query('checkoutSessions')
  .withIndex('by_expires', q => q.lt('expiresAtUtc', now))
  .collect()

for (const session of expiredCheckoutSessions) {
  await ctx.db.delete(session._id)
}
```

#### Cron Configuration
```typescript
// convex/crons.ts - HTTP Actions for external cron triggers
export const cleanupCron = httpAction(async (ctx, req) => {
  const result = await ctx.runMutation(ctx.api.events.cleanupExpiredEntries)
  return new Response(JSON.stringify({ success: true, cleaned: result }))
})

// Configure in deployment:
// curl -X POST "https://your-app.convex.cloud/cron/cleanupCron" -H "Authorization: Bearer SECRET"
```

### 4. Timezone Snapshots

#### Schema Enhancement
```typescript
events: defineTable({
  // ... existing fields
  venueTimezone: v.string(), // "America/New_York" - immutable snapshot
  createdAtUtc: v.number(),
})
```

#### Event Creation with Timezone
```typescript
export const createEvent = mutation(async (ctx, args) => {
  const venue = await ctx.db.get(args.venueId)
  
  return ctx.db.insert("events", {
    ...args,
    venueTimezone: venue.timezone, // Snapshot timezone
    startAtUtc: args.startAtUtc, // UTC milliseconds
    endAtUtc: args.endAtUtc,
    // ... other fields
  })
})
```

#### Frontend Display with Timezone Conversion
```typescript
const formatEventTime = (utcMillis: number, timezone: string): string => {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "short", day: "numeric", 
    hour: "2-digit", minute: "2-digit"
  }).format(new Date(utcMillis))
}
```

### 5. Error Boundaries & Network Error Handling

#### Network Error Boundary
```typescript
export class NetworkErrorBoundary extends Component {
  private isNetworkError(error: Error): boolean {
    return ['network', 'fetch', 'connection', 'timeout'].some(pattern => 
      error.message.toLowerCase().includes(pattern)
    )
  }
  
  private scheduleRetry() {
    const delay = Math.min(1000 * Math.pow(2, this.retryCount), 16000)
    setTimeout(() => {
      this.retryCount++
      this.setState({ hasError: false })
    }, delay)
  }
}
```

#### Convex Error Types & Handling
```typescript
try {
  await joinQueueMutation({ eventId })
} catch (err) {
  if (err.message.includes("already in queue")) {
    showToast("You're already waiting in this queue", "info")
  } else if (err.message.includes("cooldown")) {
    showToast("Try again in a few minutes", "warning") 
  } else if (err.message.includes("network")) {
    // Trigger offline queue
    addToOfflineQueue({ type: 'joinQueue', args: { eventId } })
  }
}
```

#### Permission Error Handling
```typescript
// 401: Redirect to sign-in
if (error.status === 401) {
  redirect('/sign-in')
}

// 403: Show access denied  
if (error.status === 403) {
  showToast("You don't have access to this event", "error")
}
```

### 6. Offline Queueing (IndexedDB)

#### IndexedDB Implementation
```typescript
class EventOfflineQueue {
  async addAction(action: StoredAction): Promise<string> {
    const id = `${action.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const storedAction = { ...action, id, timestamp: Date.now(), retryCount: 0 }
    
    await this.db.transaction(['actions'], 'readwrite')
      .objectStore('actions')
      .add(storedAction)
    
    return id
  }
}
```

#### Offline Action Types
```typescript
type StoredAction = {
  id: string
  timestamp: number
  type: 'joinQueue' | 'leaveQueue' | 'startCheckout' | 'purchaseTicket'
  args: any
  priority: 'high' | 'medium' | 'low'
  retryCount: number
  maxRetries: number
  metadata?: { eventId?: string, userId?: string }
}
```

#### Network Status & Sync
```typescript
// Auto-sync when connection restored
useEffect(() => {
  const handleOnline = async () => {
    if (offlineQueue.length > 0) {
      await processOfflineQueue(convex)
    }
  }
  
  window.addEventListener('online', handleOnline)
  return () => window.removeEventListener('online', handleOnline)
}, [offlineQueue, convex])
```

## 📊 Monitoring & Debugging

### Error Logging
```typescript
// Structured error logging for debugging
console.warn('[Events] Duplicate purchase attempt detected for user:', user._id)
console.error('[Events] Queue corruption detected:', { eventId, userId, seq })
console.log('[Cron] Cleanup completed:', { queueEntriesCleaned, checkoutSessionsCleaned })
```

### Performance Monitoring
```typescript
// Track queue performance
const queueMetrics = {
  averageWaitTime: calculateAverageWait(),
  queueLength: getCurrentQueueLength(),
  checkoutConversionRate: getCheckoutConversionRate(),
  oversellAttempts: getOversellAttempts()
}
```

## 🚀 Deployment Checklist

### Convex Configuration
- [ ] Deploy cron jobs to run every 5 minutes
- [ ] Set up monitoring for cleanup job failures
- [ ] Configure alert for high oversell attempts
- [ ] Enable Convex monitoring for query/mutation performance

### Frontend Integration
- [ ] Wrap event pages with NetworkErrorBoundary
- [ ] Implement offline queue UI indicators
- [ ] Add retry mechanisms with exponential backoff
- [ ] Set up error reporting for production

### Database Monitoring
- [ ] Monitor queue entry staleness
- [ ] Track checkout session cleanup rates
- [ ] Alert on high retry counts in offline queue
- [ ] Monitor timezone conversion accuracy

## 🔧 Configuration Constants

```typescript
// Error mitigation constants
const QUEUE_EXPIRY_MS = 30 * 60 * 1000 // 30 minutes
const QUEUE_COOLDOWN_MS = 60 * 60 * 1000 // 1 hour  
const CHECKOUT_EXPIRY_MS = 10 * 60 * 1000 // 10 minutes
const CHECKOUT_LIMIT = 5 // max concurrent sessions
const MAX_TICKETS_PER_PURCHASE = 10

// Validation bounds
const TITLE_MAX = 200
const DESCRIPTION_MAX = 2000
const CAPACITY_MAX = 100000
const PRICE_MAX = 999999
```

## 🧪 Testing Strategy

### Unit Tests
- [ ] Test all validation functions
- [ ] Test atomic transaction integrity
- [ ] Test idempotency safeguards
- [ ] Test timezone conversion accuracy

### Integration Tests  
- [ ] Test offline queue sync
- [ ] Test network error recovery
- [ ] Test cron cleanup functionality
- [ ] Test oversell prevention under load

### Load Tests
- [ ] Test queue with 1000+ concurrent users
- [ ] Test checkout under high concurrency
- [ ] Test network failure scenarios
- [ ] Test offline queue with large datasets

## 📈 Success Metrics

### Error Reduction
- Target: <0.1% oversell incidents
- Target: <1% queue corruption events  
- Target: <5% network error failures

### Performance
- Target: <2s average queue wait time
- Target: >95% checkout success rate
- Target: <1s offline sync time

### Reliability  
- Target: 99.9% uptime for queue operations
- Target: 100% data consistency
- Target: Zero timezone-related bugs

This comprehensive error mitigation system ensures robust, reliable event ticketing operations even under adverse conditions.