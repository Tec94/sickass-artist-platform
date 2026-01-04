import { useSearchParams } from 'react-router-dom'
import { useCallback, useMemo } from 'react'

export interface MerchFilters {
  page: number
  pageSize: number
  category: 'apparel' | 'accessories' | 'vinyl' | 'limited' | 'other' | null
  minPrice: number | null
  maxPrice: number | null
  search: string | null
  sortBy: 'newest' | 'price_low' | 'price_high' | 'popular' | 'stock'
}

export function useMerchFilters() {
  const [params, setParams] = useSearchParams()

  const filters = useMemo(
    (): MerchFilters => ({
      page: parseInt(params.get('page') || '0'),
      pageSize: 20,
      category: params.get('category') as MerchFilters['category'],
      minPrice: params.get('minPrice') ? parseInt(params.get('minPrice')!) : null,
      maxPrice: params.get('maxPrice') ? parseInt(params.get('maxPrice')!) : null,
      search: params.get('search'),
      sortBy: (params.get('sortBy') || 'newest') as MerchFilters['sortBy'],
    }),
    [params]
  )

  const setFilter = useCallback(
    (key: string, value: string | number | null) => {
      const newParams = new URLSearchParams(params)

      if (value === null || value === '') {
        newParams.delete(key)
      } else {
        newParams.set(key, String(value))
      }

      // Reset to page 0 when filters change
      if (key !== 'page') {
        newParams.set('page', '0')
      }

      setParams(newParams)
    },
    [params, setParams]
  )

  const resetFilters = useCallback(() => {
    setParams(new URLSearchParams())
  }, [setParams])

  return { filters, setFilter, resetFilters }
}
