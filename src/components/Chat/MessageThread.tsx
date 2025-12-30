import { useEffect, useRef } from 'react'
import { MessageItem } from './MessageItem'

interface MessageThreadProps {
  messages: any[]
  optimisticMessages: any[]
  isLoading: boolean
  onLoadMore: () => void
  hasMore: boolean
}

export function MessageThread({ messages, optimisticMessages, isLoading, onLoadMore, hasMore }: MessageThreadProps) {
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
    <div ref={threadRef} className="flex flex-col h-full space-y-4">
      {/* Load More Button */}
      {hasMore && (
        <div className="text-center py-2">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load more messages'}
          </button>
        </div>
      )}

      {/* Messages */}
      {allMessages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">No messages yet. Be the first to say something!</p>
        </div>
      ) : (
        allMessages.map((message) => (
          <MessageItem
            key={message._id}
            message={message as any}
            currentUserId="current-user-id" // This would come from auth context
            isPinned={message.isPinned ?? false}
          />
        ))
      )}

      {/* Loading indicator for new messages */}
      {isLoading && (
        <div className="flex justify-center py-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-500"></div>
        </div>
      )}
    </div>
  )
}