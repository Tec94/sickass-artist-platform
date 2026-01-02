import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { GearStick } from '../components/GearNavigation/GearStick'
import { WindshieldFrame } from '../components/GearNavigation/WindshieldFrame'
import { NoodleConnector } from '../components/Effects/NoodleConnector'
import { useGear, GearName } from '../contexts/GearContext'
import { useEffect, useState } from 'react'

const GEAR_ORDER: GearName[] = ['R', 'N', '1', '2', '3', '4', '5', '6']

const isValidGear = (value: string): value is GearName => {
  return GEAR_ORDER.includes(value as GearName)
}

export const GearPage = () => {
  const { currentGear, setCurrentGear } = useGear()
  const location = useLocation()
  const navigate = useNavigate()
  const [touchStart, setTouchStart] = useState(0)

  useEffect(() => {
    const pathGear = location.pathname.split('/')[1] ?? ''
    if (isValidGear(pathGear)) {
      setCurrentGear(pathGear)
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
        navigate(`/${newGear}`)
      } else if (diff < 0 && currentIndex > 0) {
        const newGear = GEAR_ORDER[currentIndex - 1]
        setCurrentGear(newGear)
        navigate(`/${newGear}`)
      }
    }
  }

  return (
    <div
      className="gear-page"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="gear-nav-overlay">
        <GearStick />
        
        {/* Decorative Noodle Connectors */}
        <NoodleConnector start={{ x: 65, y: 150 }} end={{ x: 140, y: 250 }} />
        <NoodleConnector start={{ x: 140, y: 350 }} end={{ x: 100, y: 450 }} />
      </div>

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
          overflow: hidden;
          position: relative;
        }

        .gear-nav-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 100;
        }

        .gear-nav-overlay > * {
          pointer-events: auto;
        }

        .main-viewport {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5vh 5vw;
          z-index: 10;
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
