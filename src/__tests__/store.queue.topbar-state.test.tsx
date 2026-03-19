import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { getFunctionName } from 'convex/server'
import { Merch } from '../pages/Merch'

const authState = vi.hoisted(() => ({ isSignedIn: false, userProfile: null as null | { _id: string } }))
const queueState = vi.hoisted(() => ({
  target: {
    now: Date.now(),
    state: 'none',
    drop: null,
    constants: {
      queueExpiryMs: 3600000,
      slotExpiryMs: 900000,
      cooldownMs: 1800000,
      maxActiveSlots: 10,
    },
  } as any,
  mine: null as any,
}))

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
  useCart: () => ({ itemCount: 2 }),
}))

vi.mock('../contexts/UserContext', () => ({
  useUser: () => authState,
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

describe('store queue topbar states', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authState.isSignedIn = false
    authState.userProfile = null
    queueState.target = {
      now: Date.now(),
      state: 'none',
      drop: null,
      constants: {
        queueExpiryMs: 3600000,
        slotExpiryMs: 900000,
        cooldownMs: 1800000,
        maxActiveSlots: 10,
      },
    }
    queueState.mine = null

    vi.mocked(useMutation).mockImplementation(() => vi.fn() as never)
    vi.mocked(useQuery).mockImplementation((queryRef: unknown, args?: unknown) => {
      if (matchesQuery(queryRef, 'merch:getProducts')) {
        return {
          items: [
            {
              _id: 'product-1',
              name: 'Queue Product',
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

      if (matchesQuery(queryRef, 'merch:getUpcomingDrops')) return [] as never
      if (matchesQuery(queryRef, 'merchQueue:getQueueTargetDrop')) return queueState.target
      if (matchesQuery(queryRef, 'merchQueue:getMyQueueState')) return queueState.mine
      if (matchesQuery(queryRef, 'merchManifest:getMerchImageManifestEntries')) return { entries: [] } as never
      if (matchesQuery(queryRef, 'merch:getRecentlyViewed')) return [] as never
      if (args === 'skip') return undefined as never
      return undefined as never
    })
  })

  it('shows sign-in state when queue target exists but user is signed out', () => {
    queueState.target = {
      ...queueState.target,
      state: 'upcoming',
      drop: {
        _id: 'drop-1',
        name: 'Upcoming Drop',
        startsAt: Date.now() + 1000,
        endsAt: Date.now() + 100000,
        products: ['product-1'],
        priority: 0,
      },
    }

    render(
      <MemoryRouter>
        <Merch />
      </MemoryRouter>,
    )

    expect(screen.getByText('store.queueSignInRequired')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'store.queueSignInToJoin' })).toBeInTheDocument()
  })

  it('shows waiting + claim slot controls when admitted position is available', () => {
    authState.isSignedIn = true
    authState.userProfile = { _id: 'user-1' }
    queueState.target = {
      ...queueState.target,
      state: 'active',
      drop: {
        _id: 'drop-1',
        name: 'Live Drop',
        startsAt: Date.now() - 1000,
        endsAt: Date.now() + 100000,
        products: ['product-1'],
        priority: 0,
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
      canClaimSlot: true,
    }

    render(
      <MemoryRouter>
        <Merch />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'store.claimQueueSlot' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'store.leaveQueue' })).toBeInTheDocument()
  })

  it('shows admitted + shop action when slot is active', () => {
    authState.isSignedIn = true
    authState.userProfile = { _id: 'user-1' }
    queueState.target = {
      ...queueState.target,
      state: 'active',
      drop: {
        _id: 'drop-1',
        name: 'Live Drop',
        startsAt: Date.now() - 1000,
        endsAt: Date.now() + 100000,
        products: ['product-1'],
        priority: 0,
      },
    }
    queueState.mine = {
      status: 'admitted',
      seq: 1,
      position: 0,
      estimatedWaitMinutes: 0,
      joinedAtUtc: Date.now() - 10000,
      expiresAtUtc: Date.now() + 100000,
      cooldownUntilUtc: undefined,
      slotExpiresAtUtc: Date.now() + 300000,
      canClaimSlot: false,
    }

    render(
      <MemoryRouter>
        <Merch />
      </MemoryRouter>,
    )

    expect(screen.getByText('store.queueAdmitted')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'store.shopQueueSlot' })).toBeInTheDocument()
  })

  it('shows cooldown disabled state after leaving queue', () => {
    authState.isSignedIn = true
    authState.userProfile = { _id: 'user-1' }
    queueState.target = {
      ...queueState.target,
      state: 'upcoming',
      drop: {
        _id: 'drop-1',
        name: 'Upcoming Drop',
        startsAt: Date.now() + 1000,
        endsAt: Date.now() + 100000,
        products: ['product-1'],
        priority: 0,
      },
    }
    queueState.mine = {
      status: 'left',
      seq: 8,
      position: 0,
      estimatedWaitMinutes: 0,
      joinedAtUtc: Date.now() - 10000,
      expiresAtUtc: Date.now() + 100000,
      cooldownUntilUtc: Date.now() + 300000,
      slotExpiresAtUtc: null,
      canClaimSlot: false,
    }

    render(
      <MemoryRouter>
        <Merch />
      </MemoryRouter>,
    )

    const cooldownButton = screen.getByRole('button', { name: 'store.queueCooldown' })
    expect(cooldownButton).toBeDisabled()
  })
})
