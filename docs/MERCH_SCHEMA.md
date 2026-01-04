# Merchandise Database Schema

This document describes the Convex schema for the merchandise system, including all tables, indexes, and relationships.

## Overview

The merchandise system consists of 6 tables:
1. `merchProducts` - Product catalog
2. `merchVariants` - Product size/color/style combinations
3. `merchCart` - User shopping carts
4. `merchOrders` - Completed orders
5. `merchInventoryLog` - Inventory change tracking
6. `merchDrops` - Limited-time product drops

---

## Tables

### 1. merchProducts

Main product catalog with pricing, inventory, and metadata.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Product name (e.g., "Tour T-Shirt") |
| `description` | string | Short description |
| `longDescription` | string? | Markdown/rich text description |
| `price` | number | Base price in cents (9999 = $99.99) |
| `discount` | number? | Discount percentage (0-100) |
| `totalStock` | number | Total inventory across all variants |
| `lowStockThreshold` | number | Alert level (default: 10) |
| `imageUrls` | string[] | Gallery images (max 10) |
| `thumbnailUrl` | string | Main thumbnail |
| `category` | union | apparel, accessories, vinyl, limited, other |
| `tags` | string[] | Search/filter tags (max 5) |
| `status` | union | active, draft, archived, discontinued |
| `isPreOrder` | boolean | Is this a pre-order item? |
| `preOrderDeadline` | number? | Timestamp (ms) when pre-order ends |
| `isDropProduct` | boolean | Is this part of a limited drop? |
| `dropStartsAt` | number? | Drop start timestamp (ms) |
| `dropEndsAt` | number? | Drop end timestamp (ms) |
| `createdAt` | number | Creation timestamp (ms) |
| `updatedAt` | number | Last update timestamp (ms) |
| `createdBy` | id(users) | Artist/admin who created the product |

#### Indexes

| Index | Fields | Use Case |
|-------|--------|----------|
| `by_status` | status | Filter products by status (active, draft, etc.) |
| `by_category` | category | Filter products by category |
| `by_created` | createdAt | Sort products by creation date |
| `by_drop` | isDropProduct, dropStartsAt | Query upcoming drop products |

---

### 2. merchVariants

Product size/color/style combinations with individual stock tracking.

| Field | Type | Description |
|-------|------|-------------|
| `productId` | id(merchProducts) | Parent product |
| `sku` | string | Unique SKU (e.g., "TOUR-TSH-XL-BLK") |
| `size` | string? | Size (XL, One Size, etc.) |
| `color` | string? | Color (Black, White, etc.) |
| `style` | string? | Style (Crewneck, Hoodie, etc.) |
| `price` | number? | Override product price (if different) |
| `stock` | number | Quantity available (>= 0) |
| `weight` | number? | Weight in grams for shipping |
| `status` | union | available, low_stock, out_of_stock, discontinued |
| `createdAt` | number | Creation timestamp (ms) |
| `updatedAt` | number | Last update timestamp (ms) |

#### Indexes

| Index | Fields | Use Case |
|-------|--------|----------|
| `by_product` | productId | Get all variants for a product |
| `by_sku` | sku | Unique SKU lookup |

---

### 3. merchCart

User shopping carts with price locking to prevent manipulation.

| Field | Type | Description |
|-------|------|-------------|
| `userId` | id(users) | Cart owner |
| `items` | object[] | Array of cart items (see below) |
| `createdAt` | number | Creation timestamp (ms) |
| `updatedAt` | number | Last update timestamp (ms) |

#### Cart Item Object

| Field | Type | Description |
|-------|------|-------------|
| `variantId` | id(merchVariants) | Variant reference |
| `quantity` | number | Quantity (1-100) |
| `priceAtAddTime` | number | Price locked at add time (cents) |
| `addedAt` | number | Timestamp when added (ms) |

#### Indexes

| Index | Fields | Use Case |
|-------|--------|----------|
| `by_user` | userId | Get user's cart |

---

### 4. merchOrders

Completed orders with full snapshots for historical accuracy.

| Field | Type | Description |
|-------|------|-------------|
| `userId` | id(users) | Customer |
| `orderNumber` | string | Unique order ID (e.g., "ORD-1704067200000") |
| `items` | object[] | Ordered items (see below) |
| `subtotal` | number | Sum of item prices (cents) |
| `tax` | number | Tax amount (cents) |
| `shipping` | number | Shipping cost (cents) |
| `discount` | number? | Discount amount (cents) |
| `total` | number | Final total (cents) |
| `shippingAddress` | object | Shipping address (see below) |
| `status` | union | pending, paid, processing, shipped, delivered, cancelled |
| `trackingNumber` | string? | Carrier tracking number |
| `trackingUrl` | string? | Carrier tracking URL |
| `createdAt` | number | Order creation (ms) |
| `updatedAt` | number | Last update (ms) |
| `shippedAt` | number? | Shipped timestamp (ms) |
| `deliveredAt` | number? | Delivered timestamp (ms) |

#### Order Item Object

| Field | Type | Description |
|-------|------|-------------|
| `variantId` | id(merchVariants) | Variant reference |
| `productName` | string | Product name snapshot |
| `variantName` | string | Variant name snapshot (e.g., "XL Black") |
| `quantity` | number | Quantity ordered |
| `pricePerUnit` | number | Price at purchase time (cents) |
| `totalPrice` | number | quantity × pricePerUnit (cents) |

#### Shipping Address Object

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Recipient name |
| `email` | string | Recipient email |
| `addressLine1` | string | Street address |
| `addressLine2` | string? | Apartment/suite |
| `city` | string | City |
| `state` | string | State/province |
| `zipCode` | string | Postal code |
| `country` | string | Country |

#### Indexes

| Index | Fields | Use Case |
|-------|--------|----------|
| `by_user` | userId | Get user's order history |
| `by_order_number` | orderNumber | Order lookup |
| `by_status` | status | Filter orders by status |

---

### 5. merchInventoryLog

Audit log for all inventory changes, enabling integrity checking.

| Field | Type | Description |
|-------|------|-------------|
| `variantId` | id(merchVariants) | Affected variant |
| `change` | number | Positive (restock) or negative (purchase/loss) |
| `reason` | union | purchase, restock, manual_correction, return, damage |
| `orderId` | id(merchOrders)? | Related order (if applicable) |
| `notes` | string? | Notes for manual corrections |
| `createdBy` | id(users)? | User who made manual adjustment |
| `createdAt` | number | Change timestamp (ms) |

#### Indexes

| Index | Fields | Use Case |
|-------|--------|----------|
| `by_variant` | variantId | Get inventory history for a variant |
| `by_created` | createdAt | Chronological inventory audit |

---

### 6. merchDrops

Limited-time product drops with scheduling.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Drop name (e.g., "Summer Collection Drop") |
| `description` | string? | Drop description |
| `imageUrl` | string? | Drop banner image |
| `startsAt` | number | Start timestamp (ms) |
| `endsAt` | number | End timestamp (ms) |
| `products` | id(merchProducts)[] | Products in this drop |
| `priority` | number | Display order (0 = highest) |
| `createdAt` | number | Creation timestamp (ms) |
| `updatedAt` | number | Last update timestamp (ms) |
| `createdBy` | id(users) | Drop creator |

#### Indexes

| Index | Fields | Use Case |
|-------|--------|----------|
| `by_starts` | startsAt | Sort drops by start time |
| `by_status` | startsAt, endsAt | Query active/past drops |

---

## Relationships

```
users
  ├─ 1:N ─> merchProducts (createdBy)
  ├─ 1:N ─> merchCart (userId)
  └─ 1:N ─> merchOrders (userId)

merchProducts
  ├─ 1:N ─> merchVariants (productId)
  └─ N:N ─> merchDrops (products array)

merchVariants
  ├─ 1:N ─> merchCart.items (variantId)
  ├─ 1:N ─> merchOrders.items (variantId)
  └─ 1:N ─> merchInventoryLog (variantId)

merchOrders
  └─ 1:N ─> merchInventoryLog (orderId)
```

---

## Key Design Decisions

### Denormalization for Performance

1. **Price Locking**: `merchCart.items.priceAtAddTime` stores the price when the item was added, preventing price manipulation if product prices change.

2. **Order Snapshots**: `merchOrders.items` stores product name, variant name, and price at purchase time, ensuring order history remains accurate even if products are deleted or renamed.

3. **Totals Storage**: `merchOrders.total`, `subtotal`, `tax`, and `shipping` are stored directly instead of calculated from items, avoiding expensive recalculations.

4. **Variant Status**: Each variant has its own `status` (available, low_stock, out_of_stock) independent of product status, allowing granular inventory management.

### Error Mitigation

| Risk | Mitigation Strategy |
|------|-------------------|
| Duplicate SKU | Unique index on `merchVariants.by_sku` + validation mutation |
| Negative stock | Server-side validation in mutations (enforce >= 0) |
| Orphaned variants | Soft delete products; cascade updates in mutations |
| Invalid email | Server-side regex validation in order creation |
| Price manipulation | Lock price at cart add time; never use live price at checkout |
| Overselling | Atomic stock decrements with conflict detection |

### Constraints (Server-Side)

- SKU must be unique across all variants
- Stock must be >= 0 (enforced in mutations)
- Price must be > 0 (enforced in mutations)
- Email must match valid regex pattern
- Zip code must be 3-20 characters
- Order total must equal: `subtotal + tax + shipping - discount`
- Cart item quantity must be between 1 and 100

---

## Common Query Patterns

### Get Active Products

```typescript
const products = await ctx.db
  .query('merchProducts')
  .withIndex('by_status')
  .eq('status', 'active')
  .collect();
```

### Get Variants for Product

```typescript
const variants = await ctx.db
  .query('merchVariants')
  .withIndex('by_product')
  .eq('productId', productId)
  .collect();
```

### Get User's Cart

```typescript
const cart = await ctx.db
  .query('merchCart')
  .withIndex('by_user')
  .eq('userId', userId)
  .unique();
```

### Get User's Orders

```typescript
const orders = await ctx.db
  .query('merchOrders')
  .withIndex('by_user')
  .eq('userId', userId)
  .collect();
```

### Get Inventory History

```typescript
const logs = await ctx.db
  .query('merchInventoryLog')
  .withIndex('by_variant')
  .eq('variantId', variantId)
  .collect();
```

### Get Upcoming Drops

```typescript
const now = Date.now();
const drops = await ctx.db
  .query('merchDrops')
  .withIndex('by_starts')
  .filter(q => q.gt(q.field('startsAt'), now))
  .collect();
```

---

## Schema Validation

Run the following command to validate the schema:

```bash
npx convex dev
```

This will:
1. Check for circular references
2. Validate all field types
3. Ensure indexes are properly defined
4. Generate TypeScript types in `convex/_generated/api.ts`

---

## Timestamp Format

All timestamps are stored as milliseconds since epoch (same as `Date.now()`).

Example:
```javascript
const now = Date.now(); // 1704067200000
```
