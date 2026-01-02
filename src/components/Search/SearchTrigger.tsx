import React, { useEffect } from 'react'
import { Search, Command } from 'lucide-react'

interface SearchTriggerProps {
  onClick: () => void
  className?: string
}

export const SearchTrigger: React.FC<SearchTriggerProps> = ({ onClick, className = '' }) => {
  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onClick()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClick])

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-800 transition-colors ${className}`}
      aria-label="Open search"
    >
      <Search className="h-4 w-4" />
      <span className="text-sm hidden sm:inline">Search...</span>
      <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-700 text-xs text-gray-500">
        <Command className="h-3 w-3" />
        K
      </kbd>
    </button>
  )
}
