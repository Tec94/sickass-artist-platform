import { Doc } from '../../../convex/_generated/dataModel'
import { ProfileAvatar } from './ProfileAvatar'
import { FanStatusBadge } from './FanStatusBadge'

interface FullProfileProps {
  user: Doc<'users'>
}

export function FullProfile({ user }: FullProfileProps) {
  return (
    <div className="space-y-6">
      {/* Avatar & Basic Info */}
      <div className="flex gap-6 items-start">
        <ProfileAvatar user={user} size="xl" />
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-white mb-2">
            {user.displayName || user.username}
          </h2>
          <p className="text-gray-400 text-lg mb-4">@{user.username}</p>
          {user.bio && (
            <p className="text-gray-300 text-base leading-relaxed mb-4">
              {user.bio}
            </p>
          )}
          {user.location && (
            <p className="text-gray-400 text-sm">📍 {user.location}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Level</p>
          <p className="text-2xl font-bold text-cyan-400">{user.level}</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">XP</p>
          <p className="text-2xl font-bold text-cyan-400">{user.xp}</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Badges</p>
          <p className="text-2xl font-bold text-cyan-400">{user.badges.length}</p>
        </div>
      </div>

      {/* Fan Tier */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Fan Status</h3>
        <FanStatusBadge user={user} size="md" />
      </div>

      {/* Social Links */}
      {Object.values(user.socials).some(v => v) && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Social Media
          </h3>
          <div className="flex gap-4">
            {user.socials.twitter && (
              <a
                href={`https://twitter.com/${user.socials.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm"
              >
                Twitter
              </a>
            )}
            {user.socials.instagram && (
              <a
                href={`https://instagram.com/${user.socials.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm"
              >
                Instagram
              </a>
            )}
            {user.socials.tiktok && (
              <a
                href={`https://tiktok.com/@${user.socials.tiktok}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm"
              >
                TikTok
              </a>
            )}
          </div>
        </div>
      )}

      {/* Badges */}
      {user.badges.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Badges</h3>
          <div className="flex flex-wrap gap-3">
            {user.badges.map(badge => (
              <div
                key={badge}
                className="px-4 py-2 bg-yellow-500/20 border border-yellow-500 rounded-full text-yellow-300 text-sm font-semibold"
              >
                🏆 {badge}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
