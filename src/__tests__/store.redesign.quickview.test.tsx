import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { useMutation, useQuery } from 'convex/react'
import { getFunctionName } from 'convex/server'
import { Merch } from '../pages/Merch'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
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
  useCart: () => ({ itemCount: 2 }),
}))

vi.mock('../contexts/UserContext', () => ({
  useUser: () => ({ isSignedIn: false, userProfile: null }),
}))

vi.mock('../components/Merch/MerchProductCard', () => ({
  MerchProductCard: ({ product, onQuickView, onOpenProduct }: { product: any; onQuickView?: (id: string) => void; onOpenProduct?: (id: string) => void }) => (
    <div>
      <span>{product.name}</span>
      <button type="button" onClick={() => onQuickView?.(product._id)}>
        quick-{product.name}
      </button>
      <button type="button" onClick={() => onOpenProduct?.(product._id)}>
        open-{product.name}
      </button>
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

describe('store redesign interactions', () => {
  const recordRecentlyViewedMock = vi.fn()
  const addToCartMock = vi.fn()
  const joinQueueMock = vi.fn()
  const leaveQueueMock = vi.fn()
  const claimQueueMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

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

    vi.mocked(useQuery).mockImplementation((queryRef: unknown, args?: unknown) => {
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

    const mutationFns = [recordRecentlyViewedMock, addToCartMock, joinQueueMock, leaveQueueMock, claimQueueMock]
    let mutationIndex = 0

    vi.mocked(useMutation).mockImplementation(() => {
      const fn = mutationFns[mutationIndex % mutationFns.length]
      mutationIndex += 1
      return fn as never
    })
  })

  it('opens quick view and records recently viewed products while supporting quick add', async () => {
    render(<Merch />)

    expect(screen.getByRole('option', { name: 'store.sortNewest' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'store.sortBestSellers' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'store.sortPriceLowHigh' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'store.sortPriceHighLow' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'store.sortAlphabetical' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /store\.cartButton/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /quick-Crimson Jacket/i }))

    expect(await screen.findByRole('button', { name: 'store.quickAdd' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'store.quickAdd' }))

    await waitFor(() => {
      expect(addToCartMock).toHaveBeenCalledWith({ variantId: 'variant-1', quantity: 1 })
    })

    fireEvent.click(screen.getByRole('button', { name: /open-Crimson Jacket/i }))

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/store/product/product-1')
      expect(recordRecentlyViewedMock).toHaveBeenCalledWith({ productId: 'product-1' })
    })
  })
})
