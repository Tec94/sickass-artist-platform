import { useState, useRef, useEffect, useCallback } from 'react'
import { useGear } from '../../contexts/GearContext'
import { useGearNavigation } from '../../hooks/useGearNavigation'
import { GearName } from '../../contexts/GearContext'
import './GearStick.css'

const GEAR_ORDER: GearName[] = ['R', 'N', '1', '2', '3', '4', '5']

export const GearStick = () => {
  const { currentGear } = useGear()
  const { navigateToGear } = useGearNavigation()
  const [isDragging, setIsDragging] = useState(false)
  const [showIndicator, setShowIndicator] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setShowIndicator(true)
  }

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !trackRef.current) return

    const trackRect = trackRef.current.getBoundingClientRect()
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const relativeY = clientY - trackRect.top

    // Clamp within track bounds
    const clampedY = Math.max(0, Math.min(relativeY, trackRect.height))

    // Find nearest gear
    const gearHeight = trackRect.height / (GEAR_ORDER.length - 1)
    const gearIndex = Math.round(clampedY / gearHeight)
    const nearestGear = GEAR_ORDER[Math.min(gearIndex, GEAR_ORDER.length - 1)]

    if (nearestGear !== currentGear) {
      navigateToGear(nearestGear)
    }
  }, [isDragging, currentGear, navigateToGear])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setTimeout(() => setShowIndicator(false), 500)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleMouseMove)
      document.addEventListener('touchend', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleMouseMove)
        document.removeEventListener('touchend', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const currentGearIndex = GEAR_ORDER.indexOf(currentGear)
  const stickPosition = `${(currentGearIndex / (GEAR_ORDER.length - 1)) * 100}%`

  return (
    <div className="gear-stick-container">
      <div className="gear-base">
        <div className="gear-stick-track" ref={trackRef}>
          {GEAR_ORDER.map((gear) => (
            <div
              key={gear}
              className={`gear-marker ${currentGear === gear ? 'marker-active' : ''}`}
              onClick={() => navigateToGear(gear)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigateToGear(gear)
                }
              }}
              aria-label={`Shift to ${gear}`}
            >
              {gear}
            </div>
          ))}

          <div
            ref={handleRef}
            className={`gear-stick-handle-container ${isDragging ? 'stick-dragging' : ''}`}
            style={{ top: stickPosition }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            role="slider"
            aria-label="Gear stick"
            aria-valuemin={0}
            aria-valuemax={GEAR_ORDER.length - 1}
            aria-valuenow={currentGearIndex}
            aria-valuetext={currentGear}
          >
            <div className="gear-stick" />
            <div className="gear-ball" />
          </div>

          {showIndicator && (
            <div
              className={`position-indicator visible`}
              style={{ top: stickPosition }}
            >
              {currentGear}
            </div>
          )}
        </div>
      </div>
      <div className="drag-hint">Drag or click to shift</div>
    </div>
  )
}
