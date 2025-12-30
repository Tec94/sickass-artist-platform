import { useCallback, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

interface UseCreateThreadResult {
  handleCreateThread: (title: string, content: string, tags: string[]) => Promise<void>
  isLoading: boolean
  error: Error | null
}

export function useCreateThread(categoryId: Id<'categories'> | null): UseCreateThreadResult {
  const createThread = useMutation(api.forum.createThread)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const handleCreateThread = useCallback(
    async (title: string, content: string, tags: string[]) => {
      if (!categoryId) return

      setError(null)
      setIsLoading(true)

      try {
        await createThread({
          categoryId,
          title,
          content,
          tags,
        })
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [categoryId, createThread]
  )

  return {
    handleCreateThread,
    isLoading,
    error,
  }
}
