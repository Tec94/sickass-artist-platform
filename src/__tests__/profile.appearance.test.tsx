import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  APP_APPEARANCE_STORAGE_KEY,
  AppAppearanceProvider,
  useAppAppearance,
} from '../contexts/AppAppearanceContext'
import Profile from '../pages/StitchPrototypes/Profile'

function AppearanceProbe() {
  const { appearance } = useAppAppearance()

  return <div data-testid="appearance-probe" data-appearance={appearance} />
}

function renderProfile() {
  return render(
    <AppAppearanceProvider>
      <MemoryRouter initialEntries={['/profile']}>
        <AppearanceProbe />
        <Profile />
      </MemoryRouter>
    </AppAppearanceProvider>,
  )
}

describe('Profile appearance settings', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.removeAttribute('data-appearance')
    document.body.removeAttribute('data-appearance')
  })

  afterEach(() => {
    document.documentElement.removeAttribute('data-appearance')
    document.body.removeAttribute('data-appearance')
  })

  it('keeps dark mode applied until light mode is explicitly saved', async () => {
    window.localStorage.setItem(APP_APPEARANCE_STORAGE_KEY, 'dark')

    renderProfile()

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute('data-appearance', 'dark')
    })

    fireEvent.click(screen.getByRole('button', { name: /settings/i }))

    const darkModeButton = screen.getByRole('button', { name: /dark mode/i })
    const lightModeButton = screen.getByRole('button', { name: /light mode/i })

    expect(darkModeButton).toHaveAttribute('data-active', 'true')
    expect(lightModeButton).toHaveAttribute('data-active', 'false')

    fireEvent.click(lightModeButton)

    expect(lightModeButton).toHaveAttribute('data-active', 'true')
    expect(darkModeButton).toHaveAttribute('data-active', 'false')
    expect(screen.getByTestId('appearance-probe')).toHaveAttribute('data-appearance', 'dark')
    expect(document.documentElement).toHaveAttribute('data-appearance', 'dark')
    expect(window.localStorage.getItem(APP_APPEARANCE_STORAGE_KEY)).toBe('dark')

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(screen.getByTestId('appearance-probe')).toHaveAttribute('data-appearance', 'light')
    })

    expect(document.documentElement).toHaveAttribute('data-appearance', 'light')
    expect(window.localStorage.getItem(APP_APPEARANCE_STORAGE_KEY)).toBe('light')
  })

  it('persists dark mode after saving it from the profile settings', async () => {
    window.localStorage.setItem(APP_APPEARANCE_STORAGE_KEY, 'light')

    renderProfile()

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute('data-appearance', 'light')
    })

    fireEvent.click(screen.getByRole('button', { name: /settings/i }))
    fireEvent.click(screen.getByRole('button', { name: /dark mode/i }))
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(screen.getByTestId('appearance-probe')).toHaveAttribute('data-appearance', 'dark')
    })

    expect(document.documentElement).toHaveAttribute('data-appearance', 'dark')
    expect(window.localStorage.getItem(APP_APPEARANCE_STORAGE_KEY)).toBe('dark')
  })
})
