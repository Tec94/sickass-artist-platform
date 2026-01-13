# Documentation

Complete documentation for the Sickass Artist Platform.

---

## Quick Start

New to the project? Start here:

1. **[Getting Started](./01-getting-started.md)** - Setup, project structure, key patterns
2. **[Database Schema](./02-database-schema.md)** - Complete schema reference
3. **[Testing Guide](./06-testing-guide.md)** - Testing procedures

---

## Feature Documentation

### Core Infrastructure
**[03-features-core.md](./03-features-core.md)**
- Analytics & privacy-first tracking
- Offline support & service worker
- Loading skeletons (zero-CLS)
- Optimistic updates
- Performance monitoring

### Content & Discovery
**[04-features-content.md](./04-features-content.md)**
- Gallery & lightbox
- Search & discovery
- Trending algorithm
- Recommendations

### Commerce
**[05-features-commerce.md](./05-features-commerce.md)**
- Merchandise system
- Points & gamification
- Rewards redemption

---

## Common Tasks

| Task | Documentation |
|------|---------------|
| Add feature tracking | [Analytics](./03-features-core.md#analytics--privacy) |
| Optimize performance | [Performance](./03-features-core.md#performance-monitoring) |
| Handle offline | [Offline Support](./03-features-core.md#offline-support) |
| Implement loading states | [Skeletons](./03-features-core.md#loading-skeletons) |
| Add new database table | [Schema](./02-database-schema.md) |
| Run tests | [Testing Guide](./06-testing-guide.md) |

---

## Developer Tools

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Global search |
| `Ctrl+Shift+P` | Performance dashboard |

---

## File Structure

```
docs/
├── README.md              ← You are here
├── 01-getting-started.md  ← New developer onboarding
├── 02-database-schema.md  ← Complete schema reference
├── 03-features-core.md    ← Analytics, offline, skeletons, performance
├── 04-features-content.md ← Gallery, search, trending
├── 05-features-commerce.md← Merch, points, rewards
├── 06-testing-guide.md    ← Testing procedures
└── _seed-data.ts          ← Sample data for development
```

---

## Contributing

When adding documentation:
1. Add to the appropriate feature doc (03-06)
2. Update this README if adding new sections
3. Use lowercase-with-hyphens for filenames
4. Include code examples and usage patterns
5. Keep docs concise but comprehensive

---

## Technical Notes

- All schemas use Convex backend
- Performance targets documented in feature docs
- Seed data for development/testing only
- All timestamps in UTC milliseconds
