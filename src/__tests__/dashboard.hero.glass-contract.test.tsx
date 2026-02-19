import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { CinematicHero } from '../components/Dashboard/CinematicHero'
import { dashboardHeroAssets } from '../components/Dashboard/HeroAssetManifest'

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion')
  return {
    ...actual,
    useScroll: () => ({ scrollYProgress: actual.motionValue(0.56) }),
    useReducedMotion: () => false,
  }
})

describe('dashboard hero glass contract', () => {
  it('uses the shared hero glass surface class for both Act I and Act II cards', () => {
    render(
      <MemoryRouter>
        <CinematicHero assets={dashboardHeroAssets} />
      </MemoryRouter>,
    )

    const act1Card = screen.getByText('Act I').closest('div')
    const act2Card = screen.getByText('Act II').closest('div')

    expect(act1Card).toHaveClass('hero-glass-card')
    expect(act2Card).toHaveClass('hero-glass-card')
    expect(screen.getByText(/Ceremonial drops and relic stories/i)).toHaveClass('hero-glass-card__body')
    expect(screen.getByText(/Events, rankings, and voices aligned/i)).toHaveClass('hero-glass-card__body')
  })
})
