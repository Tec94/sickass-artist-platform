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
    useScroll: () => ({ scrollYProgress: actual.motionValue(0) }),
    useReducedMotion: () => true,
  }
})

describe('dashboard hero auth CTA', () => {
  it('routes signed-out users to sign in with a safe return path', () => {
    render(
      <MemoryRouter>
        <CinematicHero assets={dashboardHeroAssets} isSignedIn={false} />
      </MemoryRouter>,
    )

    const cta = screen.getByRole('link', { name: 'Sign In to Enter Chatroom' })
    expect(cta).toHaveAttribute('href', '/sign-in?returnTo=%2Fchat')
  })

  it('routes signed-in users directly to chat', () => {
    render(
      <MemoryRouter>
        <CinematicHero assets={dashboardHeroAssets} isSignedIn />
      </MemoryRouter>,
    )

    const cta = screen.getByRole('link', { name: 'Open Chatroom' })
    expect(cta).toHaveAttribute('href', '/chat')
  })
})
