import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id, Thread } from '../types/forum'
import { useAuth } from '../hooks/useAuth'
import { useForumThreadDetail } from '../hooks/useForumThreadDetail'
import { useCreateReply } from '../hooks/useCreateReply'
import { ThreadDetail, ThreadForm } from '../components/Forum'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

export function ForumThreadDetail() {
  const { threadId } = useParams<{ threadId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const animate = useScrollAnimation()

  const parsedThreadId = (threadId as Id<'threads'> | undefined) ?? null

  const { thread, replies, isLoading } = useForumThreadDetail(parsedThreadId)
  const { handleCreateReply } = useCreateReply(parsedThreadId)

  const editThreadMutation = useMutation(api.forum.editThread)
  const deleteThreadMutation = useMutation(api.forum.deleteThread)

  const [isThreadFormOpen, setIsThreadFormOpen] = useState(false)
  const [editingThread, setEditingThread] = useState<Thread | null>(null)

  const isModerator = user?.role === 'mod' || user?.role === 'admin'

  const notFoundMessage = useMemo(() => {
    if (!threadId) return 'Thread not found'
    return 'Thread not found or unavailable'
  }, [threadId])

  if (!user) {
    return <div className="text-center py-8 text-gray-400">Please sign in to access the forum</div>
  }

  return (
    <div className="thread-detail-container">
      <header ref={animate} data-animate className="thread-detail-header">
        <button
          type="button"
          onClick={() => navigate('/forum')}
          className="back-btn"
        >
          <iconify-icon icon="solar:arrow-left-linear"></iconify-icon>
          <span>Back to Feed</span>
        </button>
      </header>

      <div className="thread-detail-body">
        {isLoading ? (
          <div className="loading-state">
             <iconify-icon icon="solar:refresh-linear" className="animate-spin"></iconify-icon>
             <span>Loading context...</span>
          </div>
        ) : !thread ? (
          <div className="empty-state">
            <p className="text-gray-400">{notFoundMessage}</p>
          </div>
        ) : (
          <ThreadDetail
            thread={thread}
            replies={replies}
            currentUserId={user._id}
            onReply={handleCreateReply}
            onEdit={() => {
              setEditingThread(thread)
              setIsThreadFormOpen(true)
            }}
            onDelete={async () => {
              await deleteThreadMutation({ threadId: thread._id, categoryId: thread.categoryId })
              navigate('/forum')
            }}
            isModerator={Boolean(isModerator)}
          />
        )}
      </div>

      {isThreadFormOpen && editingThread && (
        <ThreadForm
          initialCategoryId={editingThread.categoryId}
          initialData={{ title: editingThread.title, content: editingThread.content, tags: editingThread.tags }}
          onCancel={() => setIsThreadFormOpen(false)}
          onSubmit={async (_categoryId, title, content, _tags) => {
            await editThreadMutation({ threadId: editingThread._id, newTitle: title, newContent: content })
            setIsThreadFormOpen(false)
          }}
        />
      )}

      <style>{`
        .thread-detail-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: rgba(10, 10, 10, 0.4);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid var(--color-card-border);
        }

        .thread-detail-header {
          padding: 16px 24px;
          border-bottom: 1px solid var(--color-card-border);
        }

        .back-btn {
          background: transparent;
          border: none;
          color: var(--color-text-dim);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .back-btn:hover { color: white; transform: translateX(-4px); }

        .thread-detail-body {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
        }

        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 16px;
          color: var(--color-text-dim);
        }
      `}</style>
    </div>
  )
}
