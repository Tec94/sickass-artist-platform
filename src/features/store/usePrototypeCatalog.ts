import { useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import {
  PROTOTYPE_STORE_PRODUCTS,
  getPrototypeDefaultSelection as getStaticPrototypeDefaultSelection,
} from './prototypeStoreCatalog'
import {
  formatPrototypePrice,
  type PrototypeStoreCategory,
  type PrototypeStoreProduct,
  type PrototypeStoreSort,
} from './prototypeStoreContract'

const STATIC_PROTOTYPE_PRODUCTS: PrototypeStoreProduct[] = PROTOTYPE_STORE_PRODUCTS.map((product) => ({
  slug: product.slug,
  name: product.name,
  category: product.category,
  priceCents: product.priceCents,
  primaryImage: product.primaryImage,
  gallery: product.gallery,
  availability: product.availability,
  badge: product.badge,
  shortDescription: product.shortDescription,
  detailDescription: product.detailDescription,
  materials: undefined,
  releaseNote: product.releaseNote,
  alt: product.alt,
  featuredOrder: product.featuredOrder,
  optionGroups: product.optionGroups.map((group) => ({
    key: group.id,
    label: group.label,
    options: group.options.map((option) => ({
      value: option.id,
      label: option.label,
      priceDeltaCents: option.priceDeltaCents,
    })),
  })),
  quickDetails: product.quickDetails.map((detail) => `${detail.label}: ${detail.value}`),
  defaultSelection: getStaticPrototypeDefaultSelection(product),
}))

const getCategoryCounts = (products: PrototypeStoreProduct[]) =>
  products.reduce<Record<PrototypeStoreCategory, number>>(
    (counts, product) => {
      counts.all += 1
      counts[product.category] += 1
      return counts
    },
    {
      all: 0,
      apparel: 0,
      music: 0,
      collectibles: 0,
      accessories: 0,
    },
  )

const sortProducts = (
  products: PrototypeStoreProduct[],
  category: PrototypeStoreCategory,
  sort: PrototypeStoreSort,
) => {
  const filtered =
    category === 'all'
      ? products
      : products.filter((product) => product.category === category)

  return [...filtered].sort((left, right) => {
    if (sort === 'price-low') return left.priceCents - right.priceCents
    if (sort === 'price-high') return right.priceCents - left.priceCents
    return right.featuredOrder - left.featuredOrder
  })
}

export function usePrototypeCatalog() {
  const remoteProducts = useQuery(api.catalog.listPrototypeProducts, {})
  const products =
    remoteProducts && remoteProducts.length > 0
      ? (remoteProducts as PrototypeStoreProduct[])
      : STATIC_PROTOTYPE_PRODUCTS

  const productBySlug = useMemo(
    () => new Map(products.map((product) => [product.slug, product])),
    [products],
  )

  return {
    products,
    isLoading: remoteProducts === undefined,
    isUsingConvex: true,
    getProductBySlug: (slug: string) => productBySlug.get(slug) ?? null,
    getCategoryCounts: () => getCategoryCounts(products),
    getProducts: (category: PrototypeStoreCategory, sort: PrototypeStoreSort) =>
      sortProducts(products, category, sort),
    formatPrototypePrice,
  }
}
