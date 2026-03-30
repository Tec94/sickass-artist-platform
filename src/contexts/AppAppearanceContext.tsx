import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type AppAppearance = 'light' | 'dark'

export const APP_APPEARANCE_STORAGE_KEY = 'app_appearance_mode_v1'

type AppAppearanceContextValue = {
  appearance: AppAppearance
  setAppearance: (appearance: AppAppearance) => void
}

const AppAppearanceContext = createContext<AppAppearanceContextValue | null>(null)

const parseAppAppearance = (value: string | null): AppAppearance =>
  value === 'dark' ? 'dark' : 'light'

const readInitialAppearance = (): AppAppearance => {
  if (typeof window === 'undefined') {
    return 'light'
  }

  try {
    return parseAppAppearance(window.localStorage.getItem(APP_APPEARANCE_STORAGE_KEY))
  } catch {
    return 'light'
  }
}

export const AppAppearanceProvider = ({ children }: { children: ReactNode }) => {
  const [appearance, setAppearanceState] = useState<AppAppearance>(readInitialAppearance)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(APP_APPEARANCE_STORAGE_KEY, appearance)
    } catch {
      // Ignore storage failures in restricted environments.
    }
  }, [appearance])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    document.documentElement.dataset.appearance = appearance
    document.documentElement.style.colorScheme = appearance
    document.body.dataset.appearance = appearance
    document.body.style.colorScheme = appearance

    return () => {
      document.documentElement.removeAttribute('data-appearance')
      document.documentElement.style.removeProperty('color-scheme')
      document.body.removeAttribute('data-appearance')
      document.body.style.removeProperty('color-scheme')
    }
  }, [appearance])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== APP_APPEARANCE_STORAGE_KEY) {
        return
      }

      setAppearanceState(parseAppAppearance(event.newValue))
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const setAppearance = useCallback((nextAppearance: AppAppearance) => {
    setAppearanceState((currentAppearance) =>
      currentAppearance === nextAppearance ? currentAppearance : nextAppearance,
    )
  }, [])

  const value = useMemo<AppAppearanceContextValue>(
    () => ({
      appearance,
      setAppearance,
    }),
    [appearance, setAppearance],
  )

  return <AppAppearanceContext.Provider value={value}>{children}</AppAppearanceContext.Provider>
}

export const useAppAppearance = (): AppAppearanceContextValue => {
  const context = useContext(AppAppearanceContext)

  if (!context) {
    return {
      appearance: readInitialAppearance(),
      setAppearance: () => undefined,
    }
  }

  return context
}
