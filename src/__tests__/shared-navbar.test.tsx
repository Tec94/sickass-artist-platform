import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SharedNavbar from '../components/Navigation/SharedNavbar'
import { PrototypeCartProvider } from '../features/store/prototypeCart'

vi.mock('../components/Navigation/SearchOverlay', () => ({
  default: () => null,
}))

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
    expect(header).toHaveClass('shadow-[0_4px_10px_rgba(60,42,33,0.12)]')
    expect(screen.getByRole('link', { name: /journey/i })).toHaveClass('border-b-2')
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
})
