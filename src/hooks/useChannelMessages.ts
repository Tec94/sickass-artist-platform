import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id, Doc } from '../../convex/_generated/dataModel'

type ChatCursor = { messageId: Id<'messages'>; createdAt: number }

interface UseChannelMessagesResult {
  messages: Doc<'messages'>[]
  isLoading: boolean
  isLoadingMore: boolean
  error: null
  loadMore: () => void
  hasMore: boolean
}

function mergeMessages(messages: Doc<'messages'>[]) {
  const byId = new Map<string, Doc<'messages'>>()
  for (const message of messages) {
    byId.set(String(message._id), message)
  }
  return Array.from(byId.values()).sort((a, b) => a.createdAt - b.createdAt)
}

export function useChannelMessages(channelId: Id<'channels'>): UseChannelMessagesResult {
  const [olderMessages, setOlderMessages] = useState<Doc<'messages'>[]>([])
  const [nextCursor, setNextCursor] = useState<ChatCursor | null | undefined>(undefined)
  const [requestedCursor, setRequestedCursor] = useState<ChatCursor | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const previousRecentRef = useRef<Doc<'messages'>[] | undefined>(undefined)

  const recentMessages = useQuery(api.chat.subscribeToMessages, { channelId })

  const paginatedQuery = useQuery(
    api.chat.getMessages,
    requestedCursor
      ? {
          channelId,
          limit: 50,
          cursor: requestedCursor,
        }
      : 'skip'
  )

  useEffect(() => {
    setOlderMessages([])
    setNextCursor(undefined)
    setRequestedCursor(null)
    setIsLoadingMore(false)
    previousRecentRef.current = undefined
  }, [channelId])

  useEffect(() => {
    if (!recentMessages || recentMessages.length === 0) return

    const previousRecent = previousRecentRef.current
    previousRecentRef.current = recentMessages

    if (previousRecent && previousRecent.length > 0) {
      const newIds = new Set(recentMessages.map((message) => String(message._id)))
      const newestOldest = recentMessages[0]?.createdAt ?? 0
      const evicted = previousRecent.filter(
        (message) => !newIds.has(String(message._id)) && message.createdAt < newestOldest
      )
      if (evicted.length > 0) {
        setOlderMessages((prev) => mergeMessages([...prev, ...evicted]))
      }
    }

    if (nextCursor === undefined) {
      const oldest = recentMessages[0]
      if (oldest) {
        setNextCursor({ messageId: oldest._id, createdAt: oldest.createdAt })
      }
    }
  }, [recentMessages, nextCursor])

  useEffect(() => {
    if (!requestedCursor || !paginatedQuery) return

    setOlderMessages((prev) => mergeMessages([...prev, ...paginatedQuery.messages]))
    setNextCursor(paginatedQuery.nextCursor ?? null)
    setRequestedCursor(null)
    setIsLoadingMore(false)
  }, [paginatedQuery, requestedCursor])

  const messages = useMemo(() => {
    if (!recentMessages) return olderMessages
    return mergeMessages([...olderMessages, ...recentMessages])
  }, [olderMessages, recentMessages])

  const hasMore = useMemo(() => !!nextCursor, [nextCursor])

  const isLoading = recentMessages === undefined && olderMessages.length === 0

  const loadMore = useCallback(() => {
    if (!nextCursor || isLoadingMore) return
    setRequestedCursor(nextCursor)
    setIsLoadingMore(true)
  }, [nextCursor, isLoadingMore])

  return {
    messages,
    isLoading,
    isLoadingMore,
    error: null,
    loadMore,
    hasMore,
  }
}
