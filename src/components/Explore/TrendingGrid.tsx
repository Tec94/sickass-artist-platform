import { memo } from 'react'
import { useNavigate } from 'react-router-dom'

import type { TrendingItem, FanTier } from '../../types'

interface TrendingGridProps {
  items: TrendingItem[]
}

const tierColors: Record<FanTier, string> = {
  bronze: 'bg-amber-600/20 text-amber-300 border-amber-500/50',
  silver: 'bg-gray-400/20 text-gray-300 border-gray-400/50',
  gold: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50',
  platinum: 'bg-cyan-400/20 text-cyan-300 border-cyan-300/50',
}

const typeLabels: Record<string, string> = {
  show: 'SHOW',
  bts: 'BTS',
  edit: 'EDIT',
  wip: 'WIP',
  exclusive: 'EXCLUSIVE',
  'user-edit': 'USER EDIT',
  'fan-art': 'FAN ART',
  repost: 'REPOST',
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return n.toString()
}

const TrendingCard = memo(function TrendingCard({ item }: { item: TrendingItem }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (item.type === 'gallery') {
      navigate(`/gallery/${item.contentId}`)
    } else {
      navigate(`/ugc/${item.contentId}`)
    }
  }

  return (
    <div
      className="group relative bg-gray-900/70 border border-gray-800 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:border-cyan-500/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10"
      onClick={handleClick}
    >
      <div className="relative aspect-video overflow-hidden bg-gray-950">
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
        />

        {item.isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
            <span className="text-3xl mb-2">🔒</span>
            <span className="text-xs font-bold tracking-wider text-amber-400 bg-black/60 px-3 py-1 rounded-full">
              {item.requiredFanTier?.toUpperCase()} ONLY
            </span>
          </div>
        )}

        <div className="absolute top-2 left-2 bg-cyan-500/90 text-black px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">
          {typeLabels[item.subType] || item.subType.toUpperCase()}
        </div>

        <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-0.5 rounded text-xs font-medium">
          {item.type === 'gallery' ? 'Gallery' : 'UGC'}
        </div>
      </div>

      <div className="p-3">
        <h3
          className="text-white font-medium text-sm mb-2 truncate"
          title={item.title}
        >
          {item.title}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={item.creatorAvatar}
              alt={item.creatorDisplayName}
              className="w-6 h-6 rounded-full object-cover bg-gray-800"
            />
            <span className="text-cyan-400 text-xs truncate max-w-[100px]">
              {item.creatorDisplayName}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0 ${tierColors[item.creatorTier]}`}
            >
              {item.creatorTier}
            </span>
          </div>

          <div className="flex gap-3 text-xs text-gray-500 flex-shrink-0">
            <span className="flex items-center gap-1">
              <iconify-icon icon="solar:heart-linear" width="12" height="12" style={{ color: '#f87171' }}></iconify-icon>
              {formatNumber(item.likeCount)}
            </span>
            <span className="flex items-center gap-1">
              <iconify-icon icon="solar:view-linear" width="12" height="12" style={{ color: '#60a5fa' }}></iconify-icon>
              {formatNumber(item.viewCount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
})

export const TrendingGrid = memo(function TrendingGrid({ items }: TrendingGridProps) {
  if (items.length === 0) {
    return (
      <div className="col-span-full py-12 text-center">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No Content Found</h3>
        <p className="text-gray-500">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <TrendingCard key={item.id} item={item} />
      ))}
    </div>
  )
})
