import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Dashboard from '../pages/StitchPrototypes/Dashboard'
import Community from '../pages/StitchPrototypes/Community'
import AccessTiersAlbert from '../pages/StitchPrototypes/AccessTiersAlbert'
import ExperienceAlbert from '../pages/StitchPrototypes/ExperienceAlbert'
import StoreProductDetail from '../pages/StitchPrototypes/StoreProductDetail'

vi.mock('../components/Navigation/SharedNavbar', () => ({
  default: () => <div data-testid="shared-navbar-stub">Shared navbar</div>,
}))

vi.mock('../hooks/usePretextResponsiveFit', () => ({
  usePretextResponsiveFit: () => ({
    containerRef: { current: null },
    isCompact: true,
  }),
}))

vi.mock('../features/store/prototypeCart', () => ({
  usePrototypeCart: () => ({
    addItem: vi.fn(),
    itemCount: 0,
    canWrite: true,
  }),
}))

vi.mock('../features/store/usePrototypeCatalog', async () => {
  const catalog = await import('../features/store/prototypeStoreCatalog')
  const contract = await import('../features/store/prototypeStoreContract')

  const runtimeProducts = catalog.PROTOTYPE_STORE_PRODUCTS.map((product) => ({
    ...product,
    optionGroups: product.optionGroups.map((group) => ({
      key: group.id,
      label: group.label,
      options: group.options.map((option) => ({
        value: option.id,
        label: option.label,
        priceDeltaCents: option.priceDeltaCents,
      })),
    })),
    quickDetails: product.quickDetails.map((detail) => `${detail.label}: ${detail.value}`),
    defaultSelection: catalog.getPrototypeDefaultSelection(product),
  }))

  return {
    usePrototypeCatalog: () => ({
      products: runtimeProducts,
      isLoading: false,
      isUsingConvex: true,
      getProductBySlug: (slug: string) =>
        runtimeProducts.find((product) => product.slug === slug) ?? null,
      formatPrototypePrice: contract.formatPrototypePrice,
    }),
  }
})

describe('prototype responsive layout contracts', () => {
  it('keeps dashboard in a stacked shell with desktop-only row split', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('dashboard-shell')).toHaveClass('flex-col')
    expect(screen.getByTestId('dashboard-shell').className).toContain('lg:flex-row')
  })

  it('renders the mobile community category scroller', () => {
    render(
      <MemoryRouter>
        <Community />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('community-mobile-categories')).toBeInTheDocument()
  })

  it('renders mobile ticket cards and summary drawer affordances for access tiers', () => {
    render(
      <MemoryRouter>
        <AccessTiersAlbert />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('access-tier-mobile-card')).toBeInTheDocument()
    expect(screen.getByTestId('access-tier-mobile-summary')).toBeInTheDocument()
    expect(screen.getByText(/The Royal Albert Hall/i)).toHaveAttribute('data-pretext-compact', 'true')
  })

  it('marks the exhibition heading as compact when pretext fit requires it', () => {
    render(
      <MemoryRouter>
        <ExperienceAlbert />
      </MemoryRouter>,
    )

    expect(screen.getByText(/THE ROYAL ALBERT HALL EXHIBITION/i)).toHaveAttribute(
      'data-pretext-compact',
      'true',
    )
  })

  it('renders the mobile purchase bar on the product detail route', () => {
    render(
      <MemoryRouter initialEntries={['/store/product/private-suite-tee']}>
        <Routes>
          <Route path="/store/product/:productSlug" element={<StoreProductDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('detail-mobile-purchase-bar')).toBeInTheDocument()
  })
})
