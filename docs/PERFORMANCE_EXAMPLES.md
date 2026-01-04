# Performance Monitoring - Usage Examples

This document provides practical examples of using the performance monitoring system.

## Table of Contents

- [Basic Setup](#basic-setup)
- [Tracking Web Vitals](#tracking-web-vitals)
- [Custom Operation Tracking](#custom-operation-tracking)
- [Image Load Tracking](#image-load-tracking)
- [Filter Performance](#filter-performance)
- [Lightbox Performance](#lightbox-performance)
- [Like Response Tracking](#like-response-tracking)
- [Using the Dashboard](#using-the-dashboard)
- [Regression Detection](#regression-detection)
- [Async Operation Tracking](#async-operation-tracking)

## Basic Setup

### 1. Import Performance Monitor

```typescript
import { perfMonitor } from '../utils/performanceMonitor'
```

### 2. Start Measuring an Operation

```typescript
// Mark the start of an operation
perfMonitor.mark('fetch-data-start')

// ... perform the operation ...
const response = await fetch('/api/data')
const data = await response.json()

// End and record the measurement
const metric = perfMonitor.measure('fetch-data', 'fetch-data-start')
console.log(`Fetch took ${metric.value}ms`)
```

## Tracking Web Vitals

### Automatic Tracking

```typescript
import { usePerformanceMetrics } from '../hooks/usePerformanceMetrics'

export const MyPage = () => {
  // Automatically tracks LCP, FID, CLS, TTFB, FCP
  usePerformanceMetrics()

  return <div>My Page</div>
}
```

### Manual Web Vital Tracking

```typescript
import { usePerformanceMetrics } from '../hooks/usePerformanceMetrics'

export const GalleryPage = () => {
  const vitals = usePerformanceMetrics()

  useEffect(() => {
    // Check vitals after page load
    if (vitals.lcp) {
      console.log(`LCP: ${vitals.lcp}ms`)
    }
  }, [vitals])

  return <div>Gallery</div>
}
```

## Custom Operation Tracking

### Using the Performance Monitor Directly

```typescript
import { perfMonitor } from '../utils/performanceMonitor'

export const handleSearch = async (query: string) => {
  perfMonitor.mark('search-start')

  try {
    const results = await searchAPI(query)

    const metric = perfMonitor.measure('search-execution', 'search-start')
    if (metric.value > 500) {
      console.warn('Slow search:', metric.value)
    }

    return results
  } catch (error) {
    perfMonitor.measure('search-error', 'search-start')
    throw error
  }
}
```

### Using the Performance Operation Hook

```typescript
import { usePerformanceOperation } from '../hooks/usePerformanceMetrics'

export const SearchComponent = () => {
  const searchOperation = usePerformanceOperation('search-execution')

  const handleSearch = async () => {
    searchOperation.start()

    try {
      const results = await searchAPI(query)
      searchOperation.end({ resultCount: results.length })
      return results
    } catch (error) {
      searchOperation.end({ error: 'failed' })
      throw error
    }
  }

  return <button onClick={handleSearch}>Search</button>
}
```

### Async Operation Tracking

```typescript
import { usePerformanceOperation } from '../hooks/usePerformanceMetrics'

export const DataLoader = () => {
  const loadOperation = usePerformanceOperation('data-load')

  const loadData = async (id: string) => {
    // Wraps async operation with automatic timing
    const data = await loadOperation.measure(
      async () => {
        const response = await fetch(`/api/data/${id}`)
        return response.json()
      },
      { dataId: id }
    )

    return data
  }

  return <button onClick={() => loadData('123')}>Load</button>
}
```

## Image Load Tracking

### Manual Image Load Tracking

```typescript
import { perfMonitor } from '../utils/performanceMonitor'

export const loadOptimizedImage = async (url: string) => {
  const startTime = performance.now()

  const img = new Image()

  img.onload = () => {
    const duration = performance.now() - startTime
    perfMonitor.trackImageLoad(url, duration, {
      cached: false,
      width: img.width,
      height: img.height,
    })
  }

  img.onerror = () => {
    const duration = performance.now() - startTime
    perfMonitor.trackImageLoad(url, duration, { error: 'load_failed' })
  }

  img.src = url
}
```

### Tracking Cache Hits vs Misses

```typescript
import { perfMonitor } from '../utils/performanceMonitor'
import { imageCache } from '../utils/imageCache'

export const loadImageWithCache = async (url: string) => {
  const startTime = performance.now()

  try {
    const cached = await imageCache.get(url)
    if (cached) {
      const duration = performance.now() - startTime
      perfMonitor.trackImageLoad(url, duration, { cached: true })
      return cached
    }
  } catch (e) {
    // Continue to load from network
  }

  // Load from network...
  const duration = performance.now() - startTime
  perfMonitor.trackImageLoad(url, duration, { cached: false })
}
```

## Filter Performance

### Tracking Filter Apply Time

```typescript
import { perfMonitor } from '../utils/performanceMonitor'

export const applyFilters = (filters: FilterConfig) => {
  perfMonitor.mark('filter-apply-start')

  const startTime = performance.now()

  // Apply filters to data
  const filteredData = data.filter(item => {
    // Filter logic...
  })

  const duration = performance.now() - startTime
  perfMonitor.trackFilterApply(
    Object.keys(filters).length,
    duration
  )

  return filteredData
}
```

### Using React Query with Performance Tracking

```typescript
import { useQuery } from 'convex/react'
import { perfMonitor } from '../utils/performanceMonitor'

export const useFilteredGallery = (filters: GalleryFilters) => {
  const queryStart = performance.now()

  const result = useQuery(api.gallery.getFilteredGallery, filters)

  useEffect(() => {
    if (result) {
      const duration = performance.now() - queryStart
      perfMonitor.trackQueryFetch(
        'getFilteredGallery',
        duration,
        result.items?.length
      )
    }
  }, [result])

  return result
}
```

## Lightbox Performance

### Tracking Lightbox Open

```typescript
import { perfMonitor } from '../utils/performanceMonitor'
import { useState } from 'react'

export const useLightbox = (items: GalleryItem[]) => {
  const [isOpen, setIsOpen] = useState(false)

  const open = (index: number) => {
    perfMonitor.mark('lightbox-open')

    setIsOpen(true)
    setCurrentIndex(index)

    // Measure after render
    setTimeout(() => {
      const metric = perfMonitor.measure('lightbox-open', 'lightbox-open')
      perfMonitor.trackLightboxOpen(metric.value)
    }, 0)
  }

  return { isOpen, open }
}
```

### Tracking Image Change in Lightbox

```typescript
import { perfMonitor } from '../utils/performanceMonitor'

export const Lightbox = ({ items, currentIndex, onNext }) => {
  const handleNext = () => {
    perfMonitor.mark('lightbox-image-change')

    onNext()

    setTimeout(() => {
      perfMonitor.measure('lightbox-image-change', 'lightbox-image-change')
    }, 0)
  }

  return <div>...</div>
}
```

## Like Response Tracking

### Tracking Like Operations

```typescript
import { perfMonitor } from '../utils/performanceMonitor'

export const handleLike = async (contentId: string) => {
  const startTime = performance.now()

  try {
    await likeAPI(contentId)

    const duration = performance.now() - startTime
    perfMonitor.trackLikeResponse(duration, true)
  } catch (error) {
    const duration = performance.now() - startTime
    perfMonitor.trackLikeResponse(duration, false)
    throw error
  }
}
```

### Integrated with Optimistic Updates

```typescript
import { perfMonitor } from '../utils/performanceMonitor'

export const LikeButton = ({ isLiked, onToggle }) => {
  const handleClick = async () => {
    const startTime = performance.now()

    // Optimistic update
    onToggle()

    try {
      await likeAPI()
      const duration = performance.now() - startTime
      perfMonitor.trackLikeResponse(duration, true)
    } catch (error) {
      // Rollback
      onToggle()

      const duration = performance.now() - startTime
      perfMonitor.trackLikeResponse(duration, false)
    }
  }

  return <button onClick={handleClick}>Like</button>
}
```

## Using the Dashboard

### Adding Performance Dashboard Button

```typescript
import { useState } from 'react'
import { Activity } from 'lucide-react'
import { PerformanceDashboard } from '../components/Performance/PerformanceDashboard'

export const GalleryPage = () => {
  const [showPerfDashboard, setShowPerfDashboard] = useState(false)

  return (
    <div>
      {/* Header with performance button */}
      <header>
        <h1>Gallery</h1>
        {process.env.NODE_ENV === 'development' && (
          <button onClick={() => setShowPerfDashboard(true)}>
            <Activity className="w-5 h-5" />
          </button>
        )}
      </header>

      {/* Performance Dashboard */}
      <PerformanceDashboard
        isOpen={showPerfDashboard}
        onClose={() => setShowPerfDashboard(false)}
      />

      {/* Gallery content */}
      <GalleryContent />
    </div>
  )
}
```

### Console Shortcut for Performance Report

```typescript
// Press Ctrl/Cmd + Shift + P to view report in console

// Or manually:
console.table(window.__perfMonitor.getReport().summary)

// Get full report:
const report = window.__perfMonitor.getReport()
console.log(report)
```

## Regression Detection

### Setting Baselines

```typescript
import { perfMonitor } from '../utils/performanceMonitor'

// Set baseline after first page load
useEffect(() => {
  const firstLoadTime = measureFirstLoad()
  perfMonitor.setBaseline('page-load', firstLoadTime)
}, [])

// Set baseline for specific operation
const handleSearch = async (query: string) => {
  const result = await searchAPI(query)
  const duration = performance.now() - startTime

  // Only set baseline if not already set
  if (!perfMonitor.getBaseline('search')) {
    perfMonitor.setBaseline('search', duration)
  }

  return result
}
```

### Automatic Regression Alerts

```typescript
import { usePerformanceRegression } from '../hooks/usePerformanceMetrics'

export const DataComponent = () => {
  const { compare } = usePerformanceRegression()

  const loadData = async () => {
    const startTime = performance.now()
    const data = await fetchData()
    const duration = performance.now() - startTime

    // Check for regression
    const hasRegression = compare('data-load', duration)

    if (hasRegression) {
      console.warn('Performance regression detected!')
    }

    return data
  }

  return <div>...</div>
}
```

## Async Operation Tracking

### Tracking Multiple Async Operations

```typescript
import { usePerformanceOperation } from '../hooks/usePerformanceMetrics'

export const DataLoader = () => {
  const loadUserOperation = usePerformanceOperation('load-user')
  const loadPostsOperation = usePerformanceOperation('load-posts')

  const loadData = async () => {
    const [user, posts] = await Promise.all([
      loadUserOperation.measure(() => fetchUser()),
      loadPostsOperation.measure(() => fetchPosts()),
    ])

    return { user, posts }
  }

  return <button onClick={loadData}>Load Data</button>
}
```

### Chained Operations

```typescript
import { perfMonitor } from '../utils/performanceMonitor'

export const processWorkflow = async () => {
  perfMonitor.mark('workflow-start')

  // Step 1
  const step1Start = performance.now()
  await validateInput()
  perfMonitor.trackOperation('workflow-step1', performance.now() - step1Start)

  // Step 2
  const step2Start = performance.now()
  const result = await processData()
  perfMonitor.trackOperation('workflow-step2', performance.now() - step2Start)

  // Total time
  const totalDuration = perfMonitor.measure('workflow-total', 'workflow-start')
  console.log(`Workflow completed in ${totalDuration.value}ms`)

  return result
}
```

## Advanced Examples

### Tracking Scroll Performance

```typescript
import { perfMonitor } from '../utils/performanceMonitor'
import { useRef } from 'react'

export const VirtualizedList = ({ items }) => {
  const renderStartTime = useRef(0)

  const handleScroll = () => {
    renderStartTime.current = performance.now()
  }

  const renderItems = (visibleItems) => {
    const duration = performance.now() - renderStartTime.current
    perfMonitor.trackScrollRender(duration, visibleItems.length)

    return visibleItems.map(item => <Item key={item.id} {...item} />)
  }

  return (
    <div onScroll={handleScroll}>
      {renderItems(getVisibleItems())}
    </div>
  )
}
```

### Tracking Form Submission

```typescript
import { perfMonitor } from '../utils/performanceMonitor'

export const useFormSubmission = () => {
  const handleSubmit = async (formData: FormData) => {
    perfMonitor.mark('form-submit-start')

    try {
      // Validate
      perfMonitor.measure('form-validation', 'form-submit-start')
      perfMonitor.mark('form-submit-start') // Reset for actual submit

      // Submit
      const result = await submitForm(formData)
      const metric = perfMonitor.measure('form-submit', 'form-submit-start')

      if (metric.value > 2000) {
        console.warn('Slow form submission:', metric.value)
      }

      return result
    } catch (error) {
      perfMonitor.measure('form-error', 'form-submit-start')
      throw error
    }
  }

  return { handleSubmit }
}
```

### Tracking Animation Performance

```typescript
import { perfMonitor } from '../utils/performanceMonitor'

export const AnimatedComponent = () => {
  const handleAnimationStart = () => {
    perfMonitor.mark('animation-start')
  }

  const handleAnimationEnd = () => {
    const metric = perfMonitor.measure('animation-duration', 'animation-start')
    perfMonitor.trackOperation('animation', metric.value, {
      smooth: metric.value < 16.67, // 60fps threshold
    })
  }

  return (
    <div
      onAnimationStart={handleAnimationStart}
      onAnimationEnd={handleAnimationEnd}
      className="animate-fade"
    >
      Content
    </div>
  )
}
```

## Best Practices Summary

1. **Always mark before measuring**
   ```typescript
   perfMonitor.mark('start')
   // ... work ...
   perfMonitor.measure('name', 'start')
   ```

2. **Use hooks for component-level tracking**
   ```typescript
   usePerformanceMetrics() // Auto-track Web Vitals
   const operation = usePerformanceOperation('name')
   ```

3. **Track context for better insights**
   ```typescript
   perfMonitor.trackImageLoad(url, duration, {
     cached: true,
     size: 12345,
     format: 'webp'
   })
   ```

4. **Handle errors in tracking**
   ```typescript
   try {
     await operation.measure(async () => { ... })
   } catch (error) {
     // Error is automatically tracked
   }
   ```

5. **Set realistic baselines**
   ```typescript
   if (!perfMonitor.getBaseline('operation')) {
     perfMonitor.setBaseline('operation', duration)
   }
   ```

6. **Use the dashboard for real-time monitoring**
   ```typescript
   // Development only
   <PerformanceDashboard isOpen={isOpen} onClose={onClose} />
   ```

7. **Export metrics for analysis**
   ```typescript
   const data = perfMonitor.export()
   // Download or send to analytics service
   ```

8. **Clear metrics periodically to avoid memory issues**
   ```typescript
   perfMonitor.clear()
   ```
