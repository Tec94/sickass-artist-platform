import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { PhoneOverlayVisibilityPolicy } from './phoneTypes'

const ROUTE_EXCLUSIONS = ['/sign-in', '/sign-up', '/sso-callback', '/test-errors']

const matchesExcludedRoute = (pathname: string) =>
  ROUTE_EXCLUSIONS.includes(pathname) ||
  pathname.startsWith('/admin') ||
  pathname === '/store/checkout' ||
  pathname === '/store/confirmation'

const isFullscreenFixedOverlay = (el: Element) => {
  if (!(el instanceof HTMLElement)) return false
  if (el.closest('[data-phone-overlay-root="true"]')) return false
  const style = window.getComputedStyle(el)
  if (style.position !== 'fixed') return false
  const rect = el.getBoundingClientRect()
  const coversViewport = rect.width >= window.innerWidth * 0.95 && rect.height >= window.innerHeight * 0.9
  if (!coversViewport) return false
  const zIndex = Number(style.zIndex || '0')
  return Number.isFinite(zIndex) && zIndex >= 5000
}

const isDrawerConflictOnMobile = (el: Element) => {
  if (!(el instanceof HTMLElement)) return false
  if (el.closest('[data-phone-overlay-root="true"]')) return false
  const style = window.getComputedStyle(el)
  if (style.position !== 'fixed') return false
  const rect = el.getBoundingClientRect()
  const tall = rect.height >= window.innerHeight * 0.8
  const wide = rect.width >= Math.min(window.innerWidth * 0.6, 480)
  const anchoredSide = rect.left <= 4 || rect.right >= window.innerWidth - 4
  return tall && wide && anchoredSide
}

export function usePhoneVisibilityPolicy(): PhoneOverlayVisibilityPolicy {
  const location = useLocation()
  const [domPolicy, setDomPolicy] = useState<PhoneOverlayVisibilityPolicy>({ enabled: true })

  const routeExcluded = useMemo(() => matchesExcludedRoute(location.pathname), [location.pathname])

  useEffect(() => {
    if (routeExcluded || typeof window === 'undefined') {
      setDomPolicy({ enabled: true })
      return
    }

    let raf = 0
    let interval = 0

    const recompute = () => {
      raf = 0
      const elements = Array.from(document.body.querySelectorAll('*'))
      if (elements.some(isFullscreenFixedOverlay)) {
        setDomPolicy({ enabled: false, reason: 'fullscreen-overlay' })
        return
      }
      if (window.innerWidth < 640 && elements.some(isDrawerConflictOnMobile)) {
        setDomPolicy({ enabled: false, reason: 'mobile-drawer-conflict' })
        return
      }
      setDomPolicy({ enabled: true })
    }

    const schedule = () => {
      if (raf) return
      raf = window.requestAnimationFrame(recompute)
    }

    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true, attributes: true })
    window.addEventListener('resize', schedule)
    interval = window.setInterval(schedule, 1200)
    schedule()

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', schedule)
      if (raf) window.cancelAnimationFrame(raf)
      if (interval) window.clearInterval(interval)
    }
  }, [routeExcluded])

  if (routeExcluded) {
    return { enabled: false, reason: 'route-excluded' }
  }

  return domPolicy
}

