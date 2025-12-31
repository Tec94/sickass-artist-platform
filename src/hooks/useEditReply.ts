import { useCallback, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Doc, Id } from '../../convex/_generated/dataModel'

interface UseEditReplyProps {
  replyId: Id<'replies'>
  initialContent: string
}

interface UseEditReplyResult {
  handleEditReply: (newContent: string) => Promise<Doc<'replies'> | null>
  isLoading: boolean
  error: string | null
}

export function useEditReply({
  replyId,
  initialContent,
}: UseEditReplyProps): UseEditReplyResult {
  const editReplyMutation = useMutation(api.forum.editReply)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEditReply = useCallback(
    async (newContent: string): Promise<Doc<'replies'> | null> => {
      if (!newContent || newContent.trim().length === 0) {
        setError('Reply content cannot be empty')
        return null
      }

      if (newContent.length > 5000) {
        setError('Reply content too long (max 5000 characters)')
        return null
      }

      if (newContent.trim() === initialContent.trim()) {
        setError('No changes to save')
        return null
      }

      setIsLoading(true)
      setError(null)

      try {
        const updatedReply = await editReplyMutation({
          replyId,
          newContent: newContent.trim(),
        })

        return updatedReply
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to edit reply'

        if (message.includes('too fast')) {
          setError('Please slow down - you\'re editing too quickly')
        } else if (message.includes('permission') || message.includes('Only')) {
          setError('You do not have permission to edit this reply')
        } else {
          setError(message)
        }

        return null
      } finally {
        setIsLoading(false)
      }
    },
    [editReplyMutation, initialContent, replyId]
  )

  return {
    handleEditReply,
    isLoading,
    error,
  }
}
