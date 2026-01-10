/**
 * Performance Monitoring Utility
 * Tracks and reports performance metrics for the gallery
 */

import { trackPerformanceMetric, trackPerformanceRegression } from './analytics'

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
  context?: Record<string, string | number | boolean>
}

interface MetricSummary {
  avg: number
  min: number
  max: number
  count: number
  p95: number
}

interface PerformanceReport {
  metrics: PerformanceMetric[]
  summary: Record<string, MetricSummary>
  alerts: PerformanceMetric[]
}

interface AnalyticsAPI {
  track: (event: string, properties?: Record<string, unknown>) => void
}

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, options?: Record<string, unknown>) => void
    analytics?: AnalyticsAPI
  }
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private marks: Map<string, number> = new Map()
  private readonly MAX_METRICS = 1000
  private regressionBaseline: Map<string, number> = new Map()

  /**
   * Start measuring an operation
   */
  mark(name: string): void {
    this.marks.set(name, performance.now())
  }

  /**
   * End measurement and record metric
   */
  measure(name: string, startMark: string): PerformanceMetric {
    const start = this.marks.get(startMark)
    if (!start) {
      console.warn(`[PERF] Start mark ${startMark} not found`)
      return { name, value: 0, unit: 'ms', timestamp: Date.now() }
    }

    const duration = performance.now() - start
    this.marks.delete(startMark)

    const metric: PerformanceMetric = {
      name,
      value: Math.round(duration * 100) / 100,
      unit: 'ms',
      timestamp: Date.now(),
    }

    this.addMetric(metric)
    return metric
  }

  /**
   * Track image load time
   */
  trackImageLoad(url: string, duration: number, context?: Record<string, string | number | boolean>): void {
    const metric: PerformanceMetric = {
      name: 'image-load',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      context: {
        url: url.substring(0, 100), // Truncate URL for privacy/size
        ...context,
      },
    }

    this.addMetric(metric)

    // Alert if slow
    if (duration > 800) {
      this.alert(`Slow image load: ${duration.toFixed(0)}ms for ${url.substring(0, 50)}`)
    }
  }

  /**
   * Track lightbox open time
   */
  trackLightboxOpen(duration: number): void {
    this.trackOperation('lightbox-open', duration)
    if (duration > 300) {
      this.alert(`Slow lightbox open: ${duration.toFixed(0)}ms`)
    }
  }

  /**
   * Track filter apply time
   */
  trackFilterApply(filterCount: number, duration: number): void {
    this.trackOperation('filter-apply', duration, { filterCount })
    if (duration > 500) {
      this.alert(`Slow filter apply: ${duration.toFixed(0)}ms`)
    }
  }

  /**
   * Track like/unlike response time
   */
  trackLikeResponse(duration: number, success: boolean): void {
    this.trackOperation('like-response', duration, { success })
    if (duration > 1000) {
      this.alert(`Slow like response: ${duration.toFixed(0)}ms`)
    }
  }

  /**
   * Track scroll render time
   */
  trackScrollRender(duration: number, itemCount: number): void {
    this.trackOperation('scroll-render', duration, { itemCount })
    if (duration > 100) {
      this.alert(`Slow scroll render: ${duration.toFixed(0)}ms for ${itemCount} items`)
    }
  }

  /**
   * Track query fetch time
   */
  trackQueryFetch(queryName: string, duration: number, recordCount?: number): void {
    const metric: PerformanceMetric = {
      name: 'query-fetch',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      context: {
        query: queryName,
        recordCount,
      },
    }

    this.addMetric(metric)

    // Different thresholds based on record count
    const threshold = recordCount ? Math.max(500, recordCount * 10) : 500
    if (duration > threshold) {
      this.alert(`Slow query fetch: ${queryName} took ${duration.toFixed(0)}ms`)
    }
  }

  /**
   * Generic operation tracking
   */
  private trackOperation(
    name: string,
    duration: number,
    context?: Record<string, string | number | boolean>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value: Math.round(duration * 100) / 100,
      unit: 'ms',
      timestamp: Date.now(),
      context,
    }

    this.addMetric(metric)
  }

  /**
   * Add a metric to the collection
   */
  private addMetric(metric: PerformanceMetric): void {
    // Maintain max metrics limit
    if (this.metrics.length >= this.MAX_METRICS) {
      this.metrics = this.metrics.slice(this.MAX_METRICS / 2)
    }

    this.metrics.push(metric)
    this.logMetric(metric)
    this.checkRegression(metric)
  }

  /**
   * Log metric to console and analytics
   */
  private logMetric(metric: PerformanceMetric): void {
    // Log to console in dev
    if (process.env.NODE_ENV === 'development') {
      const contextStr = metric.context ? ` ${JSON.stringify(metric.context)}` : ''
      console.log(`[PERF] ${metric.name}: ${metric.value.toFixed(2)}${metric.unit}${contextStr}`)
    }

    // Send to analytics
    this.sendToAnalytics(metric)
  }

  /**
   * Send metric to analytics providers
   */
  private sendToAnalytics(metric: PerformanceMetric): void {
    try {
      // Track in our analytics system
      trackPerformanceMetric(metric.name, metric.value)

      // Google Analytics
      if (window.gtag) {
        window.gtag('event', metric.name, {
          value: Math.round(metric.value),
          unit: metric.unit,
          ...metric.context,
        })
      }

      // Segment/Analytics
      if (window.analytics) {
        window.analytics.track(metric.name, {
          value: metric.value,
          unit: metric.unit,
          ...metric.context,
        })
      }
    } catch (error) {
      console.warn('[PERF] Failed to send to analytics:', error)
    }
  }

  /**
   * Check for performance regression
   */
  private checkRegression(metric: PerformanceMetric): void {
    const baseline = this.regressionBaseline.get(metric.name)
    if (baseline && metric.value > baseline * 1.2) {
      // 20% regression detected
      this.alert(
        `PERFORMANCE REGRESSION: ${metric.name} is ${((metric.value / baseline - 1) * 100).toFixed(0)}% slower than baseline`
      )
      // Track regression in analytics
      trackPerformanceRegression(metric.name, metric.value, baseline)
    }
  }

  /**
   * Alert on slow operations
   */
  private alert(message: string): void {
    console.warn(`[PERF] ${message}`)

    // Send alert to analytics
    try {
      if (window.gtag) {
        window.gtag('event', 'performance_alert', {
          alert_message: message,
          timestamp: Date.now(),
        })
      }
    } catch (error) {
      console.warn('[PERF] Failed to send alert:', error)
    }
  }

  /**
   * Calculate p95 percentile
   */
  private calculateP95(values: number[]): number {
    if (values.length === 0) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.ceil(values.length * 0.95) - 1
    return sorted[Math.max(0, index)]
  }

  /**
   * Get performance report
   */
  getReport(): PerformanceReport {
    const summary: Record<string, MetricSummary> = {}
    const alerts: PerformanceMetric[] = []

    for (const metric of this.metrics) {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          avg: 0,
          min: Infinity,
          max: -Infinity,
          count: 0,
          p95: 0,
        }
      }

      const stat = summary[metric.name]
      stat.avg = (stat.avg * stat.count + metric.value) / (stat.count + 1)
      stat.min = Math.min(stat.min, metric.value)
      stat.max = Math.max(stat.max, metric.value)
      stat.count += 1

      // Collect slow metrics as alerts
      const threshold = this.getThreshold(metric.name)
      if (metric.value > threshold) {
        alerts.push(metric)
      }
    }

    // Calculate p95 for each metric
    for (const name in summary) {
      const values = this.metrics.filter(m => m.name === name).map(m => m.value)
      summary[name].p95 = this.calculateP95(values)
    }

    return { metrics: this.metrics, summary, alerts }
  }

  /**
   * Get threshold for a metric
   */
  private getThreshold(name: string): number {
    const thresholds: Record<string, number> = {
      'image-load': 800,
      'lightbox-open': 300,
      'filter-apply': 500,
      'like-response': 1000,
      'scroll-render': 100,
      'query-fetch': 500,
    }
    return thresholds[name] || Infinity
  }

  /**
   * Set baseline for regression detection
   */
  setBaseline(name: string, value: number): void {
    this.regressionBaseline.set(name, value)
    console.log(`[PERF] Baseline set for ${name}: ${value}ms`)
  }

  /**
   * Get baseline for a metric
   */
  getBaseline(name: string): number | undefined {
    return this.regressionBaseline.get(name)
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = []
    this.marks.clear()
    console.log('[PERF] Metrics cleared')
  }

  /**
   * Export metrics as JSON
   */
  export(): string {
    const report = this.getReport()
    return JSON.stringify(report, null, 2)
  }
}

// Singleton instance
export const perfMonitor = new PerformanceMonitor()

// Expose in dev tools
if (process.env.NODE_ENV === 'development') {
  (window as typeof globalThis & { __perfMonitor?: typeof perfMonitor }).__perfMonitor = perfMonitor

  // Add keyboard shortcut for performance report
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Shift + P
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        console.log('[PERF] Performance Report:')
        console.table(perfMonitor.getReport().summary)
        console.log(`[PERF] Alerts: ${perfMonitor.getReport().alerts.length} slow operations`)
      }
    })
  }
}
