import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { ProfileAvatar } from '../Profile/ProfileAvatar'
import { FanStatusBadge } from '../Profile/FanStatusBadge'

export function UserHeader() {
  const { user, isSignedIn } = useAuth()
  const navigate = useNavigate()
  const { logout } = useAuth0()

  if (!isSignedIn || !user) {
    return null
  }

  return (
    <div className="user-header-integrated flex items-center gap-3">
      {/* User Info Card */}
      <div className="profile-group flex items-center gap-3">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <ProfileAvatar user={user} size="sm" />
          <div className="text-left">
            <p className="user-name text-white font-semibold text-sm leading-none">
              {user.displayName || user.username}
            </p>
            <p className="user-level text-gray-400 text-xs leading-none mt-1">LVL {user.level}</p>
          </div>
        </button>

        {/* Tier Badge */}
        <div className="hidden lg:block">
          <FanStatusBadge user={user} size="sm" />
        </div>

        {/* Sign Out Button */}
        <button
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          className="sign-out-btn px-4 py-1.5 bg-red-600/20 hover:bg-red-600/40 border border-red-600/40 text-white text-xs font-bold rounded-full transition-all"
        >
          EXIT
        </button>
      </div>

      <style>{`
        .user-header-integrated {
          height: 44px;
        }
        .user-name {
          letter-spacing: 0.5px;
        }
        .sign-out-btn:hover {
          box-shadow: 0 0 15px rgba(255, 0, 0, 0.2);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  )
}
