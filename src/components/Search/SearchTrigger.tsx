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
      className={`app-search-trigger group relative inline-flex items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-950/70 px-3 py-2 text-zinc-300 transition-all hover:border-zinc-600 hover:text-white ${className}`}
      aria-label="Open search"
    >
      <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-white/[0.08] via-transparent to-transparent opacity-80"></span>
      <iconify-icon icon="solar:magnifer-linear" width="18" height="18" class="relative z-[1] text-zinc-400 group-hover:text-white"></iconify-icon>
      <span className="app-search-trigger-label relative z-[1] text-sm hidden sm:inline font-medium tracking-wide text-zinc-300">
        Search...
      </span>
      <kbd className="app-search-trigger-shortcut relative z-[1] hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700/80 text-[10px] font-bold text-zinc-400">
        <span className="text-xs">⌘</span>
        K
      </kbd>
    </button>
  )
}
