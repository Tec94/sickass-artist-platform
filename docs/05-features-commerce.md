# Commerce Features

Merchandise system, points/gamification, and rewards redemption.

---

## Merchandise System

Comprehensive e-commerce system with product catalog, cart management, and order processing.

### Core Components

#### Products & Variants
- **`merchProducts`**: Main catalog with pricing, category, drops
- **`merchVariants`**: Granular stock tracking (size, color, SKU)

#### Cart & Orders
- **`merchCart`**: User carts with price-locking
- **`merchOrders`**: Historical snapshots of completed purchases

### Key Features

| Feature | Description |
|---------|-------------|
| **Price Locking** | Cart prices locked at add-time to prevent checkout surprises |
| **Order Snapshots** | Orders store full product data at purchase time |
| **Idempotency** | Unique SKUs and atomic stock decrements prevent overselling |
| **Drop Support** | Limited-time product releases with scheduling |

### API Examples

**Get Active Products:**
```typescript
const products = await ctx.db.query('merchProducts')
  .withIndex('by_status', q => q.eq('status', 'active'))
  .collect()
```

**Get User Cart:**
```typescript
const cart = await ctx.db.query('merchCart')
  .withIndex('by_user', q => q.eq('userId', userId))
  .unique()
```

**Get Product Variants:**
```typescript
const variants = await ctx.db.query('merchVariants')
  .withIndex('by_product', q => q.eq('productId', productId))
  .collect()
```

### Cart Flow
1. User adds item → price locked at `priceAtAddTime`
2. Stock reserved in `reservedStock` field
3. Checkout validates stock availability
4. Order created with full item snapshots
5. Inventory decremented atomically

### Order Processing
- **Atomic transactions**: All inventory updates happen together
- **Idempotency keys**: Prevent duplicate orders
- **Inventory logging**: Full audit trail in `merchInventoryLog`

### Files
- `convex/merch.ts` - Merch mutations and queries
- `src/pages/Merch.tsx` - Product listing page
- `src/pages/MerchDetail.tsx` - Product detail page
- `src/components/Merch/*.tsx` - Merch components
- `src/hooks/useShoppingCart.ts` - Cart management hook

---

## Points System

Gamification system for user engagement, rewarding interactions with spendable points.

### Point Values

| Action | Points | Description |
|--------|--------|-------------|
| `thread_post` | 20 | Creating a new forum thread |
| `forum_reply` | 10 | Replying to a thread |
| `chat_message` | 3 | Sending a chat message |
| `gallery_like` | 1 | Liking a gallery item |
| `ugc_like` | 1 | Liking user-generated content |
| `event_checkin` | 75 | Physical/digital event check-in |
| `ticket_purchase` | 10% | 10% of ticket price in points |
| `livestream_join` | 25 | Joining a livestream |
| `daily_bonus` | 10 | Daily login bonus |

### Implementation

**Frontend Hooks:**
```typescript
import { usePoints, useAwardPoints } from '@/hooks/usePoints'

// Get balances and history
const { balance, transactions, leaderboard } = usePoints()

// Award points programmatically
const { award } = useAwardPoints()
await award('thread_post', 20, 'Post bonus')
```

**UI Components:**
- `<PointsDisplay />` - Badge showing available points (e.g., "⭐ 150")
- `<PointsEarned amount={20} type="thread post" />` - Toast notification

### Backend API

**Award Points:**
```typescript
await mutations.points.awardPoints({
  userId: "user_123",
  type: "thread_post",
  amount: 20,
  description: "Created forum thread",
  idempotencyKey: "thread-jh7abc123"  // Prevents duplicates
})
```

**Check Balance:**
```typescript
const balance = await queries.points.getUserBalance({ userId })
// { availablePoints: 150, totalPoints: 200, redeemedPoints: 50 }
```

**Get Leaderboard:**
```typescript
const leaderboard = await queries.points.getPointsLeaderboard()
// Top 100 users by totalPoints
```

### Idempotency Protection
All awards require an `idempotencyKey` (format: `type-id`) to prevent double-awarding during retries.

```typescript
// Same key = returns existing transaction, no duplicate award
idempotencyKey: `thread-${threadId}`
idempotencyKey: `reply-${replyId}`
idempotencyKey: `message-${messageId}`
```

### Integration Points
Points are automatically awarded in:
- `convex/forum.ts` - Thread creation (+20), replies (+10)
- `convex/chat.ts` - Messages (+3)
- `convex/gallery.ts` - Likes (+1) (ready for integration)

### Files
- `convex/points.ts` - Core point system
- `src/hooks/usePoints.ts` - React hooks
- `src/components/PointsDisplay.tsx` - UI components

---

## Rewards System

Reward catalog and redemption system for spending earned points.

### Reward Categories

| Category | Examples |
|----------|----------|
| `discount` | 10% off merch, free shipping codes |
| `physical` | Signed posters, exclusive merch |
| `digital` | Exclusive downloads, early access |
| `experience` | Meet & greets, VIP upgrades |
| `feature` | Custom profile badge, priority support |

### Redemption Flow

1. **Browse Catalog** → User views available rewards
2. **Select Reward** → Validation checks (points, stock, expiry)
3. **Confirm** → Points deducted atomically
4. **Coupon Generated** → Format: `REWARD-XXXXX-XXXXX`
5. **Fulfillment** → Admin approves and ships (if physical)

### API Examples

**Get Available Rewards:**
```typescript
const rewards = await queries.rewards.getAvailableRewards({
  category: 'physical',
  sortBy: 'price_low'
})
```

**Redeem Reward:**
```typescript
const result = await mutations.rewards.redeemReward({
  userId: currentUserId,
  rewardId: rewardDocId
})
// Returns: { redemptionId, couponCode, rewardName, pointsSpent }
```

**Admin Approve:**
```typescript
await mutations.rewards.adminApproveRedemption({
  redemptionId: redemptionDocId,
  adminId: adminUserId,
  trackingId: 'USPS123456789',
  notes: 'Shipped via USPS Priority'
})
```

**Admin Refund:**
```typescript
const result = await mutations.rewards.adminRefundRedemption({
  redemptionId: redemptionDocId,
  adminId: adminUserId,
  reason: 'Out of stock, refunded points'
})
// Returns: { success: true, pointsRefunded: 100 }
```

### Stock Protection
- Atomic stock checks prevent over-redemption
- Stock decrements happen in same transaction as point deduction
- "Out of Stock" UI state prevents further redemptions

### Coupon Code Format
- Pattern: `REWARD-XXXXX-XXXXX`
- Characters: Alphanumeric (A-Z, 0-9)
- 11 random characters for uniqueness

### Admin Features
- View all pending redemptions
- Approve with optional tracking ID
- Refund with reason (restores points + stock)
- User info and delivery address display

### Files
- `convex/rewards.ts` - Rewards mutations and queries
- `src/components/RewardShop.tsx` - Reward catalog UI
- `src/pages/AdminRedemptions.tsx` - Admin management

---

## Seed Data

Sample data for development and testing is available in `_seed-data.ts`.

### Contents
- 5 sample products (T-shirt, Hoodie, Vinyl, Pins, Festival Tee)
- 11 sample variants covering size/color combinations
- 2 sample drops (Summer Collection, Pre-Order)
- Sample cart with 2 items
- Sample completed order with shipping

### Usage

**Via Convex Dashboard:**
1. Open Convex dashboard
2. Navigate to each table
3. Click "Insert Document"
4. Paste sample data from `_seed-data.ts`
5. Replace placeholders with actual IDs

**Via Mutation:**
```typescript
// Create convex/seedMerchData.ts
import { sampleProducts, sampleVariants, sampleDrops } from '../docs/_seed-data'

// Map items to your userId and call insert mutations
```
