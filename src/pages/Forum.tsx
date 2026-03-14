import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { ForumInsightsPayload, Id, Thread, ThreadSortBy } from '../types/forum'
import { useAuth } from '../hooks/useAuth'
import { useForumCategories } from '../hooks/useForumCategories'
import { useForumThreads } from '../hooks/useForumThreads'
import { useForumThreadDetail } from '../hooks/useForumThreadDetail'
import { useCreateReply } from '../hooks/useCreateReply'
import { useAnalytics } from '../hooks/useAnalytics'
import {
  ForumCommunityTabs,
  ForumInsightsRail,
  ForumThreadCard,
  ThreadDetail,
  ThreadForm,
  ForumToolbar,
} from '../components/Forum'
import { useTranslation } from '../hooks/useTranslation'
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference'

const FALLBACK_THREADS = [
  {
    title: 'Collab call for the spring visual pack',
    content: 'Drop your strongest references and styleboard ideas. We are locking shortlist picks tonight.',
    replies: 14,
    views: 802,
    votes: 61,
  },
  {
    title: 'Need feedback on the vinyl insert draft',
    content: 'Focus on readability and hierarchy first. Type treatment options in comments would help.',
    replies: 9,
    views: 560,
    votes: 37,
  },
]

type ForumCommunityTab = 'community' | 'profile' | 'answers'

export function Forum() {
  useAnalytics()

  const { user } = useAuth()
  const { t } = useTranslation()
  const { prefersReducedMotion, motionClassName } = useReducedMotionPreference()

  const { categories } = useForumCategories()

  const [selectedCategoryId, setSelectedCategoryId] = useState<Id<'categories'> | null>(null)
  const [selectedThreadId, setSelectedThreadId] = useState<Id<'threads'> | null>(null)
  const [sortBy, setSortBy] = useState<ThreadSortBy>('newest')
  const [searchValue, setSearchValue] = useState('')
  const [bookmarkOnly, setBookmarkOnly] = useState(false)
  const [activeTab, setActiveTab] = useState<ForumCommunityTab>('community')
  const [isThreadFormOpen, setIsThreadFormOpen] = useState(false)
  const [editingThread, setEditingThread] = useState<Thread | null>(null)

  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
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
  const toggleThreadBookmark = useMutation(api.forum.toggleThreadBookmark)

  const bookmarkedThreadIds = useQuery(api.forum.getBookmarkedThreadIds, user ? {} : 'skip') as
    | Id<'threads'>[]
    | undefined
  const insightsQuery = useQuery(api.forum.getForumInsights, selectedCategoryId ? { categoryId: selectedCategoryId, range: '7d' } : 'skip')
  const insights = (insightsQuery ?? null) as ForumInsightsPayload | null

  if (!user) {
    return <div className="py-8 text-center text-gray-400">{t('forum.signInToAccess')}</div>
  }

  const isModerator = user.role === 'mod' || user.role === 'admin'

  const bookmarkedSet = useMemo(() => {
    return new Set((bookmarkedThreadIds ?? []).map((id) => String(id)))
  }, [bookmarkedThreadIds])

  const filteredThreads = useMemo(() => {
    const trimmedSearch = searchValue.trim().toLowerCase()
    return threads.filter((candidate) => {
      if (bookmarkOnly && !bookmarkedSet.has(String(candidate._id))) return false
      if (!trimmedSearch) return true

      const tagHit = candidate.tags.some((tag) => tag.toLowerCase().includes(trimmedSearch))
      if (tagHit) return true

      return (
        candidate.title.toLowerCase().includes(trimmedSearch) ||
        candidate.content.toLowerCase().includes(trimmedSearch) ||
        (candidate.authorDisplayName || '').toLowerCase().includes(trimmedSearch)
      )
    })
  }, [threads, bookmarkOnly, bookmarkedSet, searchValue])

  const handleDeleteThread = async () => {
    if (!selectedThreadId || !selectedCategoryId) return
    await deleteThreadMutation({ threadId: selectedThreadId, categoryId: selectedCategoryId })
    setSelectedThreadId(null)
  }

  return (
    <div className={`app-surface-page mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8 ${motionClassName}`}>
      <div className="forum-surface-shell motion-panel-enter px-4 py-4 sm:px-6 sm:py-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Wolfpack Network</p>
            <h1 className="mt-2 text-3xl font-display font-semibold text-slate-100">{t('forum.title')}</h1>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingThread(null)
              setIsThreadFormOpen(true)
            }}
            className="rounded-full border border-blue-500/60 bg-blue-500/90 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-blue-400"
          >
            {t('forum.newThread')}
          </button>
        </header>

        <ForumCommunityTabs activeTab={activeTab} onChange={setActiveTab} />

        {activeTab !== 'community' ? (
          <div className="forum-surface-card mt-6 p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-100">{t('forum.tabInProgressTitle')}</h2>
            <p className="mt-2 text-sm text-slate-400">{t('forum.tabInProgressDescription')}</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="space-y-4">
              <ForumToolbar
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={(nextCategoryId) => {
                  setSelectedCategoryId(nextCategoryId)
                  setSelectedThreadId(null)
                }}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                bookmarkOnly={bookmarkOnly}
                onToggleBookmarkOnly={() => setBookmarkOnly((value) => !value)}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                onRefresh={refresh}
                isLoading={isThreadsLoading}
              />

              {selectedThreadId ? (
                <div className="forum-surface-card motion-card-enter p-4 sm:p-6">
                  <button
                    type="button"
                    onClick={() => setSelectedThreadId(null)}
                    className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 transition hover:text-slate-200"
                  >
                    <iconify-icon icon="solar:arrow-left-linear"></iconify-icon>
                    {t('forum.backToThreads')}
                  </button>

                  {isThreadDetailLoading ? (
                    <div className="py-10 text-center text-slate-500">{t('common.loading')}</div>
                  ) : !thread ? (
                    <div className="py-10 text-center text-slate-500">{t('common.notFound')}</div>
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
                      onDelete={handleDeleteThread}
                      isModerator={isModerator}
                    />
                  )}
                </div>
              ) : filteredThreads.length > 0 ? (
                <div className="space-y-0">
                  {filteredThreads.map((threadRow, index) => (
                    <div
                      key={threadRow._id}
                      className="motion-card-enter"
                      style={
                        prefersReducedMotion
                          ? undefined
                          : { animationDelay: `${Math.min(index * 30, 180)}ms` }
                      }
                    >
                      <ForumThreadCard
                        thread={threadRow}
                        isBookmarked={bookmarkedSet.has(String(threadRow._id))}
                        onToggleBookmark={async (threadId) => {
                          await toggleThreadBookmark({ threadId })
                        }}
                        onOpen={(threadId) => setSelectedThreadId(threadId)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="forum-surface-card p-6">
                  <h2 className="text-lg font-semibold text-slate-200">{t('forum.emptyThreadsTitle')}</h2>
                  <p className="mt-2 text-sm text-slate-400">{t('forum.emptyThreadsDescription')}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {FALLBACK_THREADS.map((fallback) => (
                      <article key={fallback.title} className="rounded-xl border border-slate-700/80 bg-slate-950/70 p-4">
                        <p className="text-sm font-semibold text-slate-100">{fallback.title}</p>
                        <p className="mt-2 line-clamp-2 text-xs text-slate-400">{fallback.content}</p>
                        <p className="mt-3 text-xs text-slate-500">
                          {fallback.replies} {t('forum.repliesLabel')} · {fallback.views} {t('forum.viewsLabel')} · {fallback.votes} {t('forum.votesLabel')}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {hasMore && !selectedThreadId ? (
                <button
                  type="button"
                  onClick={fetchMore}
                  disabled={isThreadsLoading}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/80 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isThreadsLoading ? t('common.loading') : t('common.loadMore')}
                </button>
              ) : null}
            </section>

            <ForumInsightsRail
              insights={insights}
              onSelectHotThread={(threadId) => setSelectedThreadId(threadId as Id<'threads'>)}
            />
          </div>
        )}
      </div>

      {isThreadFormOpen ? (
        <ThreadForm
          categories={categories}
          initialCategoryId={selectedCategoryId}
          initialData={
            editingThread
              ? {
                  title: editingThread.title,
                  content: editingThread.content,
                  tags: editingThread.tags,
                }
              : undefined
          }
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
      ) : null}
    </div>
  )
}
