import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import StoreProductDetail from '../pages/StitchPrototypes/StoreProductDetail'
import {
  SKELETON_MODE_STORAGE_KEY,
  SkeletonModeProvider,
} from '../features/skeletonMode'
import { type PrototypeStoreProduct } from '../features/store/prototypeStoreContract'

const resolvedProduct: PrototypeStoreProduct = {
  slug: 'private-suite-tee',
  name: 'Private Suite Tee',
  category: 'apparel',
  priceCents: 4500,
  primaryImage: '/test/private-suite-tee.jpg',
  gallery: ['/test/private-suite-tee.jpg'],
  availability: 'available',
  badge: 'New',
  shortDescription: 'Core uniform weight with a small crest hit and a crisp editorial drape.',
  detailDescription:
    'A clean front-loaded staple cut for the current campaign cycle.',
  materials: 'Heavy cotton jersey',
  releaseNote: 'Latest capsule',
  alt: 'White Private Suite tee displayed against a light studio backdrop',
  featuredOrder: 10,
  optionGroups: [
    {
      key: 'size',
      label: 'Size',
      options: [
        { value: 'm', label: 'M' },
        { value: 'l', label: 'L' },
      ],
    },
  ],
  quickDetails: ['Material: Heavy cotton jersey', 'Fit: Classic straight fit'],
  defaultSelection: {
    size: 'm',
  },
}

const prototypeCatalogState = {
  products: [] as PrototypeStoreProduct[],
  isLoading: true,
  isUsingConvex: true,
  getProductBySlug: (_slug: string) => null as PrototypeStoreProduct | null,
  getCategoryCounts: vi.fn(),
  getProducts: vi.fn(),
  formatPrototypePrice: vi.fn(),
}

vi.mock('../components/Navigation/SharedNavbar', () => ({
  default: () => <div data-testid="shared-navbar-stub">Shared navbar</div>,
}))

vi.mock('../features/store/prototypeCart', () => ({
  usePrototypeCart: () => ({
    addItem: vi.fn(),
    itemCount: 0,
    canWrite: true,
  }),
}))

vi.mock('../features/store/usePrototypeCatalog', () => ({
  usePrototypeCatalog: () => prototypeCatalogState,
}))

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  vi.stubGlobal('ResizeObserver', MockResizeObserver)
})

beforeEach(() => {
  window.localStorage.clear()
  prototypeCatalogState.products = []
  prototypeCatalogState.isLoading = true
  prototypeCatalogState.isUsingConvex = true
  prototypeCatalogState.getProductBySlug = () => null
  prototypeCatalogState.getCategoryCounts = vi.fn()
  prototypeCatalogState.getProducts = vi.fn()
  prototypeCatalogState.formatPrototypePrice = vi.fn()
})

describe('StoreProductDetail loading state', () => {
  it('renders a loading state instead of crashing when catalog data is unresolved', () => {
    render(
      <MemoryRouter initialEntries={['/store/product/private-suite-tee']}>
        <Routes>
          <Route path="/store/product/:productSlug" element={<StoreProductDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('shared-navbar-stub')).toBeInTheDocument()
    expect(screen.getByText(/loading product/i).closest('[data-boneyard]')).toHaveAttribute(
      'data-boneyard',
      'store-product-detail',
    )
    expect(screen.getByText(/loading product/i)).toBeInTheDocument()
  })

  it('honors forced skeleton mode even when the product payload is resolved', () => {
    window.localStorage.setItem(SKELETON_MODE_STORAGE_KEY, 'true')

    prototypeCatalogState.products = [resolvedProduct]
    prototypeCatalogState.isLoading = false
    prototypeCatalogState.getProductBySlug = (slug: string) =>
      slug === resolvedProduct.slug ? resolvedProduct : null

    render(
      <SkeletonModeProvider enabled>
        <MemoryRouter initialEntries={[`/store/product/${resolvedProduct.slug}`]}>
          <Routes>
            <Route path="/store/product/:productSlug" element={<StoreProductDetail />} />
          </Routes>
        </MemoryRouter>
      </SkeletonModeProvider>,
    )

    expect(screen.getByText(/loading product/i).closest('[data-boneyard]')).toHaveAttribute(
      'data-boneyard',
      'store-product-detail',
    )
    expect(screen.getByText(/loading product/i)).toBeInTheDocument()
  })
})
