import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Store from '../pages/StitchPrototypes/Store'
import StoreProductDetail from '../pages/StitchPrototypes/StoreProductDetail'
import { PrototypeCartProvider } from '../features/store/prototypeCart'

vi.mock('../components/Navigation/SearchOverlay', () => ({
  default: () => null,
}))

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location-display">{location.pathname}</div>
}

function renderPrototypeStore(initialEntry = '/store') {
  return render(
    <PrototypeCartProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route
            path="/store"
            element={
              <>
                <LocationDisplay />
                <Store />
              </>
            }
          />
          <Route
            path="/store/product/:productSlug"
            element={
              <>
                <LocationDisplay />
                <StoreProductDetail />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </PrototypeCartProvider>,
  )
}

describe('Prototype store route', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('filters in place and keeps the catalog shell borders after removing the sidebar divider', () => {
    renderPrototypeStore()

    fireEvent.click(
      within(screen.getByTestId('prototype-store-sidebar')).getByRole('button', { name: /music/i }),
    )

    expect(screen.getByTestId('location-display')).toHaveTextContent('/store')
    expect(screen.getByText('Midnight Sessions Vinyl')).toBeInTheDocument()
    expect(screen.queryByText('Private Suite Tee')).not.toBeInTheDocument()
    expect(screen.getByTestId('prototype-store-sidebar').className).not.toContain('border-r')
    expect(screen.getByTestId('prototype-store-canvas').className).toContain('border-l')
    expect(screen.getByTestId('prototype-store-canvas').className).toContain('border-r')
  })

  it('adds items without navigating and opens the detail route from card image and text targets', () => {
    renderPrototypeStore()

    const productCard = screen.getByRole('button', { name: /view private suite tee/i }).closest('article')
    expect(productCard).not.toBeNull()

    fireEvent.click(within(productCard!).getByRole('button', { name: /^add$/i }))

    expect(screen.getByTestId('location-display')).toHaveTextContent('/store')
    expect(screen.getByLabelText(/open cart/i).querySelector('span')).toHaveTextContent('1')

    fireEvent.click(screen.getByRole('button', { name: /open private suite tee details/i }))

    expect(screen.getByTestId('location-display')).toHaveTextContent(
      '/store/product/private-suite-tee',
    )
    expect(
      screen.getByRole('heading', { name: /private suite tee/i, level: 1 }),
    ).toBeInTheDocument()
  })

  it('lets sold-out products open their detail page while keeping cart actions disabled', () => {
    renderPrototypeStore()

    fireEvent.click(screen.getByRole('button', { name: /view tour longsleeve/i }))

    expect(screen.getByTestId('location-display')).toHaveTextContent('/store/product/tour-longsleeve')
    expect(screen.getAllByText(/sold out/i).length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument()
  })
})
