# Loading Skeletons

Zero-CLS skeleton system with shimmer animations for all content types.

## System Architecture

- **Zero CLS**: Exact dimensions prevent layout shift
- **Shimmer**: Smooth 60fps GPU-accelerated animation
- **Timeout**: 5-second timeout with error state
- **Responsive**: Mobile-first responsive design

## Skeleton Types

### Gallery Skeleton
- Image: `aspect-ratio: 1/1` (square)
- Title, creator, stats (likes/views)
- Default count: 4 items

### Forum Skeleton
- Avatar: 32x32px circle
- Title: 2 lines
- Content: 3 lines preview
- Metadata: user + date
- Default count: 5 items

### Product Skeleton
- Image: `aspect-ratio: 3/4` (portrait)
- Name, price, rating stars
- Default count: 12 items

### Chat Skeleton
- Avatar: 32x32px
- Message bubble (variable width)
- Timestamp
- Default count: 3 items

## Implementation

### Files
- `src/components/LoadingSkeleton.tsx` - Generic wrapper
- `src/components/Skeletons/GallerySkeleton.tsx` - Gallery cards
- `src/components/Skeletons/ForumSkeleton.tsx` - Forum threads
- `src/components/Skeletons/ProductSkeleton.tsx` - Product cards
- `src/components/Skeletons/ChatSkeleton.tsx` - Chat messages
- `src/hooks/useQueryWithTimeout.ts` - Query timeout hook
- `src/styles/skeletons.css` - Shimmer CSS

### Usage

```typescript
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { useQueryWithTimeout } from '../hooks/useQueryWithTimeout'

function MyComponent() {
  const { data, isLoading, timedOut, retry } = useQueryWithTimeout(
    api.gallery.getItems,
    { limit: 12 },
    { timeoutMs: 5000 }
  )

  if (timedOut) {
    return <ErrorState onRetry={retry} message="Request timed out" />
  }

  if (isLoading) {
    return <LoadingSkeleton type="gallery" count={12} />
  }

  return <GalleryGrid items={data} />
}
```

## Performance

- **CLS**: 0.0 (measured with Web Vitals)
- **Animation**: 60fps GPU-accelerated
- **Memory**: Minimal (CSS-only animations)
- **Bundle Size**: < 5KB

### Optimizations
```css
.skeleton-element {
  will-change: background-position;
  backface-visibility: hidden;
  transform: translateZ(0);
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-element { animation: none; }
}
```

## Responsive Breakpoints

- **Desktop (1200px+)**: Gallery 4 cols, Products 6 cols
- **Tablet (768-1199px)**: Gallery 3 cols, Products 4 cols
- **Mobile (<768px)**: Gallery 2 cols, Products 3 cols

## Accessibility

- Respects `prefers-reduced-motion`
- High contrast mode support
- Proper ARIA labels where needed
