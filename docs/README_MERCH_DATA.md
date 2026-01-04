# Merchandise Seed Data

This directory contains sample data for testing the merchandise system.

## Files

- `MERCH_SCHEMA.md` - Complete documentation of the merchandise schema
- `merchSeedData.ts` - Sample data for products, variants, drops, cart, and orders

## Using the Seed Data

### Option 1: Via Convex Dashboard

1. Run `npx convex dev` to start the development server
2. Open the Convex dashboard at the URL shown in your terminal
3. Navigate to each table (merchProducts, merchVariants, etc.)
4. Click "Insert Document" and paste the sample data from `merchSeedData.ts`
5. Replace `<USER_ID>` and `<PRODUCT_ID>` placeholders with actual IDs

### Option 2: Via Mutation

Create a new mutation file `convex/seedMerchData.ts`:

```typescript
import { mutation } from './_generated/server';
import { sampleProducts, sampleVariants, sampleDrops } from '../docs/merchSeedData';

export const seedMerchData = mutation({
  args: {},
  handler: async (ctx) => {
    // Get first user (or create one)
    const users = await ctx.db.query('users').collect();
    if (users.length === 0) {
      throw new Error('No users found. Please create a user first.');
    }
    const userId = users[0]._id;

    // Insert products
    const productIds: string[] = [];
    for (const product of sampleProducts) {
      const id = await ctx.db.insert('merchProducts', {
        ...product,
        createdBy: userId
      });
      productIds.push(id);
    }

    // Insert variants
    const variantIds: string[] = [];
    let productIndex = 0;
    for (const variant of sampleVariants) {
      const id = await ctx.db.insert('merchVariants', {
        ...variant,
        productId: productIds[productIndex]
      });
      variantIds.push(id);
      // Cycle through products for variants
      if (variantIds.length % 5 === 0) productIndex++;
    }

    // Insert drops
    await ctx.db.insert('merchDrops', {
      ...sampleDrops[0],
      products: [productIds[1], productIds[4]],
      createdBy: userId
    });

    await ctx.db.insert('merchDrops', {
      ...sampleDrops[1],
      products: [productIds[2]],
      createdBy: userId
    });

    return {
      success: true,
      productIds,
      variantIds
    };
  }
});
```

Then call it from your frontend:

```typescript
import { api } from '../convex/_generated/api';
import { useMutation } from 'convex/react';

function SeedDataButton() {
  const seedData = useMutation(api.seedMerchData);

  return (
    <button onClick={() => seedData()}>
      Seed Merchandise Data
    </button>
  );
}
```

## Sample Data Overview

### Products (5 items)

1. **Tour T-Shirt 2024** - Active product with 4 size/color variants
2. **Limited Edition Hoodie** - Drop product, limited to 100 units
3. **Debut Album - Vinyl LP** - Pre-order with 10% discount
4. **Tour Enamel Pin Set** - Collectible pin set
5. **Summer Festival Tee** - Out of stock (0 units)

### Variants (11 items)

- T-Shirt: 5 variants (S, M, L, XL in Black; S in White)
- Hoodie: 4 variants (M, L, XL, 2XL in Black)
- Vinyl LP: 2 variants (Black, Transparent Blue)
- Pin Set: 1 variant (One Size Multi)

### Drops (2 items)

1. **Summer Collection Drop** - Starts in 7 days
2. **Exclusive Pre-Order Drop** - Starts in 30 days

### Cart Example

Sample cart with 2 items (2x T-Shirts, 1x Pin Set)

### Order Example

Sample completed order with shipping address and full pricing breakdown

## Validating the Schema

To ensure the schema is correctly defined, run:

```bash
npx convex dev
```

This will:
- Validate all table definitions
- Check for circular references
- Generate TypeScript types in `convex/_generated/api.ts`
- Start the development server

## Testing Queries

After seeding data, you can test these queries:

```typescript
// Get all active products
const products = await ctx.db
  .query('merchProducts')
  .withIndex('by_status')
  .eq('status', 'active')
  .collect();

// Get variants for a product
const variants = await ctx.db
  .query('merchVariants')
  .withIndex('by_product')
  .eq('productId', productId)
  .collect();

// Get upcoming drops
const now = Date.now();
const drops = await ctx.db
  .query('merchDrops')
  .withIndex('by_starts')
  .filter(q => q.gt(q.field('startsAt'), now))
  .collect();

// Get user's cart
const cart = await ctx.db
  .query('merchCart')
  .withIndex('by_user')
  .eq('userId', userId)
  .unique();
```

## Important Notes

1. **Replace Placeholders**: All `<USER_ID>`, `<PRODUCT_ID>`, and `<VARIANT_ID>` placeholders must be replaced with actual IDs from your database.

2. **Circular References**: The schema has no circular references, but when inserting data manually in the dashboard, you must:
   - Insert products first
   - Then insert variants (referencing product IDs)
   - Then insert drops (referencing product IDs)

3. **Price Format**: All prices are in cents (e.g., 3499 = $34.99)

4. **Timestamps**: All timestamps are in milliseconds since epoch (use `Date.now()`)

5. **Stock Management**: Remember that `totalStock` in products should equal the sum of `stock` across all variants.

## Next Steps

After seeding data, you can:

1. Build the frontend merchandise catalog
2. Implement cart functionality
3. Create checkout flow
4. Build admin panel for inventory management
5. Add drop countdown timers
6. Implement inventory audit features

See the main task documentation for details on building these features.
