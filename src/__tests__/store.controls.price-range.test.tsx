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

describe('store dual-handle price controls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useMutation).mockImplementation(() => vi.fn() as never)
    vi.mocked(useQuery).mockImplementation((queryRef: unknown, args?: unknown) => {
      if (matchesQuery(queryRef, 'merch:getProducts')) {
        return {
          items: [
            {
              _id: 'product-1',
              name: 'Price Test Product',
              description: 'Description',
              price: 1000,
              imageUrls: ['/image.jpg'],
              thumbnailUrl: '/image.jpg',
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

      if (matchesQuery(queryRef, 'merchManifest:getMerchImageManifestEntries')) return { entries: [] } as never
      if (matchesQuery(queryRef, 'merch:getUpcomingDrops')) return [] as never
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
      if (matchesQuery(queryRef, 'merchQueue:getMyQueueState')) return null as never
      if (matchesQuery(queryRef, 'merch:getRecentlyViewed')) return [] as never
      if (args === 'skip') return undefined as never
      return undefined as never
    })
  })

  it('keeps range sliders and numeric inputs synchronized', () => {
    const { container } = render(
      <MemoryRouter>
        <Merch />
      </MemoryRouter>,
    )

    const sliders = Array.from(container.querySelectorAll('input[type="range"]')) as HTMLInputElement[]
    const spinButtons = screen.getAllByRole('spinbutton') as HTMLInputElement[]

    expect(sliders).toHaveLength(2)

    fireEvent.change(sliders[0], { target: { value: '120' } })
    expect(spinButtons[0]).toHaveValue(120)

    fireEvent.change(spinButtons[1], { target: { value: '250' } })
    expect(sliders[1]).toHaveValue('250')
  })
})
