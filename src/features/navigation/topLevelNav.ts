import type { CastleRegionId } from '../castleNavigation/sceneConfig'

type TranslationFn = (key: string) => string

export type TopLevelNavId =
  | 'explore-estate'
  | CastleRegionId

export interface TopLevelNavLink {
  id: TopLevelNavId
  name: string
  path: string
  keywords: string[]
  authRequired?: boolean
}

const resolveLabel = (t: TranslationFn, key: string, fallback: string) => {
  const translated = t(key)
  return translated === key ? fallback : translated
}

export const buildTopLevelNavLinks = (t: TranslationFn): TopLevelNavLink[] => [
  {
    id: 'explore-estate',
    name: resolveLabel(t, 'nav.exploreEstate', 'Explore Estate'),
    path: '/',
    keywords: ['home', 'grounds', 'castle', 'estate', 'explore'],
  },
  {
    id: 'store',
    name: resolveLabel(t, 'nav.store', 'Store'),
    path: '/store',
    keywords: ['shop', 'merch', 'products', 'browse'],
  },
  {
    id: 'events',
    name: resolveLabel(t, 'nav.events', 'Events'),
    path: '/events',
    keywords: ['tour', 'tickets', 'appearances'],
  },
  {
    id: 'ranking',
    name: resolveLabel(t, 'nav.ranking', 'Rankings'),
    path: '/rankings',
    keywords: ['leaderboard', 'songs', 'charts'],
  },
  {
    id: 'campaign',
    name: resolveLabel(t, 'nav.campaign', 'Campaign'),
    path: '/campaign',
    keywords: ['release', 'spotlight', 'current release'],
  },
  {
    id: 'community',
    name: resolveLabel(t, 'nav.community', 'Community'),
    path: '/community',
    keywords: ['members', 'gallery', 'forum', 'chat', 'profile'],
    authRequired: true,
  },
]

export const getActiveTopLevelNavId = (pathname: string): TopLevelNavId | null => {
  if (pathname === '/') return 'explore-estate'
  if (pathname.startsWith('/store') || pathname.startsWith('/merch')) return 'store'
  if (pathname.startsWith('/events')) return 'events'
  if (pathname.startsWith('/rankings') || pathname.startsWith('/ranking')) return 'ranking'
  if (pathname.startsWith('/campaign')) return 'campaign'

  if (
    pathname.startsWith('/community') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/gallery') ||
    pathname.startsWith('/forum') ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/quests')
  ) {
    return 'community'
  }

  return null
}
