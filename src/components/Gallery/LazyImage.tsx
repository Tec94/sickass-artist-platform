import { useState, useRef, useEffect, useCallback } from 'react'

interface LazyImageProps {
  src: string
  alt: string
  placeholder?: string
  onLoad?: () => void
  className?: string
}

export function LazyImage({
  src,
  alt,
  placeholder,
  onLoad,
  className = '',
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && imgRef.current) {
          imgRef.current.src = src
          observer.unobserve(imgRef.current)
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [src])

  const handleLoad = useCallback(() => {
    setLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setError(true)
  }, [])

  const handleRetry = useCallback(() => {
    setError(false)
    setLoaded(false)
    if (imgRef.current) {
      imgRef.current.src = src
    }
  }, [src])

  if (error) {
    return (
      <div className={`bg-gray-700 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Failed to load image</p>
          <button
            onClick={handleRetry}
            className="text-cyan-500 hover:text-cyan-400 text-xs mt-1 underline"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {placeholder && !loaded && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm"
        />
      )}
      <img
        ref={imgRef}
        alt={alt}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition opacity-0 duration-300 ${
          loaded ? 'opacity-100' : ''
        }`}
      />
    </div>
  )
}