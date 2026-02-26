import type { PhoneAppId, PhoneLocale, PhoneModalState, PhoneNavEntry, PhoneScreenRoute, PhoneSheetState } from './phoneTypes'

export type PhoneState = {
  isOpen: boolean
  isLocked: boolean
  locale: PhoneLocale
  navStack: PhoneNavEntry[]
  sheet: PhoneSheetState | null
  modal: PhoneModalState | null
  lastInteractionAt: number
}

export type PhoneAction =
  | { type: 'OPEN_PHONE' }
  | { type: 'CLOSE_PHONE' }
  | { type: 'LOCK_PHONE' }
  | { type: 'UNLOCK_PHONE' }
  | { type: 'GO_HOME' }
  | { type: 'OPEN_APP'; appId: PhoneAppId; view?: string; params?: Record<string, string | number | boolean> }
  | { type: 'PUSH_ROUTE'; route: PhoneScreenRoute }
  | { type: 'POP_ROUTE' }
  | { type: 'SET_LOCALE'; locale: PhoneLocale }
  | { type: 'SET_SHEET'; sheet: PhoneSheetState | null }
  | { type: 'SET_MODAL'; modal: PhoneModalState | null }
  | { type: 'TOUCH' }

let navCounter = 0

const createNavKey = () => `phone-nav-${Date.now()}-${navCounter++}`

const makeEntry = (route: PhoneScreenRoute): PhoneNavEntry => ({ ...route, key: createNavKey() })

export const createInitialPhoneState = (locale: PhoneLocale = 'en', defaults?: { open?: boolean; locked?: boolean }): PhoneState => {
  const locked = defaults?.locked ?? true
  const baseRoute: PhoneScreenRoute = locked ? { kind: 'locked' } : { kind: 'home' }
  return {
    isOpen: defaults?.open ?? false,
    isLocked: locked,
    locale,
    navStack: [makeEntry(baseRoute)],
    sheet: null,
    modal: null,
    lastInteractionAt: Date.now(),
  }
}

export const getCurrentPhoneRoute = (state: PhoneState): PhoneScreenRoute =>
  state.navStack[state.navStack.length - 1] ?? { kind: state.isLocked ? 'locked' : 'home' }

export function phoneReducer(state: PhoneState, action: PhoneAction): PhoneState {
  switch (action.type) {
    case 'OPEN_PHONE':
      return { ...state, isOpen: true, lastInteractionAt: Date.now() }
    case 'CLOSE_PHONE':
      return {
        ...state,
        isOpen: false,
        isLocked: true,
        navStack: [makeEntry({ kind: 'locked' })],
        sheet: null,
        modal: null,
        lastInteractionAt: Date.now(),
      }
    case 'LOCK_PHONE':
      return {
        ...state,
        isLocked: true,
        navStack: [makeEntry({ kind: 'locked' })],
        sheet: null,
        modal: null,
        lastInteractionAt: Date.now(),
      }
    case 'UNLOCK_PHONE':
      return {
        ...state,
        isLocked: false,
        navStack: [makeEntry({ kind: 'home' })],
        sheet: null,
        modal: null,
        lastInteractionAt: Date.now(),
      }
    case 'GO_HOME':
      return {
        ...state,
        isLocked: false,
        navStack: [makeEntry({ kind: 'home' })],
        sheet: null,
        modal: null,
        lastInteractionAt: Date.now(),
      }
    case 'OPEN_APP':
      return {
        ...state,
        isLocked: false,
        navStack: [
          ...state.navStack,
          makeEntry({
            kind: 'app',
            appId: action.appId,
            view: action.view,
            params: action.params,
          }),
        ],
        sheet: null,
        modal: null,
        lastInteractionAt: Date.now(),
      }
    case 'PUSH_ROUTE':
      return {
        ...state,
        navStack: [...state.navStack, makeEntry(action.route)],
        sheet: null,
        modal: null,
        lastInteractionAt: Date.now(),
      }
    case 'POP_ROUTE': {
      if (state.navStack.length <= 1) {
        const fallbackRoute: PhoneScreenRoute = state.isLocked ? { kind: 'locked' } : { kind: 'home' }
        return {
          ...state,
          navStack: [makeEntry(fallbackRoute)],
          sheet: null,
          modal: null,
          lastInteractionAt: Date.now(),
        }
      }
      return {
        ...state,
        navStack: state.navStack.slice(0, -1),
        sheet: null,
        modal: null,
        lastInteractionAt: Date.now(),
      }
    }
    case 'SET_LOCALE':
      return { ...state, locale: action.locale, lastInteractionAt: Date.now() }
    case 'SET_SHEET':
      return { ...state, sheet: action.sheet, lastInteractionAt: Date.now() }
    case 'SET_MODAL':
      return { ...state, modal: action.modal, lastInteractionAt: Date.now() }
    case 'TOUCH':
      return { ...state, lastInteractionAt: Date.now() }
    default:
      return state
  }
}
