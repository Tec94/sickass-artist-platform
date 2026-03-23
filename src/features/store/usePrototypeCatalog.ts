import { useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import {
  formatPrototypePrice,
  type PrototypeStoreCategory,
  type PrototypeStoreProduct,
  type PrototypeStoreSort,
} from './prototypeStoreContract'

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
  const products = (remoteProducts ?? []) as PrototypeStoreProduct[]

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
