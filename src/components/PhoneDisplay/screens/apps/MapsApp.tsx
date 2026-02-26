import { useMemo, useRef, useState } from 'react'
import AppScaffold from './AppScaffold'
import { usePhoneOverlay } from '../../PhoneOverlayProvider'

type Marker = {
  id: string
  x: number
  y: number
  title: string
  subtitle: string
}

export default function MapsApp() {
  const { locale, setSheet } = usePhoneOverlay()
  const [zoom, setZoom] = useState(1)
  const [style, setStyle] = useState<'light' | 'dark'>('light')
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)

  const markers = useMemo<Marker[]>(
    () => [
      { id: 'pr', x: 52, y: 36, title: 'Puerto Rico', subtitle: locale === 'es' ? 'Base creativa' : 'Creative base' },
      { id: 'event', x: 70, y: 55, title: locale === 'es' ? 'Venue / Evento' : 'Venue / Event', subtitle: locale === 'es' ? 'Stage call' : 'Stage call' },
      { id: 'merch', x: 30, y: 62, title: locale === 'es' ? 'Merch pickup' : 'Merch pickup', subtitle: locale === 'es' ? 'Drop logistics' : 'Drop logistics' },
    ],
    [locale],
  )

  const openNearbySheet = () =>
    setSheet({
      id: 'maps-nearby',
      title: locale === 'es' ? 'Cerca de ROA' : 'Nearby ROA',
      subtitle: locale === 'es' ? 'Ubicaciones destacadas' : 'Featured locations',
      body: (
        <div className="space-y-2">
          {markers.map((marker) => (
            <div key={marker.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <div className="text-xs text-white">{marker.title}</div>
              <div className="text-[11px] text-zinc-400">{marker.subtitle}</div>
            </div>
          ))}
        </div>
      ),
      actions: [{ id: 'close', label: locale === 'es' ? 'Cerrar' : 'Close' }],
    })

  return (
    <AppScaffold
      title={locale === 'es' ? 'Mapas' : 'Maps'}
      subtitle={locale === 'es' ? 'Superficie simulada V1' : 'Simulated map surface V1'}
      toolbar={
        <div className="flex items-center gap-1">
          <button type="button" className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white" onClick={() => setStyle(style === 'light' ? 'dark' : 'light')}>
            {style === 'light' ? 'Dark' : 'Light'}
          </button>
          <button type="button" className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white" onClick={openNearbySheet}>
            {locale === 'es' ? 'Lista' : 'List'}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-2">
          <div
            className={`relative h-[320px] overflow-hidden rounded-xl border ${style === 'light' ? 'border-zinc-200/30 bg-[#edf3f5]' : 'border-white/5 bg-[#071018]'}`}
            onPointerDown={(event) => {
              dragRef.current = { startX: event.clientX, startY: event.clientY, originX: offset.x, originY: offset.y }
              ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
            }}
            onPointerMove={(event) => {
              if (!dragRef.current) return
              const nextX = dragRef.current.originX + (event.clientX - dragRef.current.startX)
              const nextY = dragRef.current.originY + (event.clientY - dragRef.current.startY)
              setOffset({ x: Math.max(-80, Math.min(80, nextX)), y: Math.max(-80, Math.min(80, nextY)) })
            }}
            onPointerUp={() => {
              dragRef.current = null
            }}
            onWheel={(event) => {
              event.preventDefault()
              setZoom((current) => Math.max(0.8, Math.min(1.8, Number((current - Math.sign(event.deltaY) * 0.08).toFixed(2)))))
            }}
          >
            <div
              className={`absolute inset-[-20%] phone-map-surface ${style === 'light' ? 'phone-map-surface--light' : 'phone-map-surface--dark'}`}
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
              }}
            >
              {markers.map((marker) => (
                <button
                  key={marker.id}
                  type="button"
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                  onClick={(event) => {
                    event.stopPropagation()
                    setSheet({
                      id: `marker-${marker.id}`,
                      title: marker.title,
                      subtitle: marker.subtitle,
                      actions: [
                        { id: 'nearby', label: locale === 'es' ? 'Ver lista' : 'View list', onSelect: openNearbySheet },
                        { id: 'close', label: locale === 'es' ? 'Cerrar' : 'Close' },
                      ],
                    })
                  }}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${style === 'light' ? 'border-sky-700/40 bg-sky-500/90 text-white' : 'border-sky-300/30 bg-sky-400/80 text-black'}`}>
                    <iconify-icon icon="solar:map-point-bold" width="12" height="12" />
                  </span>
                </button>
              ))}
            </div>
            <div className="absolute bottom-2 right-2 flex flex-col gap-1">
              <button type="button" className="rounded-lg border border-white/10 bg-black/55 px-2 py-1 text-[11px] text-white" onClick={() => setZoom((z) => Math.min(1.8, Number((z + 0.1).toFixed(2))))}>+</button>
              <button type="button" className="rounded-lg border border-white/10 bg-black/55 px-2 py-1 text-[11px] text-white" onClick={() => setZoom((z) => Math.max(0.8, Number((z - 0.1).toFixed(2))))}>-</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button type="button" className="rounded-xl border border-white/10 bg-white/5 py-2 text-xs text-white" onClick={() => setOffset({ x: 0, y: 0 })}>
            {locale === 'es' ? 'Centrar' : 'Center'}
          </button>
          <button type="button" className="rounded-xl border border-white/10 bg-white/5 py-2 text-xs text-white" onClick={() => setZoom(1)}>
            {locale === 'es' ? 'Zoom 1x' : 'Zoom 1x'}
          </button>
          <button type="button" className="rounded-xl border border-white/10 bg-white/5 py-2 text-xs text-white" onClick={openNearbySheet}>
            {locale === 'es' ? 'Nearby' : 'Nearby'}
          </button>
        </div>
      </div>
    </AppScaffold>
  )
}

