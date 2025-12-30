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
}

export function MessageItem({ message, isPinned = false, onDelete, onReact, currentUserId }: MessageItemProps) {
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

  return (
    <div
      className={`flex gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors relative ${
        isPinned ? 'border-l-2 border-yellow-500' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <ProfileAvatar user={mockUser as any} size="sm" />
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
        <span className="text-white font-semibold text-sm">
          {message.authorDisplayName}
        </span>

        {/* Tier Badge */}
        <div className="flex-shrink-0">
          <FanStatusBadge user={mockUser as any} size="sm" />
        </div>

        <span className="text-gray-400 text-xs">
          {formatTimestamp(message.createdAt)}
        </span>

        {isPinned && (
          <span className="text-yellow-400 text-xs">📌</span>
        )}

        {message.isDeleted && (
          <span className="text-red-400 text-xs">[deleted]</span>
        )}
        </div>

        {/* Message Content */}
        <div className={`text-gray-200 text-sm whitespace-pre-wrap break-words ${
          message.isDeleted ? 'italic text-gray-500' : ''
        }`}>
          {message.isDeleted ? '[deleted]' : message.content}
        </div>

        {/* Reactions and Actions */}
        <div className="flex items-center gap-3 mt-2">
        {/* Reactions */}
        {message.reactionEmojis && message.reactionEmojis.length > 0 && (
          <div className="flex items-center gap-1">
            {(message.reactionEmojis as string[]).map((emoji, index) => (
                <button
                  key={index}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-700/50 rounded-full text-xs hover:bg-gray-600/50 transition-colors"
                  onClick={() => onReact?.(emoji)}
                >
                  <span>{emoji}</span>
                  <span className="text-gray-300">{message.reactionCount}</span>
                </button>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          {(showActions || showReactionPicker) && (
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                className="text-gray-400 hover:text-white transition-colors"
                title="Add reaction"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {onDelete && message.authorId === currentUserId && (
                <button
                  onClick={onDelete}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                  title="Delete message"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Reaction Picker */}
        {showReactionPicker && (
          <div className="mt-2">
            <ReactionPicker
              onReact={(emoji) => {
                onReact?.(emoji)
                setShowReactionPicker(false)
              }}
              currentReactions={message.reactionEmojis || []}
            />
          </div>
        )}
      </div>
    </div>
  )
}