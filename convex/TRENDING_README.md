# Trending Algorithm Implementation

This document describes the trending algorithm implementation with precomputed scores and hourly refresh.

## Overview

The trending algorithm uses precomputed scores stored in the `trendingScores` table, which are refreshed hourly by a scheduled job. This approach provides better performance compared to real-time score calculation on every query.

## Architecture

### Components

1. **trendingScores Table** - Stores precomputed trending scores
2. **refreshTrendingScores Mutation** - Scheduled job that recalculates scores hourly
3. **getTrendingContent Query** - Reads from precomputed scores
4. **refreshContentScore Mutation** - Manually refresh a specific content's score

## Algorithm

### Trending Score Formula

```
trendingScore = engagementScore × recencyFactor

engagementScore = (likes × 2) + (views × 0.5) + (comments × 1.5)
recencyFactor = 1 / (1 + daysOld / 7)
```

- **7-day half-life**: Content loses trending relevance over time
- **Engagement weighting**: Likes are worth 4x views, comments are worth 3x likes
- **Recency decay**: Older content naturally deprioritizes

### Score Calculation Example

For content with:
- 100 likes
- 1000 views
- 10 comments
- Created 7 days ago

```
engagementScore = (100 × 2) + (1000 × 0.5) + (10 × 1.5)
                = 200 + 500 + 15
                = 715

recencyFactor = 1 / (1 + 7 / 7)
              = 1 / (1 + 1)
              = 1 / 2
              = 0.5

trendingScore = 715 × 0.5 = 357.5
```

## Database Schema

### trendingScores Table

```typescript
{
  contentId: string,           // galleryContent.contentId or ugcContent.ugcId
  contentType: 'gallery' | 'ugc',
  trendingScore: number,       // Final score for sorting
  recencyFactor: number,       // Time-based decay factor (0-1)
  engagementScore: number,     // Raw engagement score
  likeCount: number,           // Like count at computation time
  viewCount: number,           // View count at computation time
  commentCount: number,        // Comment count (TODO: implement)
  createdAt: number,           // When content was created
  computedAt: number,          // When score was computed (for staleness check)
}
```

### Indexes

- `by_content_type`: [contentType, trendingScore] - For efficient filtering and sorting
- `by_contentId`: [contentId, contentType] - For score lookups by content

## API Functions

### Mutations

#### `refreshTrendingScores`

Refreshes trending scores for all gallery and approved UGC content.

```typescript
const result = await convex.mutation(api.trending.refreshTrendingScores, {})
// Returns: { totalUpdated, galleryUpdated, ugcUpdated, computedAt, errors? }
```

**Use Case**: Called on schedule (every hour) to keep scores fresh.

#### `refreshContentScore`

Manually refresh a specific content's trending score.

```typescript
const result = await convex.mutation(api.trending.refreshContentScore, {
  contentId: 'abc123',
  contentType: 'gallery'
})
// Returns: { success, contentId, contentType, trendingScore, computedAt }
```

**Use Case**: Call after updating likes/views to immediately reflect changes without waiting for hourly refresh.

### Queries

#### `getTrendingContent`

Get trending content with filtering and pagination.

```typescript
const result = await convex.query(api.recommendations.getTrendingContent, {
  category: 'all',        // 'all' | 'gallery' | 'ugc'
  dateRange: '7d',        // '7d' | '30d' | '90d' | 'all'
  tierFilter: 'bronze',   // 'bronze' | 'silver' | 'gold' | 'platinum' | undefined
  sortBy: 'trending',     // 'trending' | 'newest' | 'mostLiked' | 'mostViewed'
  page: 0,
  pageSize: 12
})
// Returns: { items, hasMore, totalCount, page }
```

#### `getLastTrendingUpdate`

Get metadata about last trending score refresh.

```typescript
const result = await convex.query(api.trending.getLastTrendingUpdate, {})
// Returns: { lastComputedAt, scoreCount }
```

**Use Case**: Monitor staleness of cached scores.

## Scheduled Refresh

### Convex Cron Setup

To enable hourly refresh, add this to your Convex configuration:

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

export const cronJob = cronJobs({
  refreshTrendingScores: {
    handler: api.trending.refreshTrendingScores,
    interval: "1 hour", // Refresh every hour
  },
});
```

### Staleness Considerations

- Scores are at most 1 hour stale (due to hourly refresh)
- Use `refreshContentScore` for immediate updates after content changes
- The `computedAt` field tracks when each score was last calculated

## Performance Benefits

### Before (Real-time Calculation)

- Query: O(n) score calculation for all items
- Each query calculates trending scores for N items
- Formula computation per item: O(1) but repeated on every request
- Total: O(n) per query

### After (Precomputed Scores)

- Write: O(n) score calculation once per hour (batch job)
- Query: O(1) score lookup from index
- Total: O(1) per query (amortized)

### Real-world Impact

Assume:
- 10,000 content items
- 1000 queries per hour
- Score calculation cost: 1ms per item

**Before:**
- Hourly cost: 10,000 items × 1000 queries × 1ms = 10,000,000ms (2.8 hours)

**After:**
- Hourly cost: 10,000 items × 1 batch × 1ms = 10,000ms (2.8 seconds)
- **99.9% reduction** in computation time

## Filter Implementation

All filters work with precomputed scores:

1. **Category Filter**: Applied at query time via `by_content_type` index
2. **Date Range Filter**: Filters scores by `createdAt` timestamp
3. **Tier Filter**: Applied after fetching content to check tier requirements
4. **Sort Modes**: Uses precomputed scores or other fields

## Future Enhancements

### Comment Integration

When a comments table is added:

```typescript
// Update trending.ts
async function getCommentCount(contentId: string, contentType: string) {
  const comments = await ctx.db
    .query('comments')
    .withIndex('by_content', (q) =>
      q.eq('contentId', contentId).eq('contentType', contentType)
    )
    .collect()
  return comments.length
}
```

### Additional Metrics

Consider adding to the formula:
- Shares/downloads count
- Click-through rate
- User interaction depth
- Time spent viewing

### Personalization

Add user-specific factors:
- User's engagement history
- Followed creators
- Similar content preferences

## Monitoring

### Key Metrics to Track

- Score staleness (time since `computedAt`)
- Number of items without scores
- Refresh job execution time
- Error rates in refresh job
- Query performance vs. real-time calculation

### Alerts

- Refresh job fails or takes > 5 minutes
- More than 5% of content missing scores
- Scores are > 2 hours stale

## Testing

### Unit Tests

```typescript
// Test score calculation
const { trendingScore, recencyFactor, engagementScore } =
  calculateTrendingScore(100, 1000, 10, Date.now() - 7 * 24 * 60 * 60 * 1000, Date.now())

assert(trendingScore === 357.5)
assert(recencyFactor === 0.5)
assert(engagementScore === 715)
```

### Integration Tests

- Verify refresh job updates all scores
- Verify filters work correctly with precomputed scores
- Verify manual refresh works for specific content
- Verify pagination respects sorted order

## Troubleshooting

### Scores Not Updating

1. Check if cron job is scheduled and running
2. Check `getLastTrendingUpdate` for staleness
3. Check logs for errors in refresh job
4. Manually trigger `refreshTrendingScores`

### Stale Scores

1. Check `computedAt` timestamp on scores
2. Verify cron job interval
3. Consider calling `refreshContentScore` for hot content

### Missing Scores

1. Check if content is approved (UGC only)
2. Verify content exists in source tables
3. Check for errors in refresh job logs
4. Manually call `refreshContentScore` for missing items

## Related Files

- `convex/schema.ts` - Trending scores table definition
- `convex/trending.ts` - Score calculation and refresh logic
- `convex/recommendations.ts` - Trending content queries
- `convex/helpers.ts` - Utility functions (getTierLevel)

## References

- Original Ticket: A5 - Implement Trending Algorithm in Convex (REVISED)
- Algorithm Formula: (likes × 2 + views × 0.5 + comments × 1.5) × recencyFactor
- Recency Decay: 7-day half-life (1 / (1 + daysOld / 7))
