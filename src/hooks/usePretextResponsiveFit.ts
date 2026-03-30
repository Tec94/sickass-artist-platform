import { useEffect, useRef, useState } from 'react'
import { layout, prepare } from '@chenglou/pretext'

interface UsePretextResponsiveFitOptions {
  text: string
  font: string
  lineHeight: number
  maxLines: number
  compactBelow?: number
}

const preparedCache = new Map<string, ReturnType<typeof prepare>>()

const getPrepared = (text: string, font: string) => {
  const cacheKey = `${font}::${text}`
  const cached = preparedCache.get(cacheKey)
  if (cached) return cached
  const prepared = prepare(text, font)
  preparedCache.set(cacheKey, prepared)
  return prepared
}

const canMeasureText = () => {
  if (typeof window === 'undefined') return false
  if (typeof OffscreenCanvas !== 'undefined') return true
  if (typeof document === 'undefined') return false
  const canvas = document.createElement('canvas')
  return typeof canvas.getContext === 'function' && canvas.getContext('2d') !== null
}

export function usePretextResponsiveFit({
  text,
  font,
  lineHeight,
  maxLines,
  compactBelow = 1024,
}: UsePretextResponsiveFitOptions) {
  const containerRef = useRef<HTMLElement | null>(null)
  const [isCompact, setIsCompact] = useState(false)

  useEffect(() => {
    if (!canMeasureText()) return
    const node = containerRef.current
    if (!node) return

    let frame = 0
    const prepared = getPrepared(text, font)

    const measure = () => {
      const width = node.clientWidth
      if (!width || window.innerWidth >= compactBelow) {
        setIsCompact(false)
        return
      }

      try {
        const result = layout(prepared, width, lineHeight)
        setIsCompact(result.lineCount > maxLines)
      } catch {
        setIsCompact(false)
      }
    }

    const scheduleMeasure = () => {
      if (frame) window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(measure)
    }

    scheduleMeasure()

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => scheduleMeasure())
        : null

    resizeObserver?.observe(node)
    window.addEventListener('resize', scheduleMeasure)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', scheduleMeasure)
    }
  }, [compactBelow, font, lineHeight, maxLines, text])

  return { containerRef, isCompact }
}
