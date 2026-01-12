# Gallery Features

Advanced media gallery with lightbox, filtering, and performance optimizations.

## Core Components

### 1. Lightbox (`<LightboxContainer />`)
Full-screen viewer with keyboard shortcuts (`←/→`, `ESC`, `+/-`), touch gestures, and metadata sidebar. Performance-tuned with image preloading.

### 2. Filtering (`<AdvancedFilters />`)
URL-driven system (`?types=show&date=30d`) with debounced (300ms) queries and mobile-responsive filter modal.

### 3. Image Optimization (`<OptimizedImage />`)
Responsive images with:
- **LQIP:** Blur-up placeholders.
- **WebP:** Modern format with JPEG fallback.
- **Caching:** IndexedDB persistence with 7-day TTL.

### 4. Interactions
- **Optimistic Likes:** Instant UI feedback with background sync and offline support.
- **Recommendations:** Weighted algorithm (Creator 50%, Tags 30%) with in-memory caching.

## Developer Tools
- **Performance:** Integrated Web Vitals and operation tracking.
- **Shortcuts:** `Ctrl+Shift+P` to view performance report.
- **Testing:** `npm test` for unit/integration; `npm run test:e2e` for user flows.
