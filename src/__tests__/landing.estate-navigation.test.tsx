import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LandingPage } from '../pages/LandingPage'
import { useAuth } from '../hooks/useAuth'
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference'

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../hooks/useReducedMotionPreference', () => ({
  useReducedMotionPreference: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)
const mockedUseReducedMotionPreference = vi.mocked(useReducedMotionPreference)

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
  reducedMotion = true,
}: {
  initialEntry?: string
  isSignedIn?: boolean
  coarsePointer?: boolean
  reducedMotion?: boolean
} = {}) => {
  mockedUseAuth.mockReturnValue({
    user: isSignedIn ? ({} as ReturnType<typeof useAuth>['user']) : null,
    isSignedIn,
    isLoading: false,
    signOut: vi.fn(),
  } as ReturnType<typeof useAuth>)
  mockedUseReducedMotionPreference.mockReturnValue({
    prefersReducedMotion: reducedMotion,
    motionClassName: reducedMotion ? 'motion-reduce' : 'motion-safe',
  })
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

  it('renders all five path-driven regions in the landing overlay', () => {
    const { container } = renderLanding()

    const hitRegions = container.querySelectorAll('[data-hit-region="true"]')
    expect(hitRegions).toHaveLength(5)
    expect(container.querySelector('.castle-landing__scene-overlay')).toHaveAttribute('viewBox', '0 0 4096 2304')
    expect(container.querySelector('[data-region-id="store"][data-hit-region="true"]')).toBeInTheDocument()
    expect(container.querySelector('[data-region-id="events"][data-hit-region="true"]')).toBeInTheDocument()
    expect(container.querySelector('[data-region-id="ranking"][data-hit-region="true"]')).toBeInTheDocument()
    expect(container.querySelector('[data-region-id="campaign"][data-hit-region="true"]')).toBeInTheDocument()
    expect(container.querySelector('[data-region-id="community"][data-hit-region="true"]')).toBeInTheDocument()
    expect(container.querySelector('[data-debug-region]')).not.toBeInTheDocument()
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
    const communityPath = container.querySelector('[data-region-id="community"][data-hit-region="true"]')

    expect(communityPath).toBeTruthy()
    fireEvent.click(communityPath as Element)

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

  it('keeps keyboard focus and active card state aligned', () => {
    const { container } = renderLanding()
    const rankingPath = container.querySelector('[data-region-id="ranking"][data-hit-region="true"]')
    const rankingCard = container.querySelector('[data-region-id="ranking"][data-region-card="true"]')

    expect(rankingPath).toBeTruthy()
    expect(rankingCard).toBeTruthy()

    fireEvent.focus(rankingPath as Element)

    expect(rankingCard).toHaveAttribute('data-active', 'true')
  })

  it('keeps the active region visible when the pointer crosses the plaque', () => {
    const { container } = renderLanding()
    const storePath = container.querySelector('[data-region-id="store"][data-hit-region="true"]')
    const storeCard = container.querySelector('[data-region-id="store"][data-region-card="true"]')

    expect(storePath).toBeTruthy()
    expect(storeCard).toBeTruthy()

    fireEvent.pointerEnter(storePath as Element)
    expect(storeCard).toHaveAttribute('data-active', 'true')

    fireEvent.pointerEnter(storeCard as Element)
    expect(storeCard).toHaveAttribute('data-active', 'true')
  })

  it('drops the animated sheen when reduced motion is preferred', () => {
    const { container } = renderLanding({ reducedMotion: true })
    const campaignPath = container.querySelector('[data-region-id="campaign"][data-hit-region="true"]')

    expect(campaignPath).toBeTruthy()
    fireEvent.focus(campaignPath as Element)
    expect(container.querySelector('.castle-landing__sheen')).not.toBeInTheDocument()
  })

  it('uses first tap preview and second tap entry on coarse-pointer devices', () => {
    const { container } = renderLanding({ coarsePointer: true })
    const storePath = container.querySelector('[data-region-id="store"][data-hit-region="true"]')
    const storeCard = container.querySelector('[data-region-id="store"][data-region-card="true"]')

    expect(storePath).toBeTruthy()
    expect(storeCard).toBeTruthy()

    fireEvent.click(storePath as Element)
    expect(screen.queryByText('Store page')).not.toBeInTheDocument()
    expect(storeCard).toHaveAttribute('data-active', 'true')

    fireEvent.click(storePath as Element)
    expect(screen.getByText('Store page')).toBeInTheDocument()
  })

  it('renders the sheen when reduced motion is not preferred and a region is active', () => {
    const { container } = renderLanding({ reducedMotion: false })
    const campaignPath = container.querySelector('[data-region-id="campaign"][data-hit-region="true"]')

    expect(campaignPath).toBeTruthy()
    fireEvent.focus(campaignPath as Element)
    expect(container.querySelector('.castle-landing__sheen')).toBeInTheDocument()
  })
})
