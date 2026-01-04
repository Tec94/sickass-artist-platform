# Performance Monitoring & Metrics

This document describes the performance monitoring system implemented for the gallery and UGC features.

## Overview

The performance monitoring system tracks Core Web Vitals, custom operations, and provides real-time dashboards for development and production monitoring.

## Architecture

### Core Components

1. **Performance Monitor Utility** (`src/utils/performanceMonitor.ts`)
   - Singleton instance for centralized metric tracking
   - Supports custom operations, images, filters, and queries
   - Automatic regression detection (20% threshold)
   - Analytics integration (Google Analytics, Segment)
   - Export functionality for offline analysis

2. **Performance Metrics Hook** (`src/hooks/usePerformanceMetrics.ts`)
   - Core Web Vitals tracking (LCP, FID, CLS, TTFB, FCP)
   - Custom operation timing (`usePerformanceOperation`)
   - Regression detection hook (`usePerformanceRegression`)

3. **Performance Dashboard** (`src/components/Performance/PerformanceDashboard.tsx`)
   - Real-time metrics visualization
   - Alert system for slow operations
   - Export metrics to JSON
   - Available in development mode only

## Tracked Metrics

### Core Web Vitals

| Metric | Target | Needs Improvement | Poor |
|--------|--------|------------------|------|
| LCP (Largest Contentful Paint) | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| FID (First Input Delay) | ≤ 100ms | ≤ 300ms | > 300ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| TTFB (Time to First Byte) | ≤ 800ms | ≤ 1800ms | > 1800ms |
| FCP (First Contentful Paint) | ≤ 1.8s | ≤ 3.0s | > 3.0s |

### Custom Operations

| Operation | Target | Threshold |
|-----------|--------|-----------|
| Image Load | < 800ms avg | Alert > 800ms |
| Lightbox Open | < 300ms | Alert > 300ms |
| Filter Apply | < 500ms | Alert > 500ms |
| Like Response | < 1000ms | Alert > 1000ms |
| Scroll Render | < 100ms | Alert > 100ms |
| Query Fetch | < 500ms | Dynamic based on records |

## Usage

### Basic Usage

```typescript
import { perfMonitor } from '../utils/performanceMonitor'

// Start measuring
perfMonitor.mark('operation-start')

// ... do work ...

// End and record
const metric = perfMonitor.measure('operation-name', 'operation-start')
console.log(metric.value) // duration in ms
```

### Track Custom Operations

```typescript
// Track image load
perfMonitor.trackImageLoad(url, duration, { cached: true })

// Track lightbox open
perfMonitor.trackLightboxOpen(duration)

// Track filter apply
perfMonitor.trackFilterApply(filterCount, duration)

// Track like response
perfMonitor.trackLikeResponse(duration, success)
```

### Using the Hook

```typescript
import { usePerformanceMetrics } from '../hooks/usePerformanceMetrics'

export const GalleryPage = () => {
  // Auto-track Web Vitals
  usePerformanceMetrics()

  // Track custom operations
  const operation = usePerformanceOperation('custom-op')

  const handleClick = () => {
    operation.start()
    // ... do work ...
    operation.end({ custom: 'data' })
  }
}
```

### Async Operation Tracking

```typescript
import { usePerformanceOperation } from '../hooks/usePerformanceMetrics'

const operation = usePerformanceOperation('async-fetch')

const fetchData = async () => {
  return await operation.measure(async () => {
    const response = await fetch('/api/data')
    return response.json()
  }, { endpoint: '/api/data' })
}
```

## Performance Dashboard

### Accessing the Dashboard

**Development Mode:**
- Click the Activity icon in the Gallery header
- Press `Ctrl/Cmd + Shift + P` for console report

**Features:**
- Real-time metrics display
- Alerts for slow operations
- Performance summary (avg, min, max, p95)
- Export metrics to JSON
- Clear metrics functionality

### Console Commands

```javascript
// Get performance report
console.table(window.__perfMonitor.getReport().summary)

// Get detailed report
window.__perfMonitor.getReport()

// Clear metrics
window.__perfMonitor.clear()

// Set baseline
window.__perfMonitor.setBaseline('operation-name', 150)

// Export metrics
const data = window.__perfMonitor.export()
console.log(data)
```

## Integration Points

### Gallery Page (`src/pages/Gallery.tsx`)
- Tracks Web Vitals on page load
- Monitors filter operations
- Tracks query fetch performance

### OptimizedImage (`src/components/Gallery/OptimizedImage.tsx`)
- Tracks image load times
- Distinguishes between cache hits and misses
- Tracks load failures and timeouts

### LikeButton (`src/components/Gallery/LikeButton.tsx`)
- Tracks like/unlike response times
- Monitors success/failure rates

### LightboxContainer (`src/components/Gallery/LightboxContainer.tsx`)
- Tracks lightbox open performance
- Monitors initial render time

## Analytics Integration

The performance monitor automatically sends metrics to:

1. **Google Analytics (gtag)**
   ```javascript
   window.gtag('event', 'metric-name', { value: 123, unit: 'ms' })
   ```

2. **Segment (analytics)**
   ```javascript
   window.analytics.track('metric-name', { value: 123, unit: 'ms' })
   ```

### Fallback Logging

If analytics are not available, metrics are logged to console:

```javascript
[PERF] operation-name: 123.45ms
[WEB VITAL] ✅ LCP: 1234.56ms (target: ≤2500ms)
```

## Regression Detection

The system automatically detects performance regressions:

1. **Baseline Setting**: Initial page load establishes baselines
2. **Comparison**: Each operation is compared to baseline
3. **Alert**: 20% regression triggers alert
4. **Logging**: Regression details sent to console and analytics

```typescript
// Set baseline manually
perfMonitor.setBaseline('filter-apply', 200)

// Check for regression (automatic)
// 20% slower than baseline = alert
```

## Performance Targets by Component

| Component | Metric | Target | Acceptable |
|-----------|--------|--------|-----------|
| Gallery Page | LCP | < 2.5s | < 4s |
| Gallery Page | FID | < 100ms | < 300ms |
| Gallery Page | CLS | < 0.1 | < 0.25 |
| Image Load | Load Time | < 800ms avg | < 2s p95 |
| Lightbox | Open Time | < 300ms | < 500ms |
| Filters | Apply Time | < 500ms | < 1s |
| Likes | Response Time | < 200ms opt | < 1s |
| Scroll | Render Time | < 100ms | < 200ms |
| Queries | Fetch Time | < 500ms | < 1s |

## Best Practices

1. **Mark Before Operation**
   ```typescript
   perfMonitor.mark('operation-start')
   // ... work ...
   perfMonitor.measure('operation-name', 'operation-start')
   ```

2. **Use Hooks for Components**
   ```typescript
   usePerformanceMetrics() // Auto-track Web Vitals
   const operation = usePerformanceOperation('name')
   ```

3. **Track Context**
   ```typescript
   perfMonitor.trackImageLoad(url, duration, {
     cached: true,
     size: 12345,
     format: 'webp'
   })
   ```

4. **Handle Errors**
   ```typescript
   try {
     const result = await operation.measure(async () => {
       return await fetch(url)
     })
   } catch (error) {
     // Error is automatically tracked
   }
   ```

5. **Set Realistic Baselines**
   ```typescript
   // Set after first run for regression detection
   if (!perfMonitor.getBaseline('operation')) {
     perfMonitor.setBaseline('operation', duration)
   }
   ```

## Troubleshooting

### No Metrics Appearing

1. Check console for `[PERF]` logs
2. Verify `window.__perfMonitor` exists (dev mode only)
3. Ensure `performance.now()` is available (browser support)

### High LCP Scores

1. Check image load times in dashboard
2. Verify image optimization (WebP, responsive)
3. Check for render-blocking resources
4. Review lazy loading configuration

### High CLS Scores

1. Check for image dimension attributes
2. Verify font loading strategy
3. Look for dynamic content insertion
4. Check for ads or iframes

### Slow Filter Operations

1. Check query complexity
2. Verify database indexes
3. Review pagination strategy
4. Check for unnecessary re-renders

## Performance Optimization Checklist

- [ ] LCP < 2.5s (First paint)
- [ ] FID < 100ms (Interactive)
- [ ] CLS < 0.1 (Stable)
- [ ] Images < 800ms avg load
- [ ] Filters < 500ms apply
- [ ] Likes < 200ms optimistic
- [ ] Lightbox < 300ms open
- [ ] Bundle size < 200KB gzipped
- [ ] No regression alerts
- [ ] Analytics receiving metrics

## Export and Analysis

### Export Metrics

```typescript
// Via dashboard UI
// Click "Export Report" button

// Programmatically
const data = perfMonitor.export()
const blob = new Blob([data], { type: 'application/json' })
const url = URL.createObjectURL(blob)
// Download blob...
```

### Analyze Exported Data

```json
{
  "metrics": [
    {
      "name": "image-load",
      "value": 456.78,
      "unit": "ms",
      "timestamp": 1234567890,
      "context": {
        "url": "https://...",
        "cached": true
      }
    }
  ],
  "summary": {
    "image-load": {
      "avg": 423.45,
      "min": 123.45,
      "max": 1234.56,
      "count": 42,
      "p95": 890.12
    }
  },
  "alerts": []
}
```

## Future Enhancements

- [ ] Real User Monitoring (RUM) aggregation
- [ ] Performance budget enforcement
- [ ] Automated performance regression testing
- [ ] Performance score calculation
- [ ] Historical trend analysis
- [ ] Performance budget alerts in CI/CD
- [ ] Integration with Lighthouse CI
- [ ] A/B testing performance impact

## References

- [Core Web Vitals](https://web.dev/vitals/)
- [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [PerformanceObserver](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
