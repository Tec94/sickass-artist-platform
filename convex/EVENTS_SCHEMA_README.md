# Events & Ticketing System - Schema Documentation

## Overview

This document describes the database schema for the Events & Ticketing system. The schema consists of 6 core tables designed to handle event creation, ticket sales, virtual queuing, and checkout throttling with comprehensive error mitigation.

## Design Philosophy

### 1. UTC Timestamps (Numbers, not Strings)
- **All timestamps stored as numbers** (milliseconds since Unix epoch)
- **Why:** Prevents DST bugs, enables fast comparisons, consistent across timezones
- **Example:** `startAtUtc: 1704067200000` = Jan 1, 2024 00:00:00 UTC
- **Display:** Use venue timezone snapshot + `Intl.DateTimeFormat` on frontend

### 2. Venue Data Snapshot
- **Events snapshot venue fields** at creation time (immutable)
- **Fields snapshotted:** name, city, country, address, timezone
- **Why:** Handles venue deletion, timezone changes, and DST transitions
- **Pattern:** Event time always displays correctly even if venue is edited/deleted

### 3. Atomic Sequence Allocation
- **Queue uses event-level counter** (`event.nextQueueSeq`)
- **Why:** O(1) atomicity vs. O(n) scan; prevents sequence collisions
- **Pattern:**
  ```typescript
  const newSeq = event.nextQueueSeq
  await ctx.db.patch(eventId, { nextQueueSeq: newSeq + 1 })
  await ctx.db.insert('eventQueue', { seq: newSeq, ... })
  ```

### 4. Oversell Prevention
- **Atomic purchase mutation** validates all conditions before writing
- **Checks:**
  1. `event.saleStatus === 'on_sale'`
  2. `ticketType.quantitySold + qty <= ticketType.quantity`
  3. `event.ticketsSold + qty <= event.capacity`
  4. Ticket type within sale window
- **If any check fails:** mutation throws `ConvexError`, no state changes

### 5. Queue Expiry & Cooldown
- **Default expiry:** 30 minutes (`expiresAtUtc = joinedAtUtc + 30*60*1000`)
- **Cooldown after leaving:** 1 hour (`cooldownUntilUtc = now + 3600000`)
- **Why:** Prevents queue gaming (leaving and immediately rejoining)
- **Cron cleanup:** Runs every 5 minutes to mark expired entries

### 6. Checkout Throttling
- **CHECKOUT_LIMIT:** Max concurrent sessions per event (e.g., 5)
- **Session expiry:** 10 minutes (`expiresAtUtc = createdAtUtc + 10*60*1000`)
- **Why:** Prevents thundering herd problem during high-demand sales
- **Pattern:** Check session count before allowing checkout

## Tables

### venues
Physical locations where events take place. Reusable across multiple events.

**Fields:**
- `name: string` - Venue name (1-100 chars)
- `city: string` - City name (1-50 chars)
- `country: string` - Country (2-letter ISO code or full name)
- `address: string` - Full address for map link (5-500 chars)
- `latitude: number?` - GPS latitude (-90 to 90) for future map features
- `longitude: number?` - GPS longitude (-180 to 180) for future map features
- `capacity: number?` - Venue max capacity (for validation)
- `timezone: string` - IANA timezone (e.g., 'America/New_York')
- `createdAt: number` - Creation timestamp (UTC milliseconds)

**Indexes:**
- `by_city [city]` - Query venues by city
- `by_timezone [timezone]` - Query venues by timezone

**Validation (Phase 1.3):**
- name: 1-100 chars
- city: 1-50 chars
- country: 2-letter ISO or full name
- address: 5-500 chars
- timezone: valid IANA timezone (check against `Intl.supportedValuesOf('timeZone')`)
- latitude/longitude: if provided, must be valid coordinates

---

### events
Main event records with snapshotted venue data for immutability.

**Fields:**
- `title: string` - Event title (1-200 chars)
- `description: string` - Event description (1-2000 chars)
- `imageUrl: string` - Event banner image (CDN path, required)
- `thumbnailUrl: string?` - Thumbnail for lists (optional)
- `startAtUtc: number` - Event start time (UTC ms, must be > now)
- `endAtUtc: number` - Event end time (UTC ms, must be > startAtUtc)
- **Venue snapshot (immutable):**
  - `venueId: Id<'venues'>` - Reference to venues table
  - `venueName: string` - Snapshot of venue.name
  - `city: string` - Snapshot of venue.city
  - `country: string` - Snapshot of venue.country
  - `address: string` - Snapshot of venue.address
  - `timezone: string` - Snapshot of venue.timezone
- **Capacity & sales:**
  - `capacity: number` - Total tickets available (1-100,000)
  - `ticketsSold: number` - Current tickets sold (starts at 0, incremented atomically)
- `saleStatus: 'upcoming' | 'on_sale' | 'sold_out' | 'cancelled'` - Sale status
- `artistId: Id<'users'>` - Event creator (artist/admin/mod)
- `searchText: string` - Computed: `title + " " + venueName + " " + city` (for search index)
- `dedupeKey: string` - Unique: `artistId:venueId:startAtUtc:slug(title)` (prevents duplicates)
- `nextQueueSeq: number` - Atomic counter for queue sequence (starts at 0)
- `createdAt: number` - Creation timestamp (UTC milliseconds)
- `updatedAt: number` - Last update timestamp (UTC milliseconds)

**Indexes:**
- `by_status_start [saleStatus, startAtUtc]` - Main query: list upcoming events
- `by_city_start [city, startAtUtc]` - Filter by city + sort by start time
- `by_artist_start [artistId, startAtUtc]` - Creator's events
- `by_dedupe [dedupeKey]` - Unique constraint check + duplicate prevention
- `search_events (searchText) filter[saleStatus, city]` - Full-text search

**Validation (Phase 1.3):**
- title: 1-200 chars
- description: 1-2000 chars
- imageUrl: must be non-empty, valid URL
- startAtUtc: must be > now (no past events)
- endAtUtc: must be > startAtUtc (at least 1 minute)
- capacity: 1-100,000
- artistId: must match current user or admin override
- dedupeKey: enforce uniqueness via `by_dedupe` index

**Role Gating:** artist, mod, admin only

---

### eventTickets
Ticket type definitions per event with inventory tracking.

**Fields:**
- `eventId: Id<'events'>` - Parent event reference
- `type: 'general' | 'vip' | 'early_bird'` - Ticket type
- `price: number` - Price in cents (0-999,999), e.g., 9999 = $99.99
- `quantity: number` - Total available for this type (1-100,000)
- `quantitySold: number` - Current sold count (starts at 0, incremented atomically)
- `description: string?` - Optional description (e.g., "VIP meet & greet")
- `saleStartsAtUtc: number` - Sale window start (UTC milliseconds)
- `saleEndsAtUtc: number` - Sale window end (UTC milliseconds, must be <= event.startAtUtc)
- `createdAt: number` - Creation timestamp (UTC milliseconds)

**Indexes:**
- `by_event_type [eventId, type]` - Query all ticket types for an event
- `by_event [eventId]` - Query all ticket types (for validation)

**Validation (Phase 1.3):**
- price: 0-999,999 cents
- quantity: 1-100,000 per type
- sum(all ticket quantities) <= event.capacity (server-side check)
- saleStartsAtUtc < saleEndsAtUtc (valid window)
- saleEndsAtUtc <= event.startAtUtc (sales must end before event)

---

### userTickets
Purchased tickets owned by users with validation codes.

**Fields:**
- `userId: Id<'users'>` - Ticket owner
- `eventId: Id<'events'>` - Event reference
- `ticketType: 'general' | 'vip' | 'early_bird'` - Ticket type purchased
- `quantity: number` - Number of tickets purchased (1-10 per transaction)
- `ticketNumber: string` - Unique identifier (format: `EVENT_ID-SEQ`)
- `confirmationCode: string` - 8-char alphanumeric code (for entry gate validation)
- `purchasedAtUtc: number` - Purchase timestamp (UTC milliseconds)
- `status: 'valid' | 'used' | 'cancelled'` - Ticket status (starts at 'valid')
- `createdAt: number` - Creation timestamp (UTC milliseconds)

**Indexes:**
- `by_user [userId]` - My tickets page
- `by_event_user [eventId, userId]` - Check if user has tickets for event
- `by_user_status [userId, status]` - Filter my tickets by status

**Validation (Phase 1.3):**
- quantity: 1-10 per transaction (client enforces, server re-checks)
- Must have active checkout session OR < CHECKOUT_LIMIT concurrent sessions exist

---

### eventQueue
Virtual queue for high-demand events with automatic expiry and cooldown.

**Fields:**
- `eventId: Id<'events'>` - Event reference
- `userId: Id<'users'>` - User in queue
- `seq: number` - Queue position (monotonically allocated from event.nextQueueSeq)
- `status: 'waiting' | 'admitted' | 'expired' | 'left'` - Queue status (starts at 'waiting')
- `joinedAtUtc: number` - Join timestamp (UTC milliseconds)
- `expiresAtUtc: number` - Expiry timestamp (joinedAtUtc + 30*60*1000 default)
- `cooldownUntilUtc: number?` - Cooldown after leaving (prevents rejoin spam, 1h default)
- `notifiedAtUtc: number?` - When user was notified of position change (future use)
- `createdAt: number` - Creation timestamp (UTC milliseconds)

**Indexes:**
- `by_event_user [eventId, userId]` - Upsert check: is user already in queue?
- `by_event_status_seq [eventId, status, seq]` - Query position: count waiting with seq < mine
- `by_event_expires [eventId, expiresAtUtc]` - Cron: query expired entries by event
- `by_expires [expiresAtUtc]` - Cron: global cleanup of all expired entries

**Validation (Phase 1.3):**
- joinQueue: saleStatus must be 'on_sale'
- joinQueue: user must not have active cooldownUntilUtc (check: now < cooldownUntilUtc)
- joinQueue: upsert if entry exists (idempotent)
- leaveQueue: sets status='left', sets cooldownUntilUtc = now + 3600000 (1h)

**Error Mitigation:**
- **Duplicate entries:** Use `by_event_user` index + upsert logic
- **Stuck in queue:** Cron cleanup every 5 min; show countdown timer on frontend
- **Gaming (rejoin spam):** cooldownUntilUtc enforced server-side

---

### checkoutSessions
Throttles concurrent checkouts to prevent thundering herd.

**Fields:**
- `eventId: Id<'events'>` - Event reference
- `userId: Id<'users'>` - User checking out
- `createdAtUtc: number` - Session start timestamp (UTC milliseconds)
- `expiresAtUtc: number` - Session expiry (createdAtUtc + 10*60*1000 for 10-minute window)

**Indexes:**
- `by_event [eventId]` - Count active sessions per event (for throttling)
- `by_event_user [eventId, userId]` - Enforce 1 session per user per event
- `by_expires [expiresAtUtc]` - Cron: cleanup expired sessions every 5 minutes

**Validation (Phase 1.3):**
- startCheckout: Check if active session count < CHECKOUT_LIMIT (e.g., 5)
- startCheckout: Enforce 1 session per user per event
- Cron deletes expired sessions every 5 minutes

**Error Mitigation:**
- **Thundering herd:** CHECKOUT_LIMIT enforced; rest queued
- **Network disconnects:** Client revalidates session on reconnect

---

## Error Mitigation Strategies

### 1. Oversell Prevention
- **Risk:** Two users purchase simultaneously, exceeding capacity
- **Mitigation:** Atomic purchase mutation with server-side rechecks
- **Detection:** If mutation fails with "insufficient inventory", retry and show error
- **Recovery:** Show "Sold out" error; don't requeue; suggest similar events

### 2. Stuck in Queue
- **Risk:** User disconnects; queue entry expires but UI doesn't reflect it
- **Mitigation:** Show countdown timer (expiresAtUtc - now); cron cleanup every 5 min
- **Detection:** Convex subscription detects status='expired'; show "Queue expired" message
- **Recovery:** "Rejoin Queue" button; check cooldownUntilUtc first

### 3. Duplicate Queue Entries
- **Risk:** joinQueue called twice before response (race condition)
- **Mitigation:** Use by_event_user index + upsert logic (if exists, return existing)
- **Detection:** Check if status exists before inserting
- **Recovery:** Idempotent – return existing entry

### 4. Timezone Display Bugs
- **Risk:** Event created during DST transition; frontend shows wrong time
- **Mitigation:** Store UTC only; snapshot venue timezone at event creation
- **Detection:** Test with events spanning DST boundaries
- **Recovery:** Always use Intl.DateTimeFormat with saved timezone

### 5. Gaming (Rejoin Spam)
- **Risk:** User leaves queue, immediately rejoins to skip position
- **Mitigation:** cooldownUntilUtc enforced server-side in joinQueue mutation
- **Detection:** Mutation throws "Must wait X minutes before rejoining"
- **Recovery:** Show countdown; disable rejoin button until cooldown expires

### 6. Search Slowdown
- **Risk:** SearchIndex query times out or returns slow results
- **Mitigation:** Use Convex SearchIndex (not regex); limit results to 100; filter by saleStatus + city
- **Detection:** Monitor query latency; warn if > 500ms
- **Recovery:** Show skeleton; allow filter refinement; cache popular searches

### 7. Missing Venue Data
- **Risk:** Venue deleted; event still references it
- **Mitigation:** Snapshot venue fields (name, address, city, timezone) into events table
- **Detection:** Queries don't fail if venue doc is deleted
- **Recovery:** Display snapshotted data; disable future venue edits on old events

### 8. Network Disconnects During Checkout
- **Risk:** Checkout session created; network drops; user thinks it's invalid
- **Mitigation:** Store checkoutSessions server-side; client revalidates on reconnect
- **Detection:** Convex auto-reconnects; client refetches checkoutSessions
- **Recovery:** "Reconnected" banner; show valid checkout session if exists

### 9. Concurrent Checkout Attempts (Thundering Herd)
- **Risk:** 1000 users try to checkout simultaneously for sold-out event
- **Mitigation:** CHECKOUT_LIMIT (e.g., 5 concurrent sessions per event); rest queued
- **Detection:** startCheckout fails if position > CHECKOUT_LIMIT; show "Waiting for your turn"
- **Recovery:** Auto-retry every 5s; show estimated wait time

### 10. Idempotency on Purchase (Future)
- **Risk:** Purchase mutation succeeds but client doesn't receive response; user retries
- **Mitigation:** (MVP: not implemented) Check if userTickets already exist by (userId, eventId, ticketType)
- **Detection:** If insert fails with "duplicate", query userTickets to confirm
- **Recovery:** Return existing ticket details instead of error

---

## Code Patterns

### Atomic Sequence Allocation (for queue seq)
```typescript
// In joinQueue mutation:
const event = await ctx.db.get(eventId)
const newSeq = event.nextQueueSeq
await ctx.db.patch(eventId, { nextQueueSeq: newSeq + 1 })
await ctx.db.insert('eventQueue', { eventId, userId, seq: newSeq, ... })
```

### Timezone Snapshot
```typescript
// In createEvent mutation:
const venue = await ctx.db.get(venueId)
const event = {
  ...,
  timezone: venue.timezone, // snapshot, immutable
  venueName: venue.name,     // snapshot
  city: venue.city,          // snapshot
}
```

### Oversell Prevention
```typescript
// In purchaseTicket mutation:
const [event, ticketType] = await Promise.all([
  ctx.db.get(eventId),
  ctx.db.get(ticketTypeId),
])

// Validate counts atomically
if (event.ticketsSold + qty > event.capacity) {
  throw new ConvexError('Insufficient inventory')
}
if (ticketType.quantitySold + qty > ticketType.quantity) {
  throw new ConvexError('Ticket type sold out')
}

// Atomic writes (all or nothing)
await Promise.all([
  ctx.db.patch(eventId, { ticketsSold: event.ticketsSold + qty }),
  ctx.db.patch(ticketTypeId, { quantitySold: ticketType.quantitySold + qty }),
  ctx.db.insert('userTickets', { ... }),
])
```

### Queue Position Query
```typescript
// Query user's position in queue:
const myEntry = await ctx.db
  .query('eventQueue')
  .withIndex('by_event_user', q => q.eq('eventId', eventId).eq('userId', userId))
  .unique()

const waitingAhead = await ctx.db
  .query('eventQueue')
  .withIndex('by_event_status_seq', q => 
    q.eq('eventId', eventId).eq('status', 'waiting').lt('seq', myEntry.seq)
  )
  .collect()

return { position: waitingAhead.length + 1, total: totalWaiting }
```

---

## Query Patterns (Phase 1.2)

### Q1: List Events by Status & City
```typescript
// List upcoming events in a city:
const events = await ctx.db
  .query('events')
  .withIndex('by_city_start', q => q.eq('city', 'New York'))
  .filter(q => q.eq(q.field('saleStatus'), 'on_sale'))
  .order('asc') // by startAtUtc
  .take(20)
```

### Q2: Get Event with Ticket Types
```typescript
// Get event details + all ticket types:
const event = await ctx.db.get(eventId)
const ticketTypes = await ctx.db
  .query('eventTickets')
  .withIndex('by_event', q => q.eq('eventId', eventId))
  .collect()
```

### Q3: Check Queue Position
```typescript
// Get user's queue position:
const myEntry = await ctx.db
  .query('eventQueue')
  .withIndex('by_event_user', q => q.eq('eventId', eventId).eq('userId', userId))
  .unique()

const waitingAhead = await ctx.db
  .query('eventQueue')
  .withIndex('by_event_status_seq', q => 
    q.eq('eventId', eventId).eq('status', 'waiting').lt('seq', myEntry.seq)
  )
  .collect()

return { position: waitingAhead.length + 1 }
```

### Q4: My Tickets
```typescript
// Get all tickets for a user:
const tickets = await ctx.db
  .query('userTickets')
  .withIndex('by_user', q => q.eq('userId', userId))
  .filter(q => q.eq(q.field('status'), 'valid'))
  .collect()
```

### Q5: Search Events
```typescript
// Full-text search with filters:
const results = await ctx.db
  .query('events')
  .withSearchIndex('search_events', q => 
    q.search('searchText', query)
      .eq('saleStatus', 'on_sale')
      .eq('city', 'Los Angeles')
  )
  .take(50)
```

---

## Cron Jobs (Phase 1.4)

### Expired Queue Cleanup (every 5 minutes)
```typescript
// Mark expired queue entries as 'expired':
const now = Date.now()
const expired = await ctx.db
  .query('eventQueue')
  .withIndex('by_expires', q => q.lt('expiresAtUtc', now))
  .filter(q => q.eq(q.field('status'), 'waiting'))
  .collect()

for (const entry of expired) {
  await ctx.db.patch(entry._id, { status: 'expired' })
}
```

### Expired Checkout Sessions Cleanup (every 5 minutes)
```typescript
// Delete expired checkout sessions:
const now = Date.now()
const expired = await ctx.db
  .query('checkoutSessions')
  .withIndex('by_expires', q => q.lt('expiresAtUtc', now))
  .collect()

for (const session of expired) {
  await ctx.db.delete(session._id)
}
```

### Update Sale Status (every 10 minutes)
```typescript
// Update events from 'upcoming' to 'on_sale' when sale window starts:
const now = Date.now()
const events = await ctx.db
  .query('events')
  .filter(q => q.eq(q.field('saleStatus'), 'upcoming'))
  .collect()

for (const event of events) {
  const ticketTypes = await ctx.db
    .query('eventTickets')
    .withIndex('by_event', q => q.eq('eventId', event._id))
    .collect()
  
  const earliestSaleStart = Math.min(...ticketTypes.map(t => t.saleStartsAtUtc))
  if (now >= earliestSaleStart) {
    await ctx.db.patch(event._id, { saleStatus: 'on_sale' })
  }
}
```

---

## Testing Checklist

- [ ] Schema compiles without TypeScript errors
- [ ] All indexes defined correctly (no duplicate index names)
- [ ] Venue timezone validation accepts IANA timezones
- [ ] Event creation snapshots venue fields correctly
- [ ] Queue sequence allocation is atomic (no race conditions)
- [ ] Oversell prevention works (multiple concurrent purchases)
- [ ] Queue expiry marks entries as 'expired' after 30 minutes
- [ ] Cooldown prevents rejoin within 1 hour of leaving
- [ ] Checkout throttling limits concurrent sessions per event
- [ ] Search index returns relevant results
- [ ] All timestamp fields use UTC milliseconds (not ISO strings)
- [ ] Duplicate event prevention via dedupeKey works

---

## Related Documentation

- **Phase 1.2:** Query functions (Q1-Q5) - Dependencies: this schema
- **Phase 1.3:** Mutation functions (M1-M6) + validation + error handling
- **Phase 1.4:** Cron cleanup scheduler
- **Phase 2:** Frontend UI components
- **Phase 3:** Payment integration

---

## Type Exports (for Frontend)

```typescript
// Export type helpers for frontend reuse:
export type EventStatus = 'upcoming' | 'on_sale' | 'sold_out' | 'cancelled'
export type TicketType = 'general' | 'vip' | 'early_bird'
export type TicketStatus = 'valid' | 'used' | 'cancelled'
export type QueueStatus = 'waiting' | 'admitted' | 'expired' | 'left'
```

---

## Constants (for Mutations)

```typescript
// Constants used across mutations:
export const QUEUE_EXPIRY_MS = 30 * 60 * 1000        // 30 minutes
export const QUEUE_COOLDOWN_MS = 60 * 60 * 1000      // 1 hour
export const CHECKOUT_EXPIRY_MS = 10 * 60 * 1000     // 10 minutes
export const CHECKOUT_LIMIT = 5                      // Max concurrent sessions per event
export const MAX_TICKETS_PER_PURCHASE = 10           // Max tickets per transaction
```
