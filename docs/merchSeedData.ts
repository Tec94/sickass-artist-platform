/**
 * Sample seed data for merchandise tables
 * Run this in Convex dashboard or via mutation to populate test data
 *
 * NOTE: Replace <USER_ID> placeholders with valid user IDs from your database
 */

export const sampleProducts = [
  {
    name: "Tour T-Shirt 2024",
    description: "Premium cotton t-shirt from the world tour",
    longDescription: "Made from 100% organic cotton with a comfortable fit. Features tour artwork on the front and tour dates on the back.",
    price: 3499, // $34.99
    discount: null,
    totalStock: 250,
    lowStockThreshold: 10,
    imageUrls: [
      "https://example.com/merch/tour-tshirt-front.jpg",
      "https://example.com/merch/tour-tshirt-back.jpg",
      "https://example.com/merch/tour-tshirt-detail.jpg"
    ],
    thumbnailUrl: "https://example.com/merch/tour-tshirt-thumb.jpg",
    category: "apparel" as const,
    tags: ["t-shirt", "tour", "2024", "unisex"],
    status: "active" as const,
    isPreOrder: false,
    preOrderDeadline: null,
    isDropProduct: false,
    dropStartsAt: null,
    dropEndsAt: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy: "<USER_ID>" // Replace with actual user ID
  },
  {
    name: "Limited Edition Hoodie",
    description: "Exclusive hoodie with embroidered logo",
    longDescription: "Heavyweight cotton blend hoodie with premium embroidery. Limited to 500 pieces worldwide.",
    price: 7999, // $79.99
    discount: null,
    totalStock: 100,
    lowStockThreshold: 5,
    imageUrls: [
      "https://example.com/merch/hoodie-front.jpg",
      "https://example.com/merch/hoodie-back.jpg"
    ],
    thumbnailUrl: "https://example.com/merch/hoodie-thumb.jpg",
    category: "apparel" as const,
    tags: ["hoodie", "limited", "exclusive", "premium"],
    status: "active" as const,
    isPreOrder: false,
    preOrderDeadline: null,
    isDropProduct: true,
    dropStartsAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
    dropEndsAt: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days from now
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy: "<USER_ID>"
  },
  {
    name: "Debut Album - Vinyl LP",
    description: "180g vinyl with gatefold sleeve",
    longDescription: "First press on 180g audiophile vinyl. Includes digital download code and exclusive poster.",
    price: 2499, // $24.99
    discount: 10, // 10% off
    totalStock: 500,
    lowStockThreshold: 20,
    imageUrls: [
      "https://example.com/merch/vinyl-front.jpg",
      "https://example.com/merch/vinyl-back.jpg"
    ],
    thumbnailUrl: "https://example.com/merch/vinyl-thumb.jpg",
    category: "vinyl" as const,
    tags: ["vinyl", "album", "music", "audiophile"],
    status: "active" as const,
    isPreOrder: true,
    preOrderDeadline: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    isDropProduct: false,
    dropStartsAt: null,
    dropEndsAt: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy: "<USER_ID>"
  },
  {
    name: "Tour Enamel Pin Set",
    description: "Set of 3 collectible pins",
    longDescription: "High-quality enamel pins featuring tour logo, album artwork, and exclusive design. Each set comes in a display box.",
    price: 1999, // $19.99
    discount: null,
    totalStock: 300,
    lowStockThreshold: 15,
    imageUrls: [
      "https://example.com/merch/pins-set.jpg",
      "https://example.com/merch/pins-individual.jpg"
    ],
    thumbnailUrl: "https://example.com/merch/pins-thumb.jpg",
    category: "accessories" as const,
    tags: ["pins", "collectible", "accessories", "set"],
    status: "active" as const,
    isPreOrder: false,
    preOrderDeadline: null,
    isDropProduct: false,
    dropStartsAt: null,
    dropEndsAt: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy: "<USER_ID>"
  },
  {
    name: "Summer Festival Tee",
    description: "Lightweight tee for summer shows",
    longDescription: "Breathable cotton blend perfect for summer festivals. Quick-dry fabric with UV protection.",
    price: 2999, // $29.99
    discount: null,
    totalStock: 0,
    lowStockThreshold: 10,
    imageUrls: [
      "https://example.com/merch/summer-tee.jpg"
    ],
    thumbnailUrl: "https://example.com/merch/summer-tee-thumb.jpg",
    category: "apparel" as const,
    tags: ["t-shirt", "summer", "festival", "lightweight"],
    status: "active" as const,
    isPreOrder: false,
    preOrderDeadline: null,
    isDropProduct: false,
    dropStartsAt: null,
    dropEndsAt: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy: "<USER_ID>"
  }
];

export const sampleVariants = [
  // Tour T-Shirt variants
  {
    productId: "<PRODUCT_ID>", // Replace with actual product ID
    sku: "TOUR-TSH-S-BLK",
    size: "S",
    color: "Black",
    style: "Crewneck",
    price: null,
    stock: 50,
    weight: 180,
    status: "available" as const,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    productId: "<PRODUCT_ID>",
    sku: "TOUR-TSH-M-BLK",
    size: "M",
    color: "Black",
    style: "Crewneck",
    price: null,
    stock: 75,
    weight: 190,
    status: "available" as const,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    productId: "<PRODUCT_ID>",
    sku: "TOUR-TSH-L-BLK",
    size: "L",
    color: "Black",
    style: "Crewneck",
    price: null,
    stock: 60,
    weight: 200,
    status: "available" as const,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    productId: "<PRODUCT_ID>",
    sku: "TOUR-TSH-XL-BLK",
    size: "XL",
    color: "Black",
    style: "Crewneck",
    price: null,
    stock: 40,
    weight: 210,
    status: "available" as const,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    productId: "<PRODUCT_ID>",
    sku: "TOUR-TSH-S-WHT",
    size: "S",
    color: "White",
    style: "Crewneck",
    price: null,
    stock: 25,
    weight: 180,
    status: "available" as const,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  // Limited Edition Hoodie variants
  {
    productId: "<PRODUCT_ID>",
    sku: "HOODIE-M-BLK",
    size: "M",
    color: "Black",
    style: "Hoodie",
    price: null,
    stock: 25,
    weight: 450,
    status: "available" as const,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    productId: "<PRODUCT_ID>",
    sku: "HOODIE-L-BLK",
    size: "L",
    color: "Black",
    style: "Hoodie",
    price: null,
    stock: 35,
    weight: 480,
    status: "available" as const,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    productId: "<PRODUCT_ID>",
    sku: "HOODIE-XL-BLK",
    size: "XL",
    color: "Black",
    style: "Hoodie",
    price: null,
    stock: 20,
    weight: 510,
    status: "low_stock" as const,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    productId: "<PRODUCT_ID>",
    sku: "HOODIE-2XL-BLK",
    size: "2XL",
    color: "Black",
    style: "Hoodie",
    price: null,
    stock: 15,
    weight: 540,
    status: "low_stock" as const,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  // Vinyl LP variants
  {
    productId: "<PRODUCT_ID>",
    sku: "VINYL-LP-1ST",
    size: "12 inch",
    color: "Black",
    style: "LP",
    price: null,
    stock: 200,
    weight: 180,
    status: "available" as const,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    productId: "<PRODUCT_ID>",
    sku: "VINYL-LP-COL",
    size: "12 inch",
    color: "Transparent Blue",
    style: "LP",
    price: null,
    stock: 150,
    weight: 180,
    status: "available" as const,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  // Enamel Pin Set variants
  {
    productId: "<PRODUCT_ID>",
    sku: "PINS-SET-001",
    size: "One Size",
    color: "Multi",
    style: "Set",
    price: null,
    stock: 300,
    weight: 50,
    status: "available" as const,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

export const sampleDrops = [
  {
    name: "Summer Collection Drop",
    description: "Limited edition items available for a limited time only",
    imageUrl: "https://example.com/drops/summer-collection.jpg",
    startsAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
    endsAt: Date.now() + 21 * 24 * 60 * 60 * 1000, // 21 days from now
    products: [
      "<PRODUCT_ID>", // Hoodie
      "<PRODUCT_ID>"  // Summer Festival Tee
    ],
    priority: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy: "<USER_ID>"
  },
  {
    name: "Exclusive Pre-Order Drop",
    description: "Be the first to get exclusive pre-order items",
    imageUrl: "https://example.com/drops/preorder.jpg",
    startsAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    endsAt: Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days from now
    products: [
      "<PRODUCT_ID>" // Vinyl LP
    ],
    priority: 2,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy: "<USER_ID>"
  }
];

export const sampleCart = {
  userId: "<USER_ID>",
  items: [
    {
      variantId: "<VARIANT_ID>", // XL Black T-Shirt
      quantity: 2,
      priceAtAddTime: 3499,
      addedAt: Date.now()
    },
    {
      variantId: "<VARIANT_ID>", // Enamel Pin Set
      quantity: 1,
      priceAtAddTime: 1999,
      addedAt: Date.now()
    }
  ],
  createdAt: Date.now(),
  updatedAt: Date.now()
};

export const sampleOrder = {
  userId: "<USER_ID>",
  orderNumber: `ORD-${Date.now()}`,
  items: [
    {
      variantId: "<VARIANT_ID>",
      productName: "Tour T-Shirt 2024",
      variantName: "XL Black",
      quantity: 2,
      pricePerUnit: 3499,
      totalPrice: 6998
    },
    {
      variantId: "<VARIANT_ID>",
      productName: "Tour Enamel Pin Set",
      variantName: "One Size Multi",
      quantity: 1,
      pricePerUnit: 1999,
      totalPrice: 1999
    }
  ],
  subtotal: 8997, // 6998 + 1999
  tax: 900, // 10%
  shipping: 1000, // $10
  discount: null,
  total: 10897, // 8997 + 900 + 1000
  shippingAddress: {
    name: "John Doe",
    email: "john.doe@example.com",
    addressLine1: "123 Main Street",
    addressLine2: "Apt 4B",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90001",
    country: "United States"
  },
  status: "paid" as const,
  trackingNumber: null,
  trackingUrl: null,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  shippedAt: null,
  deliveredAt: null
};

/**
 * Example mutation to seed data
 *
 * import { mutation } from './_generated/server';
 * import { sampleProducts, sampleVariants, sampleDrops } from '../docs/merchSeedData';
 *
 * export const seedMerchData = mutation({
 *   args: {},
 *   handler: async (ctx) => {
 *     // Insert products
 *     const productIds: string[] = [];
 *     for (const product of sampleProducts) {
 *       const id = await ctx.db.insert('merchProducts', product);
 *       productIds.push(id);
 *     }
 *
 *     // Insert variants (update product IDs)
 *     for (const variant of sampleVariants) {
 *       await ctx.db.insert('merchVariants', {
 *         ...variant,
 *         productId: productIds[0] // Update with actual product ID
 *       });
 *     }
 *
 *     // Insert drops (update product IDs)
 *     for (const drop of sampleDrops) {
 *       await ctx.db.insert('merchDrops', {
 *         ...drop,
 *         products: [productIds[1], productIds[4]] // Update with actual product IDs
 *       });
 *     }
 *
 *     return { success: true, productIds };
 *   }
 * });
 */
