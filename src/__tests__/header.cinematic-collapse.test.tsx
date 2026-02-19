import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import Header from '../components/Header'
import { useDashboardHeroPresence } from '../hooks/useDashboardHeroPresence'

let heroVisible = true
let isSignedIn = true
let headerCollapseFlag = true

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useLocation: () => ({ pathname: '/dashboard' }),
    useNavigate: () => vi.fn(),
  }
})

vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}))

vi.mock('../hooks/useDashboardHeroPresence', () => ({
  useDashboardHeroPresence: vi.fn(),
}))

vi.mock('../contexts/CartContext', () => ({
  useCart: () => ({ itemCount: 3 }),
}))

vi.mock('../contexts/UserContext', () => ({
  useUser: () => ({
    isSignedIn,
    userProfile: { _id: 'user_1', username: 'wolf', avatar: undefined },
  }),
}))

vi.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('../hooks/useSearchModal', () => ({
  useSearchModal: () => ({ isSearchOpen: false, openSearch: vi.fn(), closeSearch: vi.fn() }),
}))

vi.mock('../components/Search/SearchModal', () => ({
  SearchModal: () => null,
}))

vi.mock('../components/Search/SearchTrigger', () => ({
  SearchTrigger: ({ className }: { className?: string }) => <button className={className}>Search</button>,
}))

vi.mock('../components/CartDrawer', () => ({
  CartDrawer: () => null,
}))

vi.mock('../components/WishlistDrawer', () => ({
  WishlistDrawer: () => null,
}))

vi.mock('../components/Navigation/ProfilePopover', () => ({
  ProfilePopover: () => null,
}))

describe('header cinematic collapse', () => {
  beforeEach(() => {
    heroVisible = true
    isSignedIn = true
    headerCollapseFlag = true
    window.sessionStorage.clear()
    let queryCycle = 0

    vi.mocked(useMutation).mockReturnValue(vi.fn() as never)
    vi.mocked(useDashboardHeroPresence).mockImplementation(() => heroVisible)
    vi.mocked(useQuery).mockImplementation((_query: any, args?: any) => {
      if (args === 'skip') return undefined as never

      const stage = queryCycle % 3
      queryCycle += 1

      if (stage === 0) {
        return {
          hardeningV1: false,
          headerCollapseV1: headerCollapseFlag,
          contentHygieneV1: false,
        } as never
      }

      if (stage === 1) {
        return [{ _id: 'w1' }, { _id: 'w2' }] as never
      }

      if (stage === 2) {
        return [
          { _id: 'n1', isRead: false, title: 'a', message: 'b', createdAt: Date.now() },
          { _id: 'n2', isRead: false, title: 'a', message: 'b', createdAt: Date.now() },
        ] as never
      }

      return undefined as never
    })
  })

  it('collapses header chrome while hero is in view on first session pass', () => {
    const { container } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    )

    const header = container.querySelector('header')
    expect(header).toHaveAttribute('data-cinematic-collapse', 'true')
    expect(container.querySelectorAll('span.bg-red-600').length).toBe(0)
  })

  it('restores full header chrome after hero handoff', () => {
    const { container, rerender } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    )

    expect(container.querySelector('header')).toHaveAttribute('data-cinematic-collapse', 'true')

    heroVisible = false
    rerender(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    )

    const header = container.querySelector('header')
    expect(header).toHaveAttribute('data-cinematic-collapse', 'false')
    expect(container.querySelectorAll('span.bg-red-600').length).toBeGreaterThan(0)
    expect(screen.getAllByText('nav.dashboard').length).toBeGreaterThan(0)
  })

  it('respects explicit kill-switch when header collapse flag is false', () => {
    headerCollapseFlag = false

    const { container } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    )

    const header = container.querySelector('header')
    expect(header).toHaveAttribute('data-cinematic-collapse', 'false')
  })
})
