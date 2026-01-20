# Database Schema

Complete Convex database schema documentation for the Sickass Artist Platform.

---

## Users & Authentication

User profiles integrated with Auth0 authentication.

### users

| Field | Type | Description |
|-------|------|-------------|
| `clerkId` | string | Auth subject (`sub`) from Auth0 (historical field name) |
| `username` | string | Unique username |
| `email` | string | User email |
| `displayName` | string | Display name |
| `avatarUrl` | string? | Profile image URL |
| `bio` | string? | User biography |
| `role` | enum | 'artist' \| 'admin' \| 'mod' \| 'crew' \| 'fan' |
| `fanTier` | enum | 'bronze' \| 'silver' \| 'gold' \| 'platinum' |
| `createdAt` | number | Creation timestamp (UTC ms) |
| `updatedAt` | number | Last update timestamp |

**Indexes:** `by_clerkId`, `by_username`, `by_role`, `by_fanTier`

**Hierarchy:**
- **Roles**: artist > admin > mod > crew > fan
- **Tiers**: platinum > gold > silver > bronze

---

## Chat System

### channels

Chat channels with role/tier-based access control.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Channel name |
| `slug` | string | URL-friendly slug |
| `description` | string? | Channel description |
| `category` | string | Channel category |
| `requiredRole` | enum? | Minimum role for access |
| `requiredFanTier` | enum? | Minimum tier for access |
| `messageCount` | number | Denormalized message count |
| `lastMessageAt` | number? | Last message timestamp |
| `pinnedMessageId` | Id? | Pinned message reference |
| `createdBy` | Id | Creator user ID |

**Indexes:** `by_slug`, `by_category`

### messages

Chat messages with author snapshot and tombstone pattern.

| Field | Type | Description |
|-------|------|-------------|
| `channelId` | Id | Parent channel |
| `authorId` | Id | Author user ID |
| `content` | string | Message content |
| `authorDisplayName` | string | **Snapshot** - immutable |
| `authorAvatar` | string? | **Snapshot** - immutable |
| `authorTier` | enum | **Snapshot** - immutable |
| `reactionEmojis` | string[] | Denormalized emoji list |
| `reactionCount` | number | Total reaction count |
| `isPinned` | boolean | Pin status |
| `isDeleted` | boolean | Tombstone flag |
| `deletedAt` | number? | Deletion timestamp |
| `idempotencyKey` | string | Format: `${userId}\|${channelId}\|${timestamp}-${nonce}` |

**Indexes:** `by_channel`, `by_author`, `by_idempotency`

> **Tombstone Pattern**: Use `isDeleted: true` instead of deletion to preserve message order.

### reactions

| Field | Type | Description |
|-------|------|-------------|
| `messageId` | Id | Parent message |
| `emoji` | string | Reaction emoji |
| `userId` | Id | Reacting user |
| `createdAt` | number | Timestamp |

**Indexes:** `by_message_emoji`, `by_message_user`

### userTypingIndicators

Ephemeral typing indicators (auto-cleanup via scheduler).

| Field | Type | Description |
|-------|------|-------------|
| `channelId` | Id | Channel reference |
| `userId` | Id | Typing user |
| `displayName` | string | User display name |
| `expiresAt` | number | Expiration timestamp |

**Indexes:** `by_channel`

---

## Forum System

### categories

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Category name |
| `slug` | string | URL slug |
| `description` | string? | Description |
| `icon` | string? | Icon identifier |
| `color` | string? | Theme color |
| `order` | number | Display order |
| `requiredRole` | enum? | Access control |
| `requiredFanTier` | enum? | Tier requirement |
| `threadCount` | number | Denormalized count |
| `lastThreadAt` | number? | Last activity |

**Indexes:** `by_slug`

### threads

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Thread title |
| `content` | string | Thread body |
| `authorId` | Id | Author reference |
| `categoryId` | Id | Parent category |
| `tags` | string[] | Thread tags |
| `authorDisplayName` | string | **Snapshot** |
| `authorAvatar` | string? | **Snapshot** |
| `authorTier` | enum | **Snapshot** |
| `upVoterIds` | Id[] | Vote tracking |
| `downVoterIds` | Id[] | Vote tracking |
| `upVoteCount` | number | Denormalized |
| `downVoteCount` | number | Denormalized |
| `netVoteCount` | number | Denormalized |
| `replyCount` | number | Reply count |
| `viewCount` | number | View count |
| `lastReplyAt` | number? | Last reply time |
| `isDeleted` | boolean | Tombstone flag |

**Indexes:** `by_category`, `by_category_netVote`, `by_category_lastReply`, `by_author`

### replies

| Field | Type | Description |
|-------|------|-------------|
| `threadId` | Id | Parent thread |
| `authorId` | Id | Author reference |
| `content` | string | Reply content |
| `authorDisplayName` | string | **Snapshot** |
| `upVoterIds` | Id[] | Vote tracking |
| `downVoterIds` | Id[] | Vote tracking |
| `upVoteCount` | number | Denormalized |
| `downVoteCount` | number | Denormalized |
| `isDeleted` | boolean | Tombstone flag |

**Indexes:** `by_thread`, `by_author`

---

## Events & Ticketing

### venues

Physical locations for events.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Venue name |
| `city` | string | City |
| `country` | string | Country |
| `address` | string | Full address |
| `latitude` | number? | GPS coordinate |
| `longitude` | number? | GPS coordinate |
| `capacity` | number | Maximum capacity |
| `timezone` | string | IANA timezone (e.g., 'America/New_York') |

**Indexes:** `by_city`, `by_timezone`

### events

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Event title |
| `description` | string | Description |
| `imageUrl` | string? | Hero image |
| `thumbnailUrl` | string? | Thumbnail |
| `startAtUtc` | number | Start time (UTC ms) |
| `endAtUtc` | number | End time (UTC ms) |
| `venueId` | Id | Venue reference |
| `venueName` | string | **Snapshot** |
| `city` | string | **Snapshot** |
| `country` | string | **Snapshot** |
| `timezone` | string | **Snapshot** |
| `capacity` | number | Event capacity |
| `ticketsSold` | number | Inventory tracking |
| `saleStatus` | enum | 'upcoming' \| 'on_sale' \| 'sold_out' \| 'cancelled' |
| `artistId` | Id | Event creator |
| `dedupeKey` | string | Unique: `artistId:venueId:startAtUtc:slug(title)` |
| `nextQueueSeq` | number | Atomic counter for queue (starts at 0) |

**Indexes:** `by_status_start`, `by_city_start`, `by_artist_start`, `by_dedupe`, `search_events`

### eventTickets

Ticket types per event.

| Field | Type | Description |
|-------|------|-------------|
| `eventId` | Id | Parent event |
| `type` | enum | 'general' \| 'vip' \| 'early_bird' |
| `price` | number | In cents (9999 = $99.99) |
| `quantity` | number | Total inventory |
| `quantitySold` | number | Sold count |
| `description` | string? | Ticket description |
| `saleStartsAtUtc` | number | Sale window start |
| `saleEndsAtUtc` | number | Sale window end |

**Indexes:** `by_event_type`, `by_event`

### userTickets

Purchased tickets.

| Field | Type | Description |
|-------|------|-------------|
| `userId` | Id | Owner |
| `eventId` | Id | Event reference |
| `ticketType` | enum | Ticket type |
| `quantity` | number | Quantity purchased |
| `ticketNumber` | string | Unique: `EVENT_ID-SEQ` |
| `confirmationCode` | string | 8-char alphanumeric |
| `purchasedAtUtc` | number | Purchase timestamp |
| `status` | enum | 'valid' \| 'used' \| 'cancelled' |

**Indexes:** `by_user`, `by_event_user`, `by_user_status`

### eventQueue

Virtual queue for high-demand events.

| Field | Type | Description |
|-------|------|-------------|
| `eventId` | Id | Event reference |
| `userId` | Id | User in queue |
| `seq` | number | Queue position |
| `status` | enum | 'waiting' \| 'admitted' \| 'expired' \| 'left' |
| `joinedAtUtc` | number | Join timestamp |
| `expiresAtUtc` | number | 30-minute expiry |
| `cooldownUntilUtc` | number? | 1-hour cooldown after leaving |

**Indexes:** `by_event_user`, `by_event_status_seq`, `by_event_expires`, `by_expires`

### checkoutSessions

Throttles concurrent checkouts.

| Field | Type | Description |
|-------|------|-------------|
| `eventId` | Id | Event reference |
| `userId` | Id | User reference |
| `createdAtUtc` | number | Session start |
| `expiresAtUtc` | number | 10-minute session |

**Indexes:** `by_event`, `by_event_user`, `by_expires`

**Constants:**
```typescript
const QUEUE_EXPIRY_MS = 30 * 60 * 1000      // 30 minutes
const QUEUE_COOLDOWN_MS = 60 * 60 * 1000    // 1 hour
const CHECKOUT_EXPIRY_MS = 10 * 60 * 1000   // 10 minutes
const CHECKOUT_LIMIT = 5                     // Max concurrent sessions
const MAX_TICKETS_PER_PURCHASE = 10
```

---

## Gallery & UGC

### galleryContent

Official gallery content.

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Content title |
| `description` | string? | Description |
| `mediaType` | enum | 'image' \| 'video' \| 'audio' |
| `mediaUrl` | string | Media URL |
| `thumbnailUrl` | string? | Thumbnail |
| `creatorId` | Id | Creator reference |
| `tags` | string[] | Content tags |
| `likeCount` | number | Denormalized |
| `viewCount` | number | Denormalized |
| `requiredTier` | enum? | Tier-gated content |
| `createdAt` | number | Creation timestamp |

**Indexes:** `by_creator`, `by_mediaType`, `by_tier`, `by_created`

### ugcContent

User-generated content.

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Content title |
| `description` | string? | Description |
| `mediaType` | enum | 'image' \| 'video' \| 'audio' |
| `mediaUrl` | string | Media URL |
| `thumbnailUrl` | string? | Thumbnail |
| `authorId` | Id | Author reference |
| `tags` | string[] | Content tags |
| `likeCount` | number | Denormalized |
| `viewCount` | number | Denormalized |
| `status` | enum | 'pending' \| 'approved' \| 'rejected' |
| `createdAt` | number | Creation timestamp |

**Indexes:** `by_author`, `by_status`, `by_created`

### galleryLikes / ugcLikes

| Field | Type | Description |
|-------|------|-------------|
| `contentId` | Id | Content reference |
| `userId` | Id | User who liked |
| `createdAt` | number | Timestamp |

**Indexes:** `by_content`, `by_user_content`

### trendingScores

Precomputed trending scores (hourly refresh).

| Field | Type | Description |
|-------|------|-------------|
| `contentId` | Id | Content reference |
| `contentType` | enum | 'gallery' \| 'ugc' |
| `trendingScore` | number | Final score |
| `engagementScore` | number | Component score |
| `recencyFactor` | number | Component score |
| `likeCount` | number | Metrics |
| `viewCount` | number | Metrics |
| `commentCount` | number | Metrics |
| `computedAt` | number | Last calculation |

**Indexes:** `by_content_type`, `by_contentId`

**Algorithm:**
```
trendingScore = engagementScore × recencyFactor
engagementScore = (likes × 2) + (views × 0.5) + (comments × 1.5)
recencyFactor = 1 / (1 + daysOld / 7)
```

---

## Merchandise System

### merchProducts

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Product name |
| `description` | string | Description |
| `category` | enum | 'apparel' \| 'accessories' \| 'music' \| 'collectibles' |
| `basePrice` | number | Price in cents |
| `salePrice` | number? | Discounted price |
| `imageUrls` | string[] | Product images |
| `status` | enum | 'draft' \| 'active' \| 'archived' |
| `dropId` | Id? | Associated drop |
| `createdBy` | Id | Creator |
| `createdAt` | number | Timestamp |
| `updatedAt` | number | Timestamp |

**Indexes:** `by_status`, `by_category`, `by_created`, `by_drop`

### merchVariants

| Field | Type | Description |
|-------|------|-------------|
| `productId` | Id | Parent product |
| `sku` | string | Unique SKU |
| `size` | string? | Size option |
| `color` | string? | Color option |
| `stock` | number | Available inventory |
| `reservedStock` | number | Reserved in carts |

**Indexes:** `by_product`, `by_sku`

### merchCart

| Field | Type | Description |
|-------|------|-------------|
| `userId` | Id | Cart owner |
| `items` | array | Array of { variantId, quantity, priceAtAddTime } |
| `updatedAt` | number | Last modification |

**Indexes:** `by_user`

> **Price Locking**: `priceAtAddTime` prevents checkout price manipulation.

### merchOrders

| Field | Type | Description |
|-------|------|-------------|
| `userId` | Id | Customer |
| `orderNumber` | string | Unique order number |
| `items` | array | Snapshot of purchased items |
| `subtotal` | number | Item total (cents) |
| `taxAmount` | number | Tax (cents) |
| `shippingAmount` | number | Shipping (cents) |
| `discountAmount` | number | Discount (cents) |
| `total` | number | Final total (cents) |
| `status` | enum | 'pending' \| 'paid' \| 'shipped' \| 'delivered' \| 'cancelled' |
| `shippingAddress` | object | Address snapshot |
| `trackingNumber` | string? | Shipping tracking |
| `createdAt` | number | Order timestamp |

**Indexes:** `by_user`, `by_order_number`, `by_status`

### merchInventoryLog

Audit log for stock changes.

| Field | Type | Description |
|-------|------|-------------|
| `variantId` | Id | Variant reference |
| `changeType` | enum | 'purchase' \| 'restock' \| 'return' \| 'damage' |
| `quantity` | number | Change amount (+/-) |
| `orderId` | Id? | Related order |
| `note` | string? | Admin note |
| `createdAt` | number | Timestamp |

**Indexes:** `by_variant`, `by_created`

### merchDrops

Limited-time product drops.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Drop name |
| `description` | string? | Description |
| `startsAt` | number | Start timestamp |
| `endsAt` | number? | End timestamp |
| `status` | enum | 'scheduled' \| 'active' \| 'ended' |
| `priority` | number | Display order |

**Indexes:** `by_starts`, `by_status`

---

## Points & Rewards

### userRewards

| Field | Type | Description |
|-------|------|-------------|
| `userId` | Id | User reference |
| `totalPoints` | number | Lifetime earned |
| `availablePoints` | number | Spendable balance |
| `redeemedPoints` | number | Total spent |
| `currentStreak` | number | Current login streak |
| `maxStreak` | number | Best streak |
| `lastInteractionDate` | number? | Last activity |
| `lastLoginDate` | number? | Last login |
| `unseenMilestones` | string[] | Badge notifications |

**Indexes:** `by_userId`, `by_totalPoints`

### pointTransactions

Immutable audit log.

| Field | Type | Description |
|-------|------|-------------|
| `userId` | Id | User reference |
| `amount` | number | Points (+/-) |
| `type` | enum | 'thread_post' \| 'forum_reply' \| 'chat_message' \| etc. |
| `description` | string | Human-readable |
| `idempotencyKey` | string | Deduplication key |
| `metadata` | object? | Quest/event data |
| `createdAt` | number | Timestamp |

**Indexes:** `by_userId`, `by_idempotency`

**Point Values:**
| Action | Points |
|--------|--------|
| `thread_post` | 20 |
| `forum_reply` | 10 |
| `chat_message` | 3 |
| `gallery_like` | 1 |
| `event_checkin` | 75 |

### rewards

Reward catalog.

| Field | Type | Description |
|-------|------|-------------|
| `rewardId` | string | Unique identifier |
| `name` | string | Display name |
| `description` | string | Description |
| `category` | enum | 'discount' \| 'physical' \| 'digital' \| 'experience' \| 'feature' |
| `pointCost` | number | Cost in points |
| `stock` | number? | Optional stock limit |
| `stockUsed` | number? | Current usage |
| `expiresAt` | number? | Expiration |
| `imageUrl` | string? | Reward image |
| `isActive` | boolean | Availability |

**Indexes:** `by_category`, `by_active`

### userRedemptions

| Field | Type | Description |
|-------|------|-------------|
| `userId` | Id | User reference |
| `rewardId` | Id | Reward reference |
| `pointsSpent` | number | Points spent |
| `redeemCode` | string? | Coupon code (REWARD-XXXXX-XXXXX) |
| `status` | enum | 'pending' \| 'approved' \| 'completed' \| 'refunded' |
| `deliveryAddress` | object? | Shipping address |
| `trackingId` | string? | Shipping tracking |
| `idempotencyKey` | string | Deduplication |
| `createdAt` | number | Timestamp |

**Indexes:** `by_user`, `by_status`

---

## Offline Queue

### offlineQueue

Offline action queue for synchronization.

| Field | Type | Description |
|-------|------|-------------|
| `userId` | Id | User reference |
| `type` | enum | 'message' \| 'vote_thread' \| 'vote_reply' \| 'reaction' |
| `payload` | object | Action payload |
| `status` | enum | 'pending' \| 'synced' \| 'failed' |
| `retryCount` | number | Retry attempts |
| `lastError` | string? | Last error message |
| `lastRetryAt` | number? | Last retry timestamp |

**Indexes:** `by_user_status`

---

## Data Consistency Rules

1. **Author snapshots**: Never update `authorDisplayName`, `authorAvatar`, `authorTier` after creation
2. **Vote tracking**: Always update both `voterId` arrays AND counts atomically
3. **Tombstone pattern**: Use `isDeleted` flag, don't delete documents
4. **Denormalized fields**: Update in all relevant mutations
5. **Idempotency**: Always check for duplicates before creating records
6. **Price locking**: Cart prices are locked at add-time

---

## Access Control Helpers

```typescript
// convex/helpers.ts
getCurrentUser(ctx)                          // Get authenticated user
canAccessChannel(ctx, userId, channelId)     // Check channel access
canAccessCategory(ctx, userId, categoryId)   // Check category access
isModerator(user)                            // Check mod/admin/artist role
```

---

## Error Mitigation Strategies

### Oversell Prevention
```typescript
// Atomic purchase validates all conditions before writing
if (event.ticketsSold + qty > event.capacity) {
  throw new ConvexError('Insufficient inventory')
}
await Promise.all([
  ctx.db.patch(eventId, { ticketsSold: event.ticketsSold + qty }),
  ctx.db.patch(ticketTypeId, { quantitySold: ticketType.quantitySold + qty }),
  ctx.db.insert('userTickets', { ... })
])
```

### Queue Management
- **30-minute expiry**: Countdown timer shows remaining time
- **1-hour cooldown**: Prevents rejoin spam
- **Atomic sequence**: Event-level counter for O(1) allocation

### Timezone Handling
- Store UTC only, snapshot venue timezone
- Use `Intl.DateTimeFormat` with saved timezone on frontend

### Network Resilience
- Exponential backoff retry (1s, 2s, 4s, max 16s)
- IndexedDB-based offline queue
- Idempotency keys prevent duplicates
