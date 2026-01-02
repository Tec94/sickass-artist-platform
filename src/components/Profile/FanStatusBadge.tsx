import { Doc } from '../../../convex/_generated/dataModel'

interface FanStatusBadgeProps {
  user: Doc<'users'>
  size?: 'sm' | 'md' | 'lg'
}

const tierStyles = {
  bronze: { color: '#CD7F32', icon: 'solar:medal-star-bold' },
  silver: { color: '#C0C0C0', icon: 'solar:medal-ribbon-bold' },
  gold: { color: '#FFD700', icon: 'solar:cup-first-bold' },
  platinum: { color: '#FF0000', icon: 'solar:crown-bold' },
}

export function FanStatusBadge({ user, size = 'md' }: FanStatusBadgeProps) {
  const style = tierStyles[user.fanTier]
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-lg px-4 py-2' : 'text-sm px-3 py-1'

  return (
    <div className="fan-status-container">
      <div 
        className={`fan-badge ${sizeClass}`}
        style={{ borderColor: `${style.color}44`, color: style.color, background: `${style.color}11` }}
      >
        <iconify-icon icon={style.icon}></iconify-icon>
        <span>{user.fanTier.toUpperCase()}</span>
      </div>

      {size !== 'sm' && (
        <div className="xp-progress">
          <div className="xp-info">
            <span className="level">LVL {user.level}</span>
            <span className="xp">{user.xp} XP</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(user.xp % 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      <style>{`
        .fan-status-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: fit-content;
        }

        .fan-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          border-radius: 100px;
          border: 1px solid;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .xp-progress {
          width: 200px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .xp-info {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 700;
          color: var(--color-text-dim);
        }

        .progress-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--color-primary);
          box-shadow: 0 0 10px var(--color-primary);
          transition: width 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
