import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import StoreProductDetail from '../pages/StitchPrototypes/StoreProductDetail'

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
  usePrototypeCatalog: () => ({
    products: [],
    isLoading: true,
    isUsingConvex: true,
    getProductBySlug: () => null,
    getCategoryCounts: vi.fn(),
    getProducts: vi.fn(),
    formatPrototypePrice: vi.fn(),
  }),
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
})
