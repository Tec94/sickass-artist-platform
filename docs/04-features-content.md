# Content Features

Gallery, search, discovery, and trending content features.

---

## Gallery

Advanced media gallery with lightbox, filtering, and performance optimizations.

### Core Components

#### 1. Lightbox (`<LightboxContainer />`)
Full-screen viewer with:
- **Keyboard Shortcuts:** `←/→` (navigate), `ESC` (close), `+/-` (zoom)
- **Touch Gestures:** Swipe navigation, pinch-to-zoom
- **Metadata Sidebar:** Title, creator info, tags
- **Performance:** Image preloading for smooth navigation

#### 2. Filtering (`<AdvancedFilters />`)
URL-driven filtering system:
- **URL Params:** `?types=show&date=30d`
- **Debouncing:** 300ms delay for queries
- **Mobile:** Responsive filter modal

#### 3. Image Optimization (`<OptimizedImage />`)
Responsive images with:
- **LQIP:** Blur-up placeholders for perceived performance
- **WebP:** Modern format with JPEG fallback
- **Caching:** IndexedDB persistence with 7-day TTL

#### 4. Interactions
- **Optimistic Likes:** Instant UI feedback with background sync
- **Recommendations:** Weighted algorithm (Creator 50%, Tags 30%)
- **In-Memory Caching:** For recommendations

### Developer Tools
- **Performance:** Integrated Web Vitals and operation tracking
- **Shortcuts:** `Ctrl+Shift+P` to view performance report

### Files
- `src/pages/Gallery.tsx` - Main gallery page
- `src/components/Gallery/LightboxContainer.tsx` - Full-screen viewer
- `src/components/Gallery/AdvancedFilters.tsx` - Filter panel
- `src/components/Gallery/OptimizedImage.tsx` - Optimized image component
- `src/components/Gallery/LikeButton.tsx` - Like interaction

---

## Search & Discovery

User exploration tools including global search and discovery features.

### Global Search (`Ctrl+K`)

**Features:**
- **Keyboard Navigation:** `↑/↓` (nav), `Tab` (tabs), `Enter` (select)
- **Debouncing:** 300ms delay to minimize API overhead
- **Focus Management:** Focus-trapped modal for accessibility
- **Multi-Tab:** Search across gallery, forum, events, merch

**Implementation:**
```typescript
// Search modal opens with Ctrl+K / Cmd+K
// Uses URL state for search persistence
// Results grouped by content type
```

### Performance
- **Precomputed Scores:** Trending scores precalculated for O(1) query
- **Infinite Scroll:** Cursor-based pagination for fluid browsing
- **Failsafe:** Graceful fallback to in-memory storage if localStorage unavailable

### Best Practices
- Use semantic HTML and ARIA labels for search results
- Provide clear "No results" states with helpful suggestions
- Ensure search modal opens near-instant (< 100ms)

---

## Trending Algorithm

Precomputed trending algorithm with hourly refresh for optimal performance.

### Algorithm Formula

```
trendingScore = engagementScore × recencyFactor

engagementScore = (likes × 2) + (views × 0.5) + (comments × 1.5)
recencyFactor = 1 / (1 + daysOld / 7)
```

**Key Properties:**
- **7-day half-life:** Content loses 50% relevance every 7 days
- **Engagement weighting:** Likes 2x, views 0.5x, comments 1.5x
- **Recency decay:** Older content naturally deprioritizes

### Example Calculation

Content with 100 likes, 1000 views, 10 comments, created 7 days ago:
```
engagementScore = (100 × 2) + (1000 × 0.5) + (10 × 1.5) = 715
recencyFactor = 1 / (1 + 7 / 7) = 0.5
trendingScore = 715 × 0.5 = 357.5
```

### API Functions

**Get Trending Content:**
```typescript
const result = await convex.query(api.recommendations.getTrendingContent, {
  category: 'all',        // 'all' | 'gallery' | 'ugc'
  dateRange: '7d',        // '7d' | '30d' | '90d' | 'all'
  tierFilter: 'bronze',   // tier or undefined
  sortBy: 'trending',     // 'trending' | 'newest' | 'mostLiked' | 'mostViewed'
  page: 0,
  pageSize: 12
})
```

**Refresh Scores (Manual):**
```typescript
// Refresh specific content immediately
await convex.mutation(api.trending.refreshContentScore, {
  contentId: 'abc123',
  contentType: 'gallery'
})
```

### Scheduled Refresh

```typescript
// convex/crons.ts
export const cronJob = cronJobs({
  refreshTrendingScores: {
    handler: api.trending.refreshTrendingScores,
    interval: "1 hour"
  }
})
```

### Performance Comparison

| Approach | Calculation Load |
|----------|------------------|
| **Before (Real-time)** | 10,000 items × 1000 queries/hour = 10M calculations |
| **After (Precomputed)** | 10,000 items × 1 batch/hour = 10K calculations |
| **Improvement** | **99.9% reduction** |

### Integration
Like/unlike mutations in `convex/gallery.ts` and `convex/ugc.ts` automatically refresh trending scores after operations for immediate updates.

### Staleness
- Scores at most 1 hour stale (hourly refresh)
- `computedAt` field tracks last calculation time
- Critical operations trigger immediate refresh

---

## Recommendations

Content recommendation system for personalized discovery.

### Algorithm Weights

| Factor | Weight | Description |
|--------|--------|-------------|
| Same Creator | 50% | Content from same artist |
| Matching Tags | 30% | Shared tags with viewed content |
| Similar Engagement | 10% | Similar like/view ratios |
| Recency | 10% | Newer content preferred |

### Implementation

```typescript
import { useRecommendations } from '../hooks/useRecommendations'

const { recommendations, isLoading } = useRecommendations(
  currentContentId,
  currentContentType
)
```

### Caching
- **In-Memory Cache:** Recommendations cached per content item
- **TTL:** 5 minutes before refresh
- **Invalidation:** On new likes/interactions

### Files
- `src/hooks/useRecommendations.ts` - Recommendation hook
- `convex/recommendations.ts` - Backend recommendation logic
