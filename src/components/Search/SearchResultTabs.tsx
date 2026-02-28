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
  const navCount = results.nav?.length ?? 0
  const tabs = [
    { id: 'all', label: 'All', count: results.totalResults },
    { id: 'pages', label: 'Pages', count: navCount },
    { id: 'users', label: 'Users', count: results.users.length },
    { id: 'threads', label: 'Threads', count: results.threads.length },
    { id: 'merch', label: 'Merch', count: results.merch.length },
    { id: 'events', label: 'Events', count: results.events.length },
    { id: 'gallery', label: 'Gallery', count: results.gallery.length },
    { id: 'ugc', label: 'UGC', count: results.ugc.length },
    { id: 'channels', label: 'Channels', count: results.channels.length },
  ]

  return (
    <div className="border-b border-zinc-800/80 bg-black/20 px-4 py-3">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
              activeTab === tab.id
                ? 'border-zinc-100 bg-zinc-100 text-black'
                : 'border-zinc-700/80 bg-zinc-900/60 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
            }`}
          >
            {tab.label}
            {tab.count > 0 && <span className="ml-1 text-[10px] opacity-75">({tab.count})</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
