import { merchImageManifest, merchImageAliases } from '../data/merchImageManifest'
import type { MerchImageManifest, MerchImageAliases, MerchImageManifestEntry } from '../types/merch'

const localManifest = merchImageManifest as unknown as MerchImageManifest
const localAliases = merchImageAliases as unknown as MerchImageAliases

const normalizeSlug = (value: string) => value.trim().toLowerCase()

const sortVariationKeys = (keys: string[]) =>
  keys.sort((a, b) => Number(a) - Number(b))

function resolveLocalEntry(slug: string): MerchImageManifestEntry | null {
  const normalized = normalizeSlug(slug)
  const alias = localAliases[normalized]
  const aliasList = Array.isArray(alias) ? alias : alias ? [alias] : []

  if (aliasList.length <= 1) {
    const resolved = normalizeSlug(aliasList[0] ?? normalized)
    return localManifest[resolved] ?? null
  }

  const mergedVariations: Record<string, string[]> = {}
  let variationIndex = 1
  let category: string | null = null

  for (const folderSlug of aliasList) {
    const entry = localManifest[normalizeSlug(folderSlug)]
    if (!entry) continue
    if (!category) category = entry.category
    const keys = sortVariationKeys(Object.keys(entry.variations))
    for (const key of keys) {
      mergedVariations[String(variationIndex)] = entry.variations[key]
      variationIndex += 1
    }
  }

  if (category) {
    return { category, variations: mergedVariations }
  }

  return localManifest[normalized] ?? null
}

export function resolveMerchManifestEntries(
  slugs: string[],
  remoteEntries?: MerchImageManifest | null
): MerchImageManifest | null {
  const uniqueSlugs = Array.from(new Set(slugs.map(normalizeSlug).filter(Boolean)))
  if (uniqueSlugs.length === 0) return remoteEntries ?? null

  const entries: MerchImageManifest = {}
  const remote = remoteEntries ?? null

  for (const slug of uniqueSlugs) {
    if (remote && remote[slug]) {
      entries[slug] = remote[slug]
      continue
    }

    const localEntry = resolveLocalEntry(slug)
    if (localEntry) {
      entries[slug] = localEntry
    }
  }

  return Object.keys(entries).length > 0 ? entries : remote
}

