import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference'
import { StoreScenePage } from '../pages/StoreScenePage'

vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
}))

vi.mock('../hooks/useReducedMotionPreference', () => ({
  useReducedMotionPreference: vi.fn(),
}))

const mockedUseQuery = vi.mocked(useQuery)
const mockedUseReducedMotionPreference = vi.mocked(useReducedMotionPreference)

const scenicProducts = [
  { _id: 'product-jacket', name: 'Private Suit Varsity Jacket', tags: ['private-suit-varsity-jacket'] },
  { _id: 'product-tee', name: 'Jetski Motion Tee', tags: ['jetski-motion-tee'] },
  { _id: 'product-vinyl-vol2', name: 'Private Suite Vol. 2 Vinyl', tags: ['private-suite-vol-2-vinyl'] },
  { _id: 'product-poster', name: 'PPC Poster', tags: ['ppc-poster'] },
  { _id: 'product-denim', name: 'Coated Stack Denim', tags: ['coated-stack-denim'] },
  { _id: 'product-cargo', name: 'Cargo Jeans', tags: ['cargo-jeans'] },
  { _id: 'product-vinyl', name: 'PPC Vinyl', tags: ['ppc-vinyl'] },
  { _id: 'product-windbreaker', name: 'Private Suit Windbreaker', tags: ['private-suit-windbreaker'] },
].map((product, index) => ({
  ...product,
  description: `${product.name} description`,
  price: 5000 + index * 1000,
  imageUrls: ['/product.jpg'],
  thumbnailUrl: '/product.jpg',
  category: 'apparel',
  variants: [{ _id: `variant-${index + 1}`, stock: 5 }],
  totalStock: 5,
}))

const installMatchMedia = (coarsePointer: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(hover: none), (pointer: coarse)' ? coarsePointer : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

const renderStoreScene = ({
  initialEntry = '/store',
  coarsePointer = false,
  prefersReducedMotion = true,
}: {
  initialEntry?: string
  coarsePointer?: boolean
  prefersReducedMotion?: boolean
} = {}) => {
  mockedUseQuery.mockReturnValue({
    items: scenicProducts,
    hasMore: false,
    page: 0,
    pageSize: 120,
    windowCount: scenicProducts.length,
    timestamp: Date.now(),
  } as never)
  mockedUseReducedMotionPreference.mockReturnValue({
    prefersReducedMotion,
    motionClassName: prefersReducedMotion ? 'motion-reduce' : 'motion-safe',
  })
  installMatchMedia(coarsePointer)

  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/store" element={<StoreScenePage />} />
        <Route path="/store/browse" element={<div>Browse collection</div>} />
        <Route path="/store/product/:productId" element={<div>Product detail</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('store scenic navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.scrollTo = vi.fn()
  })

  it('renders all eight store scene product paths and the browse CTA', () => {
    const { container } = renderStoreScene()

    expect(container.querySelectorAll('[data-hit-slot="true"]')).toHaveLength(8)
    expect(screen.getByRole('link', { name: 'Open Store UI' })).toHaveAttribute('href', '/store/browse')
  })

  it('shows the store debug legend when debug mode is enabled', () => {
    const { container } = renderStoreScene({ initialEntry: '/store?debugStoreScene=1' })

    expect(container.querySelector('[data-debug-slot="product-1"]')).toBeInTheDocument()
    expect(container.querySelector('[data-debug-slot="product-8"]')).toBeInTheDocument()
  })

  it('uses first tap preview and second tap entry on coarse-pointer devices', () => {
    const { container } = renderStoreScene({ coarsePointer: true })
    const slot = container.querySelector('[data-slot-id="product-1"][data-hit-slot="true"]')
    const card = container.querySelector('[data-scene-slot-card="true"]')

    expect(slot).toBeTruthy()
    expect(card).toBeTruthy()

    fireEvent.click(slot as Element)
    expect(screen.queryByText('Product detail')).not.toBeInTheDocument()
    expect(card).toHaveAttribute('data-slot-id', 'product-1')

    fireEvent.click(slot as Element)
    expect(screen.getByText('Product detail')).toBeInTheDocument()
  })

  it('keeps a static active plaque when reduced motion is preferred', () => {
    const { container } = renderStoreScene({ prefersReducedMotion: true })
    const slot = container.querySelector('[data-slot-id="product-7"][data-hit-slot="true"]')

    expect(slot).toBeTruthy()

    fireEvent.focus(slot as Element)

    expect(container.querySelector('.store-scene__sheen')).not.toBeInTheDocument()
    expect(container.querySelector('[data-scene-slot-card="true"]')).toHaveAttribute('data-slot-id', 'product-7')
  })
})
