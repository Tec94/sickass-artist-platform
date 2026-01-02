import { useState, useRef, useEffect, useCallback } from 'react'
import { useGear } from '../../contexts/GearContext'
import { useGearNavigation } from '../../hooks/useGearNavigation'
import { GearName } from '../../contexts/GearContext'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'

const GEAR_ORDER: GearName[] = ['R', 'N', '1', '2', '3', '4', '5', '6']

export const GearStick = () => {
  const { currentGear } = useGear()
  const { navigateToGear } = useGearNavigation()
  const animate = useScrollAnimation()
  const [isDragging, setIsDragging] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !trackRef.current) return

    const trackRect = trackRef.current.getBoundingClientRect()
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const relativeY = clientY - trackRect.top

    const clampedY = Math.max(0, Math.min(relativeY, trackRect.height))
    const gearHeight = trackRect.height / (GEAR_ORDER.length - 1)
    const gearIndex = Math.round(clampedY / gearHeight)
    const nearestGear = GEAR_ORDER[Math.min(gearIndex, GEAR_ORDER.length - 1)]

    if (nearestGear !== currentGear) {
      navigateToGear(nearestGear)
    }
  }, [isDragging, currentGear, navigateToGear])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
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
    <div ref={animate} data-animate className="gear-stick-container">
      <div className="gear-base">
        <div className="track-rail"></div>
        <div className="gear-stick-track" ref={trackRef}>
          {GEAR_ORDER.map((gear) => (
            <div
              key={gear}
              className={`gear-marker ${currentGear === gear ? 'marker-active' : ''}`}
            >
              <span className="marker-label">{gear}</span>
            </div>
          ))}

          <div
            className={`gear-handle-container ${isDragging ? 'dragging' : ''}`}
            style={{ top: stickPosition }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            <div className="gear-handle-ball flex items-center justify-center">
               <iconify-icon icon="solar:double-alt-arrow-up-down-linear"></iconify-icon>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .gear-stick-container {
          position: fixed;
          right: 50px;
          bottom: 50px;
          height: 350px;
          width: 80px;
          z-index: 90;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .gear-base {
          position: relative;
          height: 100%;
          width: 10px;
          background: #111;
          border-radius: 5px;
          border: 1px solid #222;
        }

        .track-rail {
          position: absolute;
          inset: -2px;
          background: linear-gradient(180deg, transparent, var(--color-primary), transparent);
          opacity: 0.1;
          filter: blur(4px);
        }

        .gear-stick-track {
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 20px 0;
        }

        .gear-marker {
          width: 40px;
          height: 2px;
          background: #333;
          position: relative;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          transition: var(--transition-standard);
          z-index: 1;
        }

        .gear-marker.marker-active {
          background: var(--color-primary);
          box-shadow: 0 0 10px var(--color-primary);
        }

        .marker-label {
          position: absolute;
          right: 50px;
          font-size: 11px;
          font-weight: 800;
          color: var(--color-text-dim);
          opacity: 0.3;
        }

        .marker-active .marker-label {
          color: white;
          opacity: 1;
        }

        .gear-handle-container {
          position: absolute;
          left: 50%;
          transform: translate(-50%, -50%);
          cursor: grab;
          z-index: 10;
          transition: top 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .gear-handle-container.dragging {
          cursor: grabbing;
          transition: none;
        }

        .gear-handle-ball {
          width: 48px;
          height: 48px;
          background: #050505;
          border: 2px solid #333;
          border-radius: 14px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.6);
          color: var(--color-primary);
          font-size: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .gear-handle-container:hover .gear-handle-ball {
          border-color: var(--color-primary);
          box-shadow: 0 0 15px rgba(255, 0, 0, 0.4);
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .gear-stick-container {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
