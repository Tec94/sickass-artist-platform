import React from 'react'
import type {
  SearchResult,
  SearchUserResult,
  SearchThreadResult,
  SearchGalleryResult,
  SearchUGCResult,
  SearchChannelResult,
  SearchMerchResult,
  SearchEventResult,
  SearchNavResult,
} from '../../hooks/useGlobalSearch'

interface SearchResultsProps {
  results: SearchResult
  filter: string
  selectedIndex: number
  onSelect: (result: { type: string; [key: string]: unknown }) => void
}

const getResultItemClass = (isSelected: boolean) =>
  `w-full flex items-center gap-3 px-4 py-3 text-left border-l-2 transition-colors ${
    isSelected
      ? 'border-l-red-400 bg-zinc-100/10'
      : 'border-l-transparent hover:bg-zinc-900/60'
  }`

// User result item
const UserResultItem = ({
  result,
  isSelected,
  onClick,
}: {
  result: SearchUserResult
  isSelected: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={getResultItemClass(isSelected)}
  >
    <img
      src={result.avatar}
      alt={result.displayName}
      className="h-10 w-10 rounded-full object-cover"
    />
    <div className="flex-1 min-w-0">
      <p className="text-white font-medium truncate">{result.displayName}</p>
      <p className="text-gray-400 text-sm truncate">@{result.username}</p>
    </div>
    <span className="text-xs text-red-400 capitalize">{result.fanTier}</span>
  </button>
)

// Thread result item
const ThreadResultItem = ({
  result,
  isSelected,
  onClick,
}: {
  result: SearchThreadResult
  isSelected: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={getResultItemClass(isSelected)}
  >
    <div className="rounded-lg border border-fuchsia-400/30 bg-fuchsia-500/15 p-2">
      <iconify-icon icon="solar:chat-square-dots-linear" width="16" height="16" class="text-purple-400"></iconify-icon>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-white font-medium truncate">{result.title}</p>
      <p className="text-gray-400 text-sm truncate">by {result.authorDisplayName}</p>
    </div>
    <div className="text-xs text-gray-500 flex items-center gap-2">
      <span>
        {result.netVoteCount >= 0 ? '+' : ''}
        {result.netVoteCount}
      </span>
      <span>{result.replyCount} replies</span>
    </div>
  </button>
)

// Gallery result item
const GalleryResultItem = ({
  result,
  isSelected,
  onClick,
}: {
  result: SearchGalleryResult
  isSelected: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={getResultItemClass(isSelected)}
  >
    <img
      src={result.thumbnailUrl}
      alt={result.title}
      className="h-12 w-12 rounded object-cover"
    />
    <div className="flex-1 min-w-0">
      <p className="text-white font-medium truncate">{result.title}</p>
      <p className="text-gray-400 text-sm capitalize">{result.type}</p>
    </div>
    <div className="text-xs text-gray-500">{result.likeCount} likes</div>
  </button>
)

// UGC result item
const UGCResultItem = ({
  result,
  isSelected,
  onClick,
}: {
  result: SearchUGCResult
  isSelected: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={getResultItemClass(isSelected)}
  >
    <img
      src={result.thumbnailUrl}
      alt={result.title}
      className="h-12 w-12 rounded object-cover"
    />
    <div className="flex-1 min-w-0">
      <p className="text-white font-medium truncate">{result.title}</p>
      <p className="text-gray-400 text-sm truncate">by {result.creatorDisplayName}</p>
    </div>
    <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-1 text-xs text-emerald-300 capitalize">
      {result.category.replace('-', ' ')}
    </span>
  </button>
)

// Channel result item
const ChannelResultItem = ({
  result,
  isSelected,
  onClick,
}: {
  result: SearchChannelResult
  isSelected: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={getResultItemClass(isSelected)}
  >
    <div className="rounded-lg border border-amber-400/30 bg-amber-500/15 p-2">
      <iconify-icon icon="solar:hashtag-linear" width="16" height="16" class="text-orange-400"></iconify-icon>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-white font-medium truncate">{result.name}</p>
      <p className="text-gray-400 text-sm truncate">{result.description || result.category}</p>
    </div>
    <div className="text-xs text-gray-500">{result.messageCount} messages</div>
  </button>
)

// Merch result item
const MerchResultItem = ({
  result,
  isSelected,
  onClick,
}: {
  result: SearchMerchResult
  isSelected: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={getResultItemClass(isSelected)}
  >
    <img
      src={result.thumbnailUrl}
      alt={result.name}
      className="h-12 w-12 rounded object-cover"
    />
    <div className="flex-1 min-w-0">
      <p className="text-white font-medium truncate">{result.name}</p>
      <p className="text-gray-400 text-sm truncate">${(result.price / 100).toFixed(2)} • {result.category}</p>
    </div>
    {!result.inStock && (
      <span className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-400">Out of Stock</span>
    )}
  </button>
)

// Event result item
const EventResultItem = ({
  result,
  isSelected,
  onClick,
}: {
  result: SearchEventResult
  isSelected: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={getResultItemClass(isSelected)}
  >
    <img
      src={result.imageUrl}
      alt={result.title}
      className="h-12 w-12 rounded object-cover"
    />
    <div className="flex-1 min-w-0">
      <p className="text-white font-medium truncate">{result.title}</p>
      <p className="text-gray-400 text-sm truncate">{result.city} • {new Date(result.startAtUtc).toLocaleDateString()}</p>
    </div>
    <span className={`rounded-full border px-2 py-1 text-xs capitalize ${
      result.saleStatus === 'on_sale'
        ? 'border-red-500/40 bg-red-500/15 text-red-300'
        : 'border-zinc-700 bg-zinc-900 text-zinc-400'
    }`}>
      {result.saleStatus.replace('_', ' ')}
    </span>
  </button>
)

// Nav/page result item
const NavResultItem = ({
  result,
  isSelected,
  onClick,
}: {
  result: SearchNavResult
  isSelected: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={getResultItemClass(isSelected)}
  >
    <div className="rounded-lg border border-slate-400/30 bg-slate-500/15 p-2">
      <iconify-icon icon="solar:link-linear" width="16" height="16" class="text-slate-300"></iconify-icon>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-white font-medium truncate">{result.name}</p>
      <p className="text-gray-400 text-sm truncate">{result.description || result.path}</p>
    </div>
    <span className="text-xs text-gray-500">Page</span>
  </button>
)

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  filter,
  selectedIndex,
  onSelect,
}) => {
  const navResults = results.nav ?? []

  // Render appropriate item based on type
  const renderResultItem = (result: SearchUserResult, index: number): React.ReactNode => {
    const isSelected = index === selectedIndex
    return (
      <UserResultItem
        key={`user-${result._id ?? index}`}
        result={result}
        isSelected={isSelected}
        onClick={() => onSelect({ ...result, type: 'user' })}
      />
    )
  }

  const renderThreadItem = (result: SearchThreadResult, index: number): React.ReactNode => {
    const isSelected = index === selectedIndex
    return (
      <ThreadResultItem
        key={`thread-${result._id ?? index}`}
        result={result}
        isSelected={isSelected}
        onClick={() => onSelect({ ...result, type: 'thread' })}
      />
    )
  }

  const renderGalleryItem = (result: SearchGalleryResult, index: number): React.ReactNode => {
    const isSelected = index === selectedIndex
    return (
      <GalleryResultItem
        key={`gallery-${result.contentId ?? index}`}
        result={result}
        isSelected={isSelected}
        onClick={() => onSelect({ ...result, type: 'gallery' })}
      />
    )
  }

  const renderUGCItem = (result: SearchUGCResult, index: number): React.ReactNode => {
    const isSelected = index === selectedIndex
    return (
      <UGCResultItem
        key={`ugc-${result.ugcId ?? index}`}
        result={result}
        isSelected={isSelected}
        onClick={() => onSelect({ ...result, type: 'ugc' })}
      />
    )
  }

  const renderChannelItem = (result: SearchChannelResult, index: number): React.ReactNode => {
    const isSelected = index === selectedIndex
    return (
      <ChannelResultItem
        key={`channel-${result._id ?? index}`}
        result={result}
        isSelected={isSelected}
        onClick={() => onSelect({ ...result, type: 'channel' })}
      />
    )
  }

  const renderMerchItem = (result: SearchMerchResult, index: number): React.ReactNode => {
    const isSelected = index === selectedIndex
    return (
      <MerchResultItem
        key={`merch-${result._id ?? index}`}
        result={result}
        isSelected={isSelected}
        onClick={() => onSelect({ ...result, type: 'merch' })}
      />
    )
  }

  const renderEventItem = (result: SearchEventResult, index: number): React.ReactNode => {
    const isSelected = index === selectedIndex
    return (
      <EventResultItem
        key={`event-${result._id ?? index}`}
        result={result}
        isSelected={isSelected}
        onClick={() => onSelect({ ...result, type: 'event' })}
      />
    )
  }

  const renderNavItem = (result: SearchNavResult, index: number): React.ReactNode => {
    const isSelected = index === selectedIndex
    return (
      <NavResultItem
        key={`pages-${result.path ?? index}`}
        result={result}
        isSelected={isSelected}
        onClick={() => onSelect({ ...result, type: 'pages' })}
      />
    )
  }

  // Group results by type if filter is 'all'
  if (filter === 'all') {
    return (
      <div className="divide-y divide-zinc-800/80">
        {navResults.length > 0 && (
          <div>
            <div className="px-4 py-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.2em]">
              Pages
            </div>
            {navResults.slice(0, 4).map((result, index) => renderNavItem(result, index))}
          </div>
        )}
        {results.users.length > 0 && (
          <div>
            <div className="px-4 py-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.2em]">
              Users
            </div>
            {results.users.slice(0, 3).map((result, index) => renderResultItem(result, navResults.length + index))}
          </div>
        )}
        {results.threads.length > 0 && (
          <div>
            <div className="px-4 py-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.2em]">
              Threads
            </div>
            {results.threads.slice(0, 3).map((result, index) =>
              renderThreadItem(result, navResults.length + results.users.length + index)
            )}
          </div>
        )}
        {results.gallery.length > 0 && (
          <div>
            <div className="px-4 py-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.2em]">
              Gallery
            </div>
            {results.gallery.slice(0, 3).map((result, index) =>
              renderGalleryItem(result, navResults.length + results.users.length + results.threads.length + index)
            )}
          </div>
        )}
        {results.ugc.length > 0 && (
          <div>
            <div className="px-4 py-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.2em]">
              UGC
            </div>
            {results.ugc.slice(0, 3).map((result, index) =>
              renderUGCItem(
                result,
                navResults.length + results.users.length + results.threads.length + results.gallery.length + index
              )
            )}
          </div>
        )}
        {results.channels.length > 0 && (
          <div>
            <div className="px-4 py-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.2em]">
              Channels
            </div>
            {results.channels.slice(0, 3).map((result, index) =>
              renderChannelItem(
                result,
                navResults.length +
                  results.users.length +
                  results.threads.length +
                  results.gallery.length +
                  results.ugc.length +
                  index
              )
            )}
          </div>
        )}
        {results.merch.length > 0 && (
          <div>
            <div className="px-4 py-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.2em]">
              Merch
            </div>
            {results.merch.slice(0, 3).map((result, index) =>
              renderMerchItem(
                result,
                navResults.length +
                  results.users.length +
                  results.threads.length +
                  results.gallery.length +
                  results.ugc.length +
                  results.channels.length +
                  index
              )
            )}
          </div>
        )}
        {results.events.length > 0 && (
          <div>
            <div className="px-4 py-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.2em]">
              Events
            </div>
            {results.events.slice(0, 3).map((result, index) =>
              renderEventItem(
                result,
                navResults.length +
                  results.users.length +
                  results.threads.length +
                  results.gallery.length +
                  results.ugc.length +
                  results.channels.length +
                  results.merch.length +
                  index
              )
            )}
          </div>
        )}
      </div>
    )
  }

  // Single type filter
  switch (filter) {
    case 'users':
      return (
        <div className="divide-y divide-zinc-800/80">
          {results.users.map((result, index) => renderResultItem(result, index))}
        </div>
      )
    case 'threads':
      return (
        <div className="divide-y divide-zinc-800/80">
          {results.threads.map((result, index) => renderThreadItem(result, index))}
        </div>
      )
    case 'gallery':
      return (
        <div className="divide-y divide-zinc-800/80">
          {results.gallery.map((result, index) => renderGalleryItem(result, index))}
        </div>
      )
    case 'ugc':
      return (
        <div className="divide-y divide-zinc-800/80">
          {results.ugc.map((result, index) => renderUGCItem(result, index))}
        </div>
      )
    case 'channels':
      return (
        <div className="divide-y divide-zinc-800/80">
          {results.channels.map((result, index) => renderChannelItem(result, index))}
        </div>
      )
    case 'merch':
      return (
        <div className="divide-y divide-zinc-800/80">
          {results.merch.map((result, index) => renderMerchItem(result, index))}
        </div>
      )
    case 'events':
      return (
        <div className="divide-y divide-zinc-800/80">
          {results.events.map((result, index) => renderEventItem(result, index))}
        </div>
      )
    case 'pages':
      return (
        <div className="divide-y divide-zinc-800/80">
          {navResults.map((result, index) => renderNavItem(result, index))}
        </div>
      )
    default:
      return null
  }
}
