import { resolveSharedNavbarDirectionalTransition } from '../../features/navigation/sharedNavbarRouteOrder'

export type TransitionType = 'push' | 'push-back' | 'slide-up' | 'fade'

export const resolvePageTransition = (
  previousPathname: string,
  nextPathname: string,
  requestedTransition: TransitionType | null | undefined,
): TransitionType => {
  if (
    requestedTransition === 'push-back' ||
    requestedTransition === 'slide-up' ||
    requestedTransition === 'fade'
  ) {
    return requestedTransition
  }

  const directionalTransition = resolveSharedNavbarDirectionalTransition(
    previousPathname,
    nextPathname,
  )

  if (directionalTransition) {
    return directionalTransition
  }

  return 'fade'
}
