import { useMemo, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import {
  DashboardMediaHighlights,
  type DashboardMediaHighlightItem,
  type MediaHighlightsTab,
} from '../components/Dashboard/DashboardMediaHighlights'

vi.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

const trendingItems: DashboardMediaHighlightItem[] = [
  {
    key: 't-1',
    tab: 'trendingGallery',
    title: 'Trending One',
    image: null,
    badge: 'GALLERY',
    caption: '100 likes',
    href: '/gallery',
    ctaLabel: 'Open Gallery',
    stats: [{ label: 'Views', value: '1K' }],
  },
  {
    key: 't-2',
    tab: 'trendingGallery',
    title: 'Trending Two',
    image: null,
    badge: 'GALLERY',
    caption: '200 likes',
    href: '/gallery',
    ctaLabel: 'Open Gallery',
  },
]

const momentItems: DashboardMediaHighlightItem[] = [
  {
    key: 'm-1',
    tab: 'artistMoments',
    title: 'Moment One',
    image: null,
    badge: 'BTS',
    caption: '02/23/2026',
    href: '/gallery?type=bts',
    ctaLabel: 'Open Moments',
  },
]

function MediaHighlightsHarness() {
  const [activeTab, setActiveTab] = useState<MediaHighlightsTab>('trendingGallery')
  const [selectedItemKey, setSelectedItemKey] = useState<string | null>('t-1')
  const itemsByTab = useMemo(
    () => ({
      trendingGallery: trendingItems,
      artistMoments: momentItems,
    }),
    [],
  )

  return (
    <DashboardMediaHighlights
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab)
        setSelectedItemKey(tab === 'trendingGallery' ? 't-1' : 'm-1')
      }}
      selectedItemKey={selectedItemKey}
      onSelectItem={setSelectedItemKey}
      itemsByTab={itemsByTab}
    />
  )
}

describe('dashboard media highlights', () => {
  it('switches tabs and updates focus panel selection', () => {
    const { container, getByRole, getByText } = render(
      <MemoryRouter>
        <MediaHighlightsHarness />
      </MemoryRouter>,
    )

    const focusTitle = () => container.querySelector('.dashboard-media-highlights__focus-title')?.textContent
    expect(focusTitle()).toBe('Trending One')

    fireEvent.click(getByText('Trending Two'))
    expect(focusTitle()).toBe('Trending Two')

    fireEvent.click(getByRole('tab', { name: 'dashboard.mediaHighlights.tabArtistMoments' }))
    expect(focusTitle()).toBe('Moment One')
    expect(getByRole('link', { name: /Open Moments/i })).toHaveAttribute('href', '/gallery?type=bts')
  })
})

