import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { List, type ListImperativeAPI, type RowComponentProps, useDynamicRowHeight, useListRef } from 'react-window'
import type { Id } from '../../../convex/_generated/dataModel'
import type { ChatMessage, ChatSticker, OptimisticMessage } from '../../types/chat'
import { MessageItem } from './MessageItem'

type UserSettingsView = {
  autoplayMedia: boolean
  showStickers: boolean
  compactMode: boolean
}

interface MessageThreadProps {
  channelId: Id<'channels'>
  channelName?: string
  messages: ChatMessage[]
  optimisticMessages: OptimisticMessage[]
  isLoading: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
  hasMore: boolean
  currentUserId?: Id<'users'>
  userSettings: UserSettingsView
  stickerMap: Map<string, ChatSticker>
  onReact: (message: ChatMessage | OptimisticMessage, emoji: string) => void
  onDelete: (message: ChatMessage | OptimisticMessage) => void
  onReport: (messageId: Id<'messages'>, reason: string, note?: string) => Promise<void>
  onRetry: (tempId: string) => Promise<void>
}

type ThreadItem =
  | { kind: 'loadMore'; key: string }
  | { kind: 'welcome'; key: string; channelName: string }
  | { kind: 'message'; key: string; message: ChatMessage | OptimisticMessage }

const STACK_WINDOW_MS = 5 * 60 * 1000

function isTempId(id: string) {
  return id.startsWith('temp-')
}

export function MessageThread({
  channelId,
  channelName,
  messages,
  optimisticMessages,
  isLoading,
  isLoadingMore,
  onLoadMore,
  hasMore,
  currentUserId,
  userSettings,
  stickerMap,
  onReact,
  onDelete,
  onReport,
  onRetry,
}: MessageThreadProps) {
  const [listHeight, setListHeight] = useState(600)
  const listRef = useListRef() as MutableRefObject<ListImperativeAPI | null>
  const rowHeightKey = `${channelId}-${userSettings.compactMode ? 'compact' : 'cozy'}`
  const rowHeight = useDynamicRowHeight({ defaultRowHeight: userSettings.compactMode ? 72 : 96, key: rowHeightKey })
  const isAtBottomRef = useRef(true)
  const pendingLoadMoreRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null)
  const lastItemCountRef = useRef(0)

  useEffect(() => {
    const updateHeight = () => {
      const computed = Math.min(820, window.innerHeight - 220)
      setListHeight(Math.max(460, computed))
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  useEffect(() => {
    isAtBottomRef.current = true
    pendingLoadMoreRef.current = null
    lastItemCountRef.current = 0
  }, [channelId])

  const combinedMessages = useMemo(() => {
    if (optimisticMessages.length === 0) return messages
    const serverKeys = new Set(messages.map((message) => message.idempotencyKey).filter(Boolean))
    const filteredOptimistic = optimisticMessages.filter((message) => !serverKeys.has(message.idempotencyKey))
    return [...messages, ...filteredOptimistic].sort((a, b) => a.createdAt - b.createdAt)
  }, [messages, optimisticMessages])

  const items = useMemo<ThreadItem[]>(() => {
    const nextItems: ThreadItem[] = []
    if (hasMore || isLoadingMore) {
      nextItems.push({ kind: 'loadMore', key: 'load-more' })
    }
    if (channelName) {
      nextItems.push({ kind: 'welcome', key: 'welcome', channelName })
    }
    for (const message of combinedMessages) {
      nextItems.push({ kind: 'message', key: String(message._id), message })
    }
    return nextItems
  }, [channelName, combinedMessages, hasMore, isLoadingMore])

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return
    const element = listRef.current?.element
    if (element) {
      pendingLoadMoreRef.current = {
        scrollHeight: element.scrollHeight,
        scrollTop: element.scrollTop,
      }
    }
    onLoadMore()
  }, [hasMore, isLoadingMore, onLoadMore, listRef])

  useEffect(() => {
    const element = listRef.current?.element
    if (!element) return

    const nodes = element.querySelectorAll('[data-row-index]')
    return rowHeight.observeRowElements(nodes)
  }, [items.length, listRef, rowHeight])

  useEffect(() => {
    const element = listRef.current?.element
    if (!element) return

    const handleScroll = () => {
      const distanceFromBottom = element.scrollHeight - (element.scrollTop + element.clientHeight)
      isAtBottomRef.current = distanceFromBottom < 96
    }

    handleScroll()
    element.addEventListener('scroll', handleScroll)
    return () => element.removeEventListener('scroll', handleScroll)
  }, [channelId, items.length, listRef])

  useEffect(() => {
    const element = listRef.current?.element
    if (!element) return

    const pending = pendingLoadMoreRef.current
    const currentCount = items.length
    const previousCount = lastItemCountRef.current
    lastItemCountRef.current = currentCount

    if (pending) {
      const delta = element.scrollHeight - pending.scrollHeight
      element.scrollTop = pending.scrollTop + delta
      pendingLoadMoreRef.current = null
      return
    }

    if (currentCount > previousCount && isAtBottomRef.current) {
      const lastIndex = currentCount - 1
      if (lastIndex < 0) return
      requestAnimationFrame(() => {
        try {
          listRef.current?.scrollToRow({ index: lastIndex, align: 'end', behavior: 'instant' })
        } catch {
          // Ignore out-of-range errors during rapid channel swaps.
        }
      })
    }
  }, [items.length, listRef])

  const rowProps = useMemo(
    () => ({
      items,
      channelName,
      currentUserId,
      userSettings,
      stickerMap,
      onReact,
      onDelete,
      onReport,
      onRetry,
      onLoadMore: handleLoadMore,
      hasMore,
      isLoadingMore,
    }),
    [
      channelName,
      currentUserId,
      handleLoadMore,
      hasMore,
      isLoadingMore,
      items,
      onDelete,
      onReact,
      onReport,
      onRetry,
      stickerMap,
      userSettings,
    ]
  )

  if (!channelName && combinedMessages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-10 text-[#808080]">
        No messages yet. Be the first to say something!
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-2">
      <List
        listRef={listRef}
        defaultHeight={listHeight}
        rowCount={items.length}
        rowHeight={rowHeight}
        rowComponent={Row}
        rowProps={rowProps}
        overscanCount={6}
        style={{ height: listHeight }}
      />
    </div>
  )
}

type RowData = {
  items: ThreadItem[]
  channelName?: string
  currentUserId?: Id<'users'>
  userSettings: UserSettingsView
  stickerMap: Map<string, ChatSticker>
  onReact: (message: ChatMessage | OptimisticMessage, emoji: string) => void
  onDelete: (message: ChatMessage | OptimisticMessage) => void
  onReport: (messageId: Id<'messages'>, reason: string, note?: string) => Promise<void>
  onRetry: (tempId: string) => Promise<void>
  onLoadMore: () => void
  hasMore: boolean
  isLoadingMore: boolean
}

function Row({
  index,
  style,
  items,
  currentUserId,
  userSettings,
  stickerMap,
  onReact,
  onDelete,
  onReport,
  onRetry,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: RowComponentProps<RowData>) {
  const item = items[index]
  if (!item) {
    return <div style={style} />
  }

  if (item.kind === 'loadMore') {
    return (
      <div style={style} data-row-index={index} className="px-4 py-3">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={!hasMore || isLoadingMore}
            className="rounded-full border border-[#2a2a2a] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#c41e3a] transition-colors hover:border-[#c41e3a] hover:text-[#ff4d6d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingMore ? 'Loading...' : hasMore ? 'Load more messages' : 'Up to date'}
          </button>
        </div>
      </div>
    )
  }

  if (item.kind === 'welcome') {
    return (
      <div style={style} data-row-index={index} className="px-4 pb-4 pt-8">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1a1a1a]">
          <span className="text-3xl font-light text-white">#</span>
        </div>
        <h1 className="mb-1 text-3xl font-extrabold text-white">Welcome to #{item.channelName}!</h1>
        <p className="text-sm text-[#808080]">This is the start of the #{item.channelName} channel.</p>
        <div className="mt-6 h-px w-full bg-[#1a1a1a]" />
      </div>
    )
  }

  const previousItem = index > 0 ? items[index - 1] : undefined
  const previousMessage = previousItem?.kind === 'message' ? previousItem.message : undefined
  const isStacked =
    previousMessage &&
    previousMessage.authorId === item.message.authorId &&
    item.message.createdAt - previousMessage.createdAt < STACK_WINDOW_MS

  const tempMessage = isTempId(String(item.message._id))
  const reactionsDisabled = tempMessage || item.message.status === 'failed'
  const reportDisabled = tempMessage || item.message.isDeleted || item.message.status === 'failed'

  return (
    <div style={style} data-row-index={index} className="px-2">
      <MessageItem
        message={item.message}
        currentUserId={currentUserId}
        isPinned={item.message.isPinned ?? false}
        isStacked={Boolean(isStacked)}
        compactMode={userSettings.compactMode}
        autoplayMedia={userSettings.autoplayMedia}
        showStickers={userSettings.showStickers}
        stickerMap={stickerMap}
        onReact={reactionsDisabled ? undefined : onReact}
        onDelete={onDelete}
        onReport={reportDisabled ? undefined : onReport}
        onRetry={onRetry}
      />
    </div>
  )
}
