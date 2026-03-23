import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import type { Doc } from './_generated/dataModel'
import { v, ConvexError } from 'convex/values'
import { api } from './_generated/api'
import { getCurrentUserOrNull, getOrCreateCurrentUser } from './helpers'
import {
  normalizePrototypeStoreSelection,
  resolvePrototypeStoreSelection,
  type PrototypeStoreProduct,
  type PrototypeStoreSelection,
} from '../src/features/store/prototypeStoreContract'

type ReadCtx = QueryCtx | MutationCtx

type PrototypeStoreCategory = 'apparel' | 'music' | 'collectibles' | 'accessories'
const mapMerchCategoryToPrototype = (
  category: Doc<'merchProducts'>['category'],
): PrototypeStoreCategory => {
  switch (category) {
    case 'vinyl':
      return 'music'
    case 'limited':
      return 'collectibles'
    case 'accessories':
      return 'accessories'
    case 'apparel':
    case 'other':
    default:
      return 'apparel'
  }
}

const buildPrototypeDefaultSelection = (
  optionGroups: NonNullable<Doc<'merchProducts'>['optionGroups']>,
  storedDefaultSelection: Doc<'merchProducts'>['defaultSelection'],
): PrototypeStoreSelection =>
  Object.fromEntries(
    optionGroups
      .map((group) => {
        const explicitValue = storedDefaultSelection?.[group.key]
        const option =
          group.options.find((candidate) => candidate.value === explicitValue) ?? group.options[0]
        return option ? [group.key, option.value] : null
      })
      .filter((entry): entry is [string, string] => entry !== null),
  )

const buildPrototypeProduct = (
  product: Doc<'merchProducts'>,
  variants: Doc<'merchVariants'>[],
) : PrototypeStoreProduct & { _id: Doc<'merchProducts'>['_id']; variantId: Doc<'merchVariants'>['_id'] | null } => {
  const primaryVariant =
    variants.find((variant) => variant.stock > 0 && variant.status === 'available') ??
    variants[0] ??
    null
  const available = variants.some((variant) => variant.stock > 0)
  const availability = available ? 'available' : 'sold-out'
  const optionGroups = product.optionGroups ?? []
  const defaultSelection = buildPrototypeDefaultSelection(optionGroups, product.defaultSelection)
  const quickDetails =
    product.quickDetails && product.quickDetails.length > 0
      ? product.quickDetails
      : [product.materials].filter((value): value is string => typeof value === 'string' && value.trim().length > 0)

  return {
    _id: product._id,
    slug: product.slug ?? '',
    name: product.name,
    category: mapMerchCategoryToPrototype(product.category),
    priceCents: primaryVariant?.price ?? product.price,
    primaryImage: product.thumbnailUrl,
    gallery: product.imageUrls.length > 0 ? product.imageUrls : [product.thumbnailUrl],
    availability,
    badge: product.catalogView === 'prototype' && product.featuredOrder && product.featuredOrder >= 8
      ? 'New'
      : undefined,
    shortDescription: product.shortDescription ?? product.description,
    detailDescription: product.detailDescription ?? product.longDescription ?? product.description,
    materials: product.materials ?? 'Edition details available on request.',
    releaseNote: product.releaseNote ?? 'Current issue',
    alt: product.alt ?? product.name,
    featuredOrder: product.featuredOrder ?? 0,
    optionGroups,
    quickDetails,
    defaultSelection,
    variantId: primaryVariant?._id ?? null,
  }
}

async function getPrototypeProductRecordBySlug(ctx: ReadCtx, slug: string) {
  const product = await ctx.db
    .query('merchProducts')
    .withIndex('by_slug', (q) => q.eq('slug', slug))
    .first()

  if (!product || product.catalogView !== 'prototype') {
    return null
  }

  const variants = await ctx.db
    .query('merchVariants')
    .withIndex('by_product', (q) => q.eq('productId', product._id))
    .collect()

  return {
    product,
    variants,
  }
}

async function getPrototypeVariantIdOrThrow(
  ctx: MutationCtx,
  slug: string,
  selection: PrototypeStoreSelection = {},
) {
  const record = await getPrototypeProductRecordBySlug(ctx, slug)
  if (!record) {
    throw new ConvexError('Prototype product not found')
  }

  const normalizedProduct = buildPrototypeProduct(record.product, record.variants)
  const normalizedSelection = normalizePrototypeStoreSelection(normalizedProduct, selection)
  const variant = record.variants.find((candidate) => {
    const candidateSelection = candidate.optionSelections ?? {}
    const normalizedCandidateSelection = normalizePrototypeStoreSelection(
      normalizedProduct,
      candidateSelection,
    )
    return JSON.stringify(normalizedCandidateSelection) === JSON.stringify(normalizedSelection)
  }) ?? record.variants[0]
  if (!variant) {
    throw new ConvexError('Prototype product variant not found')
  }

  return variant._id
}

export const listPrototypeProducts = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query('merchProducts')
      .withIndex('by_catalogView_featuredOrder', (q) => q.eq('catalogView', 'prototype'))
      .order('desc')
      .collect()

    const hydrated = await Promise.all(
      products.map(async (product) => {
        const variants = await ctx.db
          .query('merchVariants')
          .withIndex('by_product', (q) => q.eq('productId', product._id))
          .collect()

        return buildPrototypeProduct(product, variants)
      }),
    )

    return hydrated.filter((product) => product.slug)
  },
})

export const getPrototypeProduct = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const record = await getPrototypeProductRecordBySlug(ctx, args.slug)
    if (!record) return null
    return buildPrototypeProduct(record.product, record.variants)
  },
})

export const getPrototypeCart = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    const user = await getCurrentUserOrNull(ctx)

    if (!identity || !user) {
      return {
        items: [],
        itemCount: 0,
        subtotalCents: 0,
        canWrite: Boolean(identity),
        syncedAt: Date.now(),
      }
    }

    const cart = await ctx.db
      .query('merchCart')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first()

    if (!cart) {
      return {
        items: [],
        itemCount: 0,
        subtotalCents: 0,
        canWrite: true,
        syncedAt: Date.now(),
      }
    }

    const items = await Promise.all(
      cart.items.map(async (item) => {
        const variant = await ctx.db.get(item.variantId)
        if (!variant) return null

        const product = await ctx.db.get(variant.productId)
        if (!product || product.catalogView !== 'prototype' || !product.slug) return null

        const variants = await ctx.db
          .query('merchVariants')
          .withIndex('by_product', (q) => q.eq('productId', product._id))
          .collect()

        const normalizedProduct = buildPrototypeProduct(product, variants)
        const selection = normalizePrototypeStoreSelection(
          normalizedProduct,
          variant.optionSelections ?? normalizedProduct.defaultSelection,
        )

        return {
          lineId: String(variant._id),
          slug: product.slug,
          variantId: variant._id,
          quantity: item.quantity,
          selection,
          selectedOptions: resolvePrototypeStoreSelection(normalizedProduct, selection),
          product: normalizedProduct,
          lineTotalCents: (variant.price ?? product.price) * item.quantity,
        }
      }),
    )

    const validItems = items.filter((item): item is NonNullable<typeof item> => item !== null)

    return {
      items: validItems,
      itemCount: validItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotalCents: validItems.reduce((sum, item) => sum + item.lineTotalCents, 0),
      canWrite: true,
      syncedAt: Date.now(),
    }
  },
})

export const addPrototypeCartItem = mutation({
  args: {
    slug: v.string(),
    selection: v.optional(v.record(v.string(), v.string())),
    quantity: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<unknown> => {
    await getOrCreateCurrentUser(ctx)
    const variantId = await getPrototypeVariantIdOrThrow(ctx, args.slug, args.selection ?? {})
    const quantity = args.quantity ?? 1
    return await ctx.runMutation(api.cart.addToCart, { variantId, quantity })
  },
})

export const setPrototypeCartQuantity = mutation({
  args: {
    variantId: v.id('merchVariants'),
    quantity: v.number(),
  },
  handler: async (ctx, args): Promise<unknown> => {
    await getOrCreateCurrentUser(ctx)
    return await ctx.runMutation(api.cart.updateCartQuantity, {
      variantId: args.variantId,
      quantity: args.quantity,
    })
  },
})

export const removePrototypeCartItem = mutation({
  args: {
    variantId: v.id('merchVariants'),
  },
  handler: async (ctx, args): Promise<unknown> => {
    await getOrCreateCurrentUser(ctx)
    return await ctx.runMutation(api.cart.removeFromCart, { variantId: args.variantId })
  },
})

export const clearPrototypeCart = mutation({
  args: {},
  handler: async (ctx): Promise<unknown> => {
    await getOrCreateCurrentUser(ctx)
    return await ctx.runMutation(api.cart.clearCart, {})
  },
})
