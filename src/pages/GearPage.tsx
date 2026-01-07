import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { WindshieldFrame } from '../components/GearNavigation/WindshieldFrame'
import { NoodleConnector } from '../components/Effects/NoodleConnector'
import { useGear, GearName } from '../contexts/GearContext'
import { useEffect, useState } from 'react'

const GEAR_ORDER: GearName[] = ['R', 'N', '1', '2', '3', '4', '5', '6']

const isValidGear = (value: string): value is GearName => {
  return GEAR_ORDER.includes(value as GearName)
}

const PATH_TO_GEAR: Record<string, GearName> = {
  'R': 'R',
  'dashboard': 'N',
  'events': '1',
  'store': '2',
  'gallery': '3',
  'forum': '4',
  'chat': '5'
}

const GEAR_PATHS: Record<GearName, string> = {
  'R': '/R',
  'N': '/dashboard',
  '1': '/events',
  '2': '/store',
  '3': '/gallery',
  '4': '/forum',
  '5': '/chat'
}

export const GearPage = () => {
  const { currentGear, setCurrentGear } = useGear()
  const location = useLocation()
  const navigate = useNavigate()
  const [touchStart, setTouchStart] = useState(0)

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

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientY
    const swipeThreshold = 50
    const diff = touchStart - touchEnd

    if (Math.abs(diff) > swipeThreshold) {
      const currentIndex = GEAR_ORDER.indexOf(currentGear)

      if (diff > 0 && currentIndex < GEAR_ORDER.length - 1) {
        const newGear = GEAR_ORDER[currentIndex + 1]
        setCurrentGear(newGear)
        navigate(GEAR_PATHS[newGear])
      } else if (diff < 0 && currentIndex > 0) {
        const newGear = GEAR_ORDER[currentIndex - 1]
        setCurrentGear(newGear)
        navigate(GEAR_PATHS[newGear])
      }
    }
  }

  return (
    <div
      className="gear-page"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >


      <div className="main-viewport">
        <WindshieldFrame>
          <Outlet />
        </WindshieldFrame>
      </div>


      <style>{`
        .gear-page {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #000;
          color: white;
          overflow: clip;
          position: relative;
        }



        .main-viewport {
          flex: 1;
          display: flex;
          padding: 2.5vh 5vw;
          z-index: 10;
          min-height: 0;
        }


        @media (max-width: 1024px) {
          .main-viewport {
            padding: 2vh 2vw;
          }
        }

        @media (max-width: 768px) {
          .main-viewport {
            padding: 0;
          }
        }
      `}</style>
    </div>
  )
}
