# Merch Data & Seed Data

Instructions for using merchandise seed data for development and testing.

## Seed Data File

Location: `docs/merchSeedData.ts`

Contains sample merchandise data for:
- Products (8 items)
- Variants (multiple sizes/colors per product)
- Product categories
- Pre-orders and drops

## Usage

### Import and Seed

```typescript
import { merchSeedData } from './docs/merchSeedData'

// Seed products
for (const product of merchSeedData.products) {
  await ctx.db.insert('merchProducts', product)
}

// Seed variants
for (const variant of merchSeedData.variants) {
  await ctx.db.insert('merchVariants', variant)
}
```

### Development Only

**Important:** Seed data is for development/testing only. Never use in production.

## Sample Products

- Tour T-Shirts (multiple colors)
- Limited Edition Hoodies
- Vinyl Records
- Accessories (hats, pins, posters)
- Pre-order items

## Data Structure

Each product includes:
- Name, description, pricing
- Images (placeholder URLs)
- Category and tags
- Stock levels
- Variants with SKUs

Each variant includes:
- Size (XS-3XL, One Size)
- Color (Black, White, etc.)
- Individual stock tracking
- Unique SKU

## Testing Scenarios

- Browse products by category
- Filter by availability
- Add to cart
- Checkout flow
- Invent ory management
- Drop launches
- Pre-order handling

## Customization

Modify seed data to test:
- Different price points
- Out of stock scenarios
- Various product types
- Multiple image galleries
- Discount applications
