import { mutation, query } from './_generated/server'
import { v, ConvexError } from 'convex/values'

const MANIFEST_KEY = 'default'

export const getMerchImageManifest = query({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query('merchImageManifest')
      .withIndex('by_key', (q) => q.eq('key', MANIFEST_KEY))
      .first()

    if (!existing) {
      return null
    }

    return {
      manifest: existing.manifest,
      aliases: existing.aliases ?? null,
      updatedAt: existing.updatedAt,
    }
  },
})

export const getMerchImageManifestEntries = query({
  args: {
    slugs: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('merchImageManifest')
      .withIndex('by_key', (q) => q.eq('key', MANIFEST_KEY))
      .first()

    if (!existing) {
      return null
    }

    const manifest = existing.manifest as Record<string, { category: string; variations: Record<string, string[]> }>
    const aliases = (existing.aliases ?? {}) as Record<string, string | string[]>
    const entries: Record<string, { category: string; variations: Record<string, string[]> }> = {}

    const uniqueSlugs = Array.from(new Set(args.slugs.filter(Boolean)))
    for (const slug of uniqueSlugs) {
      const alias = aliases[slug]
      const aliasList = Array.isArray(alias) ? alias : alias ? [alias] : []

      if (aliasList.length <= 1) {
        const resolved = aliasList[0] ?? slug
        const entry = manifest[resolved]
        if (entry) {
          entries[slug] = entry
          continue
        }
      } else {
        const mergedVariations: Record<string, string[]> = {}
        let variationIndex = 1
        let category: string | null = null

        for (const folderSlug of aliasList) {
          const entry = manifest[folderSlug]
          if (!entry) continue
          if (!category) category = entry.category
          const keys = Object.keys(entry.variations).sort((a, b) => Number(a) - Number(b))
          for (const key of keys) {
            mergedVariations[String(variationIndex)] = entry.variations[key]
            variationIndex += 1
          }
        }

        if (category) {
          entries[slug] = { category, variations: mergedVariations }
          continue
        }
      }

      const fallback = manifest[slug]
      if (fallback) {
        entries[slug] = fallback
      }
    }

    return {
      entries,
      updatedAt: existing.updatedAt,
    }
  },
})

export const uploadMerchImageManifest = mutation({
  args: {
    manifest: v.any(),
    aliases: v.optional(v.any()),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const expectedToken = process.env.MERCH_MANIFEST_TOKEN
    if (expectedToken && args.token !== expectedToken) {
      throw new ConvexError('Unauthorized manifest upload.')
    }

    const existing = await ctx.db
      .query('merchImageManifest')
      .withIndex('by_key', (q) => q.eq('key', MANIFEST_KEY))
      .first()

    const now = Date.now()
    if (existing) {
      await ctx.db.patch(existing._id, {
        manifest: args.manifest,
        aliases: args.aliases ?? existing.aliases ?? null,
        updatedAt: now,
      })
      return { updatedAt: now, created: false }
    }

    await ctx.db.insert('merchImageManifest', {
      key: MANIFEST_KEY,
      manifest: args.manifest,
      aliases: args.aliases ?? null,
      createdAt: now,
      updatedAt: now,
    })
    return { updatedAt: now, created: true }
  },
})
