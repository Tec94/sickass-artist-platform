import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { useMutation, useQuery } from 'convex/react'
import { getFunctionName } from 'convex/server'
import { MerchDetail } from '../pages/MerchDetail'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    Link: ({ to, children, ...props }: { to: string; children: any }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
    useNavigate: () => vi.fn(),
    useParams: () => ({ productId: 'product-1' }),
  }
})

vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}))

vi.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('../hooks/useAutoRetry', () => ({
  useAutoRetry: () => ({
    retryWithBackoff: async (fn: () => Promise<unknown>) => fn(),
  }),
}))

vi.mock('../contexts/UserContext', () => ({
  useUser: () => ({
    isSignedIn: true,
    userProfile: { _id: 'user-1' },
  }),
}))

vi.mock('../components/Merch/FreeShippingBanner', () => ({
  FreeShippingBanner: () => <div data-testid="free-shipping-banner" />,
}))

vi.mock('../components/Merch/ImageGallery', () => ({
  ImageGallery: () => <div data-testid="image-gallery" />,
}))

function matchesQuery(queryRef: unknown, name: string) {
  try {
    return getFunctionName(queryRef as never) === name
  } catch {
    return false
  }
}

describe('store detail queue lock', () => {
  it('renders a queue lock interstitial when product is in an active queue-gated drop', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    vi.mocked(useMutation).mockImplementation(() => vi.fn().mockResolvedValue(undefined) as never)
    vi.mocked(useQuery).mockImplementation((queryRef: unknown, args?: unknown) => {
      if (matchesQuery(queryRef, 'merch:getProductDetail')) {
        return {
          _id: 'product-1',
          name: 'Drop Hoodie',
          description: 'Queue-gated drop product',
          longDescription: 'Queue-gated drop product',
          price: 9000,
          imageUrls: ['/image.jpg'],
          thumbnailUrl: '/image.jpg',
          category: 'apparel',
          tags: [],
          variants: [{ _id: 'variant-1', stock: 3 }],
          totalStock: 3,
          relatedProducts: [],
          model3dUrl: undefined,
          modelPosterUrl: undefined,
          modelConfig: undefined,
        } as never
      }

      if (matchesQuery(queryRef, 'merchManifest:getMerchImageManifestEntries')) {
        return { entries: [] } as never
      }

      if (matchesQuery(queryRef, 'merch:getWishlist')) {
        return [] as never
      }

      if (matchesQuery(queryRef, 'merchQueue:getQueueTargetDrop')) {
        return {
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
        } as never
      }

      if (matchesQuery(queryRef, 'merchQueue:getMyQueueState')) {
        return {
          status: 'waiting',
          seq: 3,
          position: 2,
          estimatedWaitMinutes: 4,
          joinedAtUtc: Date.now() - 10000,
          expiresAtUtc: Date.now() + 100000,
          cooldownUntilUtc: undefined,
          slotExpiresAtUtc: null,
          canClaimSlot: false,
        } as never
      }

      if (args === 'skip') return undefined as never
      return undefined as never
    })

    render(<MerchDetail />)

    expect(screen.getByRole('heading', { name: 'store.detailLockedTitle' })).toBeInTheDocument()
    expect(screen.getByText('store.detailLockedBody')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'store.queueWaiting' })).toBeDisabled()
    expect(screen.getByRole('link', { name: 'store.backToQueueControl' })).toBeInTheDocument()
  })
})
