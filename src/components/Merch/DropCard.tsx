import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { DropCountdown } from './DropCountdown'
import { Doc, Id } from '../../../convex/_generated/dataModel'
import { useState } from 'react'
import { getStoreDesignImage } from '../../features/store/storeDesignAssets'

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
  const fallbackImageIndex = Math.abs(
    Array.from(`${drop._id}${drop.name}`).reduce((sum, character) => sum + character.charCodeAt(0), 0),
  )
  const imageSrc = drop.imageUrl || getStoreDesignImage(fallbackImageIndex)

  const handleNotify = () => {
    setIsNotifyChecked(!isNotifyChecked)
    // In production, would subscribe to notification
  }

  const handleViewDrop = () => {
    // Route directly into app-mode browse instead of bouncing users back through scenic mode.
    navigate('/store/browse', {
      state: { highlightedDropId: drop._id },
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`store-v2-surface-card store-v2-record-card relative overflow-hidden p-0 text-left transition-colors ${
        isActive
          ? 'border-[rgba(216,184,152,0.34)]'
          : isUpcoming
            ? 'border-[rgba(160,32,48,0.3)]'
            : 'border-[rgba(216,184,152,0.12)]'
      }`}
    >
      <div className="absolute inset-0 z-0 opacity-45">
        <img
          src={imageSrc}
          alt={drop.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(14,10,8,0.35)] to-[rgba(10,8,7,0.94)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-4 p-6">
        {/* Status badge */}
        <div className="flex items-center gap-2">
          {isActive && (
            <span className="store-v2-pill animate-pulse">
              LIVE NOW
            </span>
          )}
          {isUpcoming && (
            <span className="store-v2-pill border-[rgba(160,32,48,0.42)] bg-[rgba(76,42,49,0.72)] text-[var(--store-v2-tone-text-main)]">
              UPCOMING
            </span>
          )}
          {isEnded && (
            <span className="store-v2-pill border-[rgba(216,184,152,0.18)] bg-[rgba(20,16,12,0.82)] text-[var(--store-v2-tone-text-meta)]">
              ENDED
            </span>
          )}
        </div>

        {/* Title */}
        <div>
          <h3 className="store-v2-h2 text-[var(--store-v2-tone-text-main)]">{drop.name}</h3>
          {drop.description && (
            <p className="mt-2 store-v2-meta">{drop.description}</p>
          )}
        </div>

        {/* Product count */}
        {drop.productCount !== undefined && (
          <p className="store-v2-label">
            {drop.productCount} product{drop.productCount !== 1 ? 's' : ''} available
          </p>
        )}

        {/* Countdown or status */}
        <div className="rounded-[14px] border border-[rgba(216,184,152,0.14)] bg-[rgba(11,9,8,0.72)] px-3 py-3">
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
            className={`store-v2-control w-full justify-center gap-2 ${
              isNotifyChecked
                ? 'store-v2-btn-primary'
                : 'store-v2-btn-secondary'
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
          className={`store-v2-control w-full justify-center ${
            isActive
              ? 'store-v2-btn-primary'
              : isUpcoming
                ? 'store-v2-btn-secondary'
                : 'store-v2-btn-secondary cursor-not-allowed opacity-55'
          }`}
        >
          {isActive ? 'Shop Drop Now' : isUpcoming ? 'View Products' : 'Drop Ended'}
        </button>
      </div>
    </motion.div>
  )
}
