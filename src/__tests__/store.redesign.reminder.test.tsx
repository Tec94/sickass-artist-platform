import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { useMutation, useQuery } from 'convex/react'
import { getFunctionName } from 'convex/server'
import { Merch } from '../pages/Merch'
import { downloadDropICS, generateDropICS, openDropGoogleCalendar } from '../utils/dropCalendar'

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
  useCart: () => ({ itemCount: 3 }),
}))

vi.mock('../contexts/UserContext', () => ({
  useUser: () => ({ isSignedIn: false, userProfile: null }),
}))

vi.mock('../components/Merch/MerchProductCard', () => ({
  MerchProductCard: ({ product }: { product: { name: string } }) => <div>{product.name}</div>,
}))

vi.mock('../utils/dropCalendar', () => ({
  generateDropICS: vi.fn(() => 'BEGIN:VCALENDAR\\r\\nEND:VCALENDAR'),
  downloadDropICS: vi.fn(),
  openDropGoogleCalendar: vi.fn(),
}))

function matchesQuery(queryRef: unknown, name: string) {
  try {
    return getFunctionName(queryRef as never) === name
  } catch {
    return false
  }
}

function mockStoreQueries(withUpcomingDrop: boolean) {
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
      return withUpcomingDrop
        ? [
            {
              _id: 'drop-1',
              name: 'Vault Night Drop',
              description: 'Limited vault release',
              startsAt: Date.now() + 172800000,
              endsAt: Date.now() + 259200000,
            },
          ]
        : []
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
}

describe('store reminder and drop scheduling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useMutation).mockImplementation(() => vi.fn() as never)
  })

  it('shows concrete upcoming drop details and executes calendar actions', () => {
    mockStoreQueries(true)
    render(<Merch />)

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    expect(screen.getByText('Vault Night Drop')).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes(`(${timezone})`))).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'store.setReminder' }))

    expect(screen.getByRole('heading', { name: 'store.reminderTitle' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /store\.reminderEmail/ })).toBeEnabled()
    expect(screen.getByRole('button', { name: /store\.reminderSms/ })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: 'store.reminderGoogleCalendar' }))
    expect(openDropGoogleCalendar).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'store.reminderDownloadCalendar' }))
    expect(generateDropICS).toHaveBeenCalledTimes(1)
    expect(downloadDropICS).toHaveBeenCalledTimes(1)
  })

  it('shows generic fallback copy and keeps reminder CTA available when no upcoming drop exists', () => {
    mockStoreQueries(false)
    render(<Merch />)

    expect(screen.getByText('store.noUpcomingDropGeneric')).toBeInTheDocument()
    const noDropReminderButton = screen.getByRole('button', { name: 'store.notifyNextDrop' })
    expect(noDropReminderButton).toBeEnabled()

    fireEvent.click(noDropReminderButton)

    expect(screen.getByRole('heading', { name: 'store.reminderTitle' })).toBeInTheDocument()
    expect(screen.getByText('store.reminderNoDropBody')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'store.reminderGoogleCalendar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'store.reminderDownloadCalendar' })).toBeDisabled()
    expect(screen.getByText('store.reminderCalendarDisabled')).toBeInTheDocument()
  })
})
