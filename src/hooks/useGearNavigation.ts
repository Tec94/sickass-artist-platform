import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGear, GearName } from '../contexts/GearContext'

const GEAR_ORDER: GearName[] = ['R', 'N', '1', '2', '3', '4', '5']

const GEAR_PATHS: Record<GearName, string> = {
  'R': '/R',
  'N': '/dashboard',
  '1': '/events',
  '2': '/store',
  '3': '/gallery',
  '4': '/forum',
  '5': '/chat'
}

export const useGearNavigation = () => {
  const { currentGear, setCurrentGear } = useGear()
  const navigate = useNavigate()

  const navigateToGear = useCallback(
    (gearName: GearName) => {
      setCurrentGear(gearName)
      navigate(GEAR_PATHS[gearName])
    },
    [setCurrentGear, navigate]
  )

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Arrow keys for shifting up/down
      if (event.key === 'ArrowUp') {
        const currentIndex = GEAR_ORDER.indexOf(currentGear)
        if (currentIndex > 0) {
          navigateToGear(GEAR_ORDER[currentIndex - 1])
        }
      } else if (event.key === 'ArrowDown') {
        const currentIndex = GEAR_ORDER.indexOf(currentGear)
        if (currentIndex < GEAR_ORDER.length - 1) {
          navigateToGear(GEAR_ORDER[currentIndex + 1])
        }
      } else if (event.key === 'Escape') {
        // Close mobile menu if present
        const mobileMenu = document.querySelector('[data-mobile-menu]')
        if (mobileMenu instanceof HTMLElement) {
          mobileMenu.style.display = 'none'
        }
      }
    },
    [currentGear, navigateToGear]
  )

  const handleTouchSwipe = useCallback(
    (startY: number, endY: number) => {
      const swipeThreshold = 50
      const diff = startY - endY

      if (Math.abs(diff) < swipeThreshold) {
        return
      }

      const currentIndex = GEAR_ORDER.indexOf(currentGear)

      if (diff > 0 && currentIndex < GEAR_ORDER.length - 1) {
        // Swipe up - shift up
        navigateToGear(GEAR_ORDER[currentIndex + 1])
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe down - shift down
        navigateToGear(GEAR_ORDER[currentIndex - 1])
      }
    },
    [currentGear, navigateToGear]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  return {
    currentGear,
    setCurrentGear,
    navigateToGear,
    handleKeyPress,
    handleTouchSwipe,
  }
}
