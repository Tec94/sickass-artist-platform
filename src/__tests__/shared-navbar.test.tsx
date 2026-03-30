import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SharedNavbar from '../components/Navigation/SharedNavbar'
import { PrototypeCartProvider } from '../features/store/prototypeCart'

vi.mock('../components/Navigation/SearchOverlay', () => ({
  default: ({
    state,
    onExited,
    onRequestClose,
  }: {
    state: 'open' | 'closing'
    onExited: () => void
    onRequestClose: () => void
  }) => (
    <div role="dialog" aria-label="search overlay" data-state={state}>
      <button type="button" onClick={onRequestClose}>
        Request search close
      </button>
      <button type="button" onClick={onExited}>
        Complete search exit
      </button>
    </div>
  ),
}))

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
  const Context = React.createContext<any>(null)

  const createLineKey = (slug: string, selection: Record<string, string>) =>
    `${slug}::${JSON.stringify(Object.entries(selection).sort(([left], [right]) => left.localeCompare(right)))}`

  const buildLineItem = (product: (typeof runtimeProducts)[number], quantity: number) => {
    const selection = contract.normalizePrototypeStoreSelection(product, product.defaultSelection)
    const selectedOptions = contract.resolvePrototypeStoreSelection(product, selection)
    const unitPriceCents = contract.getPrototypeSelectionUnitPrice(product, selection)
    return {
      lineKey: createLineKey(product.slug, selection),
      slug: product.slug,
      quantity,
      selection,
      selectedOptions,
      variantId: null,
      product,
      unitPriceCents,
      lineTotalCents: unitPriceCents * quantity,
    }
  }

  function PrototypeCartProvider({ children }: { children: React.ReactNode }) {
    const [items] = React.useState(() => {
      const legacyRaw = window.localStorage.getItem('prototype_store_cart_v1')
      if (!legacyRaw) return []
      const parsed = JSON.parse(legacyRaw) as Array<{ slug: string; quantity: number }>
      return parsed.flatMap((item) => {
        const product = productBySlug.get(item.slug)
        if (!product) return []
        return [buildLineItem(product, item.quantity)]
      })
    })

    const value = React.useMemo(() => ({
      items,
      itemCount: items.reduce((total: number, item: { quantity: number }) => total + item.quantity, 0),
      subtotalCents: items.reduce((total: number, item: { lineTotalCents: number }) => total + item.lineTotalCents, 0),
      addItem: async () => {},
      removeItem: async () => {},
      setQuantity: async () => {},
      clearCart: async () => {},
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
      if (!context) throw new Error('usePrototypeCart must be used within a PrototypeCartProvider')
      return context
    },
  }
})

describe('SharedNavbar', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('uses the lighter header shadow contract', () => {
    const { container } = render(
      <PrototypeCartProvider>
        <MemoryRouter initialEntries={['/journey']}>
          <SharedNavbar />
        </MemoryRouter>
      </PrototypeCartProvider>,
    )

    const header = container.querySelector('header')
    expect(header).toHaveClass('shadow-[var(--site-navbar-shadow)]')
    expect(screen.getByRole('link', { name: /journey/i })).toHaveClass('border-b-2')
  })

  it('opens the mobile drawer and exposes route links from the compact header shell', () => {
    render(
      <PrototypeCartProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <SharedNavbar />
        </MemoryRouter>
      </PrototypeCartProvider>,
    )

    fireEvent.click(screen.getByLabelText(/open navigation menu/i))

    const drawer = screen.getByTestId('mobile-nav-drawer')
    expect(drawer).toBeInTheDocument()
    expect(within(drawer).getByRole('link', { name: /community/i })).toBeInTheDocument()
    expect(within(drawer).getByRole('link', { name: /^profile open$/i })).toBeInTheDocument()
  })

  it('keeps the store menu hover bridge and mounts the cart drawer only when open', () => {
    window.localStorage.setItem(
      'prototype_store_cart_v1',
      JSON.stringify([{ slug: 'private-suite-tee', quantity: 2 }]),
    )

    render(
      <PrototypeCartProvider>
        <MemoryRouter initialEntries={['/store/product/private-suite-tee']}>
          <SharedNavbar />
        </MemoryRouter>
      </PrototypeCartProvider>,
    )

    expect(screen.getByRole('link', { name: /store/i })).toHaveClass('border-b-2')
    expect(screen.queryByRole('dialog', { name: /prototype cart/i })).not.toBeInTheDocument()

    fireEvent.mouseEnter(screen.getByRole('link', { name: /store/i }).parentElement!)

    expect(screen.getByTestId('store-menu-bridge')).toBeInTheDocument()
    expect(screen.getByTestId('store-mega-menu')).toBeInTheDocument()
    expect(screen.getByTestId('store-mega-menu').parentElement).toHaveClass('top-full')
    expect(screen.getByLabelText(/open cart/i).querySelector('span')).toHaveTextContent('2')

    fireEvent.click(screen.getByLabelText(/open cart/i))

    expect(screen.getByRole('dialog', { name: /prototype cart/i })).toBeInTheDocument()
  })

  it('keeps the search overlay mounted through closing, blocks navbar re-entry, and restores focus on exit', () => {
    render(
      <PrototypeCartProvider>
        <MemoryRouter initialEntries={['/rankings']}>
          <SharedNavbar />
        </MemoryRouter>
      </PrototypeCartProvider>,
    )

    const searchButton = screen.getByLabelText(/open search/i)
    const storeTrigger = screen.getByRole('link', { name: /store/i }).parentElement!

    expect(screen.queryByRole('dialog', { name: /search overlay/i })).not.toBeInTheDocument()

    fireEvent.click(searchButton)

    expect(screen.getByRole('dialog', { name: /search overlay/i })).toHaveAttribute('data-state', 'open')

    fireEvent.mouseEnter(storeTrigger)

    expect(screen.queryByTestId('store-mega-menu')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /request search close/i }))

    expect(screen.getByRole('dialog', { name: /search overlay/i })).toHaveAttribute('data-state', 'closing')

    fireEvent.mouseEnter(storeTrigger)
    fireEvent.click(screen.getByLabelText(/open cart/i))

    expect(screen.queryByTestId('store-mega-menu')).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: /prototype cart/i })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /complete search exit/i }))

    expect(screen.queryByRole('dialog', { name: /search overlay/i })).not.toBeInTheDocument()
    expect(searchButton).toHaveFocus()
  })
})
