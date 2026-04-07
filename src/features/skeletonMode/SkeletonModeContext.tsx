import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export const SKELETON_MODE_STORAGE_KEY = 'debug_skeleton_mode_v1'

type SkeletonModeContextValue = {
  isAvailable: boolean
  isSkeletonMode: boolean
  setSkeletonMode: (isEnabled: boolean) => void
  toggleSkeletonMode: () => void
}

const SkeletonModeContext = createContext<SkeletonModeContextValue | null>(null)

const readInitialSkeletonMode = (enabled: boolean) => {
  if (!enabled || typeof window === 'undefined') {
    return false
  }

  try {
    return window.localStorage.getItem(SKELETON_MODE_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export const shouldEnableSkeletonDebug = ({
  isDev = import.meta.env.DEV,
  isBuildMode = false,
}: {
  isDev?: boolean
  isBuildMode?: boolean
} = {}) => isDev && !isBuildMode

export const SkeletonModeProvider = ({
  children,
  enabled = import.meta.env.DEV,
}: {
  children: ReactNode
  enabled?: boolean
}) => {
  const [isSkeletonMode, setSkeletonModeState] = useState<boolean>(() =>
    readInitialSkeletonMode(enabled),
  )

  useEffect(() => {
    if (!enabled) {
      setSkeletonModeState(false)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(SKELETON_MODE_STORAGE_KEY, String(isSkeletonMode))
    } catch {
      // Ignore storage write failures in restricted environments.
    }
  }, [enabled, isSkeletonMode])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== SKELETON_MODE_STORAGE_KEY) {
        return
      }

      setSkeletonModeState(event.newValue === 'true')
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [enabled])

  const setSkeletonMode = useCallback(
    (nextValue: boolean) => {
      if (!enabled) {
        return
      }

      setSkeletonModeState((currentValue) =>
        currentValue === nextValue ? currentValue : nextValue,
      )
    },
    [enabled],
  )

  const toggleSkeletonMode = useCallback(() => {
    if (!enabled) {
      return
    }

    setSkeletonModeState((currentValue) => !currentValue)
  }, [enabled])

  const value = useMemo<SkeletonModeContextValue>(
    () => ({
      isAvailable: enabled,
      isSkeletonMode: enabled ? isSkeletonMode : false,
      setSkeletonMode,
      toggleSkeletonMode,
    }),
    [enabled, isSkeletonMode, setSkeletonMode, toggleSkeletonMode],
  )

  return (
    <SkeletonModeContext.Provider value={value}>{children}</SkeletonModeContext.Provider>
  )
}

export const useSkeletonMode = (): SkeletonModeContextValue => {
  const context = useContext(SkeletonModeContext)

  if (!context) {
    return {
      isAvailable: false,
      isSkeletonMode: false,
      setSkeletonMode: () => undefined,
      toggleSkeletonMode: () => undefined,
    }
  }

  return context
}
