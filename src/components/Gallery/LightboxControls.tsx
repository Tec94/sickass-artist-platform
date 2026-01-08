import { memo } from 'react'

interface LightboxControlsProps {
  currentIndex: number
  total: number
  zoom: number
  canNext: boolean
  canPrev: boolean
  onNext: () => void
  onPrev: () => void
  onClose: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
}

export const LightboxControls = memo(({
  currentIndex,
  total,
  zoom,
  canNext,
  canPrev,
  onNext,
  onPrev,
  onClose,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: LightboxControlsProps) => {
  return (
    <>
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition"
        aria-label="Close"
      >
        <iconify-icon icon="solar:close-circle-linear" width="24" height="24"></iconify-icon>
      </button>

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium z-40">
        {currentIndex + 1} / {total}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={onPrev}
        disabled={!canPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 bg-black/50 hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-full transition"
        aria-label="Previous"
      >
        <iconify-icon icon="solar:alt-arrow-left-linear" width="24" height="24"></iconify-icon>
      </button>

      <button
        onClick={onNext}
        disabled={!canNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 bg-black/50 hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-full transition"
        aria-label="Next"
      >
        <iconify-icon icon="solar:alt-arrow-right-linear" width="24" height="24"></iconify-icon>
      </button>

      {/* Zoom controls (desktop only) */}
      <div className="absolute bottom-4 right-4 hidden sm:flex gap-2 z-40">
        <button
          onClick={onZoomOut}
          disabled={zoom <= 1}
          className="p-2 bg-black/50 hover:bg-black/70 disabled:opacity-30 text-white rounded transition"
          title="Zoom out (- key)"
        >
          <iconify-icon icon="solar:magnifer-zoom-out-linear" width="20" height="20"></iconify-icon>
        </button>
        <span className="px-2 py-2 bg-black/50 text-white text-xs font-medium rounded flex items-center">
          {zoom.toFixed(1)}x
        </span>
        <button
          onClick={onZoomIn}
          disabled={zoom >= 3}
          className="p-2 bg-black/50 hover:bg-black/70 disabled:opacity-30 text-white rounded transition"
          title="Zoom in (+ key)"
        >
          <iconify-icon icon="solar:magnifer-zoom-in-linear" width="20" height="20"></iconify-icon>
        </button>
        <button
          onClick={onResetZoom}
          disabled={zoom === 1}
          className="p-2 bg-black/50 hover:bg-black/70 disabled:opacity-30 text-white rounded transition text-xs font-medium"
          title="Reset zoom"
        >
          Reset
        </button>
      </div>
    </>
  )
})
