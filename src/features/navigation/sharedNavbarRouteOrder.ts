export type SharedNavbarRouteId = 'store' | 'events' | 'community' | 'rankings' | 'journey'

export interface SharedNavbarRouteItem {
  id: SharedNavbarRouteId
  label: string
  path: string
}

export const SHARED_NAVBAR_ROUTE_ITEMS: SharedNavbarRouteItem[] = [
  { id: 'store', label: 'Store', path: '/store' },
  { id: 'events', label: 'Events', path: '/events' },
  { id: 'community', label: 'Community', path: '/community' },
  { id: 'rankings', label: 'Rankings', path: '/rankings' },
  { id: 'journey', label: 'Journey', path: '/journey' },
]

const routeIndexById = new Map(
  SHARED_NAVBAR_ROUTE_ITEMS.map((item, index) => [item.id, index]),
)

const normalizePathname = (pathname: string) => {
  if (!pathname) return '/'

  const [withoutHash] = pathname.split('#')
  const [normalizedPathname] = withoutHash.split('?')

  return normalizedPathname || '/'
}

const isExactOrChildPath = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`)

export const getSharedNavbarRouteId = (pathname: string): SharedNavbarRouteId | null => {
  const normalizedPathname = normalizePathname(pathname)

  if (isExactOrChildPath(normalizedPathname, '/store') || normalizedPathname.startsWith('/merch')) {
    return 'store'
  }

  if (isExactOrChildPath(normalizedPathname, '/events')) {
    return 'events'
  }

  if (isExactOrChildPath(normalizedPathname, '/community')) {
    return 'community'
  }

  if (
    normalizedPathname === '/rankings' ||
    normalizedPathname.startsWith('/rankings/') ||
    normalizedPathname === '/ranking' ||
    normalizedPathname.startsWith('/ranking/')
  ) {
    return 'rankings'
  }

  if (normalizedPathname === '/' || isExactOrChildPath(normalizedPathname, '/journey')) {
    return 'journey'
  }

  return null
}

export const resolveSharedNavbarDirectionalTransition = (
  fromPathname: string,
  toPathname: string,
): 'push' | 'push-back' | null => {
  const fromId = getSharedNavbarRouteId(fromPathname)
  const toId = getSharedNavbarRouteId(toPathname)

  if (!fromId || !toId || fromId === toId) {
    return null
  }

  const fromIndex = routeIndexById.get(fromId)
  const toIndex = routeIndexById.get(toId)

  if (fromIndex === undefined || toIndex === undefined) {
    return null
  }

  return fromIndex < toIndex ? 'push' : 'push-back'
}
