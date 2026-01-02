import { useEffect, useMemo, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id, Thread, ThreadSortBy } from '../types/forum'
import { useAuth } from '../hooks/useAuth'
import { useForumCategories } from '../hooks/useForumCategories'
import { useForumThreads } from '../hooks/useForumThreads'
import { useForumThreadDetail } from '../hooks/useForumThreadDetail'
import { useCreateThread } from '../hooks/useCreateThread'
import { useCreateReply } from '../hooks/useCreateReply'
import { CategoryList, ThreadDetail, ThreadForm, ThreadList } from '../components/Forum'

export function Forum() {
  const { user } = useAuth()

  const { categories, isLoading: isCategoriesLoading } = useForumCategories()
  const [selectedCategoryId, setSelectedCategoryId] = useState<Id<'categories'> | null>(null)
  const [selectedThreadId, setSelectedThreadId] = useState<Id<'threads'> | null>(null)
  const [sortBy, setSortBy] = useState<ThreadSortBy>('newest')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isThreadFormOpen, setIsThreadFormOpen] = useState(false)
  const [editingThread, setEditingThread] = useState<Thread | null>(null)

  const selectedCategory = useMemo(() => {
    return categories.find((c) => c._id === selectedCategoryId) ?? null
  }, [categories, selectedCategoryId])

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0]._id)
    }
  }, [categories, selectedCategoryId])

  const { threads, isLoading: isThreadsLoading, hasMore, fetchMore } = useForumThreads({
    categoryId: selectedCategoryId,
    sortBy,
    limit: 20,
  })

  const { thread, replies, isLoading: isThreadDetailLoading } = useForumThreadDetail(selectedThreadId)
  const { handleCreateThread } = useCreateThread(selectedCategoryId)
  const { handleCreateReply } = useCreateReply(selectedThreadId)
  const editThreadMutation = useMutation(api.forum.editThread)
  const deleteThreadMutation = useMutation(api.forum.deleteThread)

  if (!user) {
    return <div className="text-center py-8 text-gray-400">Please sign in to access the forum</div>
  }

  const isModerator = user.role === 'mod' || user.role === 'admin'

  const handleSelectCategory = (categoryId: Id<'categories'>) => {
    setSelectedCategoryId(categoryId)
    setSelectedThreadId(null)
    setIsMobileSidebarOpen(false)
  }

  const handleSelectThread = (threadId: Id<'threads'>) => {
    setSelectedThreadId(threadId)
  }

  const openCreateThread = () => {
    setEditingThread(null)
    setIsThreadFormOpen(true)
  }

  const handleDeleteThread = async () => {
    if (!selectedThreadId || !selectedCategoryId) return
    await deleteThreadMutation({ threadId: selectedThreadId, categoryId: selectedCategoryId })
    setSelectedThreadId(null)
  }

  return (
    <div className="forum-container h-full">
      <aside className={`forum-sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
        <CategoryList
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
          isLoading={isCategoriesLoading}
        />
      </aside>

      <main className="forum-main">
        <header className="forum-main-header">
           <div className="header-left">
             <h2 className="selected-category-name">{selectedCategory?.name || 'Forum'}</h2>
             <span className="thread-count">{threads.length} Threads</span>
           </div>
           <div className="header-actions">
             <button onClick={openCreateThread} className="create-thread-btn border-beam">
               <iconify-icon icon="solar:pen-new-square-linear"></iconify-icon>
               <span>New Thread</span>
             </button>
           </div>
        </header>

        <div className="forum-content">
          {selectedThreadId ? (
            <div className="thread-detail-view">
               <button className="back-btn" onClick={() => setSelectedThreadId(null)}>
                 <iconify-icon icon="solar:arrow-left-linear"></iconify-icon> Back to Feed
               </button>
               {isThreadDetailLoading ? <div>Loading...</div> : !thread ? <div>Not Found</div> : (
                 <ThreadDetail
                   thread={thread}
                   replies={replies}
                   currentUserId={user._id}
                   onReply={handleCreateReply}
                   onEdit={() => { setEditingThread(thread); setIsThreadFormOpen(true); }}
                   onDelete={handleDeleteThread}
                   isModerator={isModerator}
                 />
               )}
            </div>
          ) : (
            <ThreadList
              categoryId={selectedCategoryId}
              threads={threads}
              selectedThreadId={selectedThreadId}
              isLoading={isThreadsLoading}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onSelectThread={handleSelectThread}
              hasMore={hasMore}
              fetchMore={fetchMore}
            />
          )}
        </div>
      </main>

      {isThreadFormOpen && (
        <ThreadForm
          categoryId={selectedCategoryId}
          initialData={editingThread ? { title: editingThread.title, content: editingThread.content, tags: editingThread.tags } : undefined}
          onCancel={() => setIsThreadFormOpen(false)}
          onSubmit={async (title, content, tags) => {
            if (editingThread) {
              await editThreadMutation({ threadId: editingThread._id, newTitle: title, newContent: content })
            } else {
              await handleCreateThread(title, content, tags)
            }
            setIsThreadFormOpen(false)
          }}
        />
      )}

      <style>{`
        .forum-container {
          display: flex;
          width: 100%;
          height: 100%;
          background: rgba(10, 10, 10, 0.6);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid var(--color-card-border);
          overflow: hidden;
        }

        .forum-sidebar {
          width: 280px;
          border-right: 1px solid var(--color-card-border);
          background: rgba(5, 5, 5, 0.3);
        }

        .forum-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .forum-main-header {
          padding: 16px 24px;
          border-bottom: 1px solid var(--color-card-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(10, 10, 10, 0.4);
        }

        .selected-category-name {
          font-size: 18px;
          font-weight: 800;
          margin: 0;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .thread-count {
          font-size: 11px;
          color: var(--color-text-dim);
          font-weight: 600;
        }

        .create-thread-btn {
          background: var(--color-primary);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .forum-content {
          flex: 1;
          overflow: hidden;
        }

        .thread-detail-view {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 24px;
          overflow-y: auto;
        }

        .back-btn {
          background: transparent;
          border: none;
          color: var(--color-text-dim);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
          width: fit-content;
        }

        .back-btn:hover { color: white; }

        @media (max-width: 768px) {
          .forum-sidebar { display: none; }
          .forum-sidebar.mobile-open { display: block; position: fixed; inset: 0; z-index: 1000; }
        }
      `}</style>
    </div>
  )
}
