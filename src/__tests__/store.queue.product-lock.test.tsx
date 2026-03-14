import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { useMutation, useQuery } from 'convex/react'
import { getFunctionName } from 'convex/server'
import { Merch } from '../pages/Merch'

const authState = vi.hoisted(() => ({ isSignedIn: true, userProfile: { _id: 'user-1' } as null | { _id: string } }))
const queueState = vi.hoisted(() => ({
  target: null as any,
  mine: null as any,
}))

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
  useCart: () => ({ itemCount: 1 }),
}))

vi.mock('../contexts/UserContext', () => ({
  useUser: () => authState,
}))

vi.mock('../components/Merch/MerchProductCard', () => ({
  MerchProductCard: ({ product, isLocked }: { product: { name: string }; isLocked?: boolean }) => (
    <div>
      <span>{product.name}</span>
      <span>{isLocked ? 'LOCKED' : 'OPEN'}</span>
    </div>
  ),
}))

function matchesQuery(queryRef: unknown, name: string) {
  try {
    return getFunctionName(queryRef as never) === name
  } catch {
    return false
  }
}

describe('store queue product lock behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queueState.target = {
      now: Date.now(),
      state: 'active',
      drop: {
        _id: 'drop-1',
        name: 'Live Drop',
        startsAt: Date.now() - 1000,
        endsAt: Date.now() + 100000,
        products: ['product-1'],
        priority: 0,
      },
      constants: {
        queueExpiryMs: 3600000,
        slotExpiryMs: 900000,
        cooldownMs: 1800000,
        maxActiveSlots: 10,
      },
    }
    queueState.mine = {
      status: 'waiting',
      seq: 4,
      position: 3,
      estimatedWaitMinutes: 6,
      joinedAtUtc: Date.now() - 10000,
      expiresAtUtc: Date.now() + 100000,
      cooldownUntilUtc: undefined,
      slotExpiresAtUtc: null,
      canClaimSlot: false,
    }

    vi.mocked(useMutation).mockImplementation(() => vi.fn() as never)
    vi.mocked(useQuery).mockImplementation((queryRef: unknown, args?: unknown) => {
      if (matchesQuery(queryRef, 'merch:getProducts')) {
        return {
          items: [
            {
              _id: 'product-1',
              name: 'Drop Hoodie',
              description: 'Drop product',
              price: 9000,
              imageUrls: ['/image.jpg'],
              thumbnailUrl: '/image.jpg',
              category: 'apparel',
              tags: [],
              variants: [{ _id: 'variant-1', stock: 2 }],
              totalStock: 2,
              _creationTime: Date.now(),
            },
            {
              _id: 'product-2',
              name: 'Always On Cap',
              description: 'Always-on product',
              price: 5000,
              imageUrls: ['/image.jpg'],
              thumbnailUrl: '/image.jpg',
              category: 'accessories',
              tags: [],
              variants: [{ _id: 'variant-2', stock: 2 }],
              totalStock: 2,
              _creationTime: Date.now(),
            },
          ],
          hasMore: false,
          page: 0,
          pageSize: 120,
          windowCount: 2,
          timestamp: Date.now(),
        } as never
      }

      if (matchesQuery(queryRef, 'merch:getUpcomingDrops')) return [] as never
      if (matchesQuery(queryRef, 'merchQueue:getQueueTargetDrop')) return queueState.target
      if (matchesQuery(queryRef, 'merchQueue:getMyQueueState')) return queueState.mine
      if (matchesQuery(queryRef, 'merchManifest:getMerchImageManifestEntries')) return { entries: [] } as never
      if (matchesQuery(queryRef, 'merch:getRecentlyViewed')) return [] as never
      if (args === 'skip') return undefined as never
      return undefined as never
    })
  })

  it('locks only active-drop products when user is not admitted', () => {
    render(<Merch />)

    const lockStates = screen.getAllByText(/LOCKED|OPEN/)
    expect(lockStates[0]).toHaveTextContent('LOCKED')
    expect(lockStates[1]).toHaveTextContent('OPEN')
  })
})
