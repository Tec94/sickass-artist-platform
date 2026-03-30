import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  APP_APPEARANCE_STORAGE_KEY,
  AppAppearanceProvider,
  useAppAppearance,
} from '../contexts/AppAppearanceContext'
import Profile from '../pages/StitchPrototypes/Profile'

function RoutedAppearanceShell() {
  const { appearance } = useAppAppearance()

  return (
    <div className="app-theme-root" data-appearance={appearance} data-testid="app-theme-root">
      <nav>
        <Link to="/store">Go to store</Link>
      </nav>
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/store" element={<div>Store page</div>} />
      </Routes>
    </div>
  )
}

describe('App appearance shell', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.removeAttribute('data-appearance')
    document.body.removeAttribute('data-appearance')
  })

  afterEach(() => {
    document.documentElement.removeAttribute('data-appearance')
    document.body.removeAttribute('data-appearance')
  })

  it('hydrates the saved appearance and keeps it through route navigation', async () => {
    window.localStorage.setItem(APP_APPEARANCE_STORAGE_KEY, 'dark')

    render(
      <AppAppearanceProvider>
        <MemoryRouter initialEntries={['/profile']}>
          <RoutedAppearanceShell />
        </MemoryRouter>
      </AppAppearanceProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('app-theme-root')).toHaveAttribute('data-appearance', 'dark')
    })

    expect(document.documentElement).toHaveAttribute('data-appearance', 'dark')

    fireEvent.click(screen.getByRole('link', { name: /go to store/i }))

    expect(await screen.findByText(/store page/i)).toBeInTheDocument()
    expect(screen.getByTestId('app-theme-root')).toHaveAttribute('data-appearance', 'dark')
    expect(document.documentElement).toHaveAttribute('data-appearance', 'dark')
  })
})
