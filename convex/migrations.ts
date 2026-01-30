import { mutation } from './_generated/server'

/**
 * Initialize gamification data for existing users
 * Run once: npx convex run migrations:initializeExistingUsers
 */
export const initializeExistingUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect()
    let initialized = 0
    let skipped = 0

    for (const user of users) {
      // Check if already initialized
      const existing = await ctx.db
        .query('userRewards')
        .filter(q => q.eq(q.field('userId'), user._id))
        .first()

      if (existing) {
        skipped++
        continue
      }

      // Initialize rewards for this user
      await ctx.db.insert('userRewards', {
        userId: user._id,
        totalPoints: 0,
        availablePoints: 0,
        redeemedPoints: 0,
        currentStreak: 0,
        maxStreak: 0,
        lastInteractionDate: 0,
        lastLoginDate: '',
        unseenMilestones: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      // Initialize streak
      await ctx.db.insert('streakBonus', {
        userId: user._id,
        currentStreak: 0,
        maxStreak: 0,
        lastInteractionDate: '',
        streakStartDate: '',
        lastBreakDate: undefined,
        breakReason: undefined,
        hasStreakFreeze: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      initialized++
    }

    return { initialized, skipped, total: users.length }
  }
})

/**
 * Remove legacy Instagram rows (run once).
 * Safe to run even if the table no longer exists.
 */
export const purgeInstagramPosts = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      const dbAny = ctx.db as any
      const posts = await dbAny.query('instagramPosts').collect()
      let deleted = 0
      for (const post of posts) {
        await dbAny.delete(post._id)
        deleted++
      }
      return { deleted, total: posts.length }
    } catch (error) {
      return {
        deleted: 0,
        skipped: true,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
})

/**
 * Rename legacy merch products, point at new assets, and remove unused ones.
 * Run once: npx convex run migrations:migrateMerchProductsToNewAssets
 */
export const migrateMerchProductsToNewAssets = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const products = await ctx.db.query('merchProducts').collect()

    const updatesByName: Record<string, {
      name: string
      imageUrls: string[]
      thumbnailUrl: string
      tags: string[]
    }> = {
      'Wolfpack Bomber Jacket': {
        name: 'Private Suit Varsity Jacket',
        imageUrls: ['/merch/jackets/jacket1/jacket1-1-1.png'],
        thumbnailUrl: '/merch/jackets/jacket1/jacket1-1-1.png',
        tags: ['private-suit-varsity-jacket', 'varsity', 'jacket'],
      },
      'Signature Wolf Logo T-Shirt': {
        name: 'Jetski Motion Tee',
        imageUrls: ['/merch/shirts/shirt1/shirt1-1-1.jpeg'],
        thumbnailUrl: '/merch/shirts/shirt1/shirt1-1-1.jpeg',
        tags: ['jetski-motion-tee', 'graphic-tee'],
      },
      'Elite Fit Denim': {
        name: 'Coated Stack Denim',
        imageUrls: ['/merch/jeans/jeans1/jeans1-1-1.jpeg'],
        thumbnailUrl: '/merch/jeans/jeans1/jeans1-1-1.jpeg',
        tags: ['coated-stack-denim', 'denim'],
      },
      'Wolfpack World Tour Poster': {
        name: 'PPC Poster',
        imageUrls: ['/merch/posters/poster1/poster1-1-1.jpeg'],
        thumbnailUrl: '/merch/posters/poster1/poster1-1-1.jpeg',
        tags: ['ppc-poster', 'poster'],
      },
    }

    const deleteNames = new Set([
      'Sterling Silver Chain',
      'ROA Elite Watch',
    ])

    let updated = 0
    let deleted = 0
    const deletedVariantIds = new Set<string>()

    for (const product of products) {
      if (deleteNames.has(product.name)) {
        const variants = await ctx.db
          .query('merchVariants')
          .withIndex('by_product', (q) => q.eq('productId', product._id))
          .collect()

        for (const variant of variants) {
          deletedVariantIds.add(variant._id)
          await ctx.db.delete(variant._id)
        }

        const wishlistItems = await ctx.db
          .query('merchWishlist')
          .withIndex('by_product', (q) => q.eq('productId', product._id))
          .collect()

        for (const item of wishlistItems) {
          await ctx.db.delete(item._id)
        }

        const drops = await ctx.db.query('merchDrops').collect()
        for (const drop of drops) {
          if (drop.products.includes(product._id)) {
            const nextProducts = drop.products.filter((id) => id !== product._id)
            await ctx.db.patch(drop._id, { products: nextProducts, updatedAt: now })
          }
        }

        await ctx.db.delete(product._id)
        deleted++
        continue
      }

      const update = updatesByName[product.name]
      if (update) {
        const mergedTags = Array.from(new Set([...(product.tags ?? []), ...update.tags]))
        const searchText = [
          update.name,
          product.description,
          product.category,
          ...mergedTags,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        await ctx.db.patch(product._id, {
          name: update.name,
          imageUrls: update.imageUrls,
          thumbnailUrl: update.thumbnailUrl,
          tags: mergedTags,
          searchText,
          updatedAt: now,
        })
        updated++
      }
    }

    if (deletedVariantIds.size > 0) {
      const carts = await ctx.db.query('merchCart').collect()
      for (const cart of carts) {
        const nextItems = cart.items.filter((item) => !deletedVariantIds.has(item.variantId))
        if (nextItems.length !== cart.items.length) {
          await ctx.db.patch(cart._id, { items: nextItems, updatedAt: now })
        }
      }
    }

    return { updated, deleted }
  },
})

/**
 * Add new merch products for additional assets (windbreakers, cargo jeans, vinyls, posters),
 * and update legacy variant color labels to match the new asset variations.
 * Run once: npx convex run migrations:migrateMerchProductsAddNewAssets
 */
export const migrateMerchProductsAddNewAssets = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const creator = await ctx.db.query('users').first()
    if (!creator) {
      return { created: 0, skipped: 0, updatedVariants: 0, error: 'No users found.' }
    }

    const products = await ctx.db.query('merchProducts').collect()
    const existingByName = new Map(products.map((p) => [p.name.toLowerCase(), p]))

    const createProductWithVariants = async (input: {
      name: string
      description: string
      price: number
      category: 'apparel' | 'accessories' | 'vinyl' | 'limited' | 'other'
      image: string
      tags: string[]
      options: Array<{ size: string; color: string }>
    }) => {
      const key = input.name.toLowerCase()
      if (existingByName.has(key)) return false

      const searchText = [input.name, input.description, input.category, ...input.tags]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const productId = await ctx.db.insert('merchProducts', {
        name: input.name,
        description: input.description,
        price: input.price,
        totalStock: 100,
        lowStockThreshold: 10,
        imageUrls: [input.image],
        thumbnailUrl: input.image,
        category: input.category,
        tags: input.tags,
        searchText,
        status: 'active',
        isPreOrder: false,
        isDropProduct: false,
        createdAt: now,
        updatedAt: now,
        createdBy: creator._id,
      })

      for (const opt of input.options) {
        const skuBase = input.name
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 12)
        const sku = `${skuBase}-${opt.size.replace(/[^A-Z0-9]+/g, '')}-${opt.color.replace(/[^A-Z0-9]+/gi, '').toUpperCase().slice(0, 6)}`

        await ctx.db.insert('merchVariants', {
          productId,
          sku,
          size: opt.size,
          color: opt.color,
          stock: 25,
          status: 'available',
          createdAt: now,
          updatedAt: now,
        })
      }

      return true
    }

    const newProducts = [
      {
        name: 'Private Suit Windbreaker',
        description: 'Lightweight windbreaker with a clean, modern color-block finish.',
        price: 9800,
        category: 'apparel' as const,
        image: '/merch/jackets/jacket3/jacket3-1-1.png',
        tags: ['private-suit-windbreaker', 'windbreaker', 'jacket'],
        options: [
          { size: 'S', color: 'White' },
          { size: 'M', color: 'White' },
          { size: 'L', color: 'White' },
          { size: 'XL', color: 'White' },
          { size: 'S', color: 'Blue/White/Black' },
          { size: 'M', color: 'Blue/White/Black' },
          { size: 'L', color: 'Blue/White/Black' },
          { size: 'XL', color: 'Blue/White/Black' },
        ],
      },
      {
        name: 'Cargo Jeans',
        description: 'Dark indigo cargo denim with a structured, utility fit.',
        price: 9000,
        category: 'apparel' as const,
        image: '/merch/jeans/jeans2/jeans2-1-1.jpeg',
        tags: ['cargo-jeans', 'denim', 'cargo'],
        options: [
          { size: '30/32', color: 'Dark Indigo' },
          { size: '32/32', color: 'Dark Indigo' },
          { size: '34/32', color: 'Dark Indigo' },
          { size: '36/32', color: 'Dark Indigo' },
        ],
      },
      {
        name: 'PPC Vinyl',
        description: 'Limited single pressing from PPC.',
        price: 3200,
        category: 'vinyl' as const,
        image: '/merch/music/disk1/disk1-1-1.jpeg',
        tags: ['ppc-vinyl', 'vinyl', 'ppc'],
        options: [{ size: 'Standard', color: 'Black' }],
      },
      {
        name: 'Private Suite (Vol. 2) Vinyl',
        description: 'Private Suite (Vol. 2) full-length vinyl pressing.',
        price: 3500,
        category: 'vinyl' as const,
        image: '/merch/music/disk2/disk2-1-1.jpeg',
        tags: ['private-suite-vol-2-vinyl', 'vinyl', 'private-suite'],
        options: [{ size: 'Standard', color: 'Black' }],
      },
      {
        name: 'Private Suite (Vol. 2) Poster',
        description: 'Limited edition Private Suite (Vol. 2) poster.',
        price: 2500,
        category: 'limited' as const,
        image: '/merch/posters/poster2/poster2-1-1.jpeg',
        tags: ['private-suite-vol-2-poster', 'poster', 'private-suite'],
        options: [
          { size: '18x24"', color: 'Poster' },
          { size: '24x36"', color: 'Poster' },
        ],
      },
    ]

    let created = 0
    let skipped = 0

    for (const product of newProducts) {
      const didCreate = await createProductWithVariants(product)
      if (didCreate) created++
      else skipped++
    }

    let updatedVariants = 0

    const updateVariantColors = async (productName: string, mapping: Record<string, string>) => {
      const product = existingByName.get(productName.toLowerCase())
      if (!product) return
      const variants = await ctx.db
        .query('merchVariants')
        .withIndex('by_product', (q) => q.eq('productId', product._id))
        .collect()

      for (const variant of variants) {
        const nextColor = variant.color ? mapping[variant.color] : undefined
        if (nextColor && nextColor !== variant.color) {
          await ctx.db.patch(variant._id, { color: nextColor, updatedAt: now })
          updatedVariants++
        }
      }
    }

    await updateVariantColors('Private Suit Varsity Jacket', {
      Black: 'Navy/Cream',
      Olive: 'Black',
    })

    await updateVariantColors('Coated Stack Denim', {
      Indigo: 'Bleached Light Blue',
      Black: 'Black Wax-Coated',
    })

    return { created, skipped, updatedVariants }
  },
})
