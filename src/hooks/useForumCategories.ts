import { useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Category } from '../types/forum'

interface UseForumCategoriesResult {
  categories: Category[]
  isLoading: boolean
  error: null
}

export function useForumCategories(): UseForumCategoriesResult {
  const rawCategories = useQuery(api.forum.getCategories)

  const categories = useMemo<Category[]>(() => {
    const rows = (rawCategories ?? []) as Array<{
      _id: Category['_id']
      name: string
      slug: string
      description: string
      icon: string
      color: string
      order: number
      requiredRole?: Category['requiredRole']
      requiredFanTier?: Category['requiredFanTier']
      threadCount: number
      lastThreadAt?: number
      createdAt: number
    }>

    return rows.map((category) => ({
      _id: category._id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      color: category.color,
      order: category.order,
      requiredRole: category.requiredRole ?? null,
      requiredFanTier: category.requiredFanTier ?? null,
      threadCount: category.threadCount,
      lastThreadAt: category.lastThreadAt ?? null,
      createdAt: category.createdAt,
    }))
  }, [rawCategories])

  return {
    categories,
    isLoading: rawCategories === undefined,
    error: null,
  }
}
