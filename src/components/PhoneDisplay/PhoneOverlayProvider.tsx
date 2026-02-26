import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { fetchPhoneArtistContent } from './content/phoneContentAdapter'
import { FALLBACK_PHONE_ARTIST_CONTENT } from './content/phoneSeedContent'
import type { PhoneArtistContent } from './content/phoneContentTypes'
import { createInitialPhoneState, getCurrentPhoneRoute, phoneReducer, type PhoneState } from './phoneStore'
import type {
  PhoneLocale,
  PhoneModalState,
  PhoneOverlayVisibilityPolicy,
  PhoneScreenRoute,
  PhoneSheetState,
  PhoneAppId,
} from './phoneTypes'
import { usePhoneVisibilityPolicy } from './usePhoneVisibilityPolicy'

export type PhoneOverlayProviderProps = {
  children: ReactNode
  defaultOpen?: boolean
  defaultLocked?: boolean
}

export type PhoneOverlayContextValue = {
  state: PhoneState
  currentRoute: PhoneScreenRoute
  isOpen: boolean
  isLocked: boolean
  locale: PhoneLocale
  content: PhoneArtistContent
  visibilityPolicy: PhoneOverlayVisibilityPolicy
  isContentLoading: boolean
  openPhone: () => void
  closePhone: () => void
  lockPhone: () => void
  unlockPhone: () => void
  goHome: () => void
  openApp: (appId: PhoneAppId, options?: { view?: string; params?: Record<string, unknown> }) => void
  pushRoute: (route: PhoneScreenRoute) => void
  popRoute: () => void
  setLocale: (locale: PhoneLocale) => void
  setSheet: (sheet: PhoneSheetState | null) => void
  setModal: (modal: PhoneModalState | null) => void
  touch: () => void
}

const PhoneOverlayContext = createContext<PhoneOverlayContextValue | null>(null)

const toPhoneLocale = (language: string): PhoneLocale => (language === 'es' ? 'es' : 'en')

export function PhoneOverlayProvider({
  children,
  defaultOpen = false,
  defaultLocked = true,
}: PhoneOverlayProviderProps) {
  const { language } = useLanguage()
  const location = useLocation()
  const visibilityPolicy = usePhoneVisibilityPolicy()
  const [state, dispatch] = useReducer(
    phoneReducer,
    createInitialPhoneState(toPhoneLocale(language), { open: defaultOpen, locked: defaultLocked }),
  )
  const [content, setContent] = useState<PhoneArtistContent>(FALLBACK_PHONE_ARTIST_CONTENT)
  const [isContentLoading, setIsContentLoading] = useState(true)
  const userLocaleOverrideRef = useRef(false)

  useEffect(() => {
    const controller = new AbortController()
    setIsContentLoading(true)
    fetchPhoneArtistContent(controller.signal)
      .then((next) => setContent(next))
      .finally(() => setIsContentLoading(false))
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (userLocaleOverrideRef.current) return
    const nextLocale = toPhoneLocale(language)
    if (state.locale !== nextLocale) {
      dispatch({ type: 'SET_LOCALE', locale: nextLocale })
    }
  }, [language, state.locale])

  useEffect(() => {
    if (!visibilityPolicy.enabled && visibilityPolicy.reason === 'route-excluded' && state.isOpen) {
      dispatch({ type: 'CLOSE_PHONE' })
    }
  }, [visibilityPolicy.enabled, visibilityPolicy.reason, state.isOpen, location.pathname])

  useEffect(() => {
    if (!state.isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dispatch({ type: 'CLOSE_PHONE' })
      } else if (event.key.toLowerCase() === 'h') {
        dispatch({ type: 'GO_HOME' })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [state.isOpen])

  useEffect(() => {
    if (!state.isOpen) return
    const interval = window.setInterval(() => {
      const idleMs = Date.now() - state.lastInteractionAt
      if (idleMs >= 120_000) {
        dispatch({ type: 'CLOSE_PHONE' })
      }
    }, 5000)
    return () => window.clearInterval(interval)
  }, [state.isOpen, state.lastInteractionAt])

  const currentRoute = useMemo(() => getCurrentPhoneRoute(state), [state])

  const value = useMemo<PhoneOverlayContextValue>(
    () => ({
      state,
      currentRoute,
      isOpen: state.isOpen,
      isLocked: state.isLocked,
      locale: state.locale,
      content,
      visibilityPolicy,
      isContentLoading,
      openPhone: () => dispatch({ type: 'OPEN_PHONE' }),
      closePhone: () => dispatch({ type: 'CLOSE_PHONE' }),
      lockPhone: () => dispatch({ type: 'LOCK_PHONE' }),
      unlockPhone: () => dispatch({ type: 'UNLOCK_PHONE' }),
      goHome: () => dispatch({ type: 'GO_HOME' }),
      openApp: (appId, options) =>
        dispatch({
          type: 'OPEN_APP',
          appId,
          view: options?.view,
          params: normalizeParams(options?.params),
        }),
      pushRoute: (route) => dispatch({ type: 'PUSH_ROUTE', route }),
      popRoute: () => dispatch({ type: 'POP_ROUTE' }),
      setLocale: (locale) => {
        userLocaleOverrideRef.current = true
        dispatch({ type: 'SET_LOCALE', locale })
      },
      setSheet: (sheet) => dispatch({ type: 'SET_SHEET', sheet }),
      setModal: (modal) => dispatch({ type: 'SET_MODAL', modal }),
      touch: () => dispatch({ type: 'TOUCH' }),
    }),
    [content, currentRoute, isContentLoading, state, visibilityPolicy],
  )

  return <PhoneOverlayContext.Provider value={value}>{children}</PhoneOverlayContext.Provider>
}

function normalizeParams(
  params: Record<string, unknown> | undefined,
): Record<string, string | number | boolean> | undefined {
  if (!params) return undefined
  const normalized: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      normalized[key] = value
    }
  }
  return Object.keys(normalized).length ? normalized : undefined
}

export function usePhoneOverlay() {
  const context = useContext(PhoneOverlayContext)
  if (!context) {
    throw new Error('usePhoneOverlay must be used within PhoneOverlayProvider')
  }
  return context
}
