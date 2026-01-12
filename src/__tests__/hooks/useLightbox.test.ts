import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useLightbox } from '../../hooks/useLightbox'
import { mockGalleryItems } from '../mocks'

// Mock Image class to avoid issues in test environment
(globalThis as any).Image = class {
  onload: () => void = () => {}
  onerror: () => void = () => {}
  _src: string = ''
  set src(value: string) {
    this._src = value
    setTimeout(() => this.onload(), 0)
  }
  get src() {
    return this._src
  }
} as unknown as { new(): HTMLImageElement }

describe('useLightbox', () => {
  it('should open and close lightbox', () => {
    const { result } = renderHook(() => useLightbox(mockGalleryItems))

    expect(result.current.isOpen).toBe(false)

    act(() => {
      result.current.open(0)
    })
    expect(result.current.isOpen).toBe(true)
    expect(result.current.currentIndex).toBe(0)

    act(() => {
      result.current.close()
    })
    expect(result.current.isOpen).toBe(false)
  })

  it('should navigate between items', () => {
    const { result } = renderHook(() => useLightbox(mockGalleryItems))

    act(() => {
      result.current.open(0)
    })
    expect(result.current.currentIndex).toBe(0)

    act(() => {
      result.current.next()
    })
    // Note: useLightbox has a 300ms lock, but in tests we might need to wait or mock timers
    expect(result.current.currentIndex).toBe(1)

    act(() => {
      result.current.previous()
    })
    expect(result.current.currentIndex).toBe(0)
  })

  it('should not navigate past boundaries', () => {
    const { result } = renderHook(() => useLightbox(mockGalleryItems))

    act(() => {
      result.current.open(0)
    })
    act(() => {
      result.current.previous()
    })
    expect(result.current.currentIndex).toBe(0)

    act(() => {
      result.current.open(mockGalleryItems.length - 1)
    })
    act(() => {
      result.current.next()
    })
    expect(result.current.currentIndex).toBe(mockGalleryItems.length - 1)
  })

  it('should manage zoom state', () => {
    const { result } = renderHook(() => useLightbox(mockGalleryItems))

    act(() => {
      result.current.setZoom({ scale: 2, offsetX: 0, offsetY: 0 })
    })
    expect(result.current.zoom.scale).toBe(2)

    act(() => {
      result.current.resetZoom()
    })
    expect(result.current.zoom.scale).toBe(1)
  })
})
