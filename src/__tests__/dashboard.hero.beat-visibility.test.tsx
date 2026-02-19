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
    useScroll: () => ({ scrollYProgress: actual.motionValue(0.22) }),
    useReducedMotion: () => false,
  }
})

describe('dashboard hero beat visibility', () => {
  it('does not render the Moonlit Chatroom beat in motion mode', () => {
    render(
      <MemoryRouter>
        <CinematicHero assets={dashboardHeroAssets} />
      </MemoryRouter>,
    )

    expect(screen.queryByText('Moonlit Chatroom')).not.toBeInTheDocument()
    expect(screen.getByText('Act I')).toBeInTheDocument()
  })
})
