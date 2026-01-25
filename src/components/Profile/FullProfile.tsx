import { Doc } from '../../../convex/_generated/dataModel'
import { ProfileAvatar } from './ProfileAvatar'
import { FanStatusBadge } from './FanStatusBadge'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'

interface FullProfileProps {
  user: Doc<'users'>
}

export function FullProfile({ user }: FullProfileProps) {
  const animate = useScrollAnimation()

  return (
    <div className="profile-details space-y-8">
      {/* Avatar & Basic Info */}
      <div ref={animate} data-animate className="profile-hero flex gap-8 items-center">
        <ProfileAvatar user={user} size="xl" />
        <div className="flex-1">
          <h2 className="profile-display-name">
            {user.displayName || user.username}
          </h2>
          <p className="profile-handle">@{user.username}</p>
          {user.bio && (
            <p className="profile-bio">
              {user.bio}
            </p>
          )}
          {user.location && (
            <p className="profile-location">
              <iconify-icon icon="solar:map-point-linear"></iconify-icon> {user.location}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="profile-stats-grid grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Level', value: user.level, icon: 'solar:ranking-linear' },
          { label: 'XP', value: user.xp, icon: 'solar:bolt-linear' },
          { label: 'Karma', value: user.votedPoints || 0, icon: 'solar:star-linear' },
          { label: 'Badges', value: user.badges.length, icon: 'solar:medal-ribbon-linear' },
        ].map((stat, i) => (
          <div 
            key={stat.label} 
            ref={animate} 
            data-animate 
            className="stat-card"
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <div className="stat-header">
               <iconify-icon icon={stat.icon}></iconify-icon>
               <span className="stat-label">{stat.label}</span>
            </div>
            <p className="stat-value">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Fan Status Section */}
      <section ref={animate} data-animate className="profile-section">
        <h3 className="section-title">Fan Privilege</h3>
        <div className="section-content">
           <FanStatusBadge user={user} size="md" />
        </div>
      </section>

      {/* Social Links */}
      {Object.values(user.socials).some(v => v) && (
        <section ref={animate} data-animate className="profile-section">
          <h3 className="section-title">Connected Hubs</h3>
          <div className="social-links flex gap-4">
            {user.socials.twitter && (
              <a href={`https://twitter.com/${user.socials.twitter}`} target="_blank" rel="noopener noreferrer" className="social-btn">
                <iconify-icon icon="simple-icons:twitter"></iconify-icon>
              </a>
            )}
            {user.socials.instagram && (
              <a href={`https://www.instagram.com/${user.socials.instagram}`} target="_blank" rel="noopener noreferrer" className="social-btn">
                <iconify-icon icon="simple-icons:instagram"></iconify-icon>
              </a>
            )}
            {user.socials.tiktok && (
              <a href={`https://tiktok.com/@${user.socials.tiktok}`} target="_blank" rel="noopener noreferrer" className="social-btn">
                <iconify-icon icon="simple-icons:tiktok"></iconify-icon>
              </a>
            )}
          </div>
        </section>
      )}

      <style>{`
        .profile-details {
          max-width: 800px;
          margin: 0 auto;
        }

        .profile-hero {
          background: rgba(255, 255, 255, 0.03);
          padding: 32px;
          border-radius: 24px;
          border: 1px solid var(--color-card-border);
        }

        .profile-display-name {
          font-size: 32px;
          font-weight: 800;
          color: white;
          margin: 0;
          letter-spacing: -1px;
        }

        .profile-handle {
          font-size: 16px;
          color: var(--color-primary);
          font-weight: 700;
          margin: 4px 0 16px 0;
        }

        .profile-bio {
          font-size: 15px;
          color: var(--color-text-dim);
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .profile-location {
          font-size: 13px;
          color: var(--color-text-dim);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .stat-card {
          background: rgba(10, 10, 10, 0.4);
          border: 1px solid var(--color-card-border);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          border-color: var(--color-primary);
          transform: translateY(-5px);
          background: rgba(255, 0, 0, 0.05);
        }

        .stat-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--color-primary);
          font-size: 18px;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--color-text-dim);
          letter-spacing: 1px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 800;
          color: white;
          margin: 0;
        }

        .profile-section {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 20px;
          padding: 24px;
          border: 1px solid var(--color-card-border);
        }

        .section-title {
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--color-text-dim);
          margin: 0 0 20px 0;
        }

        .social-btn {
          width: 44px;
          height: 44px;
          background: #111;
          border: 1px solid #222;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          transition: all 0.3s ease;
        }

        .social-btn:hover {
          background: var(--color-primary);
          border-color: var(--color-primary);
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(255, 0, 0, 0.3);
        }
      `}</style>
    </div>
  )
}
