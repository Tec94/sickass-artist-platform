import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DevSkeletonModeToggle,
  RouteSkeletonBoundary,
  SKELETON_MODE_STORAGE_KEY,
  SkeletonModeProvider,
  SkeletonModeToggle,
  getRouteSkeletonTarget,
  routeSkeletonTargets,
  shouldEnableSkeletonDebug,
} from '../features/skeletonMode'

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  class MockMutationObserver {
    observe() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }

  vi.stubGlobal('ResizeObserver', MockResizeObserver)
  vi.stubGlobal('MutationObserver', MockMutationObserver)
})

beforeEach(() => {
  window.localStorage.clear()
  const boneyardWindow = window as Window & { __BONEYARD_BUILD?: boolean }
  delete boneyardWindow.__BONEYARD_BUILD
})

describe('skeleton mode tooling', () => {
  it('hydrates from localStorage and persists toggle updates', () => {
    window.localStorage.setItem(SKELETON_MODE_STORAGE_KEY, 'true')

    render(
      <SkeletonModeProvider enabled>
        <SkeletonModeToggle />
      </SkeletonModeProvider>,
    )

    const toggle = screen.getByTestId('skeleton-mode-toggle')
    expect(toggle).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    expect(window.localStorage.getItem(SKELETON_MODE_STORAGE_KEY)).toBe('false')
  })

  it('shows the route fallback when forced skeleton mode is active', () => {
    const dashboardTarget = getRouteSkeletonTarget('/dashboard')

    if (!dashboardTarget) {
      throw new Error('Expected dashboard route skeleton target to exist.')
    }

    render(
      <SkeletonModeProvider enabled>
        <SkeletonModeToggle />
        <RouteSkeletonBoundary target={dashboardTarget}>
          <div className="min-h-[320px] bg-white p-6">Dashboard dossier</div>
        </RouteSkeletonBoundary>
      </SkeletonModeProvider>,
    )

    expect(screen.getByText('Dashboard dossier')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('skeleton-mode-toggle'))

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(
      screen.getByText(/Boneyard is forcing the captured layout for this route/i),
    ).toBeInTheDocument()
    expect(document.querySelector('[data-boneyard="page-dashboard"]')).toBeInTheDocument()
  })

  it('suppresses the floating toggle while Boneyard capture mode is active', () => {
    const boneyardWindow = window as Window & { __BONEYARD_BUILD?: boolean }
    boneyardWindow.__BONEYARD_BUILD = true

    render(
      <SkeletonModeProvider enabled>
        <DevSkeletonModeToggle />
      </SkeletonModeProvider>,
    )

    expect(screen.queryByTestId('skeleton-mode-toggle')).not.toBeInTheDocument()
  })

  it('keeps the route target list aligned with the routed app surface', () => {
    expect(new Set(routeSkeletonTargets.map((target) => target.path))).toEqual(
      new Set([
        '/',
        '/dashboard',
        '/archive',
        '/rankings',
        '/ranking-submission',
        '/profile',
        '/community',
        '/journey',
        '/campaign',
        '/store',
        '/store/product/:productSlug',
        '/new-post',
        '/access-tiers-albert',
        '/experience-albert',
        '/events',
        '/login',
        '*',
      ]),
    )
  })

  it('enables the toggle only in development outside Boneyard build mode', () => {
    expect(shouldEnableSkeletonDebug({ isDev: true, isBuildMode: false })).toBe(true)
    expect(shouldEnableSkeletonDebug({ isDev: false, isBuildMode: false })).toBe(false)
    expect(shouldEnableSkeletonDebug({ isDev: true, isBuildMode: true })).toBe(false)
  })
})
