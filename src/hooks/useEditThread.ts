import { useCallback, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Doc, Id } from '../../convex/_generated/dataModel'

interface UseEditThreadProps {
  threadId: Id<'threads'>
  initialTitle: string
  initialContent: string
}

interface UseEditThreadResult {
  handleEditThread: (newTitle: string, newContent: string) => Promise<Doc<'threads'> | null>
  isLoading: boolean
  error: string | null
}

export function useEditThread({
  threadId,
  initialTitle,
  initialContent,
}: UseEditThreadProps): UseEditThreadResult {
  const editThreadMutation = useMutation(api.forum.editThread)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEditThread = useCallback(
    async (newTitle: string, newContent: string): Promise<Doc<'threads'> | null> => {
      if (!newTitle || newTitle.trim().length === 0) {
        setError('Thread title cannot be empty')
        return null
      }

      if (newTitle.length > 200) {
        setError('Thread title too long (max 200 characters)')
        return null
      }

      if (!newContent || newContent.trim().length === 0) {
        setError('Thread content cannot be empty')
        return null
      }

      if (newContent.length > 10000) {
        setError('Thread content too long (max 10000 characters)')
        return null
      }

      if (newTitle.trim() === initialTitle.trim() && newContent.trim() === initialContent.trim()) {
        setError('No changes to save')
        return null
      }

      setIsLoading(true)
      setError(null)

      try {
        const updatedThread = await editThreadMutation({
          threadId,
          newTitle: newTitle.trim(),
          newContent: newContent.trim(),
        })

        return updatedThread
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to edit thread'

        if (message.includes('too fast')) {
          setError('Please slow down - you\'re editing too quickly')
        } else if (message.includes('permission') || message.includes('Only')) {
          setError('You do not have permission to edit this thread')
        } else {
          setError(message)
        }

        return null
      } finally {
        setIsLoading(false)
      }
    },
    [editThreadMutation, initialContent, initialTitle, threadId]
  )

  return {
    handleEditThread,
    isLoading,
    error,
  }
}
