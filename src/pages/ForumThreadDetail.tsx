import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id, Thread } from '../types/forum'
import { useAuth } from '../hooks/useAuth'
import { useForumThreadDetail } from '../hooks/useForumThreadDetail'
import { useCreateReply } from '../hooks/useCreateReply'
import { ThreadDetail, ThreadForm } from '../components/Forum'

export function ForumThreadDetail() {
  const { threadId } = useParams<{ threadId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

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
    <div className="h-full w-full bg-gray-900/80 backdrop-blur-sm rounded-lg overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/2')}
          className="text-gray-300 hover:text-white"
        >
          ← Back to forum
        </button>
      </div>

      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">Loading thread…</div>
        ) : !thread ? (
          <div className="flex-1 flex items-center justify-center">
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
              await deleteThreadMutation({ threadId: thread._id })
              navigate('/2')
            }}
            isModerator={Boolean(isModerator)}
          />
        )}
      </div>

      {isThreadFormOpen && editingThread && (
        <ThreadForm
          categoryId={editingThread.categoryId}
          initialData={{ title: editingThread.title, content: editingThread.content, tags: editingThread.tags }}
          onCancel={() => setIsThreadFormOpen(false)}
          onSubmit={async (title, content) => {
            await editThreadMutation({ threadId: editingThread._id, title, content })
            setIsThreadFormOpen(false)
          }}
        />
      )}
    </div>
  )
}
