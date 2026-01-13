import { useEffect, useMemo, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id, Thread, ThreadSortBy } from '../types/forum'
import { useAuth } from '../hooks/useAuth'
import { useForumCategories } from '../hooks/useForumCategories'
import { useForumThreads } from '../hooks/useForumThreads'
import { useForumThreadDetail } from '../hooks/useForumThreadDetail'
import { useCreateReply } from '../hooks/useCreateReply'
import { useAnalytics } from '../hooks/useAnalytics'
import { ThreadDetail, ThreadForm } from '../components/Forum'

export function Forum() {
  useAnalytics() // Track page views
  const { user } = useAuth()

  const { categories } = useForumCategories()
  const [selectedCategoryId, setSelectedCategoryId] = useState<Id<'categories'> | null>(null)
  const [selectedThreadId, setSelectedThreadId] = useState<Id<'threads'> | null>(null)
  const [sortBy, setSortBy] = useState<ThreadSortBy>('newest')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isThreadFormOpen, setIsThreadFormOpen] = useState(false)
  const [editingThread, setEditingThread] = useState<Thread | null>(null)

  const _selectedCategory = useMemo(() => {
    return categories.find((c) => c._id === selectedCategoryId) ?? null
  }, [categories, selectedCategoryId])

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0]._id)
    }
  }, [categories, selectedCategoryId])

  const { threads, isLoading: isThreadsLoading, hasMore, fetchMore, refresh } = useForumThreads({
    categoryId: selectedCategoryId,
    sortBy,
    limit: 20,
  })

  const { thread, replies, isLoading: isThreadDetailLoading } = useForumThreadDetail(selectedThreadId)
  const { handleCreateReply } = useCreateReply(selectedThreadId)
  const createThreadMutation = useMutation(api.forum.createThread)
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
    // Ensure a category is selected before opening the form
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0]._id)
    }
    setEditingThread(null)
    setIsThreadFormOpen(true)
  }

  const handleDeleteThread = async () => {
    if (!selectedThreadId || !selectedCategoryId) return
    await deleteThreadMutation({ threadId: selectedThreadId, categoryId: selectedCategoryId })
    setSelectedThreadId(null)
  }

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in h-full">
      <div className="flex flex-col md:flex-row gap-8 h-full">
        {/* Left Sidebar - Categories */}
        <div className={`w-full md:w-64 shrink-0 space-y-8 ${isMobileSidebarOpen ? 'block fixed inset-0 z-50 bg-zinc-950 p-4' : 'hidden md:block'}`}>
          <div className="md:hidden flex justify-end mb-4">
            <button onClick={() => setIsMobileSidebarOpen(false)} className="text-zinc-400">Close</button>
          </div>
          <div>
             <button 
               onClick={openCreateThread}
               className="w-full bg-red-700 text-white font-bold uppercase tracking-widest py-3 hover:bg-red-600 transition-colors"
             >
               New Thread
             </button>
          </div>
          
          <div>
            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Categories</h3>
            <div className="space-y-1">
              {/* All Categories Option */}
               <button 
                  onClick={() => handleSelectCategory('' as any)} 
                  className={`w-full text-left px-3 py-2 text-sm rounded-sm transition-colors ${!selectedCategoryId ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
                >
                  All
                </button>
              {categories.map((cat) => (
                <button 
                  key={cat._id} 
                  onClick={() => handleSelectCategory(cat._id)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-sm transition-colors ${selectedCategoryId === cat._id ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
           {/* Mobile Header */}
           <div className="md:hidden mb-4 flex items-center justify-between">
              <button 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="text-white font-bold uppercase text-sm border border-zinc-700 px-3 py-1 bg-zinc-900"
              >
                Categories
              </button>
           </div>

          {selectedThreadId ? (
             <div className="bg-zinc-900 border border-zinc-800 p-6">
               <button 
                 className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm font-bold uppercase tracking-wider" 
                 onClick={() => setSelectedThreadId(null)}
               >
                 <iconify-icon icon="solar:arrow-left-linear"></iconify-icon> Back to Threads
               </button>
               {isThreadDetailLoading ? <div className="text-center py-8 text-zinc-500">Loading...</div> : !thread ? <div className="text-center py-8 text-zinc-500">Not Found</div> : (
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
            <>
              {/* Filters */}
              <div className="flex items-center gap-6 border-b border-zinc-800 pb-4 mb-6">
                <button 
                  onClick={() => setSortBy('top')}
                  className={`flex items-center gap-2 text-sm font-bold pb-4 -mb-4.5 border-b-2 transition-colors ${sortBy === 'top' ? 'text-white border-red-600' : 'text-zinc-500 border-transparent hover:text-white'}`}
                >
                  <iconify-icon icon="solar:flame-bold" /> Trending
                </button>
                <button 
                  onClick={() => setSortBy('newest')}
                  className={`flex items-center gap-2 text-sm font-bold pb-4 -mb-4.5 border-b-2 transition-colors ${sortBy === 'newest' ? 'text-white border-red-600' : 'text-zinc-500 border-transparent hover:text-white'}`}
                >
                  <iconify-icon icon="solar:clock-circle-bold" /> Newest
                </button>
                <div className="ml-auto">
                    <button onClick={refresh} className="text-zinc-500 hover:text-white p-2">
                        <iconify-icon icon="solar:refresh-linear" class={isThreadsLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
              </div>

              {/* Threads List */}
              <div className="space-y-4">
                {threads.map(post => (
                  <div key={post._id} onClick={() => handleSelectThread(post._id)} className="bg-zinc-900 border border-zinc-800 p-6 hover:border-red-900/30 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden shrink-0 mt-1">
                          {/* Use author avatar if available, else placeholder */}
                          <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-zinc-500 font-bold">
                            {post.authorDisplayName?.[0] || 'U'}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg group-hover:text-red-500 transition-colors mb-1">{post.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-zinc-500 flex-wrap">
                            <span className="hidden sm:inline">•</span>
                            <span>Posted by <span className="text-zinc-300">{post.authorDisplayName || 'Unknown'}</span></span>
                            <span className="hidden sm:inline">•</span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1 text-zinc-500 text-xs shrink-0">
                         <div className="flex items-center gap-1">
                           <iconify-icon icon="solar:chat-line-linear" /> {post.replyCount || 0}
                         </div>
                         <div>{post.viewCount || 0} views</div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {threads.length === 0 && !isThreadsLoading && (
                    <div className="text-center py-12 text-zinc-500">
                        No threads found in this category.
                    </div>
                )}
                
                {hasMore && (
                    <button 
                        onClick={fetchMore} 
                        disabled={isThreadsLoading}
                        className="w-full py-4 text-center text-zinc-500 hover:text-white text-sm font-bold uppercase tracking-widest"
                    >
                        {isThreadsLoading ? 'Loading...' : 'Load More'}
                    </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>

      {isThreadFormOpen && (
        <ThreadForm
          categories={categories}
          initialCategoryId={selectedCategoryId}
          initialData={editingThread ? { title: editingThread.title, content: editingThread.content, tags: editingThread.tags } : undefined}
          onCancel={() => setIsThreadFormOpen(false)}
          onSubmit={async (categoryId, title, content, tags) => {
            if (editingThread) {
              await editThreadMutation({ threadId: editingThread._id, newTitle: title, newContent: content })
            } else {
              await createThreadMutation({ categoryId, title, content, tags })
            }
            setSelectedCategoryId(categoryId)
            setIsThreadFormOpen(false)
          }}
        />
      )}

      <style>{`
        .forum-container {
          display: flex;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
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

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .refresh-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--color-card-border);
          color: var(--color-text-dim);
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .refresh-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: white;
          border-color: #444;
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
          position: relative;
          z-index: 10;
        }

        .create-thread-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .create-thread-btn:not(:disabled):hover {
          filter: brightness(1.1);
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
    </>
  )
}
