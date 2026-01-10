# Merch Schema

E-commerce database schema for merchandise system with products, variants, cart, orders, and inventory tracking.

## Tables Overview

1. `merchProducts` - Product catalog
2. `merchVariants` - Size/color/style combinations
3. `merchCart` - Shopping carts
4. `merchOrders` - Completed orders
5. `merchInventoryLog` - Inventory tracking
6. `merchDrops` - Limited-time drops

## merchProducts

Product catalog with pricing, inventory, and metadata.

**Fields:**
- `name`, `description`, `longDescription`
- `price` - Base price in cents (9999 = $99.99)
- `discount` - Discount percentage (0-100)
- `totalStock`, `lowStockThreshold` (default: 10)
- `imageUrls` (max 10), `thumbnailUrl`
- `category`: apparel | accessories | vinyl | limited | other
- `tags` (max 5), `status`: active | draft | archived | discontinued
- `isPreOrder`, `preOrderDeadline`
- `isDropProduct`, `dropStartsAt`, `dropEndsAt`
- `createdBy` - Artist/admin creator

**Indexes:** `by_status`, `by_category`, `by_created`, `by_drop`

## merchVariants

Product variants with individual stock tracking.

**Fields:**
- `productId`, `sku` - Unique SKU (e.g., "TOUR-TSH-XL-BLK")
- `size`, `color`, `style` - Variant attributes
- `price` - Override product price (optional)
- `stock` - Quantity available (>= 0)
- `weight` - Grams for shipping
- `status`: available | low_stock | out_of_stock | discontinued

**Indexes:** `by_product`, `by_sku` (unique)

## merchCart

Shopping carts with price locking (prevents manipulation).

**Fields:**
- `userId`, `items` - Array of cart items

**Cart Item:**
- `variantId`, `quantity` (1-100)
- `priceAtAddTime` - Locked at add time (cents)
- `addedAt`

**Indexes:** `by_user`

## merchOrders

Completed orders with full snapshots for historical accuracy.

**Fields:**
- `userId`, `orderNumber` - Unique ID (e.g., "ORD-1704067200000")
- `items` - Ordered items array
- `subtotal`, `tax`, `shipping`, `discount`, `total` - All in cents
- `shippingAddress` - Full address object
- `status`: pending | paid | processing | shipped | delivered | cancelled
- `trackingNumber`, `trackingUrl`
- `shippedAt`, `deliveredAt`

**Order Item:**
- `variantId`, `productName`, `variantName` - Snapshots
- `quantity`, `pricePerUnit`, `totalPrice`

**Shipping Address:**
- `name`, `email`, `addressLine1`, `addressLine2`, `city`, `state`, `zipCode`, `country`

**Indexes:** `by_user`, `by_order_number`, `by_status`

## merchInventoryLog

Audit log for all inventory changes.

**Fields:**
- `variantId`, `change` - Positive (restock) or negative (purchase/loss)
- `reason`: purchase | restock | manual_correction | return | damage
- `orderId` - Related order (if applicable)
- `notes` - For manual corrections
- `createdBy` - User who made adjustment

**Indexes:** `by_variant`, `by_created`

## merchDrops

Limited-time product drops.

**Fields:**
- `name`, `description`, `imageUrl`
- `startsAt`, `endsAt` - Drop window
- `products` - Array of product IDs
- `priority` - Display order (0 = highest)
- `createdBy`

**Indexes:** `by_starts`, `by_status`

## Key Design Decisions

### Price Locking
`merchCart.items.priceAtAddTime` stores price when added, preventing manipulation if product prices change.

### Order Snapshots
`merchOrders.items` stores product name, variant name, and price at purchase time. Historical accuracy even if products deleted/renamed.

### Totals Storage
`total`, `subtotal`, etc. stored directly instead of calculated, avoiding expensive recalculations.

## Error Mitigation

| Risk | Mitigation |
|------|-----------|
| Duplicate SKU | Unique index `by_sku` + validation |
| Negative stock | Server-side validation (enforce >= 0) |
| Orphaned variants | Soft delete products, cascade updates |
| Price manipulation | Lock price at cart add time |
| Overselling | Atomic stock decrements |

## Constraints (Server-Side)

- SKU unique across all variants
- Stock >= 0
- Price > 0
- Valid email regex
- Zip code: 3-20 characters
- Order total = subtotal + tax + shipping - discount
- Cart quantity: 1-100

## Common Queries

```typescript
// Get active products
const products = await ctx.db
  .query('merchProducts')
  .withIndex('by_status', q => q.eq('status', 'active'))
  .collect()

// Get variants for product
const variants = await ctx.db
  .query('merchVariants')
  .withIndex('by_product', q => q.eq('productId', id))
  .collect()

// Get user's cart
const cart = await ctx.db
  .query('merchCart')
  .withIndex('by_user', q => q.eq('userId', userId))
  .unique()
```
