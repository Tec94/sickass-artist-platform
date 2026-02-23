import { describe, expect, it, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import {
  DASHBOARD_SECTION_COLLAPSE_STORAGE_KEY,
  parseDashboardSectionCollapseState,
  useDashboardSectionCollapseState,
} from '../components/Dashboard/useDashboardSectionCollapseState'

const CollapseStateProbe = () => {
  const { collapseState, toggleSectionExpanded } = useDashboardSectionCollapseState()

  return (
    <div>
      <button
        type="button"
        onClick={() => toggleSectionExpanded('overview')}
        aria-expanded={collapseState.overview}
      >
        Toggle overview
      </button>
      <span data-testid="overview-state">{collapseState.overview ? 'expanded' : 'collapsed'}</span>
      <span data-testid="feature-state">{collapseState.featureCards ? 'expanded' : 'collapsed'}</span>
    </div>
  )
}

describe('dashboard section collapse state', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('defaults all tracked sections to expanded', () => {
    render(<CollapseStateProbe />)

    expect(screen.getByTestId('overview-state')).toHaveTextContent('expanded')
    expect(screen.getByTestId('feature-state')).toHaveTextContent('expanded')
    expect(screen.getByRole('button', { name: 'Toggle overview' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('toggles and persists section state to localStorage', () => {
    render(<CollapseStateProbe />)

    fireEvent.click(screen.getByRole('button', { name: 'Toggle overview' }))

    expect(screen.getByTestId('overview-state')).toHaveTextContent('collapsed')
    expect(screen.getByRole('button', { name: 'Toggle overview' })).toHaveAttribute('aria-expanded', 'false')

    const persisted = window.localStorage.getItem(DASHBOARD_SECTION_COLLAPSE_STORAGE_KEY)
    expect(persisted).not.toBeNull()
    expect(parseDashboardSectionCollapseState(persisted)).toMatchObject({ overview: false })
  })

  it('falls back safely when localStorage contains invalid JSON', () => {
    window.localStorage.setItem(DASHBOARD_SECTION_COLLAPSE_STORAGE_KEY, '{bad json')

    render(<CollapseStateProbe />)

    expect(screen.getByTestId('overview-state')).toHaveTextContent('expanded')
    expect(screen.getByTestId('feature-state')).toHaveTextContent('expanded')
  })
})

