/**
 * Performance Metrics Hook
 * Tracks Core Web Vitals and reports to analytics
 */

import { useEffect, useRef } from 'react'
import { perfMonitor } from '../utils/performanceMonitor'

interface CoreWebVitals {
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
  fcp?: number // First Contentful Paint
  tti?: number // Time to Interactive
}

interface AnalyticsAPI {
  track: (event: string, properties?: Record<string, unknown>) => void
}

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, options?: Record<string, unknown>) => void
    analytics?: AnalyticsAPI
    PerformanceObserver?: typeof PerformanceObserver
  }
}

// Thresholds for Core Web Vitals (from web.dev)
const VITAL_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // ms
  FID: { good: 100, needsImprovement: 300 }, // ms
  CLS: { good: 0.1, needsImprovement: 0.25 }, // score
  TTFB: { good: 800, needsImprovement: 1800 }, // ms
  FCP: { good: 1800, needsImprovement: 3000 }, // ms
} as const

function logVital(name: string, value: number, threshold: typeof VITAL_THRESHOLDS[keyof typeof VITAL_THRESHOLDS]): void {
  // const status = value <= threshold.good ? '✅' : value <= threshold.needsImprovement ? '⚠️' : '❌'
  // const unit = name === 'CLS' ? '' : 'ms'
  // console.log(`[WEB VITAL] ${status} ${name}: ${value.toFixed(2)}${unit} (target: ≤${threshold.good}${unit})`)

  // Send to analytics
  if (value > threshold.good) {
    try {
      if (window.gtag) {
        window.gtag('event', `web_vital_${name.toLowerCase()}`, {
          value: Math.round(value),
          event_category: 'web_vitals',
          event_label: value > threshold.needsImprovement ? 'poor' : 'needs_improvement',
        })
      }

      if (window.analytics) {
        window.analytics.track('web_vital', {
          name,
          value: Math.round(value),
          status: value > threshold.needsImprovement ? 'poor' : 'needs_improvement',
        })
      }
    } catch (error) {
      console.warn('[WEB VITAL] Failed to send to analytics:', error)
    }
  }
}

export const usePerformanceMetrics = () => {
  const vitalRef = useRef<CoreWebVitals>({})
  const reportedRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.PerformanceObserver) {
      console.warn('[WEB VITAL] PerformanceObserver not supported')
      return
    }

    // Measure Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as { renderTime?: number; loadTime?: number; startTime: number; element?: Element }[]
      if (entries.length > 0) {
        const lastEntry = entries[entries.length - 1]
        const lcp = lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime
        vitalRef.current.lcp = lcp
        logVital('LCP', lcp, VITAL_THRESHOLDS.LCP)

        // Track image-related LCP
        if (lastEntry.element) {
          const isImage = lastEntry.element.tagName === 'IMG' ||
            lastEntry.element.querySelector('img') !== null
          if (isImage) {
            perfMonitor.trackImageLoad('LCP element', lcp, { type: 'lcp' })
          }
        }
      }
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

    // Measure First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as { processingStart?: number; startTime: number }[]) {
        if (entry.processingStart && entry.startTime) {
          const fid = entry.processingStart - entry.startTime
          if (fid > 0) {
            vitalRef.current.fid = fid
            logVital('FID', fid, VITAL_THRESHOLDS.FID)

            perfMonitor.trackLikeResponse(fid, true)
          }
        }
      }
    })
    fidObserver.observe({ entryTypes: ['first-input'] })

    // Measure Cumulative Layout Shift (CLS)
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as unknown as { hadRecentInput: boolean; value: number }[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      }
      vitalRef.current.cls = clsValue
      logVital('CLS', clsValue, VITAL_THRESHOLDS.CLS)
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })

    // Measure Time to First Byte (TTFB)
    const ttfbObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as { responseStart?: number; requestStart?: number }[]) {
        if (entry.responseStart && entry.requestStart) {
          const ttfb = entry.responseStart - entry.requestStart
          vitalRef.current.ttfb = ttfb
          logVital('TTFB', ttfb, VITAL_THRESHOLDS.TTFB)
        }
      }
    })
    ttfbObserver.observe({ entryTypes: ['navigation', 'resource'] })

    // Measure First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as { name: string; startTime: number }[]) {
        if (entry.name === 'first-contentful-paint') {
          const fcp = entry.startTime
          vitalRef.current.fcp = fcp
          logVital('FCP', fcp, VITAL_THRESHOLDS.FCP)
        }
      }
    })
    fcpObserver.observe({ entryTypes: ['paint'] })

    // Cleanup
    return () => {
      lcpObserver.disconnect()
      fidObserver.disconnect()
      clsObserver.disconnect()
      ttfbObserver.disconnect()
      fcpObserver.disconnect()
    }
  }, [])

  // Report summary on page load
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (reportedRef.current) return

    const handleLoad = () => {
      // Wait a bit for all metrics to be collected
      setTimeout(() => {
        const vitals = vitalRef.current
        const summary = Object.entries(vitals)
          .filter(([, value]) => value !== undefined)
          .map(([name, value]) => `${name}: ${value?.toFixed(0)}${name === 'CLS' ? '' : 'ms'}`)
          .join(', ')

        if (summary) {
          // console.log(`[WEB VITAL] Summary: ${summary}`)

          // Set baselines from first page load
          if (vitals.lcp) perfMonitor.setBaseline('lcp', vitals.lcp)
          if (vitals.fid) perfMonitor.setBaseline('fid', vitals.fid)
          if (vitals.cls) perfMonitor.setBaseline('cls', vitals.cls)
        }

        reportedRef.current = true
      }, 3000)
    }

    window.addEventListener('load', handleLoad)
    return () => window.removeEventListener('load', handleLoad)
  }, [])

  return vitalRef.current
}

/**
 * Hook to measure custom operations
 */
export const usePerformanceOperation = (name: string) => {
  const startTimeRef = useRef<number>(0)
  const isActiveRef = useRef(false)

  const start = () => {
    if (!isActiveRef.current) {
      startTimeRef.current = performance.now()
      isActiveRef.current = true
      perfMonitor.mark(`${name}-start`)
    }
  }

  const end = (context?: Record<string, string | number | boolean>) => {
    if (isActiveRef.current) {
      const duration = performance.now() - startTimeRef.current
      const metric = perfMonitor.measure(name, `${name}-start`)

      // Add custom context if provided
      if (context && metric.context) {
        Object.assign(metric.context, context)
      }

      isActiveRef.current = false
      return duration
    }
    return 0
  }

  const measure = async <T,>(operation: () => Promise<T>, context?: Record<string, string | number | boolean>): Promise<T> => {
    start()
    try {
      const result = await operation()
      end(context)
      return result
    } catch (error) {
      end(context)
      throw error
    }
  }

  return { start, end, measure }
}

/**
 * Hook to detect performance regressions
 */
export const usePerformanceRegression = () => {
  const prevMetricsRef = useRef<Map<string, number>>(new Map())

  const compare = (name: string, currentValue: number): boolean => {
    const prevValue = prevMetricsRef.current.get(name)
    if (prevValue) {
      const regression = (currentValue - prevValue) / prevValue
      if (regression > 0.2) { // 20% regression
        console.warn(
          `[PERF] Regression detected for ${name}: ${regression.toFixed(1)}% slower ` +
          `(${prevValue.toFixed(0)}ms → ${currentValue.toFixed(0)}ms)`
        )
        return true
      }
    }
    prevMetricsRef.current.set(name, currentValue)
    return false
  }

  return { compare }
}
