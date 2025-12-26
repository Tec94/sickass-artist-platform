import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { GearDisplay } from '../components/GearNavigation/GearDisplay'
import { GearStick } from '../components/GearNavigation/GearStick'
import { WindshieldFrame } from '../components/GearNavigation/WindshieldFrame'
import { useGear, GearName } from '../contexts/GearContext'
import { useEffect, useState } from 'react'

const GEAR_ORDER: GearName[] = ['R', 'N', '1', '2', '3', '4', '5']

const isValidGear = (value: string): value is GearName => {
  return GEAR_ORDER.includes(value as GearName)
}

export const GearPage = () => {
  const { currentGear, setCurrentGear } = useGear()
  const location = useLocation()
  const navigate = useNavigate()
  const [touchStart, setTouchStart] = useState(0)

  useEffect(() => {
    // Update gear based on route
    const pathGear = location.pathname.slice(1)
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

    // Simple swipe zone for mobile navigation
    if (Math.abs(diff) > swipeThreshold) {
      const currentIndex = GEAR_ORDER.indexOf(currentGear)

      if (diff > 0 && currentIndex < GEAR_ORDER.length - 1) {
        // Swipe up - shift up
        const newGear = GEAR_ORDER[currentIndex + 1]
        setCurrentGear(newGear)
        navigate(`/${newGear}`)
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe down - shift down
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
      <GearDisplay />
      <GearStick />
      <div className="main-content-area">
        <WindshieldFrame>
          <Outlet />
        </WindshieldFrame>
      </div>

      <style>{`
        .gear-page {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          padding-left: 0;
        }

        .main-content-area {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        @media (max-width: 767px) {
          .gear-page {
            padding-left: 0;
          }

          .main-content-area {
            padding: 16px;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .gear-page {
            padding-left: 140px;
          }
        }

        @media (min-width: 1024px) {
          .gear-page {
            padding-left: 140px;
          }
        }
      `}</style>
    </div>
  )
}
