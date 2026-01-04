import { useState, useEffect, useRef, memo, useCallback } from 'react'
import {
  generateSrcSet,
  generateLQIP,
  getOptimalFormat,
} from '../../utils/imageOptimization'
import { imageCache } from '../../utils/imageCache'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  aspectRatio?: number
  className?: string
  onLoad?: () => void
  onError?: (error: Error) => void
  priority?: boolean
}

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  width,
  height,
  aspectRatio = 1,
  className = '',
  onLoad,
  onError,
  priority = false,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const computedAspectRatio = height && width ? width / height : aspectRatio

  const loadImage = useCallback(async (url: string) => {
    try {
      const cached = await imageCache.get(url)
      if (cached) {
        const blobUrl = URL.createObjectURL(cached)
        setImageSrc(blobUrl)
        setIsLoaded(true)
        onLoad?.()
        return
      }
    } catch (e) {
      console.warn('Cache lookup failed:', e)
    }

    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    loadTimeoutRef.current = setTimeout(() => {
      setError(new Error('Image load timeout'))
      onError?.(new Error('Image took too long to load'))
    }, 3000)

    const img = new Image()

    img.onload = async () => {
      clearTimeout(loadTimeoutRef.current!)
      setIsLoaded(true)
      setError(null)

      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          canvas.toBlob(blob => {
            if (blob) {
              imageCache.set(url, blob)
            }
          })
        }
      } catch (e) {
        console.warn('Failed to cache image:', e)
      }

      setImageSrc(url)
      onLoad?.()
    }

    img.onerror = () => {
      clearTimeout(loadTimeoutRef.current!)
      const error = new Error(`Failed to load image: ${url}`)
      setError(error)
      setImageSrc(null)
      onError?.(error)
    }

    img.src = getOptimalFormat(url)
  }, [onLoad, onError])

  useEffect(() => {
    if (!imgRef.current) return

    if (priority) {
      loadImage(src)
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadImage(src)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: '100px 0px',
        threshold: 0.01,
      }
    )

    observer.observe(imgRef.current)
    observerRef.current = observer

    return () => {
      observer.disconnect()
      observerRef.current = null
    }
  }, [src, priority, loadImage])

  useEffect(() => {
    return () => {
      clearTimeout(loadTimeoutRef.current!)
      abortControllerRef.current?.abort()
      observerRef.current?.disconnect()
    }
  }, [])

  return (
    <div
      className={`relative overflow-hidden bg-gray-900 ${className}`}
      style={{
        aspectRatio: computedAspectRatio.toString(),
      }}
    >
      {!isLoaded && !error && (
        <img
          src={generateLQIP()}
          alt=""
          className="w-full h-full object-cover blur-xl opacity-50"
          aria-hidden="true"
        />
      )}

      {!error && (
        <img
          ref={imgRef}
          src={imageSrc || generateLQIP()}
          alt={alt}
          data-src={src}
          srcSet={isLoaded ? generateSrcSet(src) : undefined}
          sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, (max-width: 1536px) 1200px, 1600px"
          className={`w-full h-full object-cover transition-all duration-300 ${
            isLoaded ? 'opacity-100 blur-none' : 'opacity-0 blur-lg'
          }`}
          loading="lazy"
          decoding="async"
          onContextMenu={e => e.preventDefault()}
        />
      )}

      {error && (
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="text-gray-500 text-sm">Failed to load image</div>
            <button
              onClick={() => loadImage(src)}
              className="text-xs text-cyan-400 hover:text-cyan-300 mt-2"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
})
