import { Outlet, useLocation } from 'react-router-dom'

import { GearName, useGear } from '../contexts/GearContext'
import { useEffect, useState } from 'react'

const PATH_TO_GEAR: Record<string, GearName> = {
  'R': 'R',
  'dashboard': 'N',
  'events': '1',
  'store': '2',
  'gallery': '3',
  'forum': '4',
  'chat': '5'
}

export const GearPage = () => {
  const { setCurrentGear } = useGear()
  const location = useLocation()
  const [_touchStart, setTouchStart] = useState(0)

  useEffect(() => {
    const path = location.pathname.split('/')[1] || ''
    const gear = PATH_TO_GEAR[path]
    if (gear) {
      setCurrentGear(gear)
    }
  }, [location.pathname, setCurrentGear])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY)
  }

  const handleTouchEnd = (_e: React.TouchEvent) => {
    // Legacy gear navigation removed - swipe functionality disabled
  }

  return (
    <div
      className="gear-page"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >


      <div className="gear-content-wrapper">
        <Outlet />
      </div>


      <style>{`
        .gear-page {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
          background: #000;
          color: white;
          overflow: hidden;
          position: relative;
        }

        .gear-content-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
          padding: 0 5vw; /* Restoring some horizontal space for non-wide content */
        }

        /* Fullscreen pages (like Chat) should ignore this padding */
        .gear-content-wrapper > .chat-layout,
        .gear-content-wrapper > .merch-page,
        .gear-content-wrapper > .merch-detail-page {
          padding: 0;
          margin-left: -5vw;
          margin-right: -5vw;
          width: 100vw;
          max-width: none;
        }
      `}</style>
    </div>
  )
}
