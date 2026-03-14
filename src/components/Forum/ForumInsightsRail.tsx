import type { ForumInsightsPayload } from '../../types/forum'
import { useTranslation } from '../../hooks/useTranslation'

interface ForumInsightsRailProps {
  insights: ForumInsightsPayload | null
  onSelectHotThread: (threadId: string) => void
}

const FALLBACK_USERS = [
  { userId: 'seed-1', displayName: 'Night Signal', avatar: '', threadCount: 7, replyCount: 21, score: 146 },
  { userId: 'seed-2', displayName: 'Wolf Archivist', avatar: '', threadCount: 6, replyCount: 17, score: 121 },
  { userId: 'seed-3', displayName: 'Raven Mixdown', avatar: '', threadCount: 4, replyCount: 11, score: 96 },
]

const FALLBACK_TOPICS = [
  { categoryId: 'seed-cat-1', name: 'setlists', threadCount: 24 },
  { categoryId: 'seed-cat-2', name: 'production', threadCount: 16 },
  { categoryId: 'seed-cat-3', name: 'fan edits', threadCount: 11 },
]

export function ForumInsightsRail({ insights, onSelectHotThread }: ForumInsightsRailProps) {
  const { t } = useTranslation()
  const topUsers = insights?.topUsers?.length ? insights.topUsers : FALLBACK_USERS
  const activeTopics = insights?.activeTopics?.length ? insights.activeTopics : FALLBACK_TOPICS
  const hotThreads = insights?.hotThreads ?? []
  const getTierTone = (score: number) => {
    if (score >= 130) return 'bg-amber-300'
    if (score >= 100) return 'bg-slate-300'
    return 'bg-rose-400'
  }
  const getRankIcon = (score: number) => {
    if (score >= 130) return 'solar:crown-star-bold'
    if (score >= 100) return 'solar:medal-ribbon-bold'
    return 'solar:verified-check-bold'
  }

  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <section className="forum-surface-card motion-card-enter p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">{t('forum.topUsers')}</h3>
        <div className="mt-4 space-y-3">
          {topUsers.slice(0, 6).map((user, index) => (
            <div key={user.userId} className="flex items-center justify-between gap-3 rounded-lg border border-slate-700/70 bg-slate-950/70 px-2.5 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${getTierTone(user.score)}`} aria-hidden="true"></span>
                <div className="relative h-8 w-8 overflow-hidden rounded-full border border-slate-700 bg-slate-900/80">
                  {user.avatar ? <img src={user.avatar} alt={user.displayName} className="h-full w-full rounded-full object-cover" /> : null}
                  {!user.avatar ? (
                    <span className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase text-slate-300">
                      {user.displayName.trim().charAt(0).toUpperCase() || 'U'}
                    </span>
                  ) : null}
                </div>
                <div className="min-w-0">
                  <span className="truncate text-sm text-slate-200">{user.displayName}</span>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">#{index + 1}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-200">
                <iconify-icon icon={getRankIcon(user.score)}></iconify-icon>
                <iconify-icon icon="solar:like-linear"></iconify-icon>
                {user.score}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="forum-surface-card motion-card-enter p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">{t('forum.activeTopics')}</h3>
        <div className="mt-4 space-y-2">
          {activeTopics.slice(0, 7).map((topic) => (
            <div key={topic.categoryId} className="flex items-center justify-between gap-2 rounded-lg border border-slate-700/70 bg-slate-950/70 px-3 py-2 transition hover:border-slate-500">
              <span className="truncate text-xs font-semibold uppercase tracking-[0.1em] text-slate-300">#{topic.name}</span>
              <span className="text-xs font-semibold text-slate-400">{topic.threadCount}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="forum-surface-card motion-card-enter p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">{t('forum.hotThreads')}</h3>
        <div className="mt-3 space-y-2">
          {hotThreads.length === 0 ? (
            <p className="text-sm text-slate-500">{t('forum.hotThreadsEmpty')}</p>
          ) : (
            hotThreads.slice(0, 5).map((thread) => (
              <button
                key={thread._id}
                type="button"
                onClick={() => onSelectHotThread(String(thread._id))}
                className="w-full rounded-lg border border-slate-700/70 bg-slate-950/70 px-3 py-2 text-left transition hover:border-slate-500"
              >
                <p className="line-clamp-1 text-sm font-semibold text-slate-100">{thread.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {thread.replyCount} {t('forum.repliesLabel')} · {thread.viewCount} {t('forum.viewsLabel')}
                </p>
              </button>
            ))
          )}
        </div>
      </section>
    </aside>
  )
}
