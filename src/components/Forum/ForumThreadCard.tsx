import type { Thread } from '../../types/forum'
import { useTranslation } from '../../hooks/useTranslation'

interface ForumThreadCardProps {
  thread: Thread
  isBookmarked: boolean
  onToggleBookmark: (threadId: Thread['_id']) => void
  onOpen: (threadId: Thread['_id']) => void
}

const formatRelative = (value: number) => {
  const diff = Date.now() - value
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 8) return `${days}d`
  return new Date(value).toLocaleDateString()
}

export function ForumThreadCard({ thread, isBookmarked, onToggleBookmark, onOpen }: ForumThreadCardProps) {
  const { t } = useTranslation()
  const tierTone =
    thread.authorTier === 'platinum'
      ? 'border-amber-300/45 bg-amber-400/15 text-amber-100'
      : thread.authorTier === 'gold'
        ? 'border-yellow-300/40 bg-yellow-400/12 text-yellow-100'
        : thread.authorTier === 'silver'
          ? 'border-slate-300/40 bg-slate-200/10 text-slate-200'
          : 'border-rose-300/35 bg-rose-400/10 text-rose-100'
  const fallbackInitial = (thread.authorDisplayName || t('common.unknownUser')).trim().charAt(0).toUpperCase()

  return (
    <article className="forum-surface-card forum-thread-divider motion-hover-lift px-4 py-4">
      <button type="button" onClick={() => onOpen(thread._id)} className="w-full text-left">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-slate-700 bg-slate-900/90">
            {thread.authorAvatar ? (
              <img src={thread.authorAvatar} alt={thread.authorDisplayName || t('common.unknownUser')} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase text-slate-300">
                {fallbackInitial || 'U'}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="truncate">{thread.authorDisplayName || t('common.unknownUser')}</span>
              <span>•</span>
              <span>{formatRelative(thread.createdAt)}</span>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${tierTone}`}>
                {thread.authorTier}
              </span>
              {thread.authorRole ? (
                <span className="rounded-full border border-blue-300/35 bg-blue-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-100">
                  {thread.authorRole}
                </span>
              ) : null}
            </div>
            <h3 className="line-clamp-1 text-lg font-semibold text-slate-100 transition hover:text-white">{thread.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-slate-400">{thread.content}</p>
          </div>
        </div>
      </button>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {thread.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full border border-slate-700/70 bg-slate-950/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
              #{tag}
            </span>
          ))}
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <iconify-icon icon="solar:eye-linear"></iconify-icon>
            {thread.viewCount}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/35 bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-200">
            <iconify-icon icon="solar:like-linear"></iconify-icon>
            {thread.netVoteCount || 0}
          </span>
          <button
            type="button"
            onClick={() => onOpen(thread._id)}
            className="inline-flex items-center gap-1 rounded-full border border-slate-600 bg-slate-950/80 px-3 py-1 font-semibold uppercase tracking-[0.12em] text-slate-200 transition hover:border-slate-400"
          >
            <iconify-icon icon="solar:chat-line-linear"></iconify-icon>
            {t('forum.replyAction')}
          </button>
          <button
            type="button"
            onClick={() => onToggleBookmark(thread._id)}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 font-semibold uppercase tracking-[0.12em] transition ${
              isBookmarked
                ? 'border-amber-400/60 bg-amber-400/15 text-amber-200'
                : 'border-slate-700 bg-slate-950/70 text-slate-400 hover:border-slate-500'
            }`}
            aria-label={isBookmarked ? t('forum.removeBookmark') : t('forum.addBookmark')}
          >
            <iconify-icon icon={isBookmarked ? 'solar:bookmark-bold' : 'solar:bookmark-linear'}></iconify-icon>
            <span className="hidden sm:inline">{t('forum.bookmarks')}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
