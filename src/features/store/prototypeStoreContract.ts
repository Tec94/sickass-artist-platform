export type PrototypeStoreCategory =
  | 'all'
  | 'apparel'
  | 'music'
  | 'collectibles'
  | 'accessories'

export type PrototypeStoreAvailability = 'available' | 'sold-out'
export type PrototypeStoreSort = 'latest' | 'price-low' | 'price-high'
export type PrototypeStoreSelection = Record<string, string>

export interface PrototypeStoreOption {
  value: string
  label: string
  priceDeltaCents?: number
  badge?: string
  swatch?: string
}

export interface PrototypeStoreOptionGroup {
  key: string
  label: string
  options: PrototypeStoreOption[]
}

export interface PrototypeStoreResolvedSelection {
  key: string
  label: string
  selectedValue: string
  selectedLabel: string
  priceDeltaCents: number
  badge?: string
  swatch?: string
}

export interface PrototypeStoreProduct {
  slug: string
  name: string
  category: Exclude<PrototypeStoreCategory, 'all'>
  priceCents: number
  primaryImage: string
  gallery: string[]
  availability: PrototypeStoreAvailability
  badge?: string
  shortDescription: string
  detailDescription: string
  materials?: string
  releaseNote: string
  alt: string
  featuredOrder: number
  optionGroups: PrototypeStoreOptionGroup[]
  quickDetails: string[]
  defaultSelection: PrototypeStoreSelection
}

export const PROTOTYPE_STORE_CATEGORY_LABELS: Record<PrototypeStoreCategory, string> = {
  all: 'All Products',
  apparel: 'Apparel',
  music: 'Music',
  collectibles: 'Collectibles',
  accessories: 'Accessories',
}

export const PROTOTYPE_STORE_SORT_LABELS: Record<PrototypeStoreSort, string> = {
  latest: 'Latest',
  'price-low': 'Price: Low - High',
  'price-high': 'Price: High - Low',
}

export const resolvePrototypeStoreSelection = (
  product: Pick<PrototypeStoreProduct, 'optionGroups' | 'defaultSelection'>,
  selection: PrototypeStoreSelection = {},
): PrototypeStoreResolvedSelection[] =>
  product.optionGroups.flatMap((group) => {
    const fallbackValue = product.defaultSelection[group.key]
    const fallbackOption =
      group.options.find((option) => option.value === fallbackValue) ?? group.options[0]
    if (!fallbackOption) return []

    const selectedOption =
      group.options.find((option) => option.value === selection[group.key]) ?? fallbackOption

    return [
      {
        key: group.key,
        label: group.label,
        selectedValue: selectedOption.value,
        selectedLabel: selectedOption.label,
        priceDeltaCents: selectedOption.priceDeltaCents ?? 0,
        badge: selectedOption.badge,
        swatch: selectedOption.swatch,
      },
    ]
  })

export const getPrototypeDefaultSelection = (
  product: Pick<PrototypeStoreProduct, 'optionGroups' | 'defaultSelection'>,
): PrototypeStoreSelection => {
  const resolvedDefault = resolvePrototypeStoreSelection(product, product.defaultSelection)
  if (resolvedDefault.length > 0) {
    return Object.fromEntries(
      resolvedDefault.map((item) => [item.key, item.selectedValue]),
    )
  }

  return Object.fromEntries(
    product.optionGroups
      .map((group) => {
        const option = group.options[0]
        return option ? [group.key, option.value] : null
      })
      .filter((entry): entry is [string, string] => entry !== null),
  )
}

export const normalizePrototypeStoreSelection = (
  product: Pick<PrototypeStoreProduct, 'optionGroups' | 'defaultSelection'>,
  selection: PrototypeStoreSelection = {},
): PrototypeStoreSelection =>
  Object.fromEntries(
    resolvePrototypeStoreSelection(product, selection).map((item) => [item.key, item.selectedValue]),
  )

export const getPrototypeSelectionUnitPrice = (
  product: Pick<PrototypeStoreProduct, 'priceCents' | 'optionGroups' | 'defaultSelection'>,
  selection: PrototypeStoreSelection = {},
) =>
  product.priceCents +
  resolvePrototypeStoreSelection(product, selection).reduce(
    (total, item) => total + item.priceDeltaCents,
    0,
  )

export const formatPrototypePrice = (priceCents: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceCents / 100)
