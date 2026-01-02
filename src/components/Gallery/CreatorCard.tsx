import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Doc } from '../../convex/_generated/dataModel'
import { ProfileAvatar } from '../Profile/ProfileAvatar'

interface CreatorCardProps {
  creator: Doc<'users'>
  showBio?: boolean
  compact?: boolean
}

export const CreatorCard = memo(function CreatorCard({
  creator,
  showBio = true,
  compact = false,
}: CreatorCardProps) {
  const navigate = useNavigate()

  const handleAvatarClick = () => {
    navigate(`/profile/${creator._id}`)
  }

  const tierColors = {
    bronze: 'bg-amber-600/20 text-amber-300 border-amber-500/50',
    silver: 'bg-gray-400/20 text-gray-300 border-gray-400/50',
    gold: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50',
    platinum: 'bg-cyan-400/20 text-cyan-300 border-cyan-300/50',
  }

  const roleColors = {
    artist: 'bg-purple-600/20 text-purple-300 border-purple-500/50',
    admin: 'bg-red-600/20 text-red-300 border-red-500/50',
    mod: 'bg-blue-600/20 text-blue-300 border-blue-500/50',
    crew: 'bg-green-600/20 text-green-300 border-green-500/50',
    fan: 'bg-gray-600/20 text-gray-300 border-gray-500/50',
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleAvatarClick}
          className="flex-shrink-0 hover:opacity-80 transition-opacity"
          aria-label={`View ${creator.displayName}'s profile`}
        >
          <ProfileAvatar user={creator} size="sm" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white truncate">{creator.displayName}</p>
          <p className="text-xs text-gray-400 truncate">@{creator.username}</p>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full border ${tierColors[creator.fanTier]} flex-shrink-0`}
        >
          {creator.fanTier}
        </span>
      </div>
    )
  }

  const truncatedBio = creator.bio && creator.bio.length > 100 
    ? creator.bio.slice(0, 100) + '...' 
    : creator.bio

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <button
        onClick={handleAvatarClick}
        className="flex items-center gap-3 mb-3 w-full hover:opacity-80 transition-opacity"
        aria-label={`View ${creator.displayName}'s profile`}
      >
        <ProfileAvatar user={creator} size="md" />
        <div className="text-left flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{creator.displayName}</p>
          <p className="text-sm text-gray-400 truncate">@{creator.username}</p>
        </div>
      </button>

      <div className="flex flex-wrap gap-2 mb-3">
        <span
          className={`text-xs px-3 py-1 rounded-full border ${tierColors[creator.fanTier]}`}
        >
          {creator.fanTier.charAt(0).toUpperCase() + creator.fanTier.slice(1)}
        </span>
        {creator.role !== 'fan' && (
          <span
            className={`text-xs px-3 py-1 rounded-full border capitalize ${roleColors[creator.role]}`}
          >
            {creator.role}
          </span>
        )}
      </div>

      {showBio && creator.bio && (
        <p className="text-sm text-gray-300 line-clamp-2 mb-3" title={creator.bio}>
          {truncatedBio}
        </p>
      )}

      <button
        className="w-full px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded transition-colors"
        aria-label={`Follow ${creator.displayName}`}
      >
        Follow
      </button>
    </div>
  )
})
