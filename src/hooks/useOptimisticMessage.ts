import { useState, useCallback, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import type { ChatMessage, OptimisticMessage, ChatAttachment } from '../types/chat'

type AttachmentInput = {
  storageId: Id<'_storage'>
  type: 'image' | 'video'
  sizeBytes: number
  contentType: string
  width?: number
  height?: number
  durationMs?: number
  previewUrl: string
}

type AuthorInput = {
  id: Id<'users'>
  displayName: string
  avatar: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
}

type SendMessageInput = {
  content: string
  attachments?: AttachmentInput[]
  stickerId?: Id<'chatStickers'>
  stickerPreviewUrl?: string
  stickerName?: string
  author: AuthorInput
  idempotencyKey?: string
}

type InternalOptimisticMessage = OptimisticMessage & {
  payload: SendMessageInput
}

interface UseOptimisticMessageProps {
  channelId: Id<'channels'>
  messages: ChatMessage[]
}

interface UseOptimisticMessageResult {
  optimisticMessages: OptimisticMessage[]
  sendOptimisticMessage: (input: SendMessageInput) => Promise<{ tempId: string; idempotencyKey: string; error?: Error }>
  retryOptimisticMessage: (tempId: string) => Promise<void>
  removeOptimisticMessage: (tempId: string) => void
}

function computeMessageType(input: SendMessageInput) {
  const hasText = input.content.trim().length > 0
  const hasMedia = (input.attachments?.length ?? 0) > 0
  const hasSticker = Boolean(input.stickerId)

  if (hasSticker && !hasText && !hasMedia) return 'sticker' as const
  if (hasMedia && (hasText || hasSticker)) return 'mixed' as const
  if (hasMedia) return 'media' as const
  return 'text' as const
}

function toDisplayAttachments(attachments?: AttachmentInput[]): ChatAttachment[] | undefined {
  if (!attachments || attachments.length === 0) return undefined
  return attachments.map((attachment) => ({
    type: attachment.type,
    storageId: attachment.storageId,
    url: attachment.previewUrl,
    thumbnailUrl: attachment.previewUrl,
    width: attachment.width,
    height: attachment.height,
    durationMs: attachment.durationMs,
    sizeBytes: attachment.sizeBytes,
    contentType: attachment.contentType,
  }))
}

function toMutationAttachments(attachments?: AttachmentInput[]) {
  if (!attachments || attachments.length === 0) return undefined
  return attachments.map(({ previewUrl: _previewUrl, ...rest }) => rest)
}

export function useOptimisticMessage({
  channelId,
  messages,
}: UseOptimisticMessageProps): UseOptimisticMessageResult {
  const [optimisticMessages, setOptimisticMessages] = useState<InternalOptimisticMessage[]>([])
  const sendMessageMutation = useMutation(api.chat.sendMessage)

  useEffect(() => {
    if (messages.length === 0 || optimisticMessages.length === 0) return
    const serverKeys = new Set(messages.map((message) => message.idempotencyKey))
    setOptimisticMessages((prev) => prev.filter((message) => !serverKeys.has(message.idempotencyKey)))
  }, [messages, optimisticMessages.length])

  const removeOptimisticMessage = useCallback((tempId: string) => {
    setOptimisticMessages((prev) => prev.filter((message) => message._id !== tempId))
  }, [])

  const sendInternal = useCallback(
    async (tempId: string, payload: SendMessageInput) => {
      const attachmentsPayload = toMutationAttachments(payload.attachments)

    try {
      await sendMessageMutation({
        channelId,
        content: payload.content,
        idempotencyKey: payload.idempotencyKey!,
        attachments: attachmentsPayload,
        stickerId: payload.stickerId,
      })

        setOptimisticMessages((prev) =>
          prev.map((message) =>
            message._id === tempId ? { ...message, status: 'sent', errorMessage: undefined } : message
          )
        )

        setTimeout(() => {
          removeOptimisticMessage(tempId)
        }, 12000)
      } catch (error) {
        const messageText = error instanceof Error ? error.message : 'Failed to send message'
        setOptimisticMessages((prev) =>
          prev.map((message) =>
            message._id === tempId ? { ...message, status: 'failed', errorMessage: messageText } : message
          )
        )
        throw error
      }
    },
    [channelId, removeOptimisticMessage, sendMessageMutation]
  )

  const sendOptimisticMessage = useCallback(
    async (input: SendMessageInput) => {
      const idempotencyKey =
        input.idempotencyKey ?? `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const now = Date.now()

      const payload: SendMessageInput = {
        ...input,
        idempotencyKey,
      }

      const optimisticMessage: InternalOptimisticMessage = {
        _id: tempId,
        channelId,
        authorId: input.author.id,
        authorDisplayName: input.author.displayName,
        authorAvatar: input.author.avatar,
        authorTier: input.author.tier,
        content: input.content,
        messageType: computeMessageType(payload),
        attachments: toDisplayAttachments(payload.attachments),
        stickerId: payload.stickerId,
        stickerUrl: payload.stickerPreviewUrl,
        stickerName: payload.stickerName,
        editedAt: undefined,
        isPinned: false,
        isDeleted: false,
        deletedAt: undefined,
        deletedBy: undefined,
        reactionEmojis: [],
        reactionCount: 0,
        upVoteCount: 0,
        downVoteCount: 0,
        netVoteCount: 0,
        idempotencyKey,
        createdAt: now,
        status: 'sending',
        payload,
      }

      setOptimisticMessages((prev) => [...prev, optimisticMessage])
      try {
        await sendInternal(tempId, payload)
        return { tempId, idempotencyKey }
      } catch (error) {
        const wrapped = error instanceof Error ? error : new Error('Failed to send message')
        return { tempId, idempotencyKey, error: wrapped }
      }
    },
    [channelId, sendInternal]
  )

  const retryOptimisticMessage = useCallback(
    async (tempId: string) => {
      const existing = optimisticMessages.find((message) => message._id === tempId)
      if (!existing || existing.status === 'sending') return

      setOptimisticMessages((prev) =>
        prev.map((message) =>
          message._id === tempId ? { ...message, status: 'sending', errorMessage: undefined } : message
        )
      )

      await sendInternal(tempId, existing.payload)
    },
    [optimisticMessages, sendInternal]
  )

  return {
    optimisticMessages,
    sendOptimisticMessage,
    retryOptimisticMessage,
    removeOptimisticMessage,
  }
}
