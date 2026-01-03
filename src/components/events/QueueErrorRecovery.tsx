import React from 'react'

interface QueueErrorRecoveryProps {
  error: string | null
  retryCount?: number
  onRetry: () => void
  onRequeue: () => void
  onViewSimilar: () => void
}

export const QueueErrorRecovery: React.FC<QueueErrorRecoveryProps> = ({
  error,
  retryCount = 0,
  onRetry,
  onRequeue,
  onViewSimilar,
}) => {
  if (!error) return null

  const isExpired = error.toLowerCase().includes('expired')
  const isSoldOut = error.toLowerCase().includes('sold out') || error.toLowerCase().includes('capacity')
  const isNetwork = error.toLowerCase().includes('network') || error.toLowerCase().includes('connection')

  return (
    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        {retryCount > 0 && (
          <div className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
        )}
        <p className="text-red-500 font-medium">
          {error}
          {retryCount > 0 && ` (Retrying attempt ${retryCount}...)`}
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {isExpired && (
          <button
            onClick={onRequeue}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors"
          >
            Re-queue
          </button>
        )}

        {isSoldOut && (
          <button
            onClick={onViewSimilar}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors border border-zinc-700"
          >
            View similar events
          </button>
        )}

        {isNetwork && (
          <button
            onClick={onRetry}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors"
          >
            Retry
          </button>
        )}

        {!isExpired && !isSoldOut && !isNetwork && (
          <button
            onClick={onRetry}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}
