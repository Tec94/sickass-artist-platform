export interface DashboardHeroAssets {
  background: string
  midground: string
  foreground: string
  spotlight: string
  grain: string
  // Deprecated: retained for compatibility while HeroLightRays uses CSS-only vignette.
  vignette: string
  crest: string
}

export const dashboardHeroAssets: DashboardHeroAssets = {
  background: '/dashboard/hero-bg-4k.webp',
  midground: '/dashboard/hero-midground.webp',
  foreground: '/dashboard/hero-foreground.webp',
  spotlight: '/dashboard/hero-spotlight.webp',
  grain: '/dashboard/hero-grain.webp',
  vignette: '/dashboard/hero-vignette.webp',
  crest: '/dashboard/wolf-crest.svg',
}

export type DashboardPromoType = 'store' | 'event' | 'announcement' | 'promo'

export const dashboardSignalPlaceholders: Record<DashboardPromoType, string> = {
  event: '/dashboard/signal-card-placeholder-1.webp',
  store: '/dashboard/signal-card-placeholder-2.webp',
  promo: '/dashboard/signal-card-placeholder-3.webp',
  announcement: '/dashboard/signal-card-placeholder-4.webp',
}
