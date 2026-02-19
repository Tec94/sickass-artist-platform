import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { CinematicHero } from '../components/Dashboard/CinematicHero'
import { dashboardHeroAssets } from '../components/Dashboard/HeroAssetManifest'

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion')
  return {
    ...actual,
    useScroll: () => ({ scrollYProgress: actual.motionValue(0) }),
    useReducedMotion: () => false,
  }
})

const originalInnerWidth = window.innerWidth

describe('dashboard hero mobile safeguard', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: 390, configurable: true, writable: true })
    Object.defineProperty(navigator, 'connection', {
      value: { saveData: true, effectiveType: '2g' },
      configurable: true,
    })
    Object.defineProperty(navigator, 'deviceMemory', { value: 2, configurable: true })
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 2, configurable: true })
  })

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, configurable: true, writable: true })
  })

  it('enables safeguard mode on constrained mobile conditions', () => {
    render(
      <MemoryRouter>
        <CinematicHero assets={dashboardHeroAssets} />
      </MemoryRouter>,
    )

    const hero = screen.getByLabelText('Cinematic dashboard hero')
    expect(hero).toHaveAttribute('data-mobile-safeguard', 'true')
  })
})
