import { useState } from 'react'
import { ProfileAvatar } from '../Profile/ProfileAvatar'
import { FanStatusBadge } from '../Profile/FanStatusBadge'
import { ReactionPicker } from './ReactionPicker'

interface MessageItemProps {
  message: any
  isPinned?: boolean
  onDelete?: () => void
  onReact?: (emoji: string) => void
  currentUserId: string
  isStacked?: boolean
}

export function MessageItem({ message, isPinned = false, onDelete, onReact, currentUserId, isStacked = false }: MessageItemProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [showActions, setShowActions] = useState(false)

  // Format timestamp as relative time
  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) return `${seconds}s ago`
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString()
  }

  // Mock user data for avatar - in real app this would come from context
  const mockUser = {
    _id: message.authorId,
    username: message.authorDisplayName,
    displayName: message.authorDisplayName,
    avatar: message.authorAvatar,
    fanTier: message.authorTier,
    level: 1,
    xp: 0
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowReactionPicker(!showReactionPicker)
  }

  const hasReactions = message.reactionEmojis && message.reactionEmojis.length > 0

  return (
    <div
      className={`flex items-start gap-3 px-3 py-0.5 hover:bg-[#1a1a1a]/50 transition-colors relative group/item ${
        isPinned ? 'border-l-2 border-[#c41e3a]' : ''
      } ${isStacked ? '' : 'mt-3'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onContextMenu={handleContextMenu}
    >
      {/* Avatar column - fixed width for alignment */}
      <div className="flex-shrink-0 w-10 pt-0.5">
        {!isStacked ? (
          <ProfileAvatar user={mockUser as any} size="sm" />
        ) : (
          <span className="text-[10px] text-[#808080] font-light opacity-0 group-hover/item:opacity-100 transition-opacity block text-center leading-[20px]">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Header - Only if not stacked */}
        {!isStacked && (
          <div className="flex items-center gap-2 leading-tight">
            <span className="text-white font-semibold text-sm">
              {message.authorDisplayName}
            </span>
            <div className="flex-shrink-0">
              <FanStatusBadge user={mockUser as any} size="sm" />
            </div>
            <span className="text-[#808080] text-[11px] font-medium">
              {formatTimestamp(message.createdAt)}
            </span>
            {isPinned && <span className="text-[#c41e3a] text-xs">📌</span>}
            {message.isDeleted && <span className="text-[#c41e3a] text-xs">[deleted]</span>}
          </div>
        )}

        {/* Message Text */}
        <div className={`text-[#e0e0e0] text-[15px] leading-snug whitespace-pre-wrap break-words ${
          message.isDeleted ? 'italic text-[#808080]' : ''
        }`}>
          {message.isDeleted ? '[deleted]' : message.content}
        </div>

        {/* Reactions - only render if there are reactions */}
        {hasReactions && (
          <div className="flex items-center gap-1 flex-wrap mt-1">
            {(message.reactionEmojis as string[]).map((emoji, index) => (
              <button
                key={index}
                className="flex items-center gap-1 px-1.5 py-0.5 bg-[#1a1a1a]/50 rounded-md text-xs hover:bg-[#2a2a2a]/50 transition-colors border border-[#2a2a2a]"
                onClick={() => onReact?.(emoji)}
              >
                <span>{emoji}</span>
                <span className="text-[#e0e0e0] font-medium">{message.reactionCount}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons - shown on hover */}
      <div className={`flex items-center gap-1 absolute top-0 right-4 bg-[#111] border border-[#2a2a2a] rounded-md px-1.5 py-1 shadow-2xl transition-all duration-200 z-10 ${
        (showActions || showReactionPicker) ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <button
          onClick={() => setShowReactionPicker(!showReactionPicker)}
          className="p-1 text-[#808080] hover:text-white hover:bg-[#1a1a1a] rounded transition-all"
          title="Add reaction (or right-click)"
        >
          <iconify-icon icon="solar:sticker-smiley-bold" style={{ fontSize: '16px' }}></iconify-icon>
        </button>

        {onDelete && message.authorId === currentUserId && (
          <button
            onClick={onDelete}
            className="p-1 text-[#808080] hover:text-[#c41e3a] hover:bg-[#1a1a1a] rounded transition-all"
            title="Delete message"
          >
            <iconify-icon icon="solar:trash-bin-trash-bold" style={{ fontSize: '16px' }}></iconify-icon>
          </button>
        )}
      </div>

      {/* Reaction Picker Popover */}
      {showReactionPicker && (
        <div className="absolute z-50 top-full right-4 mt-1">
          <div className="relative">
            <div 
              className="fixed inset-0 z-[-1]" 
              onClick={() => setShowReactionPicker(false)}
            ></div>
            <ReactionPicker
              onReact={(emoji) => {
                onReact?.(emoji)
                setShowReactionPicker(false)
              }}
              currentReactions={message.reactionEmojis || []}
            />
          </div>
        </div>
      )}
    </div>
  )
}