import { memo, useCallback } from 'react'
import type { UserVote, VoteDirection } from '../../types/forum'

interface VoteButtonsProps {
  upCount: number
  downCount: number
  userVote: UserVote
  onVote: (direction: VoteDirection) => Promise<void>
  isLoading?: boolean
  variant?: 'forum' | 'chat'
}

export const VoteButtons = memo(function VoteButtons({
  upCount = 0,
  downCount = 0,
  userVote,
  onVote,
  isLoading = false,
  variant = 'forum',
}: VoteButtonsProps) {
  const net = (upCount || 0) - (downCount || 0)

  const handleVote = useCallback(
    async (direction: VoteDirection) => {
      if (isLoading) return
      await onVote(direction)
    },
    [isLoading, onVote]
  )

  const upActive = userVote === 'up'
  const downActive = userVote === 'down'

  // Custom SVG Icons
  const UpIcon = () => (
    <svg 
      className={`w-4 h-4 transition-transform duration-300 ${upActive ? 'scale-125' : 'group-hover:translate-y-[-2px]'}`} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 19V5M5 12l7-7 7 7" />
      <path className={upActive ? 'opacity-100' : 'opacity-0'} d="M12 5l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="4" opacity="0.5" />
    </svg>
  )

  const DownIcon = () => (
    <svg 
      className={`w-4 h-4 transition-transform duration-300 ${downActive ? 'scale-125' : 'group-hover:translate-y-[2px]'}`} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12l7 7 7-7" />
      <path className={downActive ? 'opacity-100' : 'opacity-0'} d="M12 19l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="4" opacity="0.5" />
    </svg>
  )

  return (
    <div className={`inline-flex items-center ${variant === 'chat' ? 'gap-1' : 'gap-2'}`} aria-label="Vote controls">
      <button
        type="button"
        onClick={() => handleVote('up')}
        disabled={isLoading}
        aria-label="Upvote"
        aria-pressed={upActive}
        className={
          `group inline-flex items-center justify-center rounded-md border transition-all duration-300 ` +
          `${variant === 'chat' ? 'p-1' : 'px-2 py-1'} ` +
          `${upActive ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 'border-gray-800 bg-[#0a0a0a] text-gray-500 hover:border-cyan-600 hover:text-cyan-400'} ` +
          `${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`
        }
      >
        <UpIcon />
        {variant === 'forum' && <span className="ml-1 text-xs font-bold leading-none">{upCount}</span>}
      </button>

      <div
        className={
          `${variant === 'chat' ? 'min-w-[1.5rem] text-[10px]' : 'min-w-[2.5rem] text-sm'} text-center font-black transition-colors duration-300 ` +
          `${net > 0 ? 'text-cyan-400' : net < 0 ? 'text-pink-500' : 'text-gray-600'}`
        }
        aria-label={`Net votes ${net}`}
      >
        {net > 0 ? `+${net}` : net}
      </div>

      <button
        type="button"
        onClick={() => handleVote('down')}
        disabled={isLoading}
        aria-label="Downvote"
        aria-pressed={downActive}
        className={
          `group inline-flex items-center justify-center rounded-md border transition-all duration-300 ` +
          `${variant === 'chat' ? 'p-1' : 'px-2 py-1'} ` +
          `${downActive ? 'border-pink-400 bg-pink-500/20 text-pink-200 shadow-[0_0_10px_rgba(236,72,153,0.3)]' : 'border-gray-800 bg-[#0a0a0a] text-gray-500 hover:border-pink-600 hover:text-pink-400'} ` +
          `${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`
        }
      >
        <DownIcon />
        {variant === 'forum' && <span className="ml-1 text-xs font-bold leading-none">{downCount}</span>}
      </button>
    </div>
  )
})
