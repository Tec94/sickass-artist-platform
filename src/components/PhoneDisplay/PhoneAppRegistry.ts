import { lazy } from 'react'
import { defaultPhoneAppIcons } from './PhoneIconRegistry'
import type { PhoneAppId } from './phoneTypes'

export type PhoneAppDefinition = {
  id: PhoneAppId
  labelEs: string
  labelEn: string
  priority: 'primary' | 'secondary'
  icon: (typeof defaultPhoneAppIcons)[PhoneAppId]
  component: React.LazyExoticComponent<React.ComponentType>
  launchAnimation: 'icon-expand' | 'fade' | 'slide-up' | 'slider'
}

const lazyApp = (loader: () => Promise<{ default: React.ComponentType }>) => lazy(loader)

export const PHONE_APP_DEFINITIONS: PhoneAppDefinition[] = [
  { id: 'music', labelEs: 'Spotify', labelEn: 'Spotify', priority: 'primary', icon: defaultPhoneAppIcons.music, component: lazyApp(() => import('./screens/apps/MusicApp')), launchAnimation: 'icon-expand' },
  { id: 'gallery', labelEs: 'Fotos', labelEn: 'Photos', priority: 'primary', icon: defaultPhoneAppIcons.gallery, component: lazyApp(() => import('./screens/apps/GalleryApp')), launchAnimation: 'icon-expand' },
  { id: 'notes', labelEs: 'Notas', labelEn: 'Notes', priority: 'primary', icon: defaultPhoneAppIcons.notes, component: lazyApp(() => import('./screens/apps/NotesApp')), launchAnimation: 'icon-expand' },
  { id: 'messages', labelEs: 'Mensajes', labelEn: 'Messages', priority: 'primary', icon: defaultPhoneAppIcons.messages, component: lazyApp(() => import('./screens/apps/MessagesApp')), launchAnimation: 'icon-expand' },
  { id: 'calendar', labelEs: 'Calendario', labelEn: 'Calendar', priority: 'primary', icon: defaultPhoneAppIcons.calendar, component: lazyApp(() => import('./screens/apps/CalendarApp')), launchAnimation: 'icon-expand' },
  { id: 'maps', labelEs: 'Mapas', labelEn: 'Maps', priority: 'primary', icon: defaultPhoneAppIcons.maps, component: lazyApp(() => import('./screens/apps/MapsApp')), launchAnimation: 'icon-expand' },
  { id: 'phone', labelEs: 'Telefono', labelEn: 'Phone', priority: 'primary', icon: defaultPhoneAppIcons.phone, component: lazyApp(() => import('./screens/apps/PhoneApp')), launchAnimation: 'icon-expand' },
  { id: 'cards', labelEs: 'Cards', labelEn: 'Cards', priority: 'primary', icon: defaultPhoneAppIcons.cards, component: lazyApp(() => import('./screens/apps/CardsApp')), launchAnimation: 'icon-expand' },
  { id: 'calculator', labelEs: 'Calculadora', labelEn: 'Calculator', priority: 'secondary', icon: defaultPhoneAppIcons.calculator, component: lazyApp(() => import('./screens/apps/CalculatorApp')), launchAnimation: 'fade' },
  { id: 'clock', labelEs: 'Reloj', labelEn: 'Clock', priority: 'secondary', icon: defaultPhoneAppIcons.clock, component: lazyApp(() => import('./screens/apps/ClockApp')), launchAnimation: 'fade' },
  { id: 'camera', labelEs: 'Camara', labelEn: 'Camera', priority: 'secondary', icon: defaultPhoneAppIcons.camera, component: lazyApp(() => import('./screens/apps/CameraApp')), launchAnimation: 'fade' },
  { id: 'voiceTranslate', labelEs: 'Voz', labelEn: 'Translate', priority: 'secondary', icon: defaultPhoneAppIcons.voiceTranslate, component: lazyApp(() => import('./screens/apps/VoiceTranslateApp')), launchAnimation: 'fade' },
  { id: 'brandedIntro', labelEs: 'ROA', labelEn: 'ROA', priority: 'secondary', icon: defaultPhoneAppIcons.brandedIntro, component: lazyApp(() => import('./screens/apps/BrandedIntroApp')), launchAnimation: 'slide-up' },
  { id: 'voiceMemos', labelEs: 'Notas de Voz', labelEn: 'Voice Memos', priority: 'secondary', icon: defaultPhoneAppIcons.voiceMemos, component: lazyApp(() => import('./screens/apps/VoiceMemosApp')), launchAnimation: 'fade' },
  { id: 'instagram', labelEs: 'Instagram', labelEn: 'Instagram', priority: 'secondary', icon: defaultPhoneAppIcons.instagram, component: lazyApp(() => import('./screens/apps/InstagramApp')), launchAnimation: 'fade' },
]

export function getPhoneAppDefinition(appId: PhoneAppId) {
  return PHONE_APP_DEFINITIONS.find((app) => app.id === appId)
}
