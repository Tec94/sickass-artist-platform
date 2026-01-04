# Performance Monitoring - Quick Start Guide

## Overview

The performance monitoring system tracks Core Web Vitals and custom operations for the gallery. It provides real-time dashboards, regression detection, and analytics integration.

## Quick Setup

### 1. Import and Use (Already Integrated)

```typescript
import { usePerformanceMetrics } from '../hooks/usePerformanceMetrics'

export const MyComponent = () => {
  // Automatically tracks Web Vitals
  usePerformanceMetrics()

  return <div>My Component</div>
}
```

### 2. Access Performance Dashboard

**In Development Mode:**
- Open the Gallery page
- Click the Activity icon (📊) in the header
- View real-time metrics and alerts

**Keyboard Shortcut:**
- Press `Ctrl/Cmd + Shift + P` on the Gallery page
- View performance report in console

### 3. View Console Report

```javascript
// Get summary table
console.table(window.__perfMonitor.getReport().summary)

// Get full report
const report = window.__perfMonitor.getReport()

// Export metrics
const data = window.__perfMonitor.export()
```

## What's Being Tracked

### Core Web Vitals (Automatic)
- ✅ LCP (Largest Contentful Paint) - Target: ≤2.5s
- ✅ FID (First Input Delay) - Target: ≤100ms
- ✅ CLS (Cumulative Layout Shift) - Target: ≤0.1
- ✅ TTFB (Time to First Byte) - Target: ≤800ms
- ✅ FCP (First Contentful Paint) - Target: ≤1.8s

### Custom Operations (Integrated)
- ✅ Image load times (cache hits/misses)
- ✅ Lightbox open performance
- ✅ Filter apply performance
- ✅ Like/unlike response times
- ✅ Scroll render times
- ✅ Query fetch times

## Common Tasks

### Track Custom Operation

```typescript
import { perfMonitor } from '../utils/performanceMonitor'

perfMonitor.mark('start')
// ... do work ...
const metric = perfMonitor.measure('operation-name', 'start')
console.log(`Took ${metric.value}ms`)
```

### Track Async Operation

```typescript
import { usePerformanceOperation } from '../hooks/usePerformanceMetrics'

const MyComponent = () => {
  const operation = usePerformanceOperation('fetch-data')

  const fetchData = async () => {
    return await operation.measure(async () => {
      const response = await fetch('/api/data')
      return response.json()
    })
  }

  return <button onClick={fetchData}>Load</button>
}
```

### Check for Regression

```typescript
import { perfMonitor } from '../utils/performanceMonitor'

// Baseline is set automatically on first page load
// Or set manually:
perfMonitor.setBaseline('my-operation', 150)

// 20% slower than baseline = automatic alert
```

## Performance Targets

| Operation | Target | Alert |
|-----------|--------|--------|
| Image Load | < 800ms | > 800ms |
| Lightbox Open | < 300ms | > 300ms |
| Filter Apply | < 500ms | > 500ms |
| Like Response | < 200ms | > 1000ms |
| Scroll Render | < 100ms | > 100ms |
| Query Fetch | < 500ms | > 500ms |

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

## Integration Points

The following components are already integrated with performance monitoring:

- **Gallery Page** - Web Vitals, filter operations
- **OptimizedImage** - Image load times, cache status
- **LikeButton** - Like response times
- **LightboxContainer** - Lightbox open times

## Exporting Metrics

### Via Dashboard UI
1. Open performance dashboard
2. Click "Export Report" button
3. Download JSON file

### Programmatically
```typescript
import { perfMonitor } from '../utils/performanceMonitor'

const data = perfMonitor.export()
const blob = new Blob([data], { type: 'application/json' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = `metrics-${Date.now()}.json`
a.click()
```

## Troubleshooting

### Dashboard Not Showing?
- Make sure you're in development mode
- Check console for errors
- Verify `window.__perfMonitor` exists

### No Metrics Appearing?
- Check console for `[PERF]` logs
- Wait a few seconds after page load
- Try refreshing the page

### High LCP Scores?
- Check image load times in dashboard
- Verify image optimization (WebP, responsive)
- Look for render-blocking resources

### Performance Regressions?
- Check console for regression alerts
- Compare to baselines
- Review recent code changes

## Best Practices

1. **Monitor in Development**
   - Use dashboard for real-time feedback
   - Check console for alerts
   - Set baselines after optimization

2. **Optimize for p95**
   - Average can be misleading
   - p95 represents worst-case experience
   - Focus on improving worst-case scenarios

3. **Track Context**
   - Include relevant data (cache status, counts)
   - Helps identify bottlenecks
   - Provides better insights

4. **Set Realistic Baselines**
   - Baselines set automatically on first load
   - Can be manually set for specific operations
   - Used for regression detection

## Further Reading

- [Full Documentation](./PERFORMANCE_MONITORING.md)
- [Usage Examples](./PERFORMANCE_EXAMPLES.md)
- [Implementation Summary](./PERFORMANCE_IMPLEMENTATION_SUMMARY.md)

## Support

If you encounter issues:
1. Check console for error messages
2. Verify `window.performance` API is available
3. Ensure `PerformanceObserver` is supported
4. Check analytics configuration

## Summary

The performance monitoring system provides:
- ✅ Automatic Web Vitals tracking
- ✅ Custom operation tracking
- ✅ Real-time dashboard (dev mode)
- ✅ Regression detection (20% threshold)
- ✅ Analytics integration
- ✅ Export capabilities

All tracking is already integrated into the gallery components. Just use the dashboard and console to monitor performance!
