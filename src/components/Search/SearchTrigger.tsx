import React, { useEffect } from 'react'

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
      className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors ${className}`}
      aria-label="Open search"
    >
      <iconify-icon icon="solar:magnifer-linear" width="18" height="18"></iconify-icon>
      <span className="text-sm hidden sm:inline font-medium">Search...</span>
      <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-bold text-zinc-500">
        <span className="text-xs">⌘</span>
        K
      </kbd>
    </button>
  )
}
