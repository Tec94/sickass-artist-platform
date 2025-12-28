import { Doc } from '../../../convex/_generated/dataModel'

interface ProfileAvatarProps {
  user: Doc<'users'>
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
}

const tierRingColors = {
  bronze: 'ring-amber-600',
  silver: 'ring-gray-400',
  gold: 'ring-yellow-500',
  platinum: 'ring-cyan-400',
}

export function ProfileAvatar({ user, size = 'md' }: ProfileAvatarProps) {
  return (
    <div className="relative inline-block">
      <img
        src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
        alt={user.username}
        className={`${sizeClasses[size]} rounded-full ring-2 ${tierRingColors[user.fanTier]} object-cover`}
      />
      {size !== 'sm' && (
        <div className="absolute bottom-0 right-0 text-2xl bg-gray-900 rounded-full p-1">
          {user.fanTier === 'bronze' && '🥉'}
          {user.fanTier === 'silver' && '🥈'}
          {user.fanTier === 'gold' && '🥇'}
          {user.fanTier === 'platinum' && '👑'}
        </div>
      )}
    </div>
  )
}
