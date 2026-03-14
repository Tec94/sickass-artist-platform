import { beforeEach, describe, expect, it, vi, afterEach, afterAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { useMutation, useQuery } from 'convex/react'
import { getFunctionName } from 'convex/server'
import { Merch } from '../pages/Merch'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/store', search: '', hash: '' }),
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

describe('store sticky non-overlap structure', () => {
  const originalIntersectionObserver = globalThis.IntersectionObserver
  const originalResizeObserver = globalThis.ResizeObserver
  const rectSpy = vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(() => ({ x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 72, toJSON: () => ({}) }) as DOMRect)

  beforeEach(() => {
    vi.clearAllMocks()

    class MockIntersectionObserver {
      private callback: IntersectionObserverCallback
      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback
      }
      disconnect() {}
      observe() {
        this.callback([{ isIntersecting: false } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
      }
      takeRecords() {
        return []
      }
      unobserve() {}
    }

    class MockResizeObserver {
      private callback: ResizeObserverCallback
      constructor(callback: ResizeObserverCallback) {
        this.callback = callback
      }
      disconnect() {}
      observe(target: Element) {
        this.callback([{ target, borderBoxSize: [], contentBoxSize: [], devicePixelContentBoxSize: [], contentRect: target.getBoundingClientRect() }], this as unknown as ResizeObserver)
      }
      unobserve() {}
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    vi.stubGlobal('ResizeObserver', MockResizeObserver)

    vi.mocked(useMutation).mockImplementation(() => vi.fn() as never)
    vi.mocked(useQuery).mockImplementation((queryRef: unknown, args?: unknown) => {
      if (matchesQuery(queryRef, 'merch:getProducts')) {
        return {
          items: [
            {
              _id: 'product-1',
              name: 'Sticky Test Product',
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

  afterEach(() => {
    vi.stubGlobal('IntersectionObserver', originalIntersectionObserver as any)
    vi.stubGlobal('ResizeObserver', originalResizeObserver as any)
  })

  it('renders sticky sentinel and spacer structure when utility row enters sticky mode', () => {
    render(<Merch />)

    expect(screen.getByTestId('store-sticky-sentinel')).toBeInTheDocument()
    expect(screen.getByTestId('store-sticky-spacer')).toBeInTheDocument()
  })

  afterAll(() => {
    rectSpy.mockRestore()
  })
})
