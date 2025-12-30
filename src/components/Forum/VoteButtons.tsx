import { memo, useCallback } from 'react'
import type { UserVote, VoteDirection } from '../../types/forum'

interface VoteButtonsProps {
  upCount: number
  downCount: number
  userVote: UserVote
  onVote: (direction: VoteDirection) => Promise<void>
  isLoading?: boolean
}

export const VoteButtons = memo(function VoteButtons({
  upCount,
  downCount,
  userVote,
  onVote,
  isLoading = false,
}: VoteButtonsProps) {
  const net = upCount - downCount

  const handleVote = useCallback(
    async (direction: VoteDirection) => {
      if (isLoading) return
      await onVote(direction)
    },
    [isLoading, onVote]
  )

  const upActive = userVote === 'up'
  const downActive = userVote === 'down'

  return (
    <div className="inline-flex items-center gap-2" aria-label="Vote controls">
      <button
        type="button"
        onClick={() => handleVote('up')}
        disabled={isLoading}
        aria-label="Upvote"
        aria-pressed={upActive}
        className={
          `inline-flex items-center justify-center rounded-md border px-2 py-1 text-sm transition-colors ` +
          `${upActive ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200' : 'border-gray-700 bg-gray-900/30 text-gray-300 hover:bg-gray-800/60'} ` +
          `${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`
        }
      >
        <span aria-hidden="true" className="mr-1">▲</span>
        <span className="text-xs font-semibold">{upCount}</span>
      </button>

      <div
        className={
          `min-w-10 text-center text-sm font-bold ` +
          `${net > 0 ? 'text-cyan-200' : net < 0 ? 'text-pink-200' : 'text-gray-200'}`
        }
        aria-label={`Net votes ${net}`}
      >
        {net}
      </div>

      <button
        type="button"
        onClick={() => handleVote('down')}
        disabled={isLoading}
        aria-label="Downvote"
        aria-pressed={downActive}
        className={
          `inline-flex items-center justify-center rounded-md border px-2 py-1 text-sm transition-colors ` +
          `${downActive ? 'border-pink-400 bg-pink-500/20 text-pink-200' : 'border-gray-700 bg-gray-900/30 text-gray-300 hover:bg-gray-800/60'} ` +
          `${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`
        }
      >
        <span aria-hidden="true" className="mr-1">▼</span>
        <span className="text-xs font-semibold">{downCount}</span>
      </button>
    </div>
  )
})
