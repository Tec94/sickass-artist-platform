import { useMemo, useRef, useState } from 'react'
import AppScaffold from './AppScaffold'
import { usePhoneOverlay } from '../../PhoneOverlayProvider'

export default function GalleryApp() {
  const { content, locale } = usePhoneOverlay()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const touchStartXRef = useRef<number | null>(null)
  const photos = useMemo(() => content.photos.filter((photo) => Boolean(photo.thumbnailUrl)).slice(0, 24), [content.photos])

  const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] : null

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null
  }

  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchStartXRef.current === null || selectedIndex === null) return
    const delta = (event.changedTouches[0]?.clientX ?? touchStartXRef.current) - touchStartXRef.current
    if (Math.abs(delta) > 48) {
      if (delta < 0 && selectedIndex < photos.length - 1) setSelectedIndex(selectedIndex + 1)
      if (delta > 0 && selectedIndex > 0) setSelectedIndex(selectedIndex - 1)
    }
    touchStartXRef.current = null
  }

  return (
    <AppScaffold title={locale === 'es' ? 'Galeria' : 'Gallery'} subtitle={`${photos.length} ${locale === 'es' ? 'fotos' : 'photos'}`}>
      {selectedPhoto ? (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <img
              src={selectedPhoto.fullUrl || selectedPhoto.thumbnailUrl}
              alt={selectedPhoto.caption || 'ROA photo'}
              className="h-[320px] w-full object-cover"
              onError={(event) => {
                ;(event.currentTarget as HTMLImageElement).src = '/images/roa profile.jpg'
              }}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <p className="text-[11px] text-white/90">{selectedPhoto.caption || (locale === 'es' ? 'Foto destacada de ROA' : 'Featured ROA photo')}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" className="rounded-xl border border-white/10 bg-white/5 py-2 text-xs text-white" onClick={() => setSelectedIndex(Math.max(0, (selectedIndex || 0) - 1))}>
              {locale === 'es' ? 'Anterior' : 'Prev'}
            </button>
            <button type="button" className="rounded-xl border border-white/10 bg-white/5 py-2 text-xs text-white" onClick={() => setSelectedIndex(null)}>
              Grid
            </button>
            <button type="button" className="rounded-xl border border-white/10 bg-white/5 py-2 text-xs text-white" onClick={() => setSelectedIndex(Math.min(photos.length - 1, (selectedIndex || 0) + 1))}>
              {locale === 'es' ? 'Siguiente' : 'Next'}
            </button>
          </div>
          {selectedPhoto.sourceUrl ? (
            <a href={selectedPhoto.sourceUrl} target="_blank" rel="noreferrer" className="block rounded-xl border border-sky-900/60 bg-sky-950/20 px-3 py-2 text-center text-xs text-sky-100">
              {locale === 'es' ? 'Abrir en Instagram' : 'Open on Instagram'}
            </a>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 pb-2">
          {photos.map((photo, index) => (
            <button key={photo.id} type="button" className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-black/30" onClick={() => setSelectedIndex(index)}>
              <img
                src={photo.thumbnailUrl}
                alt={photo.caption || `ROA ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                onError={(event) => {
                  ;(event.currentTarget as HTMLImageElement).src = '/images/roa profile.jpg'
                }}
              />
            </button>
          ))}
        </div>
      )}
    </AppScaffold>
  )
}

