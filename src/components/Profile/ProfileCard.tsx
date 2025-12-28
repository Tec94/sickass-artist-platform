import { Doc } from '../../../convex/_generated/dataModel'
import { ProfileAvatar } from './ProfileAvatar'
import { FanStatusBadge } from './FanStatusBadge'

interface ProfileCardProps {
  user: Doc<'users'>
  onClick?: () => void
}

export function ProfileCard({ user, onClick }: ProfileCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20 transition cursor-pointer"
    >
      <div className="flex items-start gap-4 mb-4">
        <ProfileAvatar user={user} size="md" />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">
            {user.displayName || user.username}
          </h3>
          <p className="text-gray-400 text-sm">@{user.username}</p>
        </div>
      </div>

      {user.bio && (
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{user.bio}</p>
      )}

      <FanStatusBadge user={user} size="sm" />
    </div>
  )
}
