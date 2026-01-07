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
    const trimmedContent = messageContent.trim()
    if (!trimmedContent || !user || isSending) return

    // Clear IMMEDIATELY for Discord-like feel
    setMessageContent('')
    setIsSending(true)
    setSendError(null)
    
    // Maintain focus
    textareaRef.current?.focus()

    try {
      const idempotencyKey = `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`
      
      const result = await handleSendMessage(
        trimmedContent,
        user.displayName || user.username,
        user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
        idempotencyKey
      )

      if (result) {
        onMessageSent?.(result)
      } else {
        setSendError('Failed to send message.')
        // Restore content if failed? Discord usually doesn't, but let's at least show error
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setSendError('Failed to send message.')
    } finally {
      setIsSending(false)
      // Double check focus
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="w-full">
      {/* Input container with all buttons included for better coordination */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 flex items-center gap-4 min-h-[44px]">
        {/* Upload Button */}
        <button 
          className="text-[#808080] hover:text-white transition-colors flex items-center justify-center flex-shrink-0"
          type="button"
        >
          <iconify-icon icon="solar:add-circle-bold" style={{ fontSize: '24px' }}></iconify-icon>
        </button>

        {/* Textarea Wrapper */}
        <div className="flex-1 flex items-center py-2 relative">
          {/* Offline indicator */}
          {!isOnline && (
            <div className="absolute -top-10 left-0 bg-[#c41e3a]/80 text-white text-[10px] px-2 py-0.5 rounded z-10 whitespace-nowrap">
              Offline - messages will sync when online
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isOnline ? `Message #general` : `Message #offline`}
            rows={1}
            className="w-full bg-transparent text-[#e0e0e0] text-sm resize-none focus:outline-none placeholder:text-[#505050] leading-[20px]"
          />
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-3 text-[#808080] flex-shrink-0">
          <button 
            className="hover:text-white transition-colors flex items-center justify-center"
            type="button"
          >
            <iconify-icon icon="solar:sticker-smiley-bold" style={{ fontSize: '22px' }}></iconify-icon>
          </button>
          
          <button 
            onClick={handleSend}
            disabled={!messageContent.trim()}
            className={`${messageContent.trim() ? 'text-[#c41e3a] hover:text-[#ff3355]' : 'text-[#333] cursor-not-allowed'} transition-colors flex items-center justify-center`}
            type="button"
          >
            <iconify-icon icon="solar:plain-bold" style={{ fontSize: '20px' }}></iconify-icon>
          </button>
        </div>
      </div>

      {/* Error and Retry indicators */}
      <div className="px-1 mt-1 flex flex-col gap-1">
        {sendError && (
          <div className="text-[#c41e3a] text-[10px] font-medium uppercase tracking-tight">
            {sendError}
          </div>
        )}
        
        {optimisticMessages.some(msg => msg.status === 'failed') && (
          <button
            onClick={() => {/* Retry logic */}}
            className="text-[#c41e3a] hover:text-[#ff3355] text-[10px] font-bold uppercase tracking-tight self-start"
          >
            Retry failed messages
          </button>
        )}
      </div>
    </div>
  )
}