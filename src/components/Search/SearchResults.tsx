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
} from '../../hooks/useGlobalSearch'

interface SearchResultsProps {
  results: SearchResult
  filter: string
  selectedIndex: number
  onSelect: (result: { type: string; [key: string]: unknown }) => void
}

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
    className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
      isSelected ? 'bg-red-500/20' : 'hover:bg-white/5'
    }`}
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
    className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
      isSelected ? 'bg-red-500/20' : 'hover:bg-white/5'
    }`}
  >
    <div className="p-2 rounded bg-purple-500/20">
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
    className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
      isSelected ? 'bg-red-500/20' : 'hover:bg-white/5'
    }`}
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
    className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
      isSelected ? 'bg-red-500/20' : 'hover:bg-white/5'
    }`}
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
    <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 capitalize">
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
    className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
      isSelected ? 'bg-red-500/20' : 'hover:bg-white/5'
    }`}
  >
    <div className="p-2 rounded bg-orange-500/20">
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
    className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
      isSelected ? 'bg-red-500/20' : 'hover:bg-white/5'
    }`}
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
      <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-500">Out of Stock</span>
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
    className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
      isSelected ? 'bg-red-500/20' : 'hover:bg-white/5'
    }`}
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
    <span className={`text-xs px-2 py-1 rounded capitalize ${
      result.saleStatus === 'on_sale' ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-500'
    }`}>
      {result.saleStatus.replace('_', ' ')}
    </span>
  </button>
)

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  filter,
  selectedIndex,
  onSelect,
}) => {
  // Render appropriate item based on type
  const renderResultItem = (result: SearchUserResult, index: number): React.ReactNode => {
    const isSelected = index === selectedIndex
    return <UserResultItem result={result} isSelected={isSelected} onClick={() => onSelect({ ...result, type: 'user' })} />
  }

  const renderThreadItem = (result: SearchThreadResult, index: number): React.ReactNode => {
    const isSelected = index === selectedIndex
    return <ThreadResultItem result={result} isSelected={isSelected} onClick={() => onSelect({ ...result, type: 'thread' })} />
  }

  const renderGalleryItem = (result: SearchGalleryResult, index: number): React.ReactNode => {
    const isSelected = index === selectedIndex
    return <GalleryResultItem result={result} isSelected={isSelected} onClick={() => onSelect({ ...result, type: 'gallery' })} />
  }

  const renderUGCItem = (result: SearchUGCResult, index: number): React.ReactNode => {
    const isSelected = index === selectedIndex
    return <UGCResultItem result={result} isSelected={isSelected} onClick={() => onSelect({ ...result, type: 'ugc' })} />
  }

  const renderChannelItem = (result: SearchChannelResult, index: number): React.ReactNode => {
    const isSelected = index === selectedIndex
    return <ChannelResultItem result={result} isSelected={isSelected} onClick={() => onSelect({ ...result, type: 'channel' })} />
  }

  const renderMerchItem = (result: SearchMerchResult, index: number): React.ReactNode => {
    const isSelected = index === selectedIndex
    return <MerchResultItem result={result} isSelected={isSelected} onClick={() => onSelect({ ...result, type: 'merch' })} />
  }

  const renderEventItem = (result: SearchEventResult, index: number): React.ReactNode => {
    const isSelected = index === selectedIndex
    return <EventResultItem result={result} isSelected={isSelected} onClick={() => onSelect({ ...result, type: 'event' })} />
  }

  // Group results by type if filter is 'all'
  if (filter === 'all') {
    return (
      <div className="divide-y divide-red-500/10">
        {results.users.length > 0 && (
          <div>
            <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Users
            </div>
            {results.users.slice(0, 3).map((result, index) => renderResultItem(result, index))}
          </div>
        )}
        {results.threads.length > 0 && (
          <div>
            <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Threads
            </div>
            {results.threads.slice(0, 3).map((result, index) =>
              renderThreadItem(result, results.users.length + index)
            )}
          </div>
        )}
        {results.gallery.length > 0 && (
          <div>
            <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Gallery
            </div>
            {results.gallery.slice(0, 3).map((result, index) =>
              renderGalleryItem(result, results.users.length + results.threads.length + index)
            )}
          </div>
        )}
        {results.ugc.length > 0 && (
          <div>
            <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              UGC
            </div>
            {results.ugc.slice(0, 3).map((result, index) =>
              renderUGCItem(
                result,
                results.users.length + results.threads.length + results.gallery.length + index
              )
            )}
          </div>
        )}
        {results.channels.length > 0 && (
          <div>
            <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Channels
            </div>
            {results.channels.slice(0, 3).map((result, index) =>
              renderChannelItem(
                result,
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
            <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Merch
            </div>
            {results.merch.slice(0, 3).map((result, index) =>
              renderMerchItem(
                result,
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
            <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Events
            </div>
            {results.events.slice(0, 3).map((result, index) =>
              renderEventItem(
                result,
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
        <div className="divide-y divide-red-500/10">
          {results.users.map((result, index) => renderResultItem(result, index))}
        </div>
      )
    case 'threads':
      return (
        <div className="divide-y divide-red-500/10">
          {results.threads.map((result, index) => renderThreadItem(result, index))}
        </div>
      )
    case 'gallery':
      return (
        <div className="divide-y divide-red-500/10">
          {results.gallery.map((result, index) => renderGalleryItem(result, index))}
        </div>
      )
    case 'ugc':
      return (
        <div className="divide-y divide-red-500/10">
          {results.ugc.map((result, index) => renderUGCItem(result, index))}
        </div>
      )
    case 'channels':
      return (
        <div className="divide-y divide-red-500/10">
          {results.channels.map((result, index) => renderChannelItem(result, index))}
        </div>
      )
    case 'merch':
      return (
        <div className="divide-y divide-red-500/10">
          {results.merch.map((result, index) => renderMerchItem(result, index))}
        </div>
      )
    case 'events':
      return (
        <div className="divide-y divide-red-500/10">
          {results.events.map((result, index) => renderEventItem(result, index))}
        </div>
      )
    default:
      return null
  }
}
