import { useCallback, useEffect } from 'react'

interface StatsigAPI {
  logEvent: (eventName: string, value?: string | number, metadata?: Record<string, unknown>) => void
  updateUser: (user: unknown) => void
}

interface AnalyticsAPI {
  track: (event: string, properties?: Record<string, unknown>) => void
  identify: (userId?: string, traits?: Record<string, unknown>) => void
}

declare global {
  interface Window {
    statsig?: StatsigAPI
    analytics?: AnalyticsAPI
  }
}

export interface AnalyticsEvent {
  name: string
  properties?: Record<string, unknown>
}

export interface PerformanceMark {
  name: string
  start: number
  end: number
  duration: number
}

export function useEventAnalytics() {
  // Check for available analytics services
  const hasStatsig = typeof window !== 'undefined' && !!window.statsig
  const hasAnalytics = typeof window !== 'undefined' && !!window.analytics

  const trackEvent = useCallback((eventName: string, properties?: Record<string, unknown>) => {
    try {
      if (hasStatsig) {
        window.statsig!.logEvent(eventName, undefined, properties)
      }
      
      if (hasAnalytics) {
        window.analytics!.track(eventName, properties)
      }
      
      // Custom endpoint fallback
      if (!hasStatsig && !hasAnalytics) {
        // In production, replace with your analytics endpoint
        console.log('[Analytics]', eventName, properties)
      }
    } catch (error) {
      console.warn('Analytics tracking failed:', error)
    }
  }, [hasStatsig, hasAnalytics])

  const trackPageView = useCallback((page: string, params?: Record<string, unknown>) => {
    trackEvent('page_view', { page, ...params })
    
    // Performance tracking for Core Web Vitals
    if (typeof window !== 'undefined' && window.performance) {
      try {
        const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navEntry) {
          trackEvent('page_load_metrics', {
            page,
            dom_content_loaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            load_complete: navEntry.loadEventEnd - navEntry.loadEventStart,
            first_paint: navEntry.responseEnd - navEntry.fetchStart
          })
        }
      } catch {
        // Ignore performance tracking errors
      }
    }
  }, [trackEvent])

  const trackSearch = useCallback((query: string, resultCount: number, filters?: Record<string, unknown>) => {
    trackEvent('event_search', {
      query,
      result_count: resultCount,
      filters,
      timestamp: Date.now()
    })
  }, [trackEvent])

  const trackFilterUsage = useCallback((filterType: string, value: string) => {
    trackEvent('filter_usage', {
      filter_type: filterType,
      filter_value: value,
      timestamp: Date.now()
    })
  }, [trackEvent])

  const trackQueueJoin = useCallback((eventId: string, position: number) => {
    trackEvent('queue_join', {
      event_id: eventId,
      queue_position: position,
      timestamp: Date.now()
    })
  }, [trackEvent])

  const trackPurchase = useCallback((eventId: string, ticketType: string, quantity: number, total: number) => {
    trackEvent('purchase_complete', {
      event_id: eventId,
      ticket_type: ticketType,
      quantity,
      total,
      currency: 'USD',
      timestamp: Date.now()
    })
  }, [trackEvent])

  const trackImageLoad = useCallback((imageUrl: string, loadTime: number, success: boolean) => {
    trackEvent('image_load', {
      image_url: imageUrl,
      load_time_ms: loadTime,
      success,
      timestamp: Date.now()
    })
  }, [trackEvent])

  const markPerformance = useCallback((name: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      try {
        performance.mark(`start_${name}`)
      } catch {
        // Ignore performance API errors
      }
    }
  }, [])

  const measurePerformance = useCallback((name: string): PerformanceMark | null => {
    if (typeof window !== 'undefined' && window.performance) {
      try {
        const startMark = performance.getEntriesByName(`start_${name}`)[0]
        const endMarkName = `end_${name}`
        performance.mark(endMarkName)
        
        if (startMark) {
          const measure = performance.measure(name, startMark.name, endMarkName)
          return {
            name,
            start: startMark.startTime,
            end: measure.endTime,
            duration: measure.duration
          }
        }
      } catch {
        // Ignore performance API errors
      }
    }
    return null
  }, [])

  // Track slow operations automatically
  const trackSlowOperation = useCallback(async <T,>(
    name: string,
    threshold: number,
    operation: () => Promise<T>
  ): Promise<T> => {
    markPerformance(name)
    const start = Date.now()
    
    try {
      const result = await operation()
      const duration = Date.now() - start
      
      if (duration > threshold) {
        trackEvent('slow_operation', {
          operation: name,
          duration_ms: duration,
          threshold_ms: threshold
        })
      }
      
      measurePerformance(name)
      return result
    } catch (error) {
      const duration = Date.now() - start
      trackEvent('operation_error', {
        operation: name,
        duration_ms: duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }, [trackEvent, markPerformance, measurePerformance])

  interface LargestContentfulPaintEntry {
    startTime: number
  }
  
  interface LayoutShiftEntry {
    hadRecentInput: boolean
    value: number
  }

  // Auto-track Core Web Vitals when hook is used
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    let reportTimer: ReturnType<typeof setTimeout> | null = null
    
    const reportWebVitals = () => {
      try {
        // Largest Contentful Paint
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint') as unknown as LargestContentfulPaintEntry[]
        if (lcpEntries.length > 0) {
          const lcp = lcpEntries[lcpEntries.length - 1]
          trackEvent('web_vital_lcp', { value: lcp.startTime })
        }
        
        // First Input Delay (requires separate polyfill, so we'll simulate)
        trackEvent('web_vital_fid', { value: 0 })
        
        // Cumulative Layout Shift
        const clsEntries = performance.getEntriesByType('layout-shift') as unknown as LayoutShiftEntry[]
        let cls = 0
        clsEntries.forEach(entry => {
          if (!entry.hadRecentInput) {
            cls += entry.value
          }
        })
        trackEvent('web_vital_cls', { value: cls })
      } catch {
        // Ignore Web Vitals tracking errors
      }
    }
    
    // Report after page load
    const handleLoad = () => {
      reportTimer = setTimeout(reportWebVitals, 2000)
    }
    
    window.addEventListener('load', handleLoad)
    
    return () => {
      window.removeEventListener('load', handleLoad)
      if (reportTimer) clearTimeout(reportTimer)
    }
  }, [trackEvent])

  return {
    trackEvent,
    trackPageView,
    trackSearch,
    trackFilterUsage,
    trackQueueJoin,
    trackPurchase,
    trackImageLoad,
    markPerformance,
    measurePerformance,
    trackSlowOperation,
    hasAnalytics: hasStatsig || hasAnalytics
  }
}