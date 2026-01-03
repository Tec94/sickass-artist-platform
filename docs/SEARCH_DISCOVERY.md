# Search & Discovery Guide

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+K` / `Ctrl+K` | Open/Close search modal |
| `↑` / `↓` | Navigate search results |
| `Tab` | Switch result filter tabs |
| `Shift+Tab` | Switch tabs backwards |
| `Enter` | Select highlighted result |
| `ESC` | Close search modal |

## Trending Algorithm

The explore page uses a weighted trending formula to surface engaging content:

**Formula:**
`TRENDING_SCORE = (likeCount × 2 + viewCount × 0.5 + commentCount × 1.5) × RECENCY_FACTOR`

**Recency Factor:**
`RECENCY_FACTOR = 1 / (1 + daysOld / 7)`

This implements a **7-day half-life** approach where:
- Content from today: 100% score
- Content from 7 days ago: 50% score
- Content from 14 days ago: 33.3% score

This balances freshness with evergreen content, ensuring new popular items rise quickly while established content remains visible if it continues to gather engagement.

## Performance

All features optimized for responsiveness:

- **Search debounce**: 300ms to minimize unnecessary API calls
- **Infinite scroll**: Cursor-based pagination for < 500ms page loads
- **Modal open**: Near-instant (< 100ms) transition
- **Trending calculation**: Precomputed and stored for O(1) retrieval

## Accessibility

- ✅ **Keyboard-only navigation**: Full support for navigating results and tabs using keyboard.
- ✅ **ARIA labels**: Proper labeling on all interactive elements for screen readers.
- ✅ **Focus trap**: Modal maintains focus within its boundaries when open.
- ✅ **Visual indicators**: Clear high-contrast styling for selected search results.
- ✅ **Screen reader support**: Uses semantic HTML and ARIA roles.

## Error Handling

### Search Timeout
- If search takes too long, the UI provides feedback.
- User can retry the search.

### No Results
- Shows a clear "No results found" message.
- Suggests adjusting search terms or browsing recently active content.

### Network Error
- Shows a user-friendly error message with a "Try again" button.
- Maintains the current search state so the user doesn't lose their query.

### localStorage Unavailable
- If `localStorage` is disabled or full, the feature gracefully falls back to in-memory storage.
- Recent searches will not persist across sessions, but no errors are shown to the user.
