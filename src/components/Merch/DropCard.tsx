import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { DropCountdown } from './DropCountdown'
import { Doc, Id } from '../../../convex/_generated/dataModel'
import { useState } from 'react'

interface DropCardProps {
  drop: Doc<'merchDrops'> & {
    products?: Id<'merchProducts'>[]
    productCount?: number
  }
  serverTime?: number
}

export function DropCard({ drop, serverTime }: DropCardProps) {
  const navigate = useNavigate()
  const [isNotifyChecked, setIsNotifyChecked] = useState(false)

  const now = serverTime || Date.now()
  const isUpcoming = drop.startsAt > now
  const isActive = now >= drop.startsAt && now < drop.endsAt
  const isEnded = now >= drop.endsAt

  const handleNotify = () => {
    setIsNotifyChecked(!isNotifyChecked)
    // In production, would subscribe to notification
  }

  const handleViewDrop = () => {
    // Navigate to drops detail or filtered merch page
    navigate('/merch', {
      state: { highlightedDropId: drop._id },
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-lg border transition-colors ${
        isActive
          ? 'border-green-500/50 bg-green-500/5'
          : isUpcoming
            ? 'border-cyan-500/50 bg-cyan-500/5'
            : 'border-gray-800 bg-gray-900/50'
      }`}
    >
      {/* Background image */}
      {drop.imageUrl && (
        <div className="absolute inset-0 z-0 opacity-30">
          <img
            src={drop.imageUrl}
            alt={drop.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-6 space-y-4">
        {/* Status badge */}
        <div className="flex items-center gap-2">
          {isActive && (
            <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full animate-pulse">
              LIVE NOW
            </span>
          )}
          {isUpcoming && (
            <span className="px-3 py-1 bg-cyan-600 text-white text-xs font-bold rounded-full">
              UPCOMING
            </span>
          )}
          {isEnded && (
            <span className="px-3 py-1 bg-gray-700 text-gray-300 text-xs font-bold rounded-full">
              ENDED
            </span>
          )}
        </div>

        {/* Title */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">{drop.name}</h3>
          {drop.description && (
            <p className="text-gray-400 text-sm">{drop.description}</p>
          )}
        </div>

        {/* Product count */}
        {drop.productCount !== undefined && (
          <p className="text-cyan-400 text-sm font-semibold">
            {drop.productCount} product{drop.productCount !== 1 ? 's' : ''} available
          </p>
        )}

        {/* Countdown or status */}
        <div className="py-3 px-3 bg-black/40 rounded border border-gray-800">
          <DropCountdown
            startsAt={drop.startsAt}
            endsAt={drop.endsAt}
            serverTime={serverTime}
            size="lg"
          />
        </div>

        {/* Notify button (for upcoming) */}
        {isUpcoming && (
          <button
            onClick={handleNotify}
            className={`w-full py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors ${
              isNotifyChecked
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            <iconify-icon icon="solar:bell-linear" width="16" height="16"></iconify-icon>
            {isNotifyChecked ? "You'll be notified" : 'Notify me'}
          </button>
        )}

        {/* Shop button */}
        <button
          onClick={handleViewDrop}
          disabled={isEnded}
          className={`w-full py-3 px-4 font-semibold rounded transition-colors ${
            isActive
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : isUpcoming
                ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isActive ? 'Shop Drop Now' : isUpcoming ? 'View Products' : 'Drop Ended'}
        </button>
      </div>
    </motion.div>
  )
}
