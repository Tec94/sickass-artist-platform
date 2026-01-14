import type { Doc } from '../../../convex/_generated/dataModel'

type ProfileAvatarUser = Pick<Doc<'users'>, 'username' | 'avatar' | 'fanTier'>

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

const tierRingColors = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#FF0000',
}

export function ProfileAvatar({ user, size = 'md' }: ProfileAvatarProps) {
  const ringColor = tierRingColors[user.fanTier]

  return (
    <div className="relative inline-block profile-avatar-wrapper">
      <div 
        className="avatar-ring" 
        style={{ '--ring-color': ringColor } as React.CSSProperties}
      >
        <img
          src="/src/public/assets/test-image.jpg"
          alt={user.username}
          className={`${sizeClasses[size]} rounded-full object-cover avatar-img`}
        />
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
