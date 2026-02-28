import { useEffect, useState } from 'react'
import {
  DASHBOARD_HERO_SELECTOR,
  DASHBOARD_SCROLL_CONTAINER_SELECTOR,
} from '../constants/dashboardFlags'

const HERO_INTERSECTION_THRESHOLD = 0.08

const isHeroVisibleInRoot = (heroNode: Element, rootNode: HTMLElement | null): boolean => {
  if (!(heroNode instanceof HTMLElement)) {
    return false
  }

  const heroRect = heroNode.getBoundingClientRect()
  const rootRect = rootNode
    ? rootNode.getBoundingClientRect()
    : new DOMRect(0, 0, window.innerWidth, window.innerHeight)

  const intersectionWidth = Math.max(0, Math.min(heroRect.right, rootRect.right) - Math.max(heroRect.left, rootRect.left))
  const intersectionHeight = Math.max(0, Math.min(heroRect.bottom, rootRect.bottom) - Math.max(heroRect.top, rootRect.top))
  const heroArea = Math.max(heroRect.width * heroRect.height, 1)
  const intersectionArea = intersectionWidth * intersectionHeight
  const ratio = intersectionArea / heroArea

  return ratio >= HERO_INTERSECTION_THRESHOLD
}

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
      setIsHeroVisible(isHeroVisibleInRoot(heroNode, root))

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
