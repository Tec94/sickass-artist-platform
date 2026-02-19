import { useEffect, useState } from 'react'
import {
  DASHBOARD_HERO_SELECTOR,
  DASHBOARD_SCROLL_CONTAINER_SELECTOR,
} from '../constants/dashboardFlags'

const HERO_INTERSECTION_THRESHOLD = 0.08

type UseDashboardHeroPresenceArgs = {
  enabled?: boolean
  heroSelector?: string
}

export const useDashboardHeroPresence = ({
  enabled = true,
  heroSelector = DASHBOARD_HERO_SELECTOR,
}: UseDashboardHeroPresenceArgs = {}) => {
  const [isHeroVisible, setIsHeroVisible] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setIsHeroVisible(false)
      return
    }

    if (typeof window === 'undefined' || typeof window.IntersectionObserver === 'undefined') {
      setIsHeroVisible(false)
      return
    }

    let observer: IntersectionObserver | null = null
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let retryCount = 0

    const connectObserver = () => {
      const heroNode = document.querySelector(heroSelector)
      if (!heroNode) {
        if (retryCount >= 8) {
          setIsHeroVisible(false)
          return
        }
        retryCount += 1
        retryTimer = setTimeout(connectObserver, 180)
        return
      }

      const rootNode = document.querySelector(DASHBOARD_SCROLL_CONTAINER_SELECTOR)
      const root = rootNode instanceof HTMLElement ? rootNode : null

      observer = new IntersectionObserver(
        (entries) => {
          const isVisible = entries.some(
            (entry) => entry.isIntersecting && entry.intersectionRatio >= HERO_INTERSECTION_THRESHOLD,
          )
          setIsHeroVisible(isVisible)
        },
        {
          root,
          threshold: [0, HERO_INTERSECTION_THRESHOLD, 0.25, 0.5],
        },
      )

      observer.observe(heroNode)
    }

    connectObserver()

    return () => {
      if (retryTimer) clearTimeout(retryTimer)
      if (observer) observer.disconnect()
    }
  }, [enabled, heroSelector])

  return isHeroVisible
}
