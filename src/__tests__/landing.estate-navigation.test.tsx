import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LandingPage } from '../pages/LandingPage'
import { useAuth } from '../hooks/useAuth'

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)

const installMatchMedia = (coarsePointer: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(hover: none), (pointer: coarse)' ? coarsePointer : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

const renderLanding = ({
  initialEntry = '/',
  isSignedIn = false,
  coarsePointer = false,
}: {
  initialEntry?: string
  isSignedIn?: boolean
  coarsePointer?: boolean
} = {}) => {
  mockedUseAuth.mockReturnValue({
    user: isSignedIn ? ({} as ReturnType<typeof useAuth>['user']) : null,
    isSignedIn,
    isLoading: false,
    signOut: vi.fn(),
  } as ReturnType<typeof useAuth>)
  installMatchMedia(coarsePointer)

  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/store" element={<div>Store page</div>} />
        <Route path="/community" element={<div>Community page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('landing estate navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.scrollTo = vi.fn()
  })

  it('renders five marker buttons and removes the old hover-button tooltip contract', () => {
    const { container } = renderLanding()

    const markers = container.querySelectorAll('[data-region-marker="true"]')
    expect(markers).toHaveLength(5)
    expect(container.querySelector('[data-region-id="campaign"][data-region-marker="true"]')).toBeInTheDocument()
    expect(container.querySelector('[data-region-id="events"][data-region-marker="true"]')).toBeInTheDocument()
    expect(container.querySelector('[data-region-id="store"][data-region-marker="true"]')).toBeInTheDocument()
    expect(container.querySelector('[data-region-id="ranking"][data-region-marker="true"]')).toBeInTheDocument()
    expect(container.querySelector('[data-region-id="community"][data-region-marker="true"]')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /explore the estate/i })).not.toBeInTheDocument()
    expect(container.querySelector('title#castle-estate-title')).not.toBeInTheDocument()
    expect(container.querySelector('desc#castle-estate-description')).not.toBeInTheDocument()
  })

  it('shows the full debug instrumentation contract when debug mode is enabled', () => {
    const { container } = renderLanding({ initialEntry: '/?debugRegions=1' })

    expect(container.querySelectorAll('[data-debug-region]')).toHaveLength(5)
    expect(container.querySelector('[data-debug-region="campaign"]')).toBeInTheDocument()
    expect(container.querySelector('[data-region-id="campaign"][data-debug-anchor="label"]')).toBeInTheDocument()
    expect(container.querySelector('[data-region-id="campaign"][data-debug-anchor="arrow"]')).toBeInTheDocument()
    expect(container.querySelector('[data-debug-region="community"]')).toHaveAttribute('data-debug-access', 'locked')
  })

  it('opens the locked community auth prompt and preserves the scenic return target', () => {
    const { container } = renderLanding()
    const communityMarker = container.querySelector('[data-region-id="community"][data-region-marker="true"]')

    expect(communityMarker).toBeTruthy()
    fireEvent.click(communityMarker as Element)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/auth?mode=signin&returnTo=%2Fcommunity',
    )
    expect(screen.getByRole('link', { name: 'Create account' })).toHaveAttribute(
      'href',
      '/auth?mode=signup&returnTo=%2Fcommunity',
    )
  })

  it('keeps keyboard focus and active chip state aligned', () => {
    const { container } = renderLanding()
    const rankingMarker = container.querySelector('[data-region-id="ranking"][data-region-marker="true"]')

    expect(rankingMarker).toBeTruthy()

    fireEvent.focus(rankingMarker as Element)

    expect(rankingMarker).toHaveAttribute('data-active', 'true')
  })

  it('shows only the active chip and clears it when the pointer leaves the marker', () => {
    const { container } = renderLanding()
    const eventsMarker = container.querySelector('[data-region-id="events"][data-region-marker="true"]')

    expect(eventsMarker).toBeTruthy()

    fireEvent.pointerEnter(eventsMarker as Element)
    expect(eventsMarker).toHaveAttribute('data-active', 'true')

    fireEvent.pointerLeave(eventsMarker as Element)
    expect(eventsMarker).toHaveAttribute('data-active', 'false')
  })

  it('navigates immediately from a marker click on coarse-pointer devices', () => {
    const { container } = renderLanding({ coarsePointer: true })
    const storeMarker = container.querySelector('[data-region-id="store"][data-region-marker="true"]')

    expect(storeMarker).toBeTruthy()

    fireEvent.click(storeMarker as Element)

    expect(screen.getByText('Store page')).toBeInTheDocument()
  })

  it('supports horizontal drag-to-pan on coarse-pointer devices without triggering marker navigation after a drag', () => {
    const { container } = renderLanding({ coarsePointer: true })
    const sceneWrap = container.querySelector('.castle-landing__scene-wrap') as HTMLDivElement | null
    const storeMarker = container.querySelector('[data-region-id="store"][data-region-marker="true"]')

    expect(sceneWrap).toBeTruthy()
    expect(storeMarker).toBeTruthy()
    expect(sceneWrap).toHaveAttribute('data-pan-enabled', 'true')

    Object.defineProperty(sceneWrap, 'scrollWidth', {
      configurable: true,
      value: 1800,
    })
    Object.defineProperty(sceneWrap, 'clientWidth', {
      configurable: true,
      value: 900,
    })
    Object.defineProperty(sceneWrap, 'scrollLeft', {
      configurable: true,
      value: 300,
      writable: true,
    })

    sceneWrap!.setPointerCapture = vi.fn()
    sceneWrap!.releasePointerCapture = vi.fn()
    sceneWrap!.hasPointerCapture = vi.fn(() => true)

    fireEvent.pointerDown(sceneWrap as Element, {
      clientX: 320,
      pointerId: 7,
      pointerType: 'touch',
    })
    fireEvent.pointerMove(sceneWrap as Element, {
      clientX: 180,
      pointerId: 7,
      pointerType: 'touch',
    })

    expect(sceneWrap!.scrollLeft).toBe(440)

    fireEvent.pointerUp(sceneWrap as Element, {
      clientX: 180,
      pointerId: 7,
      pointerType: 'touch',
    })
    fireEvent.click(storeMarker as Element)

    expect(screen.queryByText('Store page')).not.toBeInTheDocument()
  })

  it('keeps the fallback estate list accessible on coarse-pointer devices', () => {
    renderLanding({ coarsePointer: true })

    fireEvent.click(screen.getByRole('button', { name: /open estate list/i }))

    expect(screen.getByRole('heading', { name: 'Estate list' })).toBeInTheDocument()
    expect(screen.getByText(/follow the active release cycle/i)).toBeInTheDocument()
  })
})
