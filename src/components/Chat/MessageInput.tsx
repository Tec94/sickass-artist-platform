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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
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
    <div className="relative flex-1">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="absolute -top-8 left-0 bg-[#c41e3a]/80 text-white text-xs px-3 py-1 rounded-full z-10">
          Offline - messages will sync when online
        </div>
      )}

      {/* Message Input */}
      <textarea
        ref={textareaRef}
        value={messageContent}
        onChange={(e) => setMessageContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isOnline ? `Message #general` : `Message #general (offline)`}
        disabled={isSending}
        rows={1}
        className={`w-full min-h-[24px] max-h-[120px] bg-transparent text-[#e0e0e0] text-sm resize-none focus:outline-none placeholder:text-[#505050] ${
          sendError ? 'text-[#c41e3a]' : ''
        }`}
      />

      {/* Error message */}
      {sendError && (
        <div className="text-[#c41e3a] text-xs mt-1">
          {sendError}
        </div>
      )}

      {/* Retry button for failed optimistic messages */}
      {optimisticMessages.some(msg => msg.status === 'failed') && (
        <div className="mt-1">
          <button
            onClick={() => {
              // Retry logic would go here
            }}
            className="text-[#c41e3a] hover:text-[#ff3355] text-xs transition-colors"
          >
            Retry failed messages
          </button>
        </div>
      )}
    </div>
  )
}