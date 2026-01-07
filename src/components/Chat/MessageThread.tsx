import { useEffect, useRef } from 'react'
import { MessageItem } from './MessageItem'

interface MessageThreadProps {
  messages: any[]
  optimisticMessages: any[]
  isLoading: boolean
  onLoadMore: () => void
  hasMore: boolean
  channelName?: string
}

export function MessageThread({ messages, optimisticMessages, isLoading, onLoadMore, hasMore, channelName }: MessageThreadProps) {
  const threadRef = useRef<HTMLDivElement>(null)

  // Combine regular and optimistic messages, sorted by createdAt
  const allMessages = [...messages, ...optimisticMessages].sort((a, b) => 
    a.createdAt - b.createdAt
  )

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
    }
  }, [allMessages])

  return (
    <div ref={threadRef} className="flex flex-col px-4">
      {/* Load More Button */}
      {hasMore && (
        <div className="text-center py-2">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="text-[#c41e3a] hover:text-[#ff3355] text-sm transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load more messages'}
          </button>
        </div>
      )}

      {/* Welcome Section - scrolls with messages */}
      {channelName && (
        <div className="pb-4">
          <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4">
            <span className="text-white text-3xl font-light">#</span>
          </div>
          <h1 className="text-white text-3xl font-extrabold mb-1">Welcome to #{channelName}!</h1>
          <p className="text-[#808080]">This is the start of the #{channelName} channel.</p>
          <div className="h-[1px] bg-[#1a1a1a] w-full mt-6"></div>
        </div>
      )}

      {/* Messages */}
      {allMessages.length === 0 && !channelName ? (
        <div className="flex-1 flex items-center justify-center py-8">
          <p className="text-[#808080]">No messages yet. Be the first to say something!</p>
        </div>
      ) : (
        allMessages.map((message, index) => {
          const prevMessage = allMessages[index - 1]
          const isSameUser = prevMessage && prevMessage.authorId === message.authorId
          const isWithinTimeRange = prevMessage && (message.createdAt - prevMessage.createdAt) < 5 * 60 * 1000 // 5 minutes
          const isStacked = isSameUser && isWithinTimeRange

          return (
            <MessageItem
              key={message._id}
              message={message}
              currentUserId=""
              isPinned={message.isPinned ?? false}
              isStacked={isStacked}
            />
          )
        })
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#c41e3a]"></div>
        </div>
      )}
    </div>
  )
}