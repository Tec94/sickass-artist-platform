import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Store from '../pages/StitchPrototypes/Store'
import StoreProductDetail from '../pages/StitchPrototypes/StoreProductDetail'
import { PrototypeCartProvider } from '../features/store/prototypeCart'
import { getPrototypeStoreProduct } from '../features/store/prototypeStoreCatalog'

vi.mock('../components/Navigation/SearchOverlay', () => ({
  default: () => null,
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
      getProductBySlug: (slug: string) => runtimeProducts.find((product) => product.slug === slug) ?? null,
      getCategoryCounts: () =>
        runtimeProducts.reduce(
          (counts, product) => {
            counts.all += 1
            counts[product.category] += 1
            return counts
          },
          { all: 0, apparel: 0, music: 0, collectibles: 0, accessories: 0 },
        ),
      getProducts: (category: string, sort: string) => {
        const filtered =
          category === 'all'
            ? runtimeProducts
            : runtimeProducts.filter((product) => product.category === category)
        return [...filtered].sort((left, right) => {
          if (sort === 'price-low') return left.priceCents - right.priceCents
          if (sort === 'price-high') return right.priceCents - left.priceCents
          return right.featuredOrder - left.featuredOrder
        })
      },
      formatPrototypePrice: contract.formatPrototypePrice,
    }),
  }
})

vi.mock('../features/store/prototypeCart', async () => {
  const React = await import('react')
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

  const productBySlug = new Map(runtimeProducts.map((product) => [product.slug, product]))

  type RuntimeProduct = (typeof runtimeProducts)[number]
  type LineItem = {
    lineKey: string
    slug: string
    quantity: number
    selection: Record<string, string>
    selectedOptions: ReturnType<typeof contract.resolvePrototypeStoreSelection>
    variantId: string | null
    product: RuntimeProduct
    unitPriceCents: number
    lineTotalCents: number
  }

  const Context = React.createContext<{
    items: LineItem[]
    itemCount: number
    subtotalCents: number
    addItem: (slug: string, selection?: Record<string, string>, quantity?: number) => Promise<void>
    removeItem: (lineId: string) => Promise<void>
    setQuantity: (lineId: string, quantity: number) => Promise<void>
    clearCart: () => Promise<void>
    storageMode: 'convex'
    canWrite: boolean
    isSyncing: boolean
  } | null>(null)

  const createLineKey = (slug: string, selection: Record<string, string>) =>
    `${slug}::${JSON.stringify(Object.entries(selection).sort(([left], [right]) => left.localeCompare(right)))}`

  const buildLineItem = (
    product: RuntimeProduct,
    selection: Record<string, string>,
    quantity: number,
  ): LineItem => {
    const normalizedSelection = contract.normalizePrototypeStoreSelection(product, selection)
    const selectedOptions = contract.resolvePrototypeStoreSelection(product, normalizedSelection)
    const unitPriceCents = contract.getPrototypeSelectionUnitPrice(product, normalizedSelection)

    return {
      lineKey: createLineKey(product.slug, normalizedSelection),
      slug: product.slug,
      quantity,
      selection: normalizedSelection,
      selectedOptions,
      variantId: null,
      product,
      unitPriceCents,
      lineTotalCents: unitPriceCents * quantity,
    }
  }

  const parseStoredItems = () => {
    const legacyRaw = window.localStorage.getItem('prototype_store_cart_v1')
    if (!legacyRaw) return [] as LineItem[]
    const parsed = JSON.parse(legacyRaw) as Array<{ slug: string; quantity: number }>
    return parsed.flatMap((item) => {
      const product = productBySlug.get(item.slug)
      if (!product) return []
      return [buildLineItem(product, product.defaultSelection, item.quantity)]
    })
  }

  function PrototypeCartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = React.useState<LineItem[]>(() => parseStoredItems())

    const value = React.useMemo(() => ({
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotalCents: items.reduce((total, item) => total + item.lineTotalCents, 0),
      addItem: async (slug: string, selection: Record<string, string> = {}, quantity = 1) => {
        const product = productBySlug.get(slug)
        if (!product) return
        const nextLine = buildLineItem(product, selection, quantity)
        setItems((currentItems) => {
          const existing = currentItems.find((item) => item.lineKey === nextLine.lineKey)
          if (!existing) return [...currentItems, nextLine]
          return currentItems.map((item) =>
            item.lineKey === nextLine.lineKey
              ? { ...item, quantity: item.quantity + quantity, lineTotalCents: item.unitPriceCents * (item.quantity + quantity) }
              : item,
          )
        })
      },
      removeItem: async (lineId: string) => {
        setItems((currentItems) => currentItems.filter((item) => item.lineKey !== lineId))
      },
      setQuantity: async (lineId: string, quantity: number) => {
        setItems((currentItems) =>
          currentItems.flatMap((item) => {
            if (item.lineKey !== lineId) return [item]
            if (quantity <= 0) return []
            return [{ ...item, quantity, lineTotalCents: item.unitPriceCents * quantity }]
          }),
        )
      },
      clearCart: async () => {
        setItems([])
      },
      storageMode: 'convex' as const,
      canWrite: true,
      isSyncing: false,
    }), [items])

    return <Context.Provider value={value}>{children}</Context.Provider>
  }

  return {
    PrototypeCartProvider,
    usePrototypeCart: () => {
      const context = React.useContext(Context)
      if (!context) {
        throw new Error('usePrototypeCart must be used within a PrototypeCartProvider')
      }
      return context
    },
  }
})

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

  it('filters in place and keeps the catalog shell borders after removing the sidebar divider', async () => {
    renderPrototypeStore()

    fireEvent.click(
      within(screen.getByTestId('prototype-store-sidebar')).getByRole('button', { name: /music/i }),
    )

    expect(screen.getByTestId('location-display')).toHaveTextContent('/store')
    await waitFor(() => {
      expect(screen.getByText('Midnight Sessions Vinyl')).toBeInTheDocument()
      expect(screen.queryByText('Private Suite Tee')).not.toBeInTheDocument()
    })
    expect(screen.getByTestId('prototype-store-sidebar').className).not.toContain('border-r')
    expect(screen.getByTestId('prototype-store-canvas').className).toContain('border-l')
    expect(screen.getByTestId('prototype-store-canvas').className).toContain('border-r')
  })

  it('adds the default selection from the grid without navigating away from the store route', () => {
    renderPrototypeStore()

    const productCard = screen.getByRole('button', { name: /view private suite tee/i }).closest('article')
    expect(productCard).not.toBeNull()

    fireEvent.click(within(productCard!).getByRole('button', { name: /^add$/i }))

    expect(screen.getByTestId('location-display')).toHaveTextContent('/store')
    expect(screen.getByLabelText(/open cart/i).querySelector('span')).toHaveTextContent('1')

    fireEvent.click(screen.getByLabelText(/open cart/i))

    const cartDialog = screen.getByRole('dialog', { name: /prototype cart/i })
    expect(within(cartDialog).getByText(/size: m/i)).toBeInTheDocument()
    expect(within(cartDialog).getByText(/colorway: core white/i)).toBeInTheDocument()
  })

  it('opens the detail route from card image and text targets', () => {
    renderPrototypeStore()

    fireEvent.click(screen.getByRole('button', { name: /open private suite tee details/i }))

    expect(screen.getByTestId('location-display')).toHaveTextContent(
      '/store/product/private-suite-tee',
    )
    expect(
      screen.getByRole('heading', { name: /private suite tee/i, level: 1 }),
    ).toBeInTheDocument()
  })

  it('initializes the detail hero from the first gallery image and keeps the rail focused on product controls', () => {
    renderPrototypeStore('/store/product/tour-longsleeve')

    const product = getPrototypeStoreProduct('tour-longsleeve')
    expect(product).not.toBeNull()

    expect(screen.getByTestId('detail-main-image')).toHaveAttribute('src', product!.gallery[0])
    expect(screen.getByTestId('detail-main-image').className).toContain('xl:scale-[1.14]')
    expect(screen.getByTestId('detail-back-button')).toHaveClass('px-4', 'py-3')
    expect(screen.getByTestId('detail-side-rail').className).toContain('xl:border-l')
    expect(within(screen.getByTestId('detail-side-rail')).queryByText(/editorial note/i)).not.toBeInTheDocument()
    expect(within(screen.getByTestId('detail-side-rail')).getByText(/select options/i)).toBeInTheDocument()
    expect(within(screen.getByTestId('detail-side-rail')).getByText(/quick details/i)).toBeInTheDocument()
    expect(screen.queryByText(/grid status/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/product intent/i)).not.toBeInTheDocument()
    expect(screen.getByTestId('detail-rail-content').className).not.toContain('overflow-y-auto')
  })

  it('creates separate cart lines for different variant selections and quantities', () => {
    renderPrototypeStore('/store/product/private-suite-tee')

    fireEvent.click(screen.getByRole('button', { name: /archive black/i }))
    fireEvent.click(screen.getByRole('button', { name: /increase quantity/i }))
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))

    fireEvent.click(screen.getByRole('button', { name: /core white/i }))
    fireEvent.click(screen.getByRole('button', { name: /decrease quantity/i }))
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))

    expect(screen.getByLabelText(/open cart/i).querySelector('span')).toHaveTextContent('3')

    fireEvent.click(screen.getByLabelText(/open cart/i))

    const cartDialog = screen.getByRole('dialog', { name: /prototype cart/i })
    expect(within(cartDialog).getAllByRole('heading', { name: /private suite tee/i })).toHaveLength(2)
    expect(within(cartDialog).getByText(/colorway: archive black/i)).toBeInTheDocument()
    expect(within(cartDialog).getByText(/colorway: core white/i)).toBeInTheDocument()
    expect(within(cartDialog).getByText(/^qty 2$/i)).toBeInTheDocument()
    expect(within(cartDialog).getByText(/^qty 1$/i)).toBeInTheDocument()
  })

  it('lets sold-out products open their detail page while keeping cart actions disabled', () => {
    renderPrototypeStore()

    fireEvent.click(screen.getByRole('button', { name: /view tour longsleeve/i }))

    expect(screen.getByTestId('location-display')).toHaveTextContent('/store/product/tour-longsleeve')
    expect(screen.getAllByText(/sold out/i).length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /increase quantity/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /decrease quantity/i })).toBeDisabled()
  })
})
