import React from 'react'
import type { SearchResult } from '../../hooks/useGlobalSearch'

interface SearchResultTabsProps {
  activeTab: string
  onChange: (tab: string) => void
  results: SearchResult
}

export const SearchResultTabs: React.FC<SearchResultTabsProps> = ({
  activeTab,
  onChange,
  results,
}) => {
  const tabs = [
    { id: 'all', label: 'All', count: results.totalResults },
    { id: 'users', label: 'Users', count: results.users.length },
    { id: 'threads', label: 'Threads', count: results.threads.length },
    { id: 'merch', label: 'Merch', count: results.merch.length },
    { id: 'events', label: 'Events', count: results.events.length },
    { id: 'gallery', label: 'Gallery', count: results.gallery.length },
    { id: 'ugc', label: 'UGC', count: results.ugc.length },
    { id: 'channels', label: 'Channels', count: results.channels.length },
  ]

  return (
    <div className="flex gap-1 border-b border-red-500/20 px-4 py-2 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-3 py-1 text-sm whitespace-nowrap rounded transition-colors ${
            activeTab === tab.id
              ? 'bg-red-500/30 text-red-300'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          {tab.label} {tab.count > 0 && <span className="ml-1 text-xs">({tab.count})</span>}
        </button>
      ))}
    </div>
  )
}
