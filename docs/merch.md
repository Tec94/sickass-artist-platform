# Merchandise System

Comprehensive e-commerce system with product catalog, cart management, and order processing.

## Core Components

### Products & Variants
- `merchProducts`: Main catalog (pricing, category, drops).
- `merchVariants`: Granular stock tracking (size, color, SKU).

### Cart & Orders
- `merchCart`: User carts with price-locking to prevent manipulation.
- `merchOrders`: Historical snapshots of completed purchases.

## Development & Testing

### Seed Data
Use `docs/merch-seed.ts` (formerly `merchSeedData.ts`) to populate your local database.

### Seeding via Mutation
1. Create `convex/seedMerchData.ts`.
2. Import `sampleProducts`, `sampleVariants`, and `sampleDrops` from `../docs/merch-seed`.
3. Map items to your `userId` and call the mutation.

### Quick Queries
```typescript
// Active products
const products = await ctx.db.query('merchProducts')
  .withIndex('by_status', q => q.eq('status', 'active'))
  .collect()

// Get user cart
const cart = await ctx.db.query('merchCart')
  .withIndex('by_user', q => q.eq('userId', userId))
  .unique()
```

## Key Features
- **Price Locking:** Cart prices are "locked" at add-time to prevent checkout surprises.
- **Order Snapshots:** Orders store full product data at purchase time for historical accuracy.
- **Idempotency:** Unique SKUs and atomic stock decrements prevent overselling.
