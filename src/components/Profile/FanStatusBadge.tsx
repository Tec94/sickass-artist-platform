import { Doc } from '../../../convex/_generated/dataModel'

interface FanStatusBadgeProps {
  user: Doc<'users'>
  size?: 'sm' | 'md' | 'lg'
}

const tierColors = {
  bronze: { bg: 'bg-amber-600', border: 'border-amber-500', text: 'text-amber-100' },
  silver: { bg: 'bg-gray-400', border: 'border-gray-300', text: 'text-gray-900' },
  gold: { bg: 'bg-yellow-500', border: 'border-yellow-400', text: 'text-yellow-900' },
  platinum: { bg: 'bg-cyan-400', border: 'border-cyan-300', text: 'text-cyan-900' },
}

const sizeClasses = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-lg',
}

const tierEmojis = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '👑',
}

export function FanStatusBadge({ user, size = 'md' }: FanStatusBadgeProps) {
  const tierColor = tierColors[user.fanTier]
  const emoji = tierEmojis[user.fanTier]

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`${tierColor.bg} border ${tierColor.border} rounded-full ${sizeClasses[size]} font-bold ${tierColor.text} inline-flex items-center justify-center w-fit`}
      >
        {emoji} {user.fanTier.toUpperCase()}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Level {user.level}</span>
          <span className="text-gray-500 text-xs">{user.xp} XP</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-cyan-500 h-2 rounded-full transition-all"
            style={{ width: `${(user.xp % 100) * 1}%` }}
          />
        </div>
      </div>
    </div>
  )
}
