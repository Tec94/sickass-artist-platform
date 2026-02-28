import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  DASHBOARD_VARIANT_STORAGE_KEY,
  DEFAULT_DASHBOARD_VISUAL_VARIANT,
  parseDashboardVisualVariant,
  type DashboardVisualVariant,
} from '../components/Dashboard/dashboardVisualVariants'

type AppVisualVariantContextValue = {
  visualVariant: DashboardVisualVariant
  setVisualVariant: (variant: DashboardVisualVariant) => void
}

const AppVisualVariantContext = createContext<AppVisualVariantContextValue | null>(null)

const readInitialVariant = (): DashboardVisualVariant => {
  if (typeof window === 'undefined') {
    return DEFAULT_DASHBOARD_VISUAL_VARIANT
  }

  try {
    return parseDashboardVisualVariant(window.localStorage.getItem(DASHBOARD_VARIANT_STORAGE_KEY))
  } catch {
    return DEFAULT_DASHBOARD_VISUAL_VARIANT
  }
}

export const AppVisualVariantProvider = ({ children }: { children: ReactNode }) => {
  const [visualVariant, setVisualVariantState] = useState<DashboardVisualVariant>(readInitialVariant)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(DASHBOARD_VARIANT_STORAGE_KEY, visualVariant)
    } catch {
      // Ignore write failures in private or restricted contexts.
    }
  }, [visualVariant])

  const setVisualVariant = useCallback((variant: DashboardVisualVariant) => {
    setVisualVariantState((current) => (current === variant ? current : variant))
  }, [])

  const value = useMemo<AppVisualVariantContextValue>(
    () => ({
      visualVariant,
      setVisualVariant,
    }),
    [visualVariant, setVisualVariant],
  )

  return <AppVisualVariantContext.Provider value={value}>{children}</AppVisualVariantContext.Provider>
}

export const useAppVisualVariant = (): AppVisualVariantContextValue => {
  const context = useContext(AppVisualVariantContext)
  if (!context) {
    return {
      visualVariant: readInitialVariant(),
      setVisualVariant: () => undefined,
    }
  }
  return context
}
