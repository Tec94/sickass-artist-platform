# Documentation

Complete documentation for the Sickass Artist Platform.

## Features

### Core Features
- **[Analytics](./analytics.md)** - Privacy-first analytics with event tracking and consent management
- **[Offline Support](./offline.md)** - Service worker, offline queue, and conflict resolution
- **[Loading Skeletons](./skeletons.md)** - Zero-CLS skeleton system with shimmer animations
- **[Performance](./performance.md)** - Core Web Vitals tracking and monitoring
- **[Optimistic Updates](./optimistic.md)** - Optimistic UI for likes and interactions
- **[Search & Discovery](./search.md)** - Search functionality and trending content
- **[Points System](./points.md)** - Gamification and user rewards
- **[Project History](./history.md)** - Major implementation milestones

### Content Features
- **[Gallery](./gallery.md)** - Media gallery with lightbox and image optimization
- **[Merchandise](./merch.md)** - E-commerce system, cart, and orders

## Schema Documentation

All database schema docs are in `schema/` subfolder:

- **[Core Schema](./schema/core.md)** - Users, channels, messages, forum
- **[Events Schema](./schema/events.md)** - Events, venues, RSVPs, ticketing
- **[Gallery Schema](./schema/gallery.md)** - Gallery content and UGC
- **[Merch Schema](./schema/merch.md)** - Products, variants, cart, orders
- **[Error Mitigations](./schema/error-mitigations.md)** - Error handling strategies

## Quick Start

### New Developers
1. Review [Core Schema](./schema/core.md) for database structure
2. Check [Performance](./performance.md) for monitoring setup
3. See [Analytics](./analytics.md) for event tracking

### Common Tasks
- **Add feature tracking** → [Analytics](./analytics.md)
- **Optimize performance** → [Performance](./performance.md)
- **Handle offline** → [Offline](./offline.md)
- **Implement loading states** → [Skeletons](./skeletons.md)

## File Organization

```
docs/
├── README.md (this file)
├── analytics.md
├── gallery.md
├── history.md
├── merch.md
├── merch-seed.ts
├── offline.md
├── optimistic.md
├── performance.md
├── points.md
├── search.md
├── skeletons.md
└── schema/
    ├── core.md
    ├── error-mitigations.md
    ├── events.md
    ├── gallery.md
    └── merch.md

## Contributing

When adding documentation:
1. Place implementation guides in `docs/`
2. Place schema documentation in `docs/schema/`
3. Use lowercase-with-hyphens for filenames (e.g., `my-feature.md`)
4. Update this README with links to new docs
5. Include code examples and usage patterns
6. Keep docs concise but comprehensive

## Notes

- All schemas use Convex backend
- Performance targets documented in respective feature docs
- Seed data for development/testing only
- All timestamps in UTC milliseconds
