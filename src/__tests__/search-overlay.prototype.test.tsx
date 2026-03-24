import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SearchOverlay from '../components/Navigation/SearchOverlay'

vi.mock('../components/Effects/PageTransition', () => ({
  setNextTransition: vi.fn(),
}))

describe('SearchOverlay', () => {
  afterEach(() => {
    document.body.style.overflow = ''
  })

  it('portals into document.body and locks page scroll while mounted', () => {
    const { container, unmount } = render(
      <MemoryRouter>
        <SearchOverlay state="open" onExited={vi.fn()} onRequestClose={vi.fn()} />
      </MemoryRouter>,
    )

    expect(container.querySelector('[data-testid="prototype-search-overlay"]')).not.toBeInTheDocument()
    expect(document.body.querySelector('[data-testid="prototype-search-overlay"]')).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')

    unmount()

    expect(document.body.querySelector('[data-testid="prototype-search-overlay"]')).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe('')
  })

  it('routes backdrop clicks and escape presses through the unified close handler', () => {
    const onRequestClose = vi.fn()

    render(
      <MemoryRouter>
        <SearchOverlay state="open" onExited={vi.fn()} onRequestClose={onRequestClose} />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByTestId('prototype-search-overlay-backdrop'))
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(onRequestClose).toHaveBeenCalledTimes(2)
  })
})
