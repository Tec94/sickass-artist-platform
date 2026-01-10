# Performance Monitoring

Complete performance monitoring system with Core Web Vitals tracking, custom operation timing, regression detection, and real-time dashboards.

## Quick Start

### Auto-Track Web Vitals

```typescript
import { usePerformanceMetrics } from '../hooks/usePerformanceMetrics'

export const MyComponent = () => {
  usePerformanceMetrics() // Automatically tracks LCP, FID, CLS, TTFB, FCP
  return <div>My Component</div>
}
```

### Access Performance Dashboard

**Development Mode:**
- Open Gallery page
- Click Activity icon (📊) in header
- View real-time metrics and alerts

**Keyboard Shortcut:**
- Press `Ctrl/Cmd + Shift + P` for console report

### Console Commands

```javascript
// Get summary table
console.table(window.__perfMonitor.getReport().summary)

// Get full report
const report = window.__perfMonitor.getReport()

// Export metrics
const data = window.__perfMonitor.export()
```

## Core Web Vitals

| Metric | Target | Needs Improvement | Poor |
|--------|--------|------------------|------|
| LCP (Largest Contentful Paint) | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| FID (First Input Delay) | ≤ 100ms | ≤ 300ms | > 300ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| TTFB (Time to First Byte) | ≤ 800ms | ≤ 1800ms | > 1800ms |
| FCP (First Contentful Paint) | ≤ 1.8s | ≤ 3.0s | > 3.0s |

## Custom Operations

| Operation | Target | Alert Threshold |
|-----------|--------|----------------|
| Image Load | < 800ms avg | > 800ms |
| Lightbox Open | < 300ms | > 300ms |
| Filter Apply | < 500ms | > 500ms |
| Like Response | < 1000ms | > 1000ms |
| Scroll Render | < 100ms | > 100ms |
| Query Fetch | < 500ms | > 500ms |

## Usage Examples

### Track Custom Operations

```typescript
import { perfMonitor } from '../utils/performanceMonitor'

// Basic timing
perfMonitor.mark('operation-start')
// ... do work ...
const metric = perfMonitor.measure('operation-name', 'operation-start')

// Track specific operations
perfMonitor.trackImageLoad(url, duration, { cached: true })
perfMonitor.trackLightboxOpen(duration)
perfMonitor.trackFilterApply(filterCount, duration)
perfMonitor.trackLikeResponse(duration, success)
```

### Using Hooks

```typescript
import { usePerformanceOperation } from '../hooks/usePerformanceMetrics'

const MyComponent = () => {
  const operation = usePerformanceOperation('custom-op')

  const handleClick = () => {
    operation.start()
    // ... do work ...
    operation.end({ custom: 'data' })
  }

  // Or measure async operations
  const fetchData = async () => {
    return await operation.measure(async () => {
      const response = await fetch('/api/data')
      return response.json()
    }, { endpoint: '/api/data' })
  }
}
```

## Architecture

### Core Components

1. **Performance Monitor** (`src/utils/performanceMonitor.ts`)
   - Singleton for centralized metric tracking
   - Automatic regression detection (20% threshold)
   - Analytics integration (Google Analytics, Segment)
   - Export functionality

2. **Performance Hooks** (`src/hooks/usePerformanceMetrics.ts`)
   - `usePerformanceMetrics()` - Auto-track Web Vitals
   - `usePerformanceOperation(name)` - Track custom operations
   - `usePerformanceRegression()` - Detect regressions

3. **Performance Dashboard** (`src/components/Performance/PerformanceDashboard.tsx`)
   - Real-time metrics visualization
   - Alert system for slow operations
   - Export metrics to JSON
   - Development mode only

## Integration Points

- **Gallery Page** - Web Vitals, filter operations, query performance
- **OptimizedImage** - Image load times, cache hits/misses, failures
- **LikeButton** - Like/unlike response times, success rates
- **LightboxContainer** - Lightbox open performance

## Regression Detection

The system automatically detects performance regressions:

1. **Baseline Setting** - Initial page load establishes baselines
2. **Comparison** - Each operation compared to baseline
3. **Alert** - 20% regression triggers alert
4. **Logging** - Details sent to console and analytics

```typescript
// Set baseline manually
perfMonitor.setBaseline('filter-apply', 200)

// Automatic regression detection
// 20% slower than baseline = alert
```

## Analytics Integration

Metrics automatically sent to:

**Google Analytics:**
```javascript
window.gtag('event', 'metric-name', { value: 123, unit: 'ms' })
```

**Segment:**
```javascript
window.analytics.track('metric-name', { value: 123, unit: 'ms' })
```

**Fallback:** Console logging when analytics unavailable

## Console Output

### Performance Logs
```
[PERF] image-load: 456.78ms {"cached": true}
[PERF] lightbox-open: 234.56ms
[PERF] filter-apply: 345.67ms {"filterCount": 3}
```

### Web Vitals Logs
```
[WEB VITAL] ✅ LCP: 1234.56ms (target: ≤2500ms)
[WEB VITAL] ⚠️ FID: 150.23ms (target: ≤100ms)
[WEB VITAL] ✅ CLS: 0.05 (target: ≤0.1)
```

### Alert Logs
```
[PERF] Slow image load: 1234ms for https://...
[PERF] PERFORMANCE REGRESSION: filter-apply is 25% slower than baseline
```

## Dashboard Features

1. **Real-time Metrics** - Auto-refreshes every 2 seconds
2. **Alerts** - Shows slow operations with details
3. **Summary** - Min/avg/max/p95 for each metric
4. **Progress Bars** - Visual indication vs thresholds
5. **Recent Activity** - Last 10 operations
6. **Export** - Download metrics as JSON
7. **Clear** - Reset all metrics

## Best Practices

1. **Monitor in Development** - Use dashboard for real-time feedback
2. **Optimize for p95** - Average can be misleading, focus on worst-case
3. **Track Context** - Include relevant data (cache status, counts)
4. **Set Realistic Baselines** - Auto-set on first load, manually adjust as needed
5. **Export and Analyze** - Track performance over time

## Troubleshooting

### No Metrics Appearing?
- Check console for `[PERF]` logs
- Verify `window.__perfMonitor` exists (dev mode only)
- Ensure `performance.now()` available

### High LCP Scores?
- Check image load times in dashboard
- Verify image optimization (WebP, responsive)
- Check for render-blocking resources
- Review lazy loading configuration

### High CLS Scores?
- Check for image dimension attributes
- Verify font loading strategy
- Look for dynamic content insertion

### Slow Filter Operations?
- Check query complexity
- Verify database indexes
- Review pagination strategy
- Check for unnecessary re-renders

## Export and Analysis

```typescript
// Via dashboard UI - Click "Export Report" button

// Programmatically
const data = perfMonitor.export()
const blob = new Blob([data], { type: 'application/json' })
const url = URL.createObjectURL(blob)
// Download blob...
```

### Exported Data Format

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

## Files

### Created
- `src/utils/performanceMonitor.ts` - Performance monitor utility
- `src/hooks/usePerformanceMetrics.ts` - Web Vitals and operation tracking hooks
- `src/components/Performance/PerformanceDashboard.tsx` - Visual dashboard
- `src/utils/index.ts` - Utils export file

### Modified
- `src/pages/Gallery.tsx` - Performance tracking and dashboard button
- `src/components/Gallery/OptimizedImage.tsx` - Image load tracking
- `src/components/Gallery/LikeButton.tsx` - Like response tracking
- `src/components/Gallery/LightboxContainer.tsx` - Lightbox open tracking
- `src/hooks/index.ts` - Performance hook exports

## References

- [Core Web Vitals](https://web.dev/vitals/)
- [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [PerformanceObserver](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
