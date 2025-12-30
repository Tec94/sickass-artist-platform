import { useState, useCallback } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id, Doc } from '../../convex/_generated/dataModel'

interface UseEditMessageProps {
  messageId: Id<'messages'>
  initialContent: string
}

interface UseEditMessageResult {
  handleEditMessage: (newContent: string) => Promise<Doc<'messages'> | null>
  isLoading: boolean
  error: string | null
}

export function useEditMessage({
  messageId,
  initialContent,
}: UseEditMessageProps): UseEditMessageResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const editMessageMutation = useMutation(api.chat.editMessage)
  // Message data provided via props

  const handleEditMessage = useCallback(
    async (newContent: string): Promise<Doc<'messages'> | null> => {
      // Validate client-side
      if (!newContent || newContent.trim().length === 0) {
        setError('Message content cannot be empty')
        return null
      }
      if (newContent.length > 5000) {
        setError('Message content too long (max 5000 characters)')
        return null
      }
      if (newContent.trim() === initialContent.trim()) {
        setError('No changes to save')
        return null
      }

      setIsLoading(true)
      setError(null)

      try {
        const updatedMessage = await editMessageMutation({
          messageId,
          newContent: newContent.trim(),
        })

        // Update local state optimistically handled by Convex reactive query
        return updatedMessage
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to edit message'
        
        // Rate limit error
        if (errorMessage.includes('too fast')) {
          setError('Please slow down - you\'re editing messages too quickly')
        } else if (errorMessage.includes('permission') || errorMessage.includes('Only')) {
          setError('You don\'t have permission to edit this message')
        } else {
          setError(errorMessage)
        }
        
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [messageId, initialContent, editMessageMutation]
  )

  return {
    handleEditMessage,
    isLoading,
    error,
  }
}