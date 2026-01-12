# Performance Monitoring

Comprehensive monitoring for Core Web Vitals and custom operations.

## Core Web Vitals (Automatic)

| Metric | Target | Needs Improvement | Poor |
|--------|--------|------------------|------|
| LCP (Largest Paint) | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| FID (Input Delay) | ≤ 100ms | ≤ 300ms | > 300ms |
| CLS (Layout Shift) | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| TTFB (Server Time) | ≤ 800ms | ≤ 1800ms | > 1800ms |

## Custom Operations

| Operation | Target | Threshold |
|-----------|--------|-----------|
| Image Load | < 800ms avg | Alert > 800ms |
| Lightbox Open | < 300ms | Alert > 300ms |
| Filter Apply | < 500ms | Alert > 500ms |
| Like Response | < 200ms | Alert > 1000ms |

## Developer Tools

### Performance Dashboard (Dev Mode)
- **Access:** Click the Activity icon (📊) in the header or `Ctrl/Cmd + Shift + P`.
- **Features:** Real-time metrics, alerts for slow operations, summary stats (avg/p95), and JSON export.

### Console Commands
```javascript
// Quick summary table
console.table(window.__perfMonitor.getReport().summary)

// Export full report
const data = window.__perfMonitor.export()
```

## Integration Hooks

```typescript
import { usePerformanceMetrics, usePerformanceOperation } from '../hooks/usePerformanceMetrics'

// Auto-track Web Vitals
usePerformanceMetrics()

// Track custom operation
const operation = usePerformanceOperation('custom-op')
await operation.measure(async () => {
    /* your logic */
})
```

## Regression Detection
The system establishes a baseline on first load. A 20% slowdown relative to this baseline triggers a console warning and an analytics event.
