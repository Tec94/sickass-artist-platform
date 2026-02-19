import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { CinematicHero } from '../components/Dashboard/CinematicHero'
import { dashboardHeroAssets } from '../components/Dashboard/HeroAssetManifest'

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion')
  return {
    ...actual,
    useReducedMotion: () => true,
    useScroll: () => ({ scrollYProgress: actual.motionValue(0) }),
  }
})

describe('dashboard reduced motion', () => {
  it('uses reduced-motion hero mode and static copy branch with signed-out CTA', () => {
    render(
      <MemoryRouter>
        <CinematicHero assets={dashboardHeroAssets} signalText="Static signal" />
      </MemoryRouter>,
    )

    const hero = screen.getByLabelText('Cinematic dashboard hero')
    expect(hero).toHaveAttribute('data-reduced-motion', 'true')
    expect(screen.getByText('Enter The Moonlit Vault')).toBeInTheDocument()
    const cta = screen.getByRole('link', { name: 'Sign In to Enter Chatroom' })
    expect(cta).toHaveAttribute('href', '/sign-in?returnTo=%2Fchat')
    expect(screen.queryByText('Act I')).not.toBeInTheDocument()
  })
})
