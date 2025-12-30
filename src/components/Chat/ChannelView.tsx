import { useState, useEffect, useRef } from 'react'
import { useChannelMessages } from '../../hooks/useChannelMessages'
import { useTypingIndicators } from '../../hooks/useTypingIndicators'
import { ChannelHeader } from './ChannelHeader'
import { MessageThread } from './MessageThread'
import { MessageInput } from './MessageInput'
import { TypingIndicator } from './TypingIndicator'
import type { Id } from '../../types/chat'

interface ChannelViewProps {
  channelId: Id<'channels'>
}

export function ChannelView({ channelId }: ChannelViewProps) {
  const { messages, isLoading, loadMore, hasMore } = useChannelMessages(channelId)
  const { typingUsers, isLoading: isTypingLoading } = useTypingIndicators(channelId)
  const [channelInfo, setChannelInfo] = useState<{ name: string; description: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock channel info - in a real app, this would come from a hook
  useEffect(() => {
    // This would be replaced with actual channel data fetching
    const mockChannelData = {
      name: 'General Chat',
      description: 'Main discussion channel for all users'
    }
    setChannelInfo(mockChannelData)
  }, [channelId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return (
    <div className="flex flex-col h-full w-full">
      {/* Channel Header */}
      {channelInfo && (
        <ChannelHeader
          name={channelInfo.name}
          description={channelInfo.description}
        />
      )}

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            <span className="ml-2 text-gray-400">Loading messages...</span>
          </div>
        ) : (
          <MessageThread
            messages={messages}
            optimisticMessages={[]}
            isLoading={isLoading}
            onLoadMore={loadMore}
            hasMore={hasMore}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {!isTypingLoading && typingUsers.length > 0 && (
        <div className="px-4 pb-2">
          <TypingIndicator typingUsers={typingUsers} />
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700">
        <MessageInput channelId={channelId} />
      </div>
    </div>
  )
}