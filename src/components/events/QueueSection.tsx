import React from 'react'
import { Id } from '../../../convex/_generated/dataModel'
import { useQueueState } from '../../hooks/useQueueState'
import { useCountdown } from '../../hooks/useCountdown'
import { useQueueOperations } from '../../hooks/useEventOperations'

interface QueueSectionProps {
  eventId: Id<'events'>
  onAdmitted: () => void
}

export const QueueSection: React.FC<QueueSectionProps> = ({ eventId, onAdmitted }) => {
  const { isInQueue, position, expiresAt, status, isLoading, checkoutSessionExists } = useQueueState(eventId)
  const { mins, secs, isExpired } = useCountdown(expiresAt)
  const { joinQueue, leaveQueue, isJoining, isLeaving } = useQueueOperations()

  React.useEffect(() => {
    if (status === 'admitted' || checkoutSessionExists) {
      onAdmitted()
    }
  }, [status, checkoutSessionExists, onAdmitted])

  if (isLoading) {
    return (
      <div className="bg-gray-900/70 border border-gray-800 rounded-lg p-6 animate-pulse">
        <div className="h-10 bg-gray-800 rounded mb-4"></div>
        <div className="h-6 bg-gray-800 rounded w-1/2"></div>
      </div>
    )
  }

  if (!isInQueue) {
    return (
      <div className="bg-gray-900/70 border border-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-2">Get Your Tickets</h3>
        <p className="text-gray-400 mb-6">Join the queue to purchase tickets for this event.</p>
        <button
          onClick={() => joinQueue(eventId)}
          disabled={isJoining}
          className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-600/50 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isJoining ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Joining Queue...
            </>
          ) : (
            <>
              <iconify-icon icon="solar:ticket-bold" width="20"></iconify-icon>
              Join Queue
            </>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/70 border border-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">You're in Queue</h3>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
              status === 'admitted' ? 'bg-green-500 text-green-950' : 'bg-cyan-500 text-cyan-950'
            }`}>
              {status === 'admitted' ? 'Ready to Checkout' : 'Waiting'}
            </span>
            {position !== null && status === 'waiting' && (
              <span className="text-gray-400 text-sm">Position: #{position + 1}</span>
            )}
          </div>
        </div>
        
        {expiresAt && (
          <div className="text-right">
            <div className="text-gray-400 text-xs uppercase font-bold mb-1">Expires In</div>
            <div className={`text-xl font-mono font-bold ${isExpired ? 'text-red-500' : 'text-white'}`}>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {status === 'admitted' ? (
          <button
            onClick={onAdmitted}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <iconify-icon icon="solar:cart-large-bold" width="20"></iconify-icon>
            Checkout Now
          </button>
        ) : (
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm">
              Please keep this page open. We'll notify you when it's your turn.
            </p>
          </div>
        )}

        <button
          onClick={() => leaveQueue(eventId)}
          disabled={isLeaving}
          className="w-full bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm"
        >
          {isLeaving ? 'Leaving...' : 'Leave Queue'}
        </button>
      </div>
    </div>
  )
}
