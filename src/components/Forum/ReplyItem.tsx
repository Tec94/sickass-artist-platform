import { memo } from 'react'
import type { Reply, VoteDirection } from '../../types/forum'
import { VoteButtons } from './VoteButtons'
import { useReplyVoteExtended } from '../../hooks/useReplyVoteExtended'

interface ReplyItemProps {
  reply: Reply
  currentUserId: Reply['authorId']
  onVote?: (replyId: Reply['_id'], direction: VoteDirection) => void
  onEdit?: (replyId: Reply['_id']) => void
  onDelete?: (replyId: Reply['_id']) => void
  isModerator?: boolean
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

const tierStyles: Record<Reply['authorTier'], string> = {
  bronze: 'bg-amber-600/20 text-amber-200 border-amber-600/30',
  silver: 'bg-gray-300/20 text-gray-100 border-gray-300/30',
  gold: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
  platinum: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/30',
}

export const ReplyItem = memo(function ReplyItem({
  reply,
  currentUserId,
  onVote,
  onEdit,
  onDelete,
  isModerator = false,
}: ReplyItemProps) {
  const { votes, handleVote, isLoading } = useReplyVoteExtended({
    replyId: reply._id,
    initialUpCount: reply.upVoteCount,
    initialDownCount: reply.downVoteCount,
    initialUserVote: reply.userVote,
  })

  const canEdit = isModerator || reply.authorId === currentUserId

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900/20 p-4 ml-3">
      <div className="flex items-start gap-3">
        <img
          src={reply.authorAvatar}
          alt={reply.authorDisplayName}
          loading="lazy"
          className="h-10 w-10 rounded-full border border-gray-700 object-cover flex-shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-white font-semibold">{reply.authorDisplayName}</span>
            <span className={`border rounded-full px-2 py-0.5 text-xs ${tierStyles[reply.authorTier]}`}>
              {reply.authorTier.toUpperCase()}
            </span>

            {(reply.authorRole === 'mod' || reply.authorRole === 'admin') && (
              <span className="border rounded-full px-2 py-0.5 text-xs bg-purple-600/20 text-purple-200 border-purple-600/30">
                MOD
              </span>
            )}

            <span className="text-xs text-gray-400">{formatRelativeTime(reply.createdAt)}</span>
            {reply.editedAt && (
              <span className="text-xs text-gray-500">(edited)</span>
            )}
          </div>

          <div className="mt-2 text-gray-200 text-sm whitespace-pre-wrap break-words">
            {reply.content}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <VoteButtons
              upCount={votes.upVoteCount}
              downCount={votes.downVoteCount}
              userVote={votes.userVote}
              onVote={async (direction) => {
                await handleVote(direction)
                onVote?.(reply._id, direction)
              }}
              isLoading={isLoading}
            />

            {canEdit && (
              <div className="flex items-center gap-2">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(reply._id)}
                    className="text-xs px-2 py-1 rounded-md border border-gray-700 bg-gray-900/30 text-gray-200 hover:bg-gray-800/50"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      void onDelete(reply._id)
                    }}
                    className="text-xs px-2 py-1 rounded-md border border-red-600/40 bg-red-600/10 text-red-200 hover:bg-red-600/20"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
