import { useState, useEffect, useRef } from 'react'
import { useOptimisticMessage } from '../../hooks/useOptimisticMessage'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useAuth } from '../../hooks/useAuth'
import type { Id } from '../../types/chat'

interface MessageInputProps {
  channelId: Id<'channels'>
  onMessageSent?: (message: any) => void
}

export function MessageInput({ channelId, onMessageSent }: MessageInputProps) {
  const [messageContent, setMessageContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { isOnline } = useOnlineStatus()
  const { user } = useAuth()
  const { handleSendMessage, optimisticMessages } = useOptimisticMessage({ channelId })

  // Auto-focus on channel change
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [channelId])

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [messageContent])

  const handleSend = async () => {
    if (!messageContent.trim() || !user || isSending) return

    setIsSending(true)
    setSendError(null)

    try {
      const idempotencyKey = `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`
      
      const result = await handleSendMessage(
        messageContent,
        user.displayName || user.username,
        user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
        idempotencyKey
      )

      if (result) {
        setMessageContent('')
        onMessageSent?.(result)
      } else {
        setSendError('Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setSendError('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="relative">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="absolute -top-8 left-0 bg-red-600/80 text-white text-xs px-3 py-1 rounded-full z-10">
          Offline - messages will sync when online
        </div>
      )}

      {/* Message Input */}
      <div className="flex flex-col gap-2">
        <textarea
          ref={textareaRef}
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isOnline ? `Message #channel (Shift+Enter to send)` : `Message #channel (offline)`}
          disabled={isSending}
          className={`w-full min-h-[48px] max-h-[120px] p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${
            sendError ? 'border-red-500' : ''
          }`}
        />

        {/* Character count and send button */}
        <div className="flex items-center justify-between">
          <div className="text-gray-400 text-xs">
            {messageContent.length}/500 characters
          </div>

          <button
            onClick={handleSend}
            disabled={isSending || !messageContent.trim() || !isOnline}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 ${
              isSending
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : !messageContent.trim()
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-700 text-white'
            }`}
          >
            {isSending ? (
              <>
                <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></span>
                Sending...
              </>
            ) : (
              'Send'
            )}
          </button>
        </div>

        {/* Error message */}
        {sendError && (
          <div className="text-red-400 text-sm mt-1">
            {sendError}
          </div>
        )}

        {/* Retry button for failed optimistic messages */}
        {optimisticMessages.some(msg => msg.status === 'failed') && (
          <div className="mt-2">
            <button
              onClick={() => {
                // Retry logic would go here
                // In a real app, you'd retry sending these messages
              }}
              className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
            >
              Retry failed messages
            </button>
          </div>
        )}
      </div>
    </div>
  )
}