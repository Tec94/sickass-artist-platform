import { useState } from 'react'
import { useGear } from '../../contexts/GearContext'
import { useGearNavigation } from '../../hooks/useGearNavigation'
import { useAuth } from '../../hooks/useAuth'
import { GearName } from '../../contexts/GearContext'
import { FanStatusBadge } from '../Profile/FanStatusBadge'
import './GearDisplay.css'

const GEARS: GearName[] = ['R', 'N', '1', '2', '3', '4', '5']

export const GearDisplay = () => {
  const { currentGear } = useGear()
  const { navigateToGear } = useGearNavigation()
  const [hoveredGear, setHoveredGear] = useState<GearName | null>(null)
  const [focusedGear, setFocusedGear] = useState<GearName | null>(null)

  const handleGearClick = (gear: GearName) => {
    navigateToGear(gear)
  }

  const handleKeyDown = (event: React.KeyboardEvent, gear: GearName) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      navigateToGear(gear)
    }
  }

  const { user } = useAuth()

  const getGearLabel = (gear: GearName): string => {
    const labels: Record<GearName, string> = {
      R: 'Reverse',
      N: 'Neutral',
      '1': user ? 'Profile' : 'First',
      '2': 'Second',
      '3': 'Third',
      '4': 'Fourth',
      '5': 'Fifth',
    }
    return labels[gear]
  }

  return (
    <nav className="gear-display" role="navigation" aria-label="Gear navigation">
      {GEARS.map((gear) => (
        <div key={gear} className="gear-container relative">
          <button
            className={`gear-button ${currentGear === gear ? 'gear-active' : ''} ${hoveredGear === gear ? 'gear-hover' : ''}`}
            onClick={() => handleGearClick(gear)}
            onMouseEnter={() => setHoveredGear(gear)}
            onMouseLeave={() => setHoveredGear(null)}
            onFocus={() => setFocusedGear(gear)}
            onBlur={() => setFocusedGear(null)}
            onKeyDown={(e) => handleKeyDown(e, gear)}
            aria-label={getGearLabel(gear)}
            aria-pressed={currentGear === gear}
            type="button"
          >
            {gear}
            {focusedGear === gear && <span className="gear-label">{gear}</span>}
          </button>
          {/* Profile gear highlight and tier badge */}
          {gear === '1' && user && (
            <div className="absolute -top-8 -right-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <FanStatusBadge user={user} size="sm" />
            </div>
          )}
        </div>
      ))}
    </nav>
  )
}
