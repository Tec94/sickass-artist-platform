import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { SignOutButton } from '@clerk/clerk-react'
import { ProfileAvatar } from '../Profile/ProfileAvatar'
import { FanStatusBadge } from '../Profile/FanStatusBadge'

export function UserHeader() {
  const { user, isSignedIn } = useAuth()
  const navigate = useNavigate()

  if (!isSignedIn || !user) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-4">
      {/* User Info Card */}
      <div className="bg-gray-800/90 border border-gray-700 rounded-lg p-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <ProfileAvatar user={user} size="sm" />
          <div className="text-left">
            <p className="text-white font-semibold text-sm">
              {user.displayName || user.username}
            </p>
            <p className="text-gray-400 text-xs">Level {user.level}</p>
          </div>
        </button>

        {/* Tier Badge */}
        <div className="hidden sm:block">
          <FanStatusBadge user={user} size="sm" />
        </div>

        {/* Sign Out Button */}
        <SignOutButton>
          <button className="px-3 py-1 bg-red-600/80 hover:bg-red-700 text-white text-xs font-semibold rounded transition">
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </div>
  )
}
