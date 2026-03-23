import { mutation } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { v } from 'convex/values'
import { AUTH_PROVIDER_AUTH0, buildUserSearchText, normalizeAuthSubject } from './domain/identity'
import { buildProductSearchText, slugifyCatalogText } from './domain/catalog'
import {
  PROTOTYPE_STORE_PRODUCTS,
  getPrototypeDefaultSelection,
  getPrototypeSelectionUnitPrice,
  resolvePrototypeStoreSelection,
  type PrototypeStoreSelection,
} from '../src/features/store/prototypeStoreCatalog'

const buildChannelSearchText = (input: { name: string; slug: string; description: string }) =>
  [input.name, input.slug, input.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

const buildGallerySearchText = (input: { title: string; description: string; tags: string[] }) =>
  [input.title, input.description, ...input.tags]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

const buildUGCSearchText = (input: { title: string; description: string; category: string; tags: string[] }) =>
  [input.title, input.description, input.category, ...input.tags]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

const buildPrototypeOptionGroups = (
  product: (typeof PROTOTYPE_STORE_PRODUCTS)[number],
) =>
  product.optionGroups.map((group) => ({
    key: group.id,
    label: group.label,
    options: group.options.map((option) => ({
      value: option.id,
      label: option.label,
      priceDeltaCents: option.priceDeltaCents,
    })),
  }))

const buildPrototypeQuickDetails = (
  product: (typeof PROTOTYPE_STORE_PRODUCTS)[number],
) =>
  product.quickDetails.map((detail) => `${detail.label}: ${detail.value}`)

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
      'Private Suit Varsity Jacket': {
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
      'Jetski Motion Tee': {
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
      'Coated Stack Denim': {
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
      'PPC Poster': {
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

const mapPrototypeCategoryToMerch = (
  category: (typeof PROTOTYPE_STORE_PRODUCTS)[number]['category'],
): 'apparel' | 'accessories' | 'vinyl' | 'limited' | 'other' => {
  switch (category) {
    case 'apparel':
      return 'apparel'
    case 'music':
      return 'vinyl'
    case 'collectibles':
      return 'limited'
    case 'accessories':
      return 'accessories'
    default:
      return 'other'
  }
}

const buildPrototypeVariantSku = (slug: string, selection: PrototypeStoreSelection) => {
  const suffix = Object.entries(selection)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([groupId, optionId]) => `${groupId}-${optionId}`)
    .join('-')
    .replace(/[^a-z0-9-]+/gi, '-')
    .toUpperCase()

  return `PROTO-${slug.toUpperCase()}${suffix ? `-${suffix}` : ''}`
}

const getPrototypeSelectionCombos = (product: (typeof PROTOTYPE_STORE_PRODUCTS)[number]) => {
  const seed = [getPrototypeDefaultSelection(product)]

  return product.optionGroups.reduce<PrototypeStoreSelection[]>((combinations, group) => {
    if (combinations.length === 0) return seed
    return combinations.flatMap((selection) =>
      group.options.map((option) => ({
        ...selection,
        [group.id]: option.id,
      })),
    )
  }, seed)
}

export const backfillCanonicalUserIdentity = mutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db.query('users').collect()
    const limit = Math.max(1, Math.min(args.limit ?? users.length, users.length || 1))
    let updated = 0

    for (const user of users.slice(0, limit)) {
      const legacyUser = user as typeof user & { clerkId?: string }
      const authSubject = normalizeAuthSubject(user.authSubject ?? legacyUser.clerkId ?? '')
      const searchText = buildUserSearchText({
        email: user.email,
        username: user.username,
        displayName: user.displayName,
      })

      const patch: Record<string, string> = {}
      if (user.authSubject !== authSubject) patch.authSubject = authSubject
      if (user.authProvider !== AUTH_PROVIDER_AUTH0) patch.authProvider = AUTH_PROVIDER_AUTH0
      if (user.searchText !== searchText) patch.searchText = searchText

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(user._id, patch)
        updated += 1
      }
    }

    return { scanned: Math.min(limit, users.length), updated, total: users.length }
  },
})

export const backfillForumVoteLedgers = mutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, args.limit ?? 500)
    const [threads, replies] = await Promise.all([
      ctx.db.query('threads').collect(),
      ctx.db.query('replies').collect(),
    ])

    let insertedThreadVotes = 0
    let insertedReplyVotes = 0
    let patchedThreads = 0
    let patchedReplies = 0

    for (const thread of threads.slice(0, limit)) {
      const legacyThread = thread as typeof thread & {
        upVoterIds?: Id<'users'>[]
        downVoterIds?: Id<'users'>[]
      }
      const desiredVotes = new Map<string, { userId: Id<'users'>, voteType: 'up' | 'down' }>()
      for (const userId of legacyThread.upVoterIds ?? []) {
        desiredVotes.set(String(userId), { userId, voteType: 'up' })
      }
      for (const userId of legacyThread.downVoterIds ?? []) {
        desiredVotes.set(String(userId), { userId, voteType: 'down' })
      }

      let upVoteCount = 0
      let downVoteCount = 0
      for (const { userId, voteType } of desiredVotes.values()) {
        const existing = await ctx.db
          .query('threadVotes')
          .withIndex('by_thread_user', (q) => q.eq('threadId', thread._id).eq('userId', userId))
          .first()

        if (!existing) {
          await ctx.db.insert('threadVotes', {
            threadId: thread._id,
            userId,
            voteType,
            createdAt: thread.updatedAt ?? thread.createdAt,
          })
          insertedThreadVotes += 1
        } else if (existing.voteType !== voteType) {
          await ctx.db.patch(existing._id, { voteType })
        }

        if (voteType === 'up') upVoteCount += 1
        else downVoteCount += 1
      }

      const netVoteCount = upVoteCount - downVoteCount
      if (
        (thread.upVoteCount ?? 0) !== upVoteCount ||
        (thread.downVoteCount ?? 0) !== downVoteCount ||
        (thread.netVoteCount ?? 0) !== netVoteCount
      ) {
        await ctx.db.patch(thread._id, {
          upVoteCount,
          downVoteCount,
          netVoteCount,
          updatedAt: Date.now(),
        })
        patchedThreads += 1
      }
    }

    for (const reply of replies.slice(0, limit)) {
      const legacyReply = reply as typeof reply & {
        upVoterIds?: Id<'users'>[]
        downVoterIds?: Id<'users'>[]
      }
      const desiredVotes = new Map<string, { userId: Id<'users'>, voteType: 'up' | 'down' }>()
      for (const userId of legacyReply.upVoterIds ?? []) {
        desiredVotes.set(String(userId), { userId, voteType: 'up' })
      }
      for (const userId of legacyReply.downVoterIds ?? []) {
        desiredVotes.set(String(userId), { userId, voteType: 'down' })
      }

      let upVoteCount = 0
      let downVoteCount = 0
      for (const { userId, voteType } of desiredVotes.values()) {
        const existing = await ctx.db
          .query('replyVotes')
          .withIndex('by_reply_user', (q) => q.eq('replyId', reply._id).eq('userId', userId))
          .first()

        if (!existing) {
          await ctx.db.insert('replyVotes', {
            replyId: reply._id,
            userId,
            voteType,
            createdAt: reply.editedAt ?? reply.createdAt,
          })
          insertedReplyVotes += 1
        } else if (existing.voteType !== voteType) {
          await ctx.db.patch(existing._id, { voteType })
        }

        if (voteType === 'up') upVoteCount += 1
        else downVoteCount += 1
      }

      if (
        (reply.upVoteCount ?? 0) !== upVoteCount ||
        (reply.downVoteCount ?? 0) !== downVoteCount
      ) {
        await ctx.db.patch(reply._id, {
          upVoteCount,
          downVoteCount,
        })
        patchedReplies += 1
      }
    }

    return {
      scannedThreads: Math.min(limit, threads.length),
      scannedReplies: Math.min(limit, replies.length),
      insertedThreadVotes,
      insertedReplyVotes,
      patchedThreads,
      patchedReplies,
    }
  },
})

export const backfillMessageVoteLedgers = mutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db.query('messages').collect()
    const limit = Math.max(1, Math.min(args.limit ?? messages.length, messages.length || 1))
    let insertedMessageVotes = 0
    let patchedMessages = 0

    for (const message of messages.slice(0, limit)) {
      const legacyMessage = message as typeof message & {
        upVoterIds?: Id<'users'>[]
        downVoterIds?: Id<'users'>[]
      }
      const desiredVotes = new Map<string, { userId: Id<'users'>; voteType: 'up' | 'down' }>()
      for (const userId of legacyMessage.upVoterIds ?? []) {
        desiredVotes.set(String(userId), { userId, voteType: 'up' })
      }
      for (const userId of legacyMessage.downVoterIds ?? []) {
        desiredVotes.set(String(userId), { userId, voteType: 'down' })
      }

      let upVoteCount = 0
      let downVoteCount = 0
      for (const { userId, voteType } of desiredVotes.values()) {
        const existing = await ctx.db
          .query('messageVotes')
          .withIndex('by_message_user', (q) => q.eq('messageId', message._id).eq('userId', userId))
          .first()

        if (!existing) {
          await ctx.db.insert('messageVotes', {
            messageId: message._id,
            userId,
            voteType,
            createdAt: message.createdAt,
          })
          insertedMessageVotes += 1
        } else if (existing.voteType !== voteType) {
          await ctx.db.patch(existing._id, { voteType })
        }

        if (voteType === 'up') upVoteCount += 1
        else downVoteCount += 1
      }

      const netVoteCount = upVoteCount - downVoteCount
      if (
        (message.upVoteCount ?? 0) !== upVoteCount ||
        (message.downVoteCount ?? 0) !== downVoteCount ||
        (message.netVoteCount ?? 0) !== netVoteCount
      ) {
        await ctx.db.patch(message._id, {
          upVoteCount,
          downVoteCount,
          netVoteCount,
        })
        patchedMessages += 1
      }
    }

    return {
      scannedMessages: Math.min(limit, messages.length),
      insertedMessageVotes,
      patchedMessages,
    }
  },
})

export const backfillUserStreaks = mutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db.query('users').collect()
    const limit = Math.max(1, Math.min(args.limit ?? users.length, users.length || 1))
    let inserted = 0
    let updated = 0
    const dbAny = ctx.db as any

    for (const user of users.slice(0, limit)) {
      const [existing, legacy, rewards] = await Promise.all([
        ctx.db
          .query('userStreaks')
          .withIndex('by_userId', (q) => q.eq('userId', user._id))
          .first(),
        dbAny
          .query('streakBonus')
          .withIndex('by_userId', (q: any) => q.eq('userId', user._id))
          .first(),
        ctx.db
          .query('userRewards')
          .withIndex('by_userId', (q) => q.eq('userId', user._id))
          .first(),
      ])
      const legacyRewards = rewards as typeof rewards & {
        currentStreak?: number
        maxStreak?: number
        lastLoginDate?: string
        unseenMilestones?: string[]
      }

      const fallbackDate =
        legacy?.lastInteractionDate ||
        legacyRewards?.lastLoginDate ||
        new Date(user.updatedAt || user.createdAt).toISOString().split('T')[0]

      const payload = {
        userId: user._id,
        currentStreak: existing?.currentStreak ?? legacy?.currentStreak ?? legacyRewards?.currentStreak ?? 0,
        maxStreak: existing?.maxStreak ?? legacy?.maxStreak ?? legacyRewards?.maxStreak ?? 0,
        lastInteractionDate: existing?.lastInteractionDate ?? fallbackDate,
        streakStartDate: existing?.streakStartDate ?? legacy?.streakStartDate ?? fallbackDate,
        lastBreakDate: existing?.lastBreakDate ?? legacy?.lastBreakDate,
        breakReason: existing?.breakReason ?? legacy?.breakReason,
        hasStreakFreeze: existing?.hasStreakFreeze ?? legacy?.hasStreakFreeze ?? false,
        unseenMilestones: existing?.unseenMilestones ?? legacyRewards?.unseenMilestones ?? [],
        lastLoginDate: existing?.lastLoginDate ?? legacyRewards?.lastLoginDate ?? fallbackDate,
        updatedAt: Date.now(),
      }

      if (existing) {
        await ctx.db.patch(existing._id, payload)
        updated += 1
      } else {
        await ctx.db.insert('userStreaks', {
          ...payload,
          createdAt: Date.now(),
        })
        inserted += 1
      }
    }

    return { scanned: Math.min(limit, users.length), inserted, updated, total: users.length }
  },
})

export const backfillRewardAndQuestKeys = mutation({
  args: {},
  handler: async (ctx) => {
    const [rewards, quests] = await Promise.all([
      ctx.db.query('rewards').collect(),
      ctx.db.query('quests').collect(),
    ])

    const usedRewardKeys = new Set<string>()
    const usedQuestKeys = new Set<string>()
    let rewardUpdates = 0
    let questUpdates = 0

    for (const reward of rewards) {
      let key = reward.key || slugifyCatalogText(reward.rewardId || reward.name)
      while (usedRewardKeys.has(key)) key = `${key}-${String(reward._id).slice(-4)}`
      usedRewardKeys.add(key)
      if (reward.key !== key) {
        await ctx.db.patch(reward._id, { key, updatedAt: Date.now() })
        rewardUpdates += 1
      }
    }

    for (const quest of quests) {
      let key = quest.key || slugifyCatalogText(quest.questId || quest.name)
      while (usedQuestKeys.has(key)) key = `${key}-${String(quest._id).slice(-4)}`
      usedQuestKeys.add(key)
      if (quest.key !== key) {
        await ctx.db.patch(quest._id, { key })
        questUpdates += 1
      }
    }

    return { rewardUpdates, questUpdates }
  },
})

export const backfillPhoneArtistContentEnvelope = mutation({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query('phoneArtistContent').collect()
    let updated = 0

    for (const doc of docs) {
      const legacyDoc = doc as typeof doc & { payload?: unknown }
      if (doc.payloadEnvelope) continue
      await ctx.db.patch(doc._id, {
        payloadEnvelope: {
          version: 'artist-scrape/v1',
          data: {
            artist: doc.artist,
            scrapeDate: doc.scrapeDate,
            ...(typeof legacyDoc.payload === 'object' && legacyDoc.payload !== null
              ? (legacyDoc.payload as Record<string, unknown>)
              : {}),
          },
          importedAt: Date.now(),
        },
        updatedAt: Date.now(),
      })
      updated += 1
    }

    return { updated, total: docs.length }
  },
})

export const backfillSearchDocuments = mutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(args.limit ?? 500, 1)
    const [channels, gallery, ugc] = await Promise.all([
      ctx.db.query('channels').collect(),
      ctx.db.query('galleryContent').collect(),
      ctx.db.query('ugcContent').collect(),
    ])

    let updatedChannels = 0
    let updatedGallery = 0
    let updatedUGC = 0

    for (const channel of channels.slice(0, limit)) {
      const searchText = buildChannelSearchText(channel)
      if (channel.searchText !== searchText) {
        await ctx.db.patch(channel._id, { searchText })
        updatedChannels += 1
      }
    }

    for (const entry of gallery.slice(0, limit)) {
      const searchText = buildGallerySearchText(entry)
      if (entry.searchText !== searchText) {
        await ctx.db.patch(entry._id, { searchText })
        updatedGallery += 1
      }
    }

    for (const entry of ugc.slice(0, limit)) {
      const searchText = buildUGCSearchText(entry)
      if (entry.searchText !== searchText) {
        await ctx.db.patch(entry._id, { searchText })
        updatedUGC += 1
      }
    }

    return {
      updatedChannels,
      updatedGallery,
      updatedUGC,
    }
  },
})

export const importPrototypeCatalog = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const creator =
      (await ctx.db.query('users').withIndex('by_role', (q) => q.eq('role', 'artist')).first()) ||
      (await ctx.db.query('users').withIndex('by_role', (q) => q.eq('role', 'admin')).first()) ||
      (await ctx.db.query('users').first())

    if (!creator) {
      throw new Error('Cannot import prototype catalog without at least one user')
    }

    let createdProducts = 0
    let updatedProducts = 0
    let createdVariants = 0
    let updatedVariants = 0

    for (const product of PROTOTYPE_STORE_PRODUCTS) {
      const category = mapPrototypeCategoryToMerch(product.category)
      const materials =
        product.quickDetails.find((detail) => detail.label.toLowerCase() === 'material')?.value ??
        product.quickDetails.map((detail) => `${detail.label}: ${detail.value}`).join(' · ')
      const tags = Array.from(
        new Set([
          product.slug,
          category,
          ...product.name.toLowerCase().split(/\s+/),
          ...product.releaseNote.toLowerCase().split(/\s+/),
        ]),
      )

      const productPayload = {
        slug: product.slug,
        name: product.name,
        description: product.shortDescription,
        longDescription: product.detailDescription,
        shortDescription: product.shortDescription,
        detailDescription: product.detailDescription,
        materials,
        releaseNote: product.releaseNote,
        alt: product.alt,
        featuredOrder: product.featuredOrder,
        catalogView: 'prototype' as const,
        price: product.priceCents,
        totalStock: product.availability === 'available' ? 25 : 0,
        lowStockThreshold: 2,
        imageUrls: product.gallery,
        thumbnailUrl: product.primaryImage,
        category,
        tags,
        searchText: buildProductSearchText(product.name, product.shortDescription, tags, [
          product.detailDescription,
          materials,
          product.releaseNote,
        ]),
        optionGroups: buildPrototypeOptionGroups(product),
        quickDetails: buildPrototypeQuickDetails(product),
        defaultSelection: Object.fromEntries(
          Object.entries(getPrototypeDefaultSelection(product)).map(([groupId, optionId]) => [groupId, optionId]),
        ),
        status: 'active' as const,
        isPreOrder: false,
        isDropProduct: false,
        updatedAt: now,
      }

      const existingProduct = await ctx.db
        .query('merchProducts')
        .withIndex('by_slug', (q) => q.eq('slug', product.slug))
        .first()

      const productId = existingProduct?._id ??
        (await ctx.db.insert('merchProducts', {
          ...productPayload,
          createdAt: now,
          createdBy: creator._id,
        }))

      if (existingProduct) {
        await ctx.db.patch(existingProduct._id, productPayload)
        updatedProducts += 1
      } else {
        createdProducts += 1
      }

      const existingVariants = await ctx.db
        .query('merchVariants')
        .withIndex('by_product', (q) => q.eq('productId', productId))
        .collect()
      const selectionCombos = getPrototypeSelectionCombos(product)

      for (const selection of selectionCombos) {
        const resolvedSelection = resolvePrototypeStoreSelection(product, selection)
        const variantPayload = {
          productId,
          sku: buildPrototypeVariantSku(product.slug, selection),
          size: resolvedSelection[0]?.optionLabel ?? 'Standard',
          color: resolvedSelection[1]?.optionLabel ?? 'Default',
          style: resolvedSelection[2]?.optionLabel,
          optionSelections: Object.fromEntries(
            Object.entries(selection).map(([groupId, optionId]) => [groupId, optionId]),
          ),
          price: getPrototypeSelectionUnitPrice(product, selection),
          stock: product.availability === 'available' ? 5 : 0,
          status: product.availability === 'available' ? 'available' as const : 'out_of_stock' as const,
          updatedAt: now,
        }

        const existingVariant = existingVariants.find((variant) => variant.sku === variantPayload.sku)
        if (existingVariant) {
          await ctx.db.patch(existingVariant._id, variantPayload)
          updatedVariants += 1
        } else {
          await ctx.db.insert('merchVariants', {
            ...variantPayload,
            createdAt: now,
          })
          createdVariants += 1
        }
      }
    }

    return { createdProducts, updatedProducts, createdVariants, updatedVariants }
  },
})
