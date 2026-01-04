import { useEffect, useRef } from 'react'

interface UseImagePreloadOptions {
  urls: string[]
  onPreloadComplete?: () => void
}

export const useImagePreload = ({ urls, onPreloadComplete }: UseImagePreloadOptions) => {
  const preloadedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false

    const preloadImages = async () => {
      for (const url of urls) {
        if (cancelled || preloadedRef.current.has(url)) continue

        try {
          const img = new Image()
          img.src = url

          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
            // Timeout after 5s
            setTimeout(() => reject(new Error('Preload timeout')), 5000)
          })

          preloadedRef.current.add(url)
        } catch (error) {
          console.warn(`Failed to preload ${url}`, error)
        }
      }

      if (!cancelled && onPreloadComplete) {
        onPreloadComplete()
      }
    }

    preloadImages()

    return () => {
      cancelled = true
    }
  }, [urls, onPreloadComplete])

  return preloadedRef.current
}
