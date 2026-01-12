# Loading Skeletons

Zero-CLS skeleton system with shimmer animations for all content types.

## Core Features
- **Zero CLS:** Exact dimensions prevent layout shift during loading.
- **Shimmer:** Smooth 60fps GPU-accelerated CSS animations.
- **Timeout:** 5-second automatic timeout with retry/error state handling.
- **Responsive:** Mobile-first designs for all skeleton types.

## Skeleton Types

| Type | Specification | Default Count |
|------|---------------|---------------|
| `gallery` | Square (1:1), title, creator, stats | 4 |
| `forum` | Avatar (32x32), title (2 lines), preview (3 lines) | 5 |
| `product` | Portrait (3:4), name, price, rating | 12 |
| `chat` | Avatar, variable-width message bubble | 3 |

## Implementation

### Usage
```typescript
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { useQueryWithTimeout } from '../hooks/useQueryWithTimeout'

const { data, isLoading, timedOut, retry } = useQueryWithTimeout(
  api.gallery.getItems,
  { limit: 12 },
  { timeoutMs: 5000 }
)

if (isLoading) return <LoadingSkeleton type="gallery" count={12} />
```

## Accessibility
- **Reduced Motion:** Animation is disabled if `prefers-reduced-motion` is detected.
- **High Contrast:** Base colors adjust for high-contrast accessibility modes.
