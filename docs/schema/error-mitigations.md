# Error Mitigation Strategies

Comprehensive error handling, validation, and resilience patterns for events & ticketing system.

## Data Validation

###Server-Side (Convex)
All mutations include comprehensive validation:
- **createEvent**: title 1-200 chars, startAt < endAt, capacity > 0, venue exists, unique dedupeKey
- **createTicketType**: price >= 0, quantity >= 1, saleEndsAt <= event.startAt
- **joinQueue**: user not in queue, no cooldown, atomic sequence
- **purchaseTicket**: inventory recheck, qty matches session, idempotency safeguard

### Client-Side (Frontend)
Pre-mutation validation with user-friendly messages:
- Form validation with real-time feedback
- Min/max bounds, disabled past dates
- Clear error messages with specific guidance
- Character counters, input constraints

## Atomic Transactions

### Oversell Prevention

```typescript
export const purchaseTicket = mutation(async (ctx, args) => {
  // Server-side inventory recheck (never trust client)
  const availableQty = ticketType.quantity - ticketType.quantitySold
  
  if (availableQty < args.quantity) {
    throw new ConvexError('Insufficient inventory')
  }
  
  // Atomic transaction: All-or-nothing
  await Promise.all([
    ctx.db.insert("userTickets", {...}),
    ctx.db.patch(ticketTypeId, {
      quantitySold: ticketType.quantitySold + args.quantity
    }),
    ctx.db.delete(queueEntryId),
    ctx.db.delete(checkoutSessionId)
  ])
})
```

### Idempotency Safeguard

Check for existing tickets before creating duplicates. If found, return existing ticket instead of error.

## Cron Cleanup

### Tasks (Every 5 Minutes)
- **Expired queue entries**: Mark as 'expired' after 30 min
- **Expired checkout sessions**: Delete after 10 min
- **Sale status updates**: Update 'upcoming' to 'on_sale' when window starts

```typescript
const expired = await ctx.db
  .query('eventQueue')
  .withIndex('by_expires', q => q.lt('expiresAtUtc', Date.now()))
  .filter(q => q.eq(q.field('status'), 'waiting'))
  .collect()

for (const entry of expired) {
  await ctx.db.patch(entry._id, { status: 'expired' })
}
```

## Timezone Snapshots

Events snapshot venue timezone at creation (immutable). Prevents DST bugs and handles venue deletion/changes.

```typescript
// Event creation
const event = {
  ...args,
  venueTimezone: venue.timezone, // Snapshot
  startAtUtc: args.startAtUtc,   // UTC ms
}

// Frontend display
const formatEventTime = (utcMs, timezone) => {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit"
  }).format(new Date(utcMs))
}
```

## Error Boundaries & Network Handling

### Network Error Boundary
Detects network errors, schedules exponential backoff retry (1s, 2s, 4s, max 16s).

### Convex Error Types
```typescript
try {
  await joinQueueMutation({ eventId })
} catch (err) {
  if (err.message.includes("already in queue")) {
    showToast("You're already waiting", "info")
  } else if (err.message.includes("cooldown")) {
    showToast("Try again in a few minutes", "warning")
  } else if (err.message.includes("network")) {
    addToOfflineQueue({ type: 'joinQueue', args: { eventId } })
  }
}
```

### Permission Errors
- **401**: Redirect to sign-in
- **403**: Show "Access denied" toast

## Offline Queueing

IndexedDB-based offline action queue with priority, retry count, and metadata.

```typescript
type StoredAction = {
  id: string
  timestamp: number
  type: 'joinQueue' | 'leaveQueue' | 'startCheckout' | 'purchaseTicket'
  args: any
  priority: 'high' | 'medium' | 'low'
  retryCount: number
  maxRetries: number
}
``

Auto-sync when connection restored.

## Monitoring & Debugging

### Error Logging
```typescript
console.warn('[Events] Duplicate purchase attempt for user:', userId)
console.error('[Events] Queue corruption detected:', { eventId, seq })
console.log('[Cron] Cleanup completed:', { queueCleaned, sessionsCleaned })
```

### Performance Monitoring
Track queue metrics: average wait time, queue length, checkout conversion rate, oversell attempts.

## Configuration Constants

```typescript
const QUEUE_EXPIRY_MS = 30 * 60 * 1000      // 30 minutes
const QUEUE_COOLDOWN_MS = 60 * 60 * 1000    // 1 hour
const CHECKOUT_EXPIRY_MS = 10 * 60 * 1000   // 10 minutes
const CHECKOUT_LIMIT = 5                     // Max concurrent sessions
const MAX_TICKETS_PER_PURCHASE = 10
```

## Success Metrics

- **Error Reduction**: <0.1% oversell, <1% queue corruption, <5% network failures
- **Performance**: <2s avg queue wait, >95% checkout success, <1s offline sync
- **Reliability**: 99.9% uptime, 100% data consistency, zero timezone bugs
