import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id, Doc } from '../../convex/_generated/dataModel'

interface UseChannelMessagesResult {
  messages: Doc<'messages'>[]
  isLoading: boolean
  error: null
  loadMore: () => void
  hasMore: boolean
}

export function useChannelMessages(
  channelId: Id<'channels'>
): UseChannelMessagesResult {
  const [cursor, setCursor] = useState<
    { messageId: Id<'messages'>; createdAt: number } | undefined
  >(undefined)
  const [paginatedMessages, setPaginatedMessages] = useState<Doc<'messages'>[]>(
    []
  )

  const subscriptionData = useQuery(api.chat.subscribeToMessages, {
    channelId,
  })

  const initialQuery = useQuery(api.chat.getMessages, {
    channelId,
    limit: 50,
    cursor: undefined,
  })

  const paginatedQuery = useQuery(api.chat.getMessages, {
    channelId,
    limit: 50,
    cursor,
  })

  useEffect(() => {
    if (subscriptionData) {
      setPaginatedMessages(subscriptionData)
      setCursor(undefined)
    }
  }, [subscriptionData])

  useEffect(() => {
    if (!subscriptionData && initialQuery) {
      setPaginatedMessages(initialQuery.messages)
      setCursor(initialQuery.nextCursor ?? undefined)
    }
  }, [subscriptionData, initialQuery])

  useEffect(() => {
    if (
      !subscriptionData &&
      paginatedQuery &&
      cursor !== undefined &&
      paginatedQuery.messages.length > 0
    ) {
      setPaginatedMessages((prev) => [...prev, ...paginatedQuery.messages])
      setCursor(paginatedQuery.nextCursor ?? undefined)
    }
  }, [subscriptionData, paginatedQuery, cursor])

  const hasMore = useMemo(() => {
    if (subscriptionData) {
      return false
    }
    return cursor !== undefined
  }, [subscriptionData, cursor])

  const isLoading =
    subscriptionData === undefined &&
    initialQuery === undefined &&
    paginatedMessages.length === 0

  const loadMore = useCallback(() => {
    if (subscriptionData || cursor === undefined || paginatedQuery !== undefined) {
      return
    }
    setCursor(cursor)
  }, [subscriptionData, cursor, paginatedQuery])

  return {
    messages: paginatedMessages,
    isLoading,
    error: null,
    loadMore,
    hasMore,
  }
}
