import { useState, useCallback } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id, Doc } from '../../convex/_generated/dataModel'

interface OptimisticMessage {
  _id: string
  content: string
  authorDisplayName: string
  authorAvatar: string
  createdAt: number
  status: 'sending' | 'sent' | 'failed'
  idempotencyKey: string
}

interface UseOptimisticMessageResult {
  optimisticMessages: OptimisticMessage[]
  handleSendMessage: (
    content: string,
    authorDisplayName: string,
    authorAvatar: string,
    idempotencyKey: string
  ) => Promise<Doc<'messages'> | null>
  removeOptimisticMessage: (tempId: string) => void
}

interface UseOptimisticMessageProps {
  channelId: Id<'channels'>
}

export function useOptimisticMessage({
  channelId,
}: UseOptimisticMessageProps): UseOptimisticMessageResult {
  const [optimisticMessages, setOptimisticMessages] = useState<
    OptimisticMessage[]
  >([])

  const sendMessageMutation = useMutation(api.chat.sendMessage)

  const handleSendMessage = useCallback(
    async (
      content: string,
      authorDisplayName: string,
      authorAvatar: string,
      idempotencyKey: string
    ): Promise<Doc<'messages'> | null> => {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`

      const optimisticMessage: OptimisticMessage = {
        _id: tempId,
        content,
        authorDisplayName,
        authorAvatar,
        createdAt: Date.now(),
        status: 'sending',
        idempotencyKey,
      }

      setOptimisticMessages((prev) => [...prev, optimisticMessage])

      try {
        const message = await sendMessageMutation({
          channelId,
          content,
          idempotencyKey,
        })

        setOptimisticMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempId ? { ...msg, status: 'sent' } : msg
          )
        )

        setTimeout(() => {
          setOptimisticMessages((prev) =>
            prev.filter((msg) => msg._id !== tempId)
          )
        }, 200)

        return message
      } catch (error) {
        console.error('Failed to send message:', error)

        setOptimisticMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempId ? { ...msg, status: 'failed' } : msg
          )
        )

        return null
      }
    },
    [channelId, sendMessageMutation]
  )

  const removeOptimisticMessage = useCallback((tempId: string) => {
    setOptimisticMessages((prev) => prev.filter((msg) => msg._id !== tempId))
  }, [])

  return {
    optimisticMessages,
    handleSendMessage,
    removeOptimisticMessage,
  }
}
