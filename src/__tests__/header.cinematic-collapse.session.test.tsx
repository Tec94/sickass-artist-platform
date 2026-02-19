import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import Header from '../components/Header'
import { useDashboardHeroPresence } from '../hooks/useDashboardHeroPresence'

let heroVisible = true
let isSignedIn = true

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
  useCart: () => ({ itemCount: 1 }),
}))

vi.mock('../contexts/UserContext', () => ({
  useUser: () => ({
    isSignedIn,
    userProfile: isSignedIn ? { _id: 'user_1', username: 'wolf', avatar: undefined } : null,
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

describe('header cinematic collapse session behavior', () => {
  beforeEach(() => {
    heroVisible = true
    isSignedIn = true
    window.sessionStorage.clear()

    vi.mocked(useMutation).mockReturnValue(vi.fn() as never)
    vi.mocked(useDashboardHeroPresence).mockImplementation(() => heroVisible)
    vi.mocked(useQuery).mockImplementation((query: any, args?: any) => {
      if (args === 'skip') return undefined as never

      if (query === api.dashboard.getDashboardExperienceFlags) {
        return {
          hardeningV1: false,
          headerCollapseV1: true,
          contentHygieneV1: false,
        } as never
      }

      if (query === api.merch.getWishlist) {
        return [] as never
      }

      if (query === api.notifications.getUserNotifications) {
        return [] as never
      }

      return undefined as never
    })
  })

  it('collapses only on the first hero pass within the same login session', () => {
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
    expect(container.querySelector('header')).toHaveAttribute('data-cinematic-collapse', 'false')

    heroVisible = true
    rerender(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    )
    expect(container.querySelector('header')).toHaveAttribute('data-cinematic-collapse', 'false')
  })

  it('resets collapse eligibility after a logout/login cycle', () => {
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
    expect(container.querySelector('header')).toHaveAttribute('data-cinematic-collapse', 'false')

    isSignedIn = false
    rerender(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    )

    isSignedIn = true
    heroVisible = true
    rerender(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    )

    expect(container.querySelector('header')).toHaveAttribute('data-cinematic-collapse', 'true')
  })
})
