import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { getFunctionName } from 'convex/server'
import { Merch } from '../pages/Merch'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/store/browse', search: '', hash: '' }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  }
})

vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}))

vi.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('../hooks/useReducedMotionPreference', () => ({
  useReducedMotionPreference: () => ({ motionClassName: 'motion-reduce' }),
}))

vi.mock('../contexts/CartContext', () => ({
  useCart: () => ({ itemCount: 1 }),
}))

vi.mock('../contexts/UserContext', () => ({
  useUser: () => ({ isSignedIn: false, userProfile: null }),
}))

vi.mock('../components/Merch/MerchProductCard', () => ({
  MerchProductCard: ({ product }: { product: { name: string } }) => <div>{product.name}</div>,
}))

function matchesQuery(queryRef: unknown, name: string) {
  try {
    return getFunctionName(queryRef as never) === name
  } catch {
    return false
  }
}

describe('store IA controls', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useQuery).mockImplementation((queryRef: unknown, args?: unknown) => {
      const product = {
        _id: 'product-1',
        name: 'Crimson Jacket',
        description: 'Premium jacket',
        price: 9900,
        imageUrls: ['/image.jpg'],
        thumbnailUrl: '/thumb.jpg',
        category: 'apparel',
        tags: ['tour collection'],
        variants: [{ _id: 'variant-1', stock: 10 }],
        totalStock: 10,
        _creationTime: Date.now(),
      }

      if (matchesQuery(queryRef, 'merch:getProducts')) {
        return {
          items: [product],
          hasMore: false,
          page: 0,
          pageSize: 120,
          windowCount: 1,
          timestamp: Date.now(),
        } as never
      }

      if (matchesQuery(queryRef, 'merchManifest:getMerchImageManifestEntries')) {
        return { entries: [] } as never
      }

      if (matchesQuery(queryRef, 'merch:getUpcomingDrops')) {
        return [] as never
      }

      if (matchesQuery(queryRef, 'merchQueue:getQueueTargetDrop')) {
        return {
          now: Date.now(),
          state: 'none',
          drop: null,
          constants: {
            queueExpiryMs: 3600000,
            slotExpiryMs: 900000,
            cooldownMs: 1800000,
            maxActiveSlots: 10,
          },
        } as never
      }

      if (matchesQuery(queryRef, 'merchQueue:getMyQueueState')) {
        return null as never
      }

      if (matchesQuery(queryRef, 'merch:getRecentlyViewed')) {
        return [] as never
      }

      if (args === 'skip') return undefined as never
      return undefined as never
    })

    vi.mocked(useMutation).mockImplementation(() => vi.fn() as never)
  })

  it('keeps category and collection visible while queue/search/sort remain in the top utility layer', () => {
    const { container } = render(
      <MemoryRouter>
        <Merch />
      </MemoryRouter>,
    )

    expect(screen.queryAllByRole('button', { name: 'store.allProducts' })).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'store.tourCollection' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'store.sortBestSellers' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'store.sortNewest' })).toBeInTheDocument()
    expect(screen.getByText('store.queueStatus')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'store.inStock' })).not.toBeInTheDocument()

    expect(container.querySelectorAll('.store-surface-card.store-utility-row')).toHaveLength(0)
    expect(container.querySelectorAll('.store-announcement-strip.store-surface-card')).toHaveLength(0)
    expect(container.querySelectorAll('iconify-icon[icon=\"solar:check-circle-bold\"]')).toHaveLength(0)
    expect(container.querySelectorAll('[data-testid=\"store-sidebar-panel\"]')).toHaveLength(1)
  })
})
