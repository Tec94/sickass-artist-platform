import { useRef } from 'react'
import type { Id } from '../../../convex/_generated/dataModel'
import type { Category, ThreadSortBy } from '../../types/forum'
import { useTranslation } from '../../hooks/useTranslation'

interface ForumToolbarProps {
  categories: Category[]
  selectedCategoryId: Id<'categories'> | null
  onSelectCategory: (categoryId: Id<'categories'>) => void
  sortBy: ThreadSortBy
  onSortByChange: (next: ThreadSortBy) => void
  bookmarkOnly: boolean
  onToggleBookmarkOnly: () => void
  searchValue: string
  onSearchChange: (value: string) => void
  onRefresh: () => void
  isLoading?: boolean
}

export function ForumToolbar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  sortBy,
  onSortByChange,
  bookmarkOnly,
  onToggleBookmarkOnly,
  searchValue,
  onSearchChange,
  onRefresh,
  isLoading = false,
}: ForumToolbarProps) {
  const { t } = useTranslation()
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  return (
    <div className="forum-surface-card motion-card-enter flex flex-wrap items-center gap-2 px-3 py-2">
      <div className="relative min-w-[132px]">
        <select
          value={selectedCategoryId ?? ''}
          onChange={(event) => onSelectCategory(event.target.value as Id<'categories'>)}
          className="w-full appearance-none rounded-full border border-slate-700 bg-slate-950/90 px-3 py-2 pl-8 pr-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-200 outline-none transition focus:border-slate-300"
        >
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        <iconify-icon
          icon="solar:hashtag-linear"
          class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        ></iconify-icon>
        <iconify-icon
          icon="solar:alt-arrow-down-linear"
          class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
        ></iconify-icon>
      </div>

      <div className="relative min-w-[126px]">
        <select
          value={sortBy}
          onChange={(event) => onSortByChange(event.target.value as ThreadSortBy)}
          className="w-full appearance-none rounded-full border border-slate-700 bg-slate-950/90 px-3 py-2 pl-8 pr-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-200 outline-none transition focus:border-slate-300"
        >
          <option value="newest">{t('forum.newest')}</option>
          <option value="top">{t('forum.trending')}</option>
          <option value="mostReplies">{t('forum.mostReplies')}</option>
        </select>
        <iconify-icon
          icon="solar:sort-linear"
          class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        ></iconify-icon>
        <iconify-icon
          icon="solar:alt-arrow-down-linear"
          class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
        ></iconify-icon>
      </div>

      <button
        type="button"
        onClick={onToggleBookmarkOnly}
        className={`rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
          bookmarkOnly
            ? 'border-emerald-400/70 bg-emerald-500/15 text-emerald-200'
            : 'border-slate-700 bg-slate-950/90 text-slate-300 hover:border-slate-500'
        }`}
      >
        <span className="inline-flex items-center gap-2">
          <iconify-icon icon={bookmarkOnly ? 'solar:bookmark-bold' : 'solar:bookmark-linear'}></iconify-icon>
          {t('forum.bookmarks')}
        </span>
      </button>

      <label className="relative ml-auto min-w-[170px] flex-1 sm:max-w-[260px]">
        <iconify-icon
          icon="solar:magnifer-linear"
          class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        ></iconify-icon>
        <input
          ref={searchInputRef}
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t('forum.searchThreads')}
          className="w-full rounded-full border border-slate-700 bg-slate-950/90 py-2 pl-9 pr-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-slate-400"
        />
      </label>

      <button
        type="button"
        onClick={onRefresh}
        className="rounded-lg border border-slate-700 bg-slate-950/90 p-2 text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
        aria-label={t('forum.refreshThreads')}
      >
        <iconify-icon icon="solar:refresh-linear" class={isLoading ? 'animate-spin' : ''}></iconify-icon>
      </button>

      <button
        type="button"
        onClick={() => searchInputRef.current?.focus()}
        className="rounded-full border border-slate-700 bg-slate-950/90 p-2 text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
        aria-label={t('forum.searchThreads')}
      >
        <iconify-icon icon="solar:magnifer-linear"></iconify-icon>
      </button>
    </div>
  )
}
