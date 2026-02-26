import type { CSSProperties, ReactNode } from 'react'

export type PhoneAppId =
  | 'music'
  | 'gallery'
  | 'notes'
  | 'messages'
  | 'calendar'
  | 'maps'
  | 'phone'
  | 'cards'
  | 'calculator'
  | 'clock'
  | 'camera'
  | 'voiceTranslate'
  | 'brandedIntro'
  | 'instagram'
  | 'voiceMemos'

export type PhoneLocale = 'es' | 'en'

export type PhoneSurface = 'closed' | 'launcher' | 'locked' | 'unlocking' | 'home' | 'app' | 'sheet' | 'modal'

export type PhoneScreenRoute =
  | { kind: 'locked' }
  | { kind: 'home' }
  | { kind: 'app'; appId: PhoneAppId; view?: string; params?: Record<string, string | number | boolean> }

export type PhoneNavEntry = PhoneScreenRoute & { key: string }

export type PhoneDockCorner = 'bottom-right' | 'bottom-left'

export type PhoneOverlayVisibilityPolicy = {
  enabled: boolean
  reason?: 'route-excluded' | 'fullscreen-overlay' | 'mobile-drawer-conflict'
}

export type PhoneSheetAction = {
  id: string
  label: string
  tone?: 'default' | 'accent' | 'danger'
  href?: string
  onSelect?: () => void
}

export type PhoneSheetState = {
  id: string
  title?: string
  subtitle?: string
  body?: ReactNode
  actions?: PhoneSheetAction[]
}

export type PhoneModalState = {
  id: string
  title?: string
  body?: ReactNode
  actions?: PhoneSheetAction[]
}

export type PhoneDockLayout = {
  hidden: boolean
  style: CSSProperties
}

