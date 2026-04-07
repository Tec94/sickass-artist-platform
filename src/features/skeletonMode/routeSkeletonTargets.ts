import routeSkeletonTargetsJson from './routeSkeletonTargets.json'

export type RouteSkeletonTarget = {
  id: string
  path: string
  capturePath: string | null
  skeletonName: string
  label: string
}

export const routeSkeletonTargets = routeSkeletonTargetsJson as RouteSkeletonTarget[]

const routeSkeletonTargetByPath = new Map(
  routeSkeletonTargets.map((target) => [target.path, target] as const),
)

export const getRouteSkeletonTarget = (path: string) =>
  routeSkeletonTargetByPath.get(path) ?? null

export const routeSkeletonCapturePaths = Array.from(
  new Set(
    routeSkeletonTargets
      .map((target) => target.capturePath)
      .filter((capturePath): capturePath is string => Boolean(capturePath)),
  ),
)
