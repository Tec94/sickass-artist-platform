import { describe, expect, it } from 'vitest'
import {
  closeGalleryLightbox,
  hydrateGalleryPreferences,
  navigateGalleryLightbox,
  openGalleryLightbox,
  toPersistedGalleryLayoutMode,
  toggleGalleryLayoutMode,
} from '../pages/galleryState'

describe('gallery redesign state behavior', () => {
  it('hydrates saved preferences and toggles between feed/grid modes', () => {
    const hydrated = hydrateGalleryPreferences(
      { activeTab: 'artist', layoutMode: 'feed' },
      { activeTab: 'community', layoutMode: 'grid' },
    )

    expect(hydrated).toEqual({ activeTab: 'community', layoutMode: 'grid' })
    expect(toggleGalleryLayoutMode('feed')).toBe('grid')
    expect(toggleGalleryLayoutMode('grid')).toBe('masonry')
    expect(toggleGalleryLayoutMode('masonry')).toBe('feed')
    expect(toPersistedGalleryLayoutMode('masonry')).toBe('grid')
  })

  it('supports lightbox open/close and keyboard navigation', () => {
    const opened = openGalleryLightbox(1, 3)
    expect(opened).toBe(1)

    expect(navigateGalleryLightbox(opened, 'ArrowRight', 3)).toBe(2)
    expect(navigateGalleryLightbox(2, 'ArrowRight', 3)).toBe(0)
    expect(navigateGalleryLightbox(0, 'ArrowLeft', 3)).toBe(2)
    expect(navigateGalleryLightbox(2, 'Escape', 3)).toBeNull()
    expect(closeGalleryLightbox()).toBeNull()
  })
})
