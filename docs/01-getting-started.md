# Getting Started

Quick start guide for new developers on the Sickass Artist Platform.

---

## Project Overview

A premium fan engagement platform with:
- **Chat & Forum** - Real-time communication with role/tier access control
- **Events & Ticketing** - Event management with virtual queue system
- **Gallery & UGC** - Media gallery with user-generated content
- **Merchandise** - Full e-commerce with cart and checkout
- **Points & Rewards** - Gamification system for engagement

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React, TypeScript, Vite |
| **Styling** | Custom CSS with dark theme |
| **Backend** | Convex (serverless functions + real-time DB) |
| **Auth** | Auth0 |
| **State** | React Context + Convex subscriptions |

---

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` with:
```env
VITE_CONVEX_DEPLOYMENT_URL=<your-convex-deployment-url>
VITE_AUTH0_DOMAIN=<your-auth0-domain>
VITE_AUTH0_CLIENT_ID=<your-auth0-client-id>
```

### 3. Start Development
```bash
# Start Convex backend
npx convex dev

# In another terminal, start frontend
npm run dev
```

---

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Admin/        # Admin panel components
│   ├── Dashboard/    # Dashboard widgets
│   ├── Gallery/      # Gallery components
│   ├── Merch/        # E-commerce components
│   └── ...
├── hooks/            # Custom React hooks
├── pages/            # Route components
├── styles/           # CSS files
├── utils/            # Utility functions
└── contexts/         # React contexts

convex/
├── schema.ts         # Database schema
├── chat.ts           # Chat mutations/queries
├── forum.ts          # Forum mutations/queries
├── events.ts         # Events mutations/queries
├── gallery.ts        # Gallery mutations/queries
├── merch.ts          # Merch mutations/queries
├── points.ts         # Points system
└── helpers.ts        # Shared utilities

docs/
├── README.md              # This file
├── 01-getting-started.md  # Quick start (you are here)
├── 02-database-schema.md  # Complete schema reference
├── 03-features-core.md    # Analytics, offline, performance
├── 04-features-content.md # Gallery, search, trending
├── 05-features-commerce.md # Merch, points, rewards
├── 06-testing-guide.md    # Testing procedures
└── _seed-data.ts          # Sample data for dev
```

---

## Key Patterns

### Convex Queries & Mutations

```typescript
// Query (reads data, real-time subscription)
import { useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'

const messages = useQuery(api.chat.getMessages, { channelId })

// Mutation (writes data)
import { useMutation } from 'convex/react'

const sendMessage = useMutation(api.chat.sendMessage)
await sendMessage({ channelId, content: "Hello!" })
```

### Access Control

```typescript
// Check role/tier access
import { canAccessChannel, isModerator } from './helpers'

// Role hierarchy: artist > admin > mod > crew > fan
// Tier hierarchy: platinum > gold > silver > bronze
```

### Optimistic Updates

```typescript
// Instant UI feedback with background sync
setLiked(true)
try {
  await likeMutation({ id })
} catch {
  setLiked(false) // Rollback on error
}
```

### Idempotency Keys

```typescript
// Prevent duplicate operations
const idempotencyKey = `thread-${threadId}`
await awardPoints({ idempotencyKey, ... })
```

---

## Common Tasks

### Add a New Page

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add to gear navigation if needed

### Add a Database Table

1. Define table in `convex/schema.ts`
2. Run `npx convex dev` to generate types
3. Create queries/mutations in `convex/`

### Track Analytics

```typescript
import { useAnalytics, trackCTA } from '../hooks/useAnalytics'

useAnalytics() // Auto page tracking
trackCTA('button_name', 'location')
```

### Add Loading State

```typescript
import { LoadingSkeleton } from '../components/LoadingSkeleton'

if (isLoading) return <LoadingSkeleton type="gallery" count={12} />
```

### Handle Offline

Operations are automatically queued via `useOfflineQueue` and synced when online.

---

## Development Tips

### Performance Dashboard
Press `Ctrl+Shift+P` on any page to view performance metrics.

### Global Search
Press `Ctrl+K` to open global search modal.

### Console Commands
```javascript
// Performance report
console.table(window.__perfMonitor.getReport().summary)

// Export metrics
window.__perfMonitor.export()
```

---

## Next Steps

1. **Schema Reference** → [02-database-schema.md](./02-database-schema.md)
2. **Core Features** → [03-features-core.md](./03-features-core.md)
3. **Content Features** → [04-features-content.md](./04-features-content.md)
4. **Commerce Features** → [05-features-commerce.md](./05-features-commerce.md)
5. **Testing Guide** → [06-testing-guide.md](./06-testing-guide.md)
