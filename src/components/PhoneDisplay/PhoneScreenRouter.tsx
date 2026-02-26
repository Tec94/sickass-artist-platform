import { Suspense } from 'react'
import { PhoneAnimationHost } from './PhoneAnimationHost'
import { usePhoneOverlay } from './PhoneOverlayProvider'
import { getPhoneAppDefinition } from './PhoneAppRegistry'
import { LockScreen } from './screens/LockScreen'
import { HomeScreen } from './screens/HomeScreen'

export function PhoneScreenRouter() {
  const { currentRoute, state } = usePhoneOverlay()
  const routeKey = currentRoute.kind === 'app' ? `${currentRoute.kind}-${currentRoute.appId}-${currentRoute.view || 'root'}` : currentRoute.kind

  let content: React.ReactNode

  if (state.isLocked || currentRoute.kind === 'locked') {
    content = <LockScreen />
  } else if (currentRoute.kind === 'home') {
    content = <HomeScreen />
  } else {
    const app = getPhoneAppDefinition(currentRoute.appId)
    const AppComponent = app?.component
    content = AppComponent ? (
      <Suspense fallback={<div className="phone-app-loading flex h-full items-center justify-center text-sm text-zinc-300">Loading...</div>}>
        <AppComponent />
      </Suspense>
    ) : (
      <div className="flex h-full items-center justify-center text-sm text-zinc-400">App unavailable</div>
    )
  }

  return <PhoneAnimationHost routeKey={`${routeKey}-${state.navStack.length}`}>{content}</PhoneAnimationHost>
}

