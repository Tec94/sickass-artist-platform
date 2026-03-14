import type { GalleryViewPreferences } from '../types/gallery'

export type GalleryTab = GalleryViewPreferences['activeTab']
export type GalleryLayoutMode = GalleryViewPreferences['layoutMode'] | 'masonry'

export const toggleGalleryLayoutMode = (current: GalleryLayoutMode): GalleryLayoutMode =>
  current === 'feed' ? 'grid' : current === 'grid' ? 'masonry' : 'feed'

export const toPersistedGalleryLayoutMode = (
  layoutMode: GalleryLayoutMode,
): GalleryViewPreferences['layoutMode'] => (layoutMode === 'masonry' ? 'grid' : layoutMode)

export const hydrateGalleryPreferences = (
  fallback: Pick<GalleryViewPreferences, 'activeTab' | 'layoutMode'>,
  preference: GalleryViewPreferences | null | undefined,
): Pick<GalleryViewPreferences, 'activeTab' | 'layoutMode'> => {
  if (!preference) return fallback
  return {
    activeTab: preference.activeTab,
    layoutMode: preference.layoutMode,
  }
}

export const openGalleryLightbox = (index: number, itemCount: number): number | null => {
  if (itemCount <= 0) return null
  const bounded = Math.max(0, Math.min(Math.trunc(index), itemCount - 1))
  return bounded
}

export const closeGalleryLightbox = (): null => null

export const navigateGalleryLightbox = (
  currentIndex: number | null,
  key: string,
  itemCount: number,
): number | null => {
  if (key === 'Escape') return null
  if (currentIndex === null || itemCount <= 0) return currentIndex

  if (key === 'ArrowRight') {
    return (currentIndex + 1) % itemCount
  }

  if (key === 'ArrowLeft') {
    return (currentIndex - 1 + itemCount) % itemCount
  }

  return currentIndex
}
