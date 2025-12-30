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
import { CategoryFilter, CategoryList, ThreadDetail, ThreadForm, ThreadList } from '../components/Forum'

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

  const openEditThread = (t: Thread) => {
    setEditingThread(t)
    setIsThreadFormOpen(true)
  }

  const handleDeleteThread = async () => {
    if (!selectedThreadId) return

    await deleteThreadMutation({ threadId: selectedThreadId })
    setSelectedThreadId(null)
  }

  return (
    <div className="flex h-full w-full bg-gray-900/80 backdrop-blur-sm rounded-lg overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-800 p-2 rounded-lg border border-gray-700"
        aria-label="Toggle categories"
        type="button"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Category List - Sidebar */}
      <div
        className={
          `${isMobileSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-96 bg-gray-800/90 border-r border-gray-700 overflow-y-auto`
        }
      >
        <CategoryList
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
          isLoading={isCategoriesLoading}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full">
        <CategoryFilter
          category={selectedCategory}
          sortBy={sortBy}
          onSortChange={(next) => {
            setSortBy(next)
            setSelectedThreadId(null)
          }}
          onCreateThread={openCreateThread}
          onBackToCategories={() => setIsMobileSidebarOpen(true)}
        />

        {/* List vs Detail */}
        <div className="flex-1 min-h-0">
          {selectedThreadId ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-700 bg-gray-800/20 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedThreadId(null)}
                  className="text-gray-300 hover:text-white"
                >
                  ← Back to threads
                </button>
              </div>

              {isThreadDetailLoading ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">Loading thread…</div>
              ) : !thread ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-400">Thread not found or unavailable</p>
                </div>
              ) : (
                <ThreadDetail
                  thread={thread}
                  replies={replies}
                  currentUserId={user._id}
                  onReply={handleCreateReply}
                  onEdit={() => openEditThread(thread)}
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
      </div>

      {isThreadFormOpen && (
        <ThreadForm
          categoryId={selectedCategoryId}
          initialData={
            editingThread
              ? { title: editingThread.title, content: editingThread.content, tags: editingThread.tags }
              : undefined
          }
          onCancel={() => setIsThreadFormOpen(false)}
          onSubmit={async (title, content, tags) => {
            if (editingThread) {
              await editThreadMutation({ threadId: editingThread._id, title, content })
            } else {
              await handleCreateThread(title, content, tags)
            }

            setIsThreadFormOpen(false)
          }}
        />
      )}
    </div>
  )
}
