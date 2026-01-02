import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'

export type GearName = 'R' | 'N' | '1' | '2' | '3' | '4' | '5' | '6'

interface GearContextType {
  currentGear: GearName
  setCurrentGear: (gear: GearName) => void
  isGearStickVisible: boolean
  gearHistory: GearName[]
}

const GearContext = createContext<GearContextType | undefined>(undefined)

export const GearProvider = ({ children }: { children: ReactNode }) => {
  const [currentGear, setCurrentGear] = useState<GearName>('N')
  const [isGearStickVisible, setIsGearStickVisible] = useState(true)
  const [gearHistory, setGearHistory] = useState<GearName[]>(['N'])

  useEffect(() => {
    const checkScreenSize = () => {
      setIsGearStickVisible(window.innerWidth >= 768)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const handleSetCurrentGear = useCallback((gear: GearName) => {
    setCurrentGear(gear)
    setGearHistory((prev) => {
      const newHistory = [...prev, gear]
      return newHistory.slice(-3)
    })
  }, [])

  return (
    <GearContext.Provider
      value={{
        currentGear,
        setCurrentGear: handleSetCurrentGear,
        isGearStickVisible,
        gearHistory,
      }}
    >
      {children}
    </GearContext.Provider>
  )
}

export const useGear = () => {
  const context = useContext(GearContext)
  if (context === undefined) {
    throw new Error('useGear must be used within a GearProvider')
  }
  return context
}
