import { memo } from 'react'
import type { GalleryContentItem } from '../../types/gallery'
import { FanTier } from '../../types/gallery'

interface TierLockedOverlayProps {
  item: GalleryContentItem
  onClose: () => void
}

const tierLevels: Record<FanTier, number> = {
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
}

const tierColors: Record<FanTier, string> = {
  bronze: 'from-amber-600 to-amber-800',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-500 to-yellow-700',
  platinum: 'from-cyan-400 to-cyan-600',
}

export const TierLockedOverlay = memo(function TierLockedOverlay({
  item,
  onClose,
}: TierLockedOverlayProps) {
  const tier = item.requiredFanTier

  if (!tier) {
    onClose()
    return null
  }

  const level = tierLevels[tier]
  const gradient = tierColors[tier]

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-700 shadow-2xl">
        <div className="text-center mb-6">
          <div className={`inline-block p-4 rounded-full bg-gradient-to-br ${gradient} mb-4 shadow-lg`}>
            <span className="text-5xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {tier.toUpperCase()} Tier Content
          </h2>
          <p className="text-gray-400">
            This content is exclusive to {tier} tier fans and above
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={item.thumbnailUrl || item.imageUrl}
              alt={item.title}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1 text-left">
              <h3 className="text-white font-semibold mb-1 truncate">{item.title}</h3>
              <p className="text-gray-400 text-sm truncate">{item.description}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <img
                src={item.creator.avatar}
                alt={item.creator.displayName}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-gray-300">@{item.creator.username}</span>
            </div>
            <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${gradient} text-black text-xs font-bold`}>
              LVL {level}+
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <p className="text-gray-300 text-center text-sm">
            Upgrade your fan tier to unlock exclusive content, early access, and more!
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-black font-semibold rounded-lg transition-colors shadow-lg"
          >
            Upgrade Tier
          </button>
        </div>
      </div>
    </div>
  )
})
