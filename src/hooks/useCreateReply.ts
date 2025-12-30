import { useCallback, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

interface UseCreateReplyResult {
  handleCreateReply: (content: string) => Promise<void>
  isLoading: boolean
  error: Error | null
}

export function useCreateReply(threadId: Id<'threads'> | null): UseCreateReplyResult {
  const createReply = useMutation(api.forum.createReply)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const handleCreateReply = useCallback(
    async (content: string) => {
      if (!threadId) return

      setError(null)
      setIsLoading(true)

      try {
        await createReply({ threadId, content })
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [createReply, threadId]
  )

  return {
    handleCreateReply,
    isLoading,
    error,
  }
}
