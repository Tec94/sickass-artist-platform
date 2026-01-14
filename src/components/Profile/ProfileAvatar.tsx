import type { Doc } from '../../../convex/_generated/dataModel'
import { useState } from 'react'

type ProfileAvatarUser = Pick<Doc<'users'>, 'username' | 'avatar' | 'fanTier' | 'displayName'>

interface ProfileAvatarProps {
  user: ProfileAvatarUser
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
}

const fontSizeClasses = {
  sm: 'text-xs',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-3xl',
}

const tierRingColors = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#FF0000',
}

// Generate initials from display name or username
function getInitials(displayName?: string, username?: string): string {
  const name = displayName || username || '?'
  const parts = name.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

// Generate a consistent color based on username for fallback avatar
function getAvatarColor(username: string): string {
  const colors = [
    '#e11d48', // scarlet
    '#dc2626', // red
    '#ea580c', // orange
    '#d97706', // amber
    '#ca8a04', // yellow
    '#65a30d', // lime
    '#16a34a', // green
    '#0d9488', // teal
    '#0891b2', // cyan
    '#0284c7', // sky
    '#2563eb', // blue
    '#7c3aed', // violet
    '#9333ea', // purple
    '#c026d3', // fuchsia
    '#db2777', // pink
  ]
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function ProfileAvatar({ user, size = 'md' }: ProfileAvatarProps) {
  const ringColor = tierRingColors[user.fanTier]
  const [imageError, setImageError] = useState(false)
  
  // Use OAuth avatar (Google profile picture) if available, otherwise show initials
  const hasValidAvatar = user.avatar && user.avatar.length > 0 && !imageError
  const initials = getInitials(user.displayName, user.username)
  const bgColor = getAvatarColor(user.username)

  return (
    <div className="relative inline-block profile-avatar-wrapper">
      <div 
        className="avatar-ring" 
        style={{ '--ring-color': ringColor } as React.CSSProperties}
      >
        {hasValidAvatar ? (
          <img
            src={user.avatar}
            alt={user.username}
            className={`${sizeClasses[size]} rounded-full object-cover avatar-img`}
            onError={() => setImageError(true)}
          />
        ) : (
          <div 
            className={`${sizeClasses[size]} rounded-full avatar-img flex items-center justify-center ${fontSizeClasses[size]} font-bold text-white`}
            style={{ backgroundColor: bgColor }}
          >
            {initials}
          </div>
        )}
      </div>

      <style>{`
        .profile-avatar-wrapper {
          padding: 3px;
        }

        .avatar-ring {
          position: relative;
          padding: 3px;
          border-radius: 50%;
          background: linear-gradient(45deg, transparent, var(--ring-color), transparent);
          animation: rotate-ring 4s linear infinite;
        }

        .avatar-img {
          background: #000;
          border: 2px solid #000;
          position: relative;
          z-index: 2;
        }

        @keyframes rotate-ring {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
