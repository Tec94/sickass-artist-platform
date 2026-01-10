# Trending Algorithm

Precomputed trending algorithm with hourly refresh for optimal performance.

## Algorithm Formula

```
trendingScore = engagementScore × recencyFactor

engagementScore = (likes × 2) + (views × 0.5) + (comments × 1.5)
recencyFactor = 1 / (1 + daysOld / 7)
```

- **7-day half-life**: Content loses 50% trending relevance every 7 days
- **Engagement weighting**: Likes 2x, views 0.5x, comments 1.5x
- **Recency decay**: Older content naturally deprioritizes

### Example Calculation

Content with 100 likes, 1000 views, 10 comments, created 7 days ago:
```
engagementScore = (100 × 2) + (1000 × 0.5) + (10 × 1.5) = 715
recencyFactor = 1 / (1 + 7 / 7) = 0.5
trendingScore = 715 × 0.5 = 357.5
```

## Database Schema

### trendingScores Table
- `contentId`, `contentType` - Content reference
- `trendingScore` - Final score for sorting
- `recencyFactor`, `engagementScore` - Component scores
- `likeCount`, `viewCount`, `commentCount` - Engagement metrics
- `createdAt`, `computedAt` - Timestamps

**Indexes:**
- `by_content_type`: [contentType, trendingScore] - Filtering and sorting
- `by_contentId`: [contentId, contentType] - Score lookups

## API Functions

### Mutations

```typescript
// Refresh all scores (scheduled hourly)
await convex.mutation(api.trending.refreshTrendingScores, {})
// Returns: { totalUpdated, galleryUpdated, ugcUpdated, computedAt }

// Refresh specific content (manual/immediate)
await convex.mutation(api.trending.refreshContentScore, {
  contentId: 'abc123',
  contentType: 'gallery'
})
```

### Queries

```typescript
// Get trending content with filters
const result = await convex.query(api.recommendations.getTrendingContent, {
  category: 'all',        // 'all' | 'gallery' | 'ugc'
  dateRange: '7d',        // '7d' | '30d' | '90d' | 'all'
  tierFilter: 'bronze',   // tier or undefined
  sortBy: 'trending',     // 'trending' | 'newest' | 'mostLiked' | 'mostViewed'
  page: 0,
  pageSize: 12
})

// Get refresh metadata
const { lastComputedAt, scoreCount } = await convex.query(
  api.trending.getLastTrendingUpdate, 
  {}
)
```

## Scheduled Refresh

### Convex Cron Setup

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server"
import { api } from "./_generated/api"

export const cronJob = cronJobs({
  refreshTrendingScores: {
    handler: api.trending.refreshTrendingScores,
    interval: "1 hour"
  }
})
```

## Performance

### Before (Real-time)
- O(n) score calculation per query
- 10,000 items × 1000 queries/hour = 10M calculations

### After (Precomputed)
- O(1) score lookup per query
- 10,000 items × 1 batch/hour = 10K calculations
- **99.9% reduction** in computation time

## Staleness

- Scores at most 1 hour stale (hourly refresh)
- Like/unlike operations call `refreshContentScore` for immediate updates
- `computedAt` field tracks last calculation time

## Integration

Like/unlike mutations in `convex/gallery.ts` and `convex/ugc.ts` automatically refresh trending scores after operations.

## Future Enhancements

- Comment count integration
- Personalized trending based on user preferences
- A/B testing of engagement weights
- Machine learning for engagement prediction
