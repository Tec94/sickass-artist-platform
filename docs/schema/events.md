# Events & Ticketing Schema

Database schema for events, venues, ticketing, queuing, and checkout with error mitigation.

## Design Philosophy

1. **UTC Timestamps**: All times stored as numbers (ms since Unix epoch)
2. **Venue Snapshots**: Events snapshot venue data at creation (immutable)
3. **Atomic Sequences**: Queue uses event-level counter for O(1) allocation
4. **Oversell Prevention**: Atomic purchase validates all conditions before writing
5. **Queue Management**: 30-minute expiry, 1-hour cooldown after leaving
6. **Checkout Throttling**: Limit concurrent sessions per event

## Tables

### venues
Physical locations for events. Reusable across multiple events.

**Fields:**
- `name`, `city`, `country`, `address`
- `latitude`, `longitude` - Optional GPS coordinates
- `capacity` - Venue max capacity
- `timezone` - IANA timezone (e.g., 'America/New_York')

**Indexes:** `by_city`, `by_timezone`

### events
Main event records with snapshotted venue data.

**Fields:**
- `title`, `description`, `imageUrl`, `thumbnailUrl`
- `startAtUtc`, `endAtUtc` - Event times (UTC ms)
- **Venue snapshot**: `venueId`, `venueName`, `city`, `country`, `address`, `timezone`
- `capacity`, `ticketsSold` - Inventory tracking
- `saleStatus`: 'upcoming' | 'on_sale' | 'sold_out' | 'cancelled'
- `artistId` - Event creator
- `searchText` - Computed for search index
- `dedupeKey` - Unique: `artistId:venueId:startAtUtc:slug(title)`
- `nextQueueSeq` - Atomic counter for queue (starts at 0)

**Indexes:**
- `by_status_start` - Main query: list upcoming events
- `by_city_start` - Filter by city + sort by start
- `by_artist_start` - Creator's events
- `by_dedupe` - Duplicate prevention
- `search_events` - Full-text search

### eventTickets
Ticket type definitions per event with inventory tracking.

**Fields:**
- `eventId`, `type`: 'general' | 'vip' | 'early_bird'
- `price` - In cents (e.g., 9999 = $99.99)
- `quantity`, `quantitySold` - Inventory
- `description` - Optional (e.g., "VIP meet & greet")
- `saleStartsAtUtc`, `saleEndsAtUtc` - Sale window

**Indexes:** `by_event_type`, `by_event`

**Validation:**
- sum(all ticket quantities) <= event.capacity
- saleEndsAtUtc <= event.startAtUtc

### userTickets
Purchased tickets owned by users.

**Fields:**
- `userId`, `eventId`, `ticketType`, `quantity`
- `ticketNumber` - Unique: `EVENT_ID-SEQ`
- `confirmationCode` - 8-char alphanumeric for entry validation
- `purchasedAtUtc`
- `status`: 'valid' | 'used' | 'cancelled'

**Indexes:** `by_user`, `by_event_user`, `by_user_status`

### eventQueue
Virtual queue for high-demand events with expiry and cooldown.

**Fields:**
- `eventId`, `userId`, `seq` - Queue position
- `status`: 'waiting' | 'admitted' | 'expired' | 'left'
- `joinedAtUtc`, `expiresAtUtc` - 30-minute expiry
- `cooldownUntilUtc` - 1-hour cooldown after leaving

**Indexes:**
- `by_event_user` - Upsert check
- `by_event_status_seq` - Query position
- `by_event_expires`, `by_expires` - Cron cleanup

### checkoutSessions
Throttles concurrent checkouts (prevents thundering herd).

**Fields:**
- `eventId`, `userId`
- `createdAtUtc`, `expiresAtUtc` - 10-minute session

**Indexes:**
- `by_event` - Count active sessions (throttling check)
- `by_event_user` - 1 session per user per event
- `by_expires` - Cron cleanup

## Constants

```typescript
const QUEUE_EXPIRY_MS = 30 * 60 * 1000      // 30 minutes
const QUEUE_COOLDOWN_MS = 60 * 60 * 1000    // 1 hour
const CHECKOUT_EXPIRY_MS = 10 * 60 * 1000   // 10 minutes
const CHECKOUT_LIMIT = 5                     // Max concurrent sessions
const MAX_TICKETS_PER_PURCHASE = 10
```

## Error Mitigation

### Oversell Prevention
Atomic purchase validates: `saleStatus === 'on_sale'`, `ticketType.quantitySold + qty <= quantity`, `event.ticketsSold + qty <= capacity`. All-or-nothing writes.

### Stuck in Queue
Countdown timer shows `expiresAtUtc - now`. Cron cleanup every 5 minutes marks expired entries. "Rejoin Queue" button checks cooldown first.

### Duplicate Queue Entries
Use `by_event_user` index + upsert logic. Idempotent – return existing entry.

### Timezone Display
Store UTC only, snapshot venue timezone. Use `Intl.DateTimeFormat` with saved timezone on frontend.

### Gaming (Rejoin Spam)
`cooldownUntilUtc` enforced server-side in joinQueue. Show countdown, disable button until cooldown expires.

### Thundering Herd
`CHECKOUT_LIMIT` per event enforced. startCheckout fails if count >= limit. Auto-retry every 5s with estimated wait.

## Cron Jobs

### Expired Queue Cleanup (every 5 min)
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

### Expired Checkout Sessions (every 5 min)
Delete sessions where `expiresAtUtc < now`.

### Update Sale Status (every 10 min)
Update events from 'upcoming' to 'on_sale' when earliest ticket sale starts.

## Code Patterns

### Atomic Sequence Allocation
```typescript
const event = await ctx.db.get(eventId)
const newSeq = event.nextQueueSeq
await ctx.db.patch(eventId, { nextQueueSeq: newSeq + 1 })
await ctx.db.insert('eventQueue', { eventId, userId, seq: newSeq, ... })
```

### Oversell Prevention
```typescript
const [event, ticketType] = await Promise.all([
  ctx.db.get(eventId),
  ctx.db.get(ticketTypeId)
])

if (event.ticketsSold + qty > event.capacity) {
  throw new ConvexError('Insufficient inventory')
}

await Promise.all([
  ctx.db.patch(eventId, { ticketsSold: event.ticketsSold + qty }),
  ctx.db.patch(ticketTypeId, { quantitySold: ticketType.quantitySold + qty }),
  ctx.db.insert('userTickets', { ... })
])
```
