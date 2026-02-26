import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import type { PhoneDockLayout } from './phoneTypes'

type DockMeasure = {
  bottom: number
  right: number
}

const DEFAULT_DOCK: DockMeasure = { bottom: 24, right: 24 }

const RIGHT_OCCUPANT_SELECTORS = ['[data-dashboard-design-lab-switcher="true"]', '[data-sonner-toaster]', '.sonner-toaster']

function computeDock(): DockMeasure {
  if (typeof window === 'undefined') return DEFAULT_DOCK

  let bottom = DEFAULT_DOCK.bottom
  let right = DEFAULT_DOCK.right

  for (const selector of RIGHT_OCCUPANT_SELECTORS) {
    const elements = Array.from(document.querySelectorAll(selector))
    for (const el of elements) {
      if (!(el instanceof HTMLElement)) continue
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) continue
      const nearRight = rect.right >= window.innerWidth - 32
      const inLowerHalf = rect.bottom >= window.innerHeight * 0.4
      if (!nearRight || !inLowerHalf) continue
      bottom = Math.max(bottom, window.innerHeight - rect.top + 16)
      right = Math.max(right, Math.max(12, window.innerWidth - rect.right + 12))
    }
  }

  return { bottom, right }
}

export function usePhoneOverlayDock(enabled: boolean, hidden: boolean): PhoneDockLayout {
  const [dock, setDock] = useState<DockMeasure>(DEFAULT_DOCK)

  useEffect(() => {
    if (!enabled || hidden) return
    let raf = 0
    let interval = 0

    const measure = () => {
      raf = 0
      setDock(computeDock())
    }
    const schedule = () => {
      if (raf) return
      raf = window.requestAnimationFrame(measure)
    }

    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { subtree: true, childList: true, attributes: true })
    window.addEventListener('resize', schedule)
    interval = window.setInterval(schedule, 1500)
    schedule()

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', schedule)
      if (interval) window.clearInterval(interval)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [enabled, hidden])

  const style = useMemo<CSSProperties>(
    () => ({
      bottom: `${dock.bottom}px`,
      right: `${dock.right}px`,
    }),
    [dock.bottom, dock.right],
  )

  return {
    hidden: hidden || !enabled,
    style,
  }
}

