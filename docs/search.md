# Search & Discovery

User exploration tools including global search and trending content algorithms.

## Features

### Global Search (`Ctrl+K`)
- **Keyboard Navigation:** Full support for `↑/↓` (nav), `Tab` (tabs), and `Enter` (select).
- **Debouncing:** 300ms delay to minimize API overhead.
- **Focus Management:** Focus-trapped modal for accessibility.

### Trending Algorithm
Surfaces engaging content using a weighted formula with a **7-day half-life**.

```text
SCORE = (Likes × 2 + Views × 0.5 + Comments × 1.5) / (1 + DaysOld / 7)
```

## Performance
- **Precomputed Scores:** Trending scores are precalculated for O(1) query performance.
- **Infinite Scroll:** Cursor-based pagination for fluid browsing.
- **Failsafe:** Graceful fallback to in-memory storage if `localStorage` is unavailable.

## Best Practices
- Use semantic HTML and ARIA labels for search results.
- Provide clear "No results" states with helpful suggestions.
- Ensure the search modal is near-instant (< 100ms) to open.
