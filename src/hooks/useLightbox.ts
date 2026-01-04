import { useState, useEffect, useCallback, useRef, type Dispatch, type SetStateAction } from 'react'
import type { GalleryContentItem } from '../types/gallery'

export interface ImageLoadState {
  status: 'loading' | 'loaded' | 'error' | 'timeout'
  error?: string
  loadTime?: number
}

export interface UseLightboxReturn {
  isOpen: boolean
  currentIndex: number
  currentItem: GalleryContentItem | null
  zoom: { scale: number; offsetX: number; offsetY: number }
  imageLoadState: ImageLoadState
  
  open: (index: number) => void
  close: () => void
  next: () => void
  previous: () => void
  goToIndex: (index: number) => void
  
  setZoom: Dispatch<SetStateAction<{ scale: number; offsetX: number; offsetY: number }>>
  resetZoom: () => void
  
  canNext: boolean
  canPrev: boolean
}

export const constrainPan = (x: number, y: number, scale: number, width: number, height: number) => {
  const maxX = (width * (scale - 1)) / 2
  const maxY = (height * (scale - 1)) / 2
  return {
    x: Math.max(-maxX, Math.min(maxX, x)),
    y: Math.max(-maxY, Math.min(maxY, y)),
  }
}

interface PreloadCache {
  urls: Map<string, HTMLImageElement>
  abortControllers: Map<string, AbortController>
}

const preloadCache: PreloadCache = {
  urls: new Map(),
  abortControllers: new Map(),
}

const preloadAdjacentImages = (index: number, items: GalleryContentItem[]) => {
  // Load next 2 images for smooth navigation
  const indicesToPreload = [index + 1, index + 2].filter(i => i < items.length)
  
  indicesToPreload.forEach(i => {
    const url = items[i].imageUrl
    if (!preloadCache.urls.has(url)) {
      const controller = new AbortController()
      const img = new Image()
      img.src = url
      preloadCache.urls.set(url, img)
      preloadCache.abortControllers.set(url, controller)
      
      // Cleanup after timeout (10s)
      setTimeout(() => {
        controller.abort()
        preloadCache.urls.delete(url)
        preloadCache.abortControllers.delete(url)
      }, 10000)
    }
  })
}

const loadImageWithTimeout = async (url: string, timeoutMs = 3000): Promise<ImageLoadState> => {
  return new Promise((resolve) => {
    const img = new Image()
    const startTime = performance.now()
    
    const timeout = setTimeout(() => {
      resolve({
        status: 'timeout',
        error: 'Image took too long to load',
      })
    }, timeoutMs)
    
    img.onload = () => {
      clearTimeout(timeout)
      resolve({
        status: 'loaded',
        loadTime: performance.now() - startTime,
      })
    }
    
    img.onerror = () => {
      clearTimeout(timeout)
      resolve({
        status: 'error',
        error: `Failed to load image: ${url}`,
      })
    }
    
    img.src = url
  })
}

export const useLightbox = (items: GalleryContentItem[]): UseLightboxReturn => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [zoom, setZoom] = useState({ scale: 1, offsetX: 0, offsetY: 0 })
  const [imageLoadState, setImageLoadState] = useState<ImageLoadState>({ status: 'loading' })
  
  const lockRef = useRef(false)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [isOpen])

  // Preload adjacent images
  useEffect(() => {
    if (isOpen && items.length > 0) {
      preloadAdjacentImages(currentIndex, items)
    }
  }, [isOpen, currentIndex, items])

  // Load current image with timeout
  useEffect(() => {
    if (!isOpen || !items[currentIndex]) return
    
    setImageLoadState({ status: 'loading' })
    const currentItem = items[currentIndex]
    
    loadImageWithTimeout(currentItem.imageUrl, 3000).then(state => {
      setImageLoadState(state)
    })
  }, [isOpen, currentIndex, items])

  const resetZoom = useCallback(() => {
    setZoom({ scale: 1, offsetX: 0, offsetY: 0 })
  }, [])

  const next = useCallback(() => {
    if (lockRef.current || currentIndex >= items.length - 1) return
    lockRef.current = true
    setCurrentIndex(prev => prev + 1)
    resetZoom()
    setTimeout(() => { lockRef.current = false }, 300)
  }, [currentIndex, items.length, resetZoom])

  const previous = useCallback(() => {
    if (lockRef.current || currentIndex <= 0) return
    lockRef.current = true
    setCurrentIndex(prev => prev - 1)
    resetZoom()
    setTimeout(() => { lockRef.current = false }, 300)
  }, [currentIndex, resetZoom])

  const close = useCallback(() => {
    setIsOpen(false)
    resetZoom()
  }, [resetZoom])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || lockRef.current) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with other modal shortcuts
      if (e.ctrlKey || e.metaKey || e.altKey) return
      
      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          close()
          break
        case 'ArrowRight':
        case ' ':
          e.preventDefault()
          next()
          break
        case 'ArrowLeft':
          e.preventDefault()
          previous()
          break
        case '+':
        case '=':
          e.preventDefault()
          setZoom(prev => ({
            ...prev,
            scale: Math.min(3, prev.scale + 0.5),
          }))
          break
        case '-':
          e.preventDefault()
          setZoom(prev => ({
            ...prev,
            scale: Math.max(1, prev.scale - 0.5),
          }))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, items.length, next, previous, close])

  const open = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, items.length - 1)))
    setIsOpen(true)
  }, [items.length])

  const goToIndex = useCallback((index: number) => {
    if (index < 0 || index >= items.length) return
    setCurrentIndex(index)
    resetZoom()
  }, [items.length, resetZoom])

  return {
    isOpen,
    currentIndex,
    currentItem: items[currentIndex] || null,
    zoom,
    imageLoadState,
    open,
    close,
    next,
    previous,
    goToIndex,
    setZoom,
    resetZoom,
    canNext: currentIndex < items.length - 1,
    canPrev: currentIndex > 0,
  }
}
