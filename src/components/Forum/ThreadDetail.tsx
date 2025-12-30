import { memo, useMemo, useState } from 'react'
import type { Id, Reply, Thread, VoteDirection } from '../../types/forum'
import { VoteButtons } from './VoteButtons'
import { ReplyItem } from './ReplyItem'
import { useThreadVote } from '../../hooks/useThreadVote'

interface ThreadDetailProps {
  thread: Thread
  replies: Reply[]
  currentUserId: Id<'users'>
  onVote?: (threadId: Thread['_id'], direction: VoteDirection) => void
  onReply: (content: string) => Promise<void>
  onEdit: () => void
  onDelete: () => Promise<void>
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

const tierStyles: Record<Thread['authorTier'], string> = {
  bronze: 'bg-amber-600/20 text-amber-200 border-amber-600/30',
  silver: 'bg-gray-300/20 text-gray-100 border-gray-300/30',
  gold: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
  platinum: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/30',
}

export const ThreadDetail = memo(function ThreadDetail({
  thread,
  replies,
  currentUserId,
  onVote,
  onReply,
  onEdit,
  onDelete,
  isModerator = false,
}: ThreadDetailProps) {
  const [replyContent, setReplyContent] = useState('')
  const [replyError, setReplyError] = useState<string | null>(null)
  const [isReplySubmitting, setIsReplySubmitting] = useState(false)

  const { votes, handleVote, isLoading: isVoteLoading } = useThreadVote({
    threadId: thread._id,
    initialUpCount: thread.upVoteCount,
    initialDownCount: thread.downVoteCount,
    initialNetCount: thread.netVoteCount,
    initialUserVote: thread.userVote,
  })

  const isEdited = thread.updatedAt > thread.createdAt + 1000

  const canEdit = useMemo(() => {
    return isModerator || thread.authorId === currentUserId
  }, [currentUserId, isModerator, thread.authorId])

  const authorIsMod = thread.authorRole === 'mod' || thread.authorRole === 'admin'

  const handleSubmitReply = async () => {
    const trimmed = replyContent.trim()
    if (!trimmed) {
      setReplyError('Reply cannot be empty')
      return
    }

    setReplyError(null)
    setIsReplySubmitting(true)

    try {
      await onReply(trimmed)
      setReplyContent('')
    } catch (err) {
      setReplyError((err as Error).message)
    } finally {
      setIsReplySubmitting(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      <div className="rounded-2xl border border-gray-700 bg-gray-900/30 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white break-words">{thread.title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-300">
              <img
                src={thread.authorAvatar}
                alt={thread.authorDisplayName}
                loading="lazy"
                className="h-10 w-10 rounded-full border border-gray-700 object-cover"
              />
              <span className="font-semibold text-white">{thread.authorDisplayName}</span>

              <span className={`border rounded-full px-2 py-0.5 text-xs ${tierStyles[thread.authorTier]}`}>
                {thread.authorTier.toUpperCase()}
              </span>

              {authorIsMod && (
                <span className="border rounded-full px-2 py-0.5 text-xs bg-purple-600/20 text-purple-200 border-purple-600/30">
                  MOD
                </span>
              )}

              <span className="text-gray-500">•</span>
              <span className="text-gray-400">{formatRelativeTime(thread.createdAt)}</span>
              {isEdited && <span className="text-gray-500">(edited)</span>}

              {thread.isPinned && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-200 border border-yellow-500/30">
                  📌 Pinned
                </span>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col items-end gap-2">
            <VoteButtons
              upCount={votes.upVoteCount}
              downCount={votes.downVoteCount}
              userVote={votes.userVote}
              onVote={async (direction) => {
                await handleVote(direction)
                onVote?.(thread._id, direction)
              }}
              isLoading={isVoteLoading}
            />

            {canEdit && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onEdit}
                  className="text-sm px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-900/30 text-gray-200 hover:bg-gray-800/50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void onDelete()
                  }}
                  className="text-sm px-3 py-1.5 rounded-lg border border-red-600/40 bg-red-600/10 text-red-200 hover:bg-red-600/20"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {thread.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
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

        <div className="mt-5 text-gray-200 leading-relaxed whitespace-pre-wrap break-words">
          {thread.content}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-white font-bold text-lg">Replies ({replies.length})</h2>
        {replies.length === 0 ? (
          <p className="text-gray-400">No replies yet. Be the first to reply.</p>
        ) : (
          <div className="space-y-3">
            {replies.map((reply) => (
              <ReplyItem
                key={reply._id}
                reply={reply}
                currentUserId={currentUserId}
                isModerator={isModerator}
              />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-700 bg-gray-900/30 p-5">
        <h3 className="text-white font-bold text-lg">Create Reply</h3>
        <textarea
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          rows={4}
          maxLength={5000}
          placeholder="Write your reply..."
          className="mt-3 w-full rounded-xl border border-gray-700 bg-gray-900/30 text-gray-100 p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xs text-gray-400">{replyContent.length}/5000</span>
          <button
            type="button"
            onClick={handleSubmitReply}
            disabled={isReplySubmitting}
            className={
              `px-4 py-2 rounded-xl font-semibold border transition-colors ` +
              `${isReplySubmitting ? 'cursor-not-allowed opacity-60 border-gray-700 bg-gray-800/40 text-gray-300' : 'border-cyan-500/60 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30'}`
            }
          >
            {isReplySubmitting ? 'Posting…' : 'Post Reply'}
          </button>
        </div>

        {replyError && <p className="mt-2 text-sm text-red-300">{replyError}</p>}
      </div>
    </div>
  )
})
