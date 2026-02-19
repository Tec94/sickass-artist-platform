import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useDashboardHeroPresence } from '../../hooks/useDashboardHeroPresence'

type ObserverEntry = {
  isIntersecting: boolean
  intersectionRatio: number
}

let observerCallback: ((entries: ObserverEntry[]) => void) | null = null
const originalIntersectionObserver = window.IntersectionObserver

class MockIntersectionObserver {
  constructor(callback: (entries: ObserverEntry[]) => void) {
    observerCallback = callback
  }

  observe() {}
  disconnect() {}
}

const PresenceProbe = () => {
  const visible = useDashboardHeroPresence({ enabled: true })
  return <div data-testid="probe" data-visible={visible ? 'true' : 'false'} />
}

describe('useDashboardHeroPresence', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    observerCallback = null
    Object.defineProperty(window, 'IntersectionObserver', {
      value: MockIntersectionObserver,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
    Object.defineProperty(window, 'IntersectionObserver', {
      value: originalIntersectionObserver,
      configurable: true,
    })
  })

  it('recovers when the hero mounts after initial render', () => {
    const scrollRoot = document.createElement('div')
    scrollRoot.setAttribute('data-scroll-container', 'true')
    document.body.appendChild(scrollRoot)

    render(<PresenceProbe />)
    expect(screen.getByTestId('probe')).toHaveAttribute('data-visible', 'false')

    const hero = document.createElement('section')
    hero.setAttribute('data-dashboard-hero-root', 'true')
    document.body.appendChild(hero)

    act(() => {
      vi.advanceTimersByTime(220)
    })

    expect(observerCallback).not.toBeNull()

    act(() => {
      observerCallback?.([{ isIntersecting: true, intersectionRatio: 0.3 }])
    })

    expect(screen.getByTestId('probe')).toHaveAttribute('data-visible', 'true')
  })

  it('gracefully works without a custom scroll root', () => {
    const hero = document.createElement('section')
    hero.setAttribute('data-dashboard-hero-root', 'true')
    document.body.appendChild(hero)

    render(<PresenceProbe />)

    act(() => {
      observerCallback?.([{ isIntersecting: true, intersectionRatio: 0.2 }])
    })

    expect(screen.getByTestId('probe')).toHaveAttribute('data-visible', 'true')
  })
})
