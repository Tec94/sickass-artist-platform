import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useGlobalSearch } from '../../hooks/useGlobalSearch'
import type { SearchNavResult } from '../../hooks/useGlobalSearch'
import { SearchResults } from './SearchResults'
import { RecentSearches } from './RecentSearches'
import { SearchResultTabs } from './SearchResultTabs'
import { useTranslation } from '../../hooks/useTranslation'

type ResultFilter = 'all' | 'pages' | 'users' | 'threads' | 'gallery' | 'ugc' | 'channels' | 'merch' | 'events'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  navLinks?: SearchNavResult[]
}

// Helper to flatten results for navigation
function getFlatResults(
  results: NonNullable<ReturnType<typeof useGlobalSearch>['results']>,
  filter: ResultFilter
): Array<{ type: string; [key: string]: unknown }> {
  const all = [
    ...(results.nav ?? []).map((n) => ({ ...n, type: 'pages' as const })),
    ...results.users.map((u) => ({ ...u, type: 'user' as const })),
    ...results.threads.map((t) => ({ ...t, type: 'thread' as const })),
    ...results.gallery.map((g) => ({ ...g, type: 'gallery' as const })),
    ...results.ugc.map((u) => ({ ...u, type: 'ugc' as const })),
    ...results.channels.map((c) => ({ ...c, type: 'channel' as const })),
    ...results.merch.map((m) => ({ ...m, type: 'merch' as const })),
    ...results.events.map((e) => ({ ...e, type: 'event' as const })),
  ]

  if (filter === 'all') return all
  return all.filter((r) => r.type === filter)
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, navLinks }) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const {
    results,
    isLoading,
    error,
    query,
    setQuery,
    recentSearches,
    clearRecentSearches,
    addToRecentSearches,
    hasSearched,
  } = useGlobalSearch({ enabled: isOpen })

  const [selectedResultIndex, setSelectedResultIndex] = useState(0)
  const [resultFilter, setResultFilter] = useState<ResultFilter>('all')
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const defaultNavLinks: SearchNavResult[] = useMemo(() => ([
    { name: t('nav.dashboard'), path: '/dashboard', keywords: ['home'] },
    { name: t('nav.store'), path: '/store', keywords: ['shop', 'merch', 'products'] },
    { name: t('nav.events'), path: '/events', keywords: ['tour', 'tickets'] },
    { name: t('nav.gallery'), path: '/gallery', keywords: ['media', 'photos', 'videos'] },
    { name: t('nav.forum'), path: '/forum', keywords: ['threads', 'community'] },
    { name: t('nav.chat'), path: '/chat', keywords: ['messages', 'channels'] },
    { name: t('nav.ranking'), path: '/ranking', keywords: ['leaderboard', 'songs'] },
  ]), [t])
  const resolvedNavLinks = navLinks ?? defaultNavLinks
  const normalizedQuery = query.trim().toLowerCase()
  const navResults = useMemo(
    () =>
      normalizedQuery.length > 0
        ? resolvedNavLinks.filter((link) => {
            const nameMatch = link.name.toLowerCase().includes(normalizedQuery)
            const pathMatch = link.path.toLowerCase().includes(normalizedQuery)
            const keywordMatch = (link.keywords || []).some((keyword) =>
              keyword.toLowerCase().includes(normalizedQuery)
            )
            return nameMatch || pathMatch || keywordMatch
          })
        : [],
    [normalizedQuery, resolvedNavLinks]
  )
  const combinedResults = useMemo(() => {
    if (!results && navResults.length === 0) return null
    const base = {
      users: [],
      threads: [],
      gallery: [],
      ugc: [],
      channels: [],
      merch: [],
      events: [],
      totalResults: 0,
      query,
      ...(results ?? {}),
    }

    return {
      ...base,
      nav: navResults,
      totalResults: base.totalResults + navResults.length,
    }
  }, [results, navResults, query])
  const hasAnyResults = (combinedResults?.totalResults ?? 0) > 0

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setSelectedResultIndex(0)
    }
  }, [isOpen])

  // Navigate to result based on type (must be before handleKeyDown)
  const handleSelectResult = useCallback(
    (result: { type: string; _id?: string; contentId?: string; ugcId?: string; path?: string }) => {
      addToRecentSearches(query)

      // Navigate based on result type
      if (result.type === 'user' && result._id) {
        navigate(`/profile/${result._id}`)
      } else if (result.type === 'thread' && result._id) {
        navigate(`/forum/thread/${result._id}`)
      } else if (result.type === 'gallery' && result.contentId) {
        navigate(`/?gear=3&contentId=${result.contentId}`)
      } else if (result.type === 'ugc' && result.ugcId) {
        navigate(`/?gear=3&ugcId=${result.ugcId}`)
      } else if (result.type === 'channel' && result._id) {
        navigate(`/?gear=6&channelId=${result._id}`)
      } else if (result.type === 'merch' && result._id) {
        navigate(`/store/product/${result._id}`)
      } else if (result.type === 'event' && result._id) {
        navigate(`/events/${result._id}`)
      } else if (result.type === 'pages' && result.path) {
        navigate(result.path)
      }

      onClose()
    },
    [addToRecentSearches, query, navigate, onClose]
  )

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // ESC to close
      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Arrow keys to navigate results
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedResultIndex((prev) => {
          const flatResults = combinedResults ? getFlatResults(combinedResults, resultFilter) : []
          return Math.min(prev + 1, flatResults.length - 1)
        })
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedResultIndex((prev) => Math.max(prev - 1, 0))
        return
      }

      // Tab to switch filter tabs
      if (e.key === 'Tab') {
        e.preventDefault()
        const tabs: ResultFilter[] = ['all', 'pages', 'users', 'threads', 'gallery', 'ugc', 'channels', 'merch', 'events']
        const currentIndex = tabs.indexOf(resultFilter)
        const nextIndex = e.shiftKey
          ? (currentIndex - 1 + tabs.length) % tabs.length
          : (currentIndex + 1) % tabs.length
        setResultFilter(tabs[nextIndex])
        return
      }

      // Enter to select
      if (e.key === 'Enter') {
        e.preventDefault()
        const flatResults = combinedResults ? getFlatResults(combinedResults, resultFilter) : []
        const selected = flatResults[selectedResultIndex]
        if (selected) {
          handleSelectResult(selected)
        }
        return
      }
    },
    [combinedResults, resultFilter, selectedResultIndex, onClose, handleSelectResult]
  )

  // Focus trap: prevent focus from leaving modal
  const handleKeyDownOnModal = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [tabindex]:not([tabindex="-1"]), input'
        )
        if (!focusableElements || focusableElements.length === 0) return

        const focusedElement = document.activeElement as HTMLElement
        const focusedIndex = Array.from(focusableElements).indexOf(focusedElement)

        if (e.shiftKey && focusedIndex === 0) {
          e.preventDefault()
          focusableElements[focusableElements.length - 1]?.focus()
        } else if (!e.shiftKey && focusedIndex === focusableElements.length - 1) {
          e.preventDefault()
          focusableElements[0]?.focus()
        }
      }
    },
    []
  )

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  // Portal content - only render if open
  const portalContent = isOpen ? (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-[#02050b]/80 backdrop-blur-md"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="app-surface-modal fixed left-1/2 top-20 z-50 w-[min(860px,calc(100%-1.5rem))] -translate-x-1/2 overflow-hidden rounded-3xl"
        onKeyDown={handleKeyDownOnModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-title"
      >
        {/* Header */}
        <div className="border-b border-zinc-800/80 bg-black/25 px-4 py-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p id="search-title" className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
              {t('common.search')}
            </p>
            <button
              onClick={onClose}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/80 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
              aria-label="Close search"
            >
              <iconify-icon icon="solar:close-circle-linear" width="18" height="18"></iconify-icon>
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-950/85 px-3 py-2 shadow-inner shadow-black/40">
            <iconify-icon icon="solar:magnifer-linear" width="18" height="18" class="text-zinc-400"></iconify-icon>
            <input
              ref={inputRef}
              type="text"
              placeholder={t('search.placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
              aria-label="Search query"
            />
          </div>
        </div>

        {/* Tabs (if results exist) */}
        {(hasSearched || navResults.length > 0) && combinedResults && hasAnyResults && (
          <SearchResultTabs
            activeTab={resultFilter}
            onChange={(tab) => setResultFilter(tab as ResultFilter)}
            results={combinedResults}
          />
        )}

        {/* Content */}
        <div className="max-h-[26rem] overflow-y-auto bg-black/15">
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <iconify-icon icon="solar:spinner-linear" class="h-6 w-6 animate-spin text-zinc-300"></iconify-icon>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="px-4 py-8 text-center">
              <p className="text-red-300">{error.message}</p>
              <button
                onClick={() => setQuery(query)}
                className="mt-2 text-red-300 hover:underline"
              >
                {t('search.tryAgain')}
              </button>
            </div>
          )}

          {/* Results */}
          {!isLoading && !error && (hasSearched || navResults.length > 0) && combinedResults && hasAnyResults && (
            <SearchResults
              results={combinedResults}
              filter={resultFilter}
              selectedIndex={selectedResultIndex}
              onSelect={handleSelectResult}
            />
          )}

          {/* No results */}
          {!isLoading &&
            !error &&
            (hasSearched || navResults.length > 0) &&
            (!combinedResults || !hasAnyResults) && (
              <div className="px-4 py-8 text-center">
                <p className="text-zinc-300">{t('search.noResults')}</p>
                {query && (
                  <p className="mt-2 text-sm text-zinc-500">
                    {t('search.tryDifferent')}
                  </p>
                )}
              </div>
            )}

          {/* Recent searches (when no query) */}
          {!query && recentSearches.length > 0 && (
            <RecentSearches
              searches={recentSearches}
              onSelect={(search) => {
                setQuery(search)
              }}
              onClear={clearRecentSearches}
            />
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-zinc-800/80 bg-black/20 px-4 py-2 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <kbd className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-1">↑↓</kbd>
            {t('search.navigate')}
          </span>
          <span className="ml-3 inline-flex items-center gap-1">
            <kbd className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-1">Enter</kbd>
            {t('search.select')}
          </span>
          <span className="ml-3 inline-flex items-center gap-1">
            <kbd className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-1">ESC</kbd>
            {t('search.close')}
          </span>
        </div>
      </div>
    </>
  ) : null

  // Use portal to render at document body level
  if (typeof document === 'undefined') return null

  return createPortal(portalContent, document.body)
}
