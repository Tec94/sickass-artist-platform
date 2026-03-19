import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
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
  useCart: () => ({ itemCount: 0 }),
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

describe('store accessibility controls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useMutation).mockImplementation(() => vi.fn() as never)
    vi.mocked(useQuery).mockImplementation((queryRef: unknown, args?: unknown) => {
      if (matchesQuery(queryRef, 'merch:getProducts')) {
        return {
          items: [
            {
              _id: 'product-1',
              name: 'Test Product',
              description: 'Description',
              price: 1000,
              imageUrls: ['/image.jpg'],
              category: 'apparel',
              tags: [],
              variants: [{ _id: 'variant-1', stock: 2 }],
              totalStock: 2,
              _creationTime: Date.now(),
            },
          ],
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
  })

  it('exposes labelled search/sort controls, queue control, and filters drawer dialog', () => {
    render(
      <MemoryRouter>
        <Merch />
      </MemoryRouter>,
    )

    const searchInput = screen.getByRole('searchbox', { name: 'store.searchProducts' })
    expect(searchInput).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'store.sortBy' })).toBeInTheDocument()
    expect(screen.getByText('store.queueStatus')).toBeInTheDocument()
    expect(screen.getByText('1 store.results')).toBeInTheDocument()

    fireEvent.change(searchInput, { target: { value: 'Test' } })
    const searchChipRemove = screen.getByRole('button', { name: /common\.remove common\.search: Test/i })
    expect(searchChipRemove).toBeInTheDocument()
    fireEvent.click(searchChipRemove)
    expect(screen.queryByRole('button', { name: /common\.remove common\.search: Test/i })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'store.filtersLabel' }))
    expect(screen.getByRole('dialog', { name: 'store.filtersLabel' })).toBeInTheDocument()
  })
})
