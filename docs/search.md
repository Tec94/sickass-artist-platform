# Search & Discovery

Search functionality and content discovery features.

## Search Implementation

Full-text search with Convex SearchIndex.

```typescript
const results = await ctx.db
  .query('events')
  .withSearchIndex('search_events', q => 
    q.search('searchText', query)
      .eq('saleStatus', 'on_sale')
      .eq('city', city)
  )
  .take(50)
```

## Features

- Full-text search across titles, descriptions, and metadata
- Filter by status, category, city, tags
- Result pagination (50 max per query)
- Relevance scoring
- Search highlighting (client-side)

## Searchable Content

-Events**: title + venue name + city
- **Gallery**: title + creator + tags
- **Merch**: product name + description + tags
- **Forum**: thread title + content preview

## Performance

- Search query: <500ms
- Results limited to 100 items
- Caching for popular searches
- Skeleton loading states

## Discovery Features

- **Trending content**: Based on engagement score × recency
- **Related items**: Weighted recommendation algorithm
- **Creator portfolios**: All content by creator
- **Tag-based discovery**: Browse by tags

## Future Enhancements

- Typo tolerance / fuzzy matching
- Search suggestions
- Recent searches
- Algolia-style faceted search
- Advanced filters UI
