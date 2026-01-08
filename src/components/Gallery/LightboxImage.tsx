import { useState, useEffect, useRef } from 'react'

import { constrainPan } from '../../hooks/useLightbox'

interface LightboxImageProps {
  src: string
  alt: string
  zoom: number
  offsetX: number
  offsetY: number
  onLoad: (loadTime: number) => void
  onError: (error: string) => void
  thumbnailSrc?: string
  onPan?: (x: number, y: number) => void
}

export const LightboxImage = ({
  src,
  alt,
  zoom,
  offsetX,
  offsetY,
  onLoad,
  onError,
  thumbnailSrc,
  onPan,
}: LightboxImageProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const startTimeRef = useRef(performance.now())
  const imgRef = useRef<HTMLImageElement>(null)
  const isDragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    let isMounted = true
    const img = new Image()
    startTimeRef.current = performance.now()
    
    const timeout = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false)
        setLoadError('Image took too long to load')
        onError('Timeout after 3s')
      }
    }, 3000)

    img.onload = () => {
      clearTimeout(timeout)
      if (isMounted) {
        setIsLoading(false)
        setLoadError(null)
        onLoad(performance.now() - startTimeRef.current)
      }
    }

    img.onerror = () => {
      clearTimeout(timeout)
      if (isMounted) {
        setIsLoading(false)
        setLoadError('Failed to load image')
        onError('Image failed to load')
      }
    }

    img.src = src

    return () => {
      isMounted = false
      clearTimeout(timeout)
    }
  }, [src, onLoad, onError, retryCount])

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1)
      setLoadError(null)
      setIsLoading(true)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      isDragging.current = true
      lastPos.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current && onPan && imgRef.current) {
      const dx = (e.clientX - lastPos.current.x) / zoom
      const dy = (e.clientY - lastPos.current.y) / zoom
      
      const rect = imgRef.current.getBoundingClientRect()
      const { x, y } = constrainPan(
        offsetX + dx,
        offsetY + dy,
        zoom,
        rect.width / zoom,
        rect.height / zoom
      )
      
      onPan(x, y)
      lastPos.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  return (
    <div 
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Fallback blur thumbnail */}
      {isLoading && thumbnailSrc && (
        <img
          src={thumbnailSrc}
          alt={alt}
          className="absolute inset-0 w-full h-full object-contain blur-lg opacity-50"
        />
      )}

      {/* Main image */}
      {!loadError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`max-w-full max-h-full object-contain transition-transform duration-200 select-none ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            transform: `scale(${zoom}) translate(${offsetX}px, ${offsetY}px)`,
          }}
          onContextMenu={e => e.preventDefault()}
          draggable={false}
        />
      )}

      {/* Error state */}
      {loadError && (
        <div className="flex flex-col items-center gap-4 text-center">
          <iconify-icon icon="solar:danger-circle-linear" width="48" height="48" style={{ color: '#ef4444' }}></iconify-icon>
          <p className="text-white text-sm max-w-xs">{loadError}</p>
          {retryCount < 3 && (
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded"
            >
              <iconify-icon icon="solar:refresh-linear" width="16" height="16"></iconify-icon>
              Retry
            </button>
          )}
          {retryCount >= 3 && (
            <p className="text-xs text-gray-400">Max retries reached</p>
          )}
        </div>
      )}

      {/* Loading spinner */}
      {isLoading && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
