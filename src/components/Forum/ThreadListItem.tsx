import { memo, useMemo, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { Thread, VoteDirection } from '../../types/forum'
import { VoteButtons } from './VoteButtons'
import { useThreadVote } from '../../hooks/useThreadVote'

interface ThreadListItemProps {
  thread: Thread
  isSelected: boolean
  onClick: (threadId: Thread['_id']) => void
  onVote?: (threadId: Thread['_id'], direction: VoteDirection) => void
}

const formatRelativeTime = (timestamp: number) => {
  const now = Date.now()
  const diff = Math.max(0, now - timestamp)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

const tierStyles: Record<Thread['authorTier'], string> = {
  bronze: 'bg-amber-600/20 text-amber-200 border-amber-600/30',
  silver: 'bg-gray-300/20 text-gray-100 border-gray-300/30',
  gold: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
  platinum: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/30',
}

export const ThreadListItem = memo(function ThreadListItem({
  thread,
  isSelected,
  onClick,
  onVote,
}: ThreadListItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  const { votes, handleVote, isLoading } = useThreadVote({
    threadId: thread._id,
    initialUpCount: thread.upVoteCount,
    initialDownCount: thread.downVoteCount,
    initialNetCount: thread.netVoteCount,
    initialUserVote: thread.userVote,
  })

  const excerpt = useMemo(() => {
    const text = thread.content.trim().replace(/\s+/g, ' ')
    if (text.length <= 100) return text
    return `${text.slice(0, 100)}…`
  }, [thread.content])

  const lastActivity = thread.lastReplyAt ?? thread.createdAt

  const showModBadge = thread.authorRole === 'mod' || thread.authorRole === 'admin'

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick(thread._id)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(thread._id)}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={
        `w-full text-left rounded-xl border p-4 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/60 ` +
        `${isSelected ? 'border-cyan-500/60 bg-cyan-500/10' : 'border-gray-700 bg-gray-900/30 hover:bg-gray-800/40'}`
      }
      aria-current={isSelected ? 'true' : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold truncate">{thread.title}</h3>
            {thread.isPinned && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-200 border border-yellow-500/30">
                📌 Pinned
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={thread.authorAvatar}
                alt={thread.authorDisplayName}
                loading="lazy"
                className="h-6 w-6 rounded-full border border-gray-700 object-cover"
              />
              <span className="text-gray-200 truncate">{thread.authorDisplayName}</span>
            </div>

            <span className={`border rounded-full px-2 py-0.5 ${tierStyles[thread.authorTier]}`}>
              {thread.authorTier.toUpperCase()}
            </span>

            {showModBadge && (
              <span className="border rounded-full px-2 py-0.5 bg-purple-600/20 text-purple-200 border-purple-600/30">
                MOD
              </span>
            )}

            <span>•</span>
            <span>{formatRelativeTime(lastActivity)}</span>
          </div>

          {thread.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {thread.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded-full bg-gray-700/40 text-gray-200 border border-gray-600/40"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {isHovered && excerpt && (
            <p className="mt-3 text-sm text-gray-300 line-clamp-2">{excerpt}</p>
          )}
        </div>

        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            <VoteButtons
              upCount={votes.upVoteCount}
              downCount={votes.downVoteCount}
              userVote={votes.userVote}
              onVote={async (direction) => {
                await handleVote(direction)
                onVote?.(thread._id, direction)
              }}
              isLoading={isLoading}
            />
          </div>

          <div className="text-xs text-gray-300">
            <span className="mr-2">💬 {thread.replyCount}</span>
          </div>
        </div>
      </div>
    </div>
  )
})
