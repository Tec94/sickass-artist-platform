import { useState } from 'react'
import { useGear } from '../../contexts/GearContext'
import { useGearNavigation } from '../../hooks/useGearNavigation'
import { useAuth } from '../../hooks/useAuth'
import { GearName } from '../../contexts/GearContext'
import './GearDisplay.css'

const GEARS: { id: GearName, icon: string, label: string }[] = [
  { id: 'R', icon: 'solar:refresh-circle-linear', label: 'Reset' },
  { id: 'N', icon: 'solar:stop-circle-linear', label: 'Neutral' },
  { id: '1', icon: 'solar:user-id-linear', label: 'Profile' },
  { id: '2', icon: 'solar:posts-carousel-vertical-linear', label: 'Forum' },
  { id: '3', icon: 'solar:gallery-wide-linear', label: 'Gallery' },
  { id: '4', icon: 'solar:music-note-linear', label: 'Music' },
  { id: '5', icon: 'solar:settings-linear', label: 'Settings' },
  { id: '6', icon: 'solar:chat-round-dots-linear', label: 'Chat' },
]

export const GearDisplay = ({ variant = 'default' }: { variant?: 'default' | 'horizontal' }) => {
  const { currentGear } = useGear()
  const { navigateToGear } = useGearNavigation()
  const { user } = useAuth()
  const [hoveredGear, setHoveredGear] = useState<GearName | null>(null)

  return (
    <nav className={`gear-display ${variant}`} role="navigation" aria-label="Gear navigation">
      <div className="gear-display-container">
        {GEARS.map((gear) => (
          <div 
            key={gear.id} 
            className={`gear-item ${currentGear === gear.id ? 'active' : ''} ${hoveredGear === gear.id ? 'hover' : ''}`}
            onMouseEnter={() => setHoveredGear(gear.id)}
            onMouseLeave={() => setHoveredGear(null)}
          >
            <button
              className="gear-btn"
              onClick={() => navigateToGear(gear.id)}
              aria-label={gear.label}
              type="button"
            >
              <iconify-icon icon={gear.icon}></iconify-icon>
              <span className="gear-marker-id">{gear.id}</span>
            </button>
            {variant === 'default' && (
              <div className="gear-info">
                <span className="gear-label">{gear.label}</span>
                {gear.id === '1' && user && <span className="user-tip">{user.displayName}</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .gear-display.default {
          position: fixed;
          left: 40px;
          bottom: 40px;
          z-index: 100;
        }

        .gear-display.horizontal {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
        }

        .gear-display.horizontal .gear-display-container {
          display: flex;
          flex-direction: row;
          gap: 8px;
          align-items: center;
        }

        .gear-display.horizontal .gear-btn {
          width: 42px;
          height: 42px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }

        .gear-display.horizontal .gear-btn iconify-icon {
          font-size: 18px;
        }

        .gear-display.horizontal .gear-marker-id {
          font-size: 9px;
          font-weight: 900;
          opacity: 0.7;
          margin-top: -1px;
        }
        
        .gear-display.horizontal .gear-item.active .gear-marker-id {
          opacity: 1;
          color: var(--color-primary);
        }

        .gear-display-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .gear-item {
          display: flex;
          align-items: center;
          gap: 16px;
          transition: var(--transition-standard);
        }

        .gear-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(10, 10, 10, 0.8);
          border: 1px solid var(--color-card-border);
          color: var(--color-text-dim);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .gear-btn iconify-icon {
          font-size: 24px;
        }

        .gear-marker-id {
          font-size: 10px;
          font-weight: 800;
          opacity: 0.5;
          margin-top: -2px;
        }

        .gear-item.active .gear-btn {
          border-color: var(--color-primary);
          color: white;
          box-shadow: 0 0 20px rgba(255, 0, 0, 0.3);
          transform: scale(1.1);
        }

        .gear-item.active .gear-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          border: 1px solid var(--color-primary);
          border-radius: 50%;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .gear-info {
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .gear-item:hover .gear-info,
        .gear-item.active .gear-info {
          opacity: 1;
          transform: translateX(0);
        }

        .gear-label {
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: white;
        }

        .user-tip {
          font-size: 11px;
          color: var(--color-primary);
        }

        @media (max-width: 768px) {
          .gear-display.default {
            left: 10px;
          }
          .gear-info { display: none; }
        }
      `}</style>
    </nav>
  )
}
