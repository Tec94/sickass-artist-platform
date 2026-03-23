# Database schema

> **Status:** Current website. This file is a domain-organized guide to the
> live Convex schema. The exhaustive source of truth is `convex/schema.ts`.

## Summary

Use this document to understand how the backend is organized today without
reading the entire schema file top to bottom. When you need exact field types,
validators, or index definitions, go directly to `convex/schema.ts`.

## How to use this guide

This guide is organized by product domain instead of dumping every field from
every table. That keeps the document readable while still mapping the current
schema structure.

Use it for:

- finding the right table family for a feature
- understanding major data relationships
- spotting queues, search indexes, and snapshot patterns

Use `convex/schema.ts` for:

- exact field names and validator shapes
- full index lists
- search index configuration
- implementation-level backend work

## Cross-cutting schema patterns

Several patterns show up across the schema and are worth knowing before you
read domain sections.

- `users.clerkId` is still the historical field name for the auth-provider
  subject, even though the current auth provider is Auth0.
- Snapshot fields are used heavily in community, event, and commerce flows to
  preserve display values after related records change.
- Queues are modeled explicitly for both events and merch drops.
- Search indexes exist on `events`, `merchProducts`, and `songSubmissions`.
- User-specific state is stored in several specialized tables instead of one
  generic settings record.

## Domain map

| Domain | Tables | Notes |
| --- | --- | --- |
| Identity and user state | `users`, `notifications`, `adminFeatureFlags`, `galleryViewPreferences`, `userChannelSettings`, `userChatSettings` | Auth-linked profiles, per-user state, and platform flags |
| Community and moderation | `channels`, `messages`, `reactions`, `messageVotes`, `categories`, `threads`, `replies`, `forumThreadBookmarks`, `userTypingIndicators`, `chatStickerPacks`, `chatStickers`, `chatServerSettings`, `moderationReports`, `moderationActions`, `moderationPolicy`, `userModerationStatus` | Chat, forum, bookmarks, and moderation controls |
| Content and discovery | `galleryContent`, `ugcContent`, `galleryLikes`, `trendingScores`, `phoneArtistContent` | Editorial media, UGC, discovery, and phone content seeds |
| Events and ticketing | `venues`, `events`, `eventTickets`, `userTickets`, `eventQueue`, `checkoutSessions` | Venue data, event inventory, queueing, and checkout throttling |
| Commerce | `merchProducts`, `merchImageManifest`, `merchVariants`, `merchCart`, `merchOrders`, `merchInventoryLog`, `merchDrops`, `merchDropQueueEntries`, `merchDropQueueSlots`, `inventoryAuditLog`, `merchWishlist`, `merchRecentlyViewed` | Store catalog, orders, queueing, and shopper state |
| Rewards and progression | `userRewards`, `pointTransactions`, `quests`, `questProgress`, `streakBonus`, `streakMilestones`, `userStreakMilestones`, `rewards`, `userRedemptions` | Points, quests, streaks, and redemption flows |
| Music and leaderboard | `songLeaderboard`, `leaderboardCache`, `songSubmissions`, `submissionVotes`, `spotifySongs` | Ranking, submission, and music metadata |
| Platform operations | `offlineQueue`, `analyticsEvents` | Sync resilience and analytics capture |

## Identity and user state

This domain anchors authentication, profile data, and per-user preferences.

- `users` stores the canonical profile, role, fan tier, social links, level,
  badges, and timestamps.
- `notifications` stores per-user notifications with unread access patterns.
- `galleryViewPreferences`, `userChannelSettings`, and `userChatSettings`
  store focused user preference state for specific product areas.
- `adminFeatureFlags` provides runtime flags that admin surfaces can read.

Start with `users` whenever a feature depends on identity, tier, or role.

## Community and moderation

This is the largest schema family and covers chat, forum, and governance.

- `channels`, `messages`, `reactions`, and `messageVotes` back chat behavior.
- `categories`, `threads`, `replies`, and `forumThreadBookmarks` back the
  forum.
- `userTypingIndicators` stores expiring typing state.
- `chatStickerPacks`, `chatStickers`, and `chatServerSettings` support richer
  chat behavior.
- `moderationReports`, `moderationActions`, `moderationPolicy`, and
  `userModerationStatus` support moderation workflows across content types.

This domain uses snapshot fields and denormalized counters heavily. Always
verify related mutation behavior before changing schema assumptions.

## Content and discovery

These tables support editorial content, UGC, and ranking-like discovery.

- `galleryContent` stores official media.
- `ugcContent` stores user-generated submissions and approval state.
- `galleryLikes` stores per-user like state keyed by content and type.
- `trendingScores` stores precomputed discovery signals.
- `phoneArtistContent` stores content prepared for the dormant phone overlay.

If you are working on discovery or gallery behavior, expect logic to combine
primary content tables with `trendingScores` and per-user preference tables.

## Events and ticketing

This domain models inventory, queueing, and event purchase flow.

- `venues` stores the canonical location records.
- `events` stores event metadata, sale status, capacity, and a search index.
- `eventTickets` stores ticket-type inventory by event.
- `userTickets` stores purchased tickets.
- `eventQueue` stores virtual queue membership with sequence numbers and
  expirations.
- `checkoutSessions` limits concurrent event checkout attempts.

This area uses explicit queue and session tables rather than implicit in-memory
state. Check expiry indexes before changing queue assumptions.

## Commerce

These tables back the merch experience and drop-specific queue behavior.

- `merchProducts` is the main catalog table and includes the merch search
  index.
- `merchImageManifest` stores image-manifest metadata for catalog assets.
- `merchVariants` stores SKU-level stock.
- `merchCart` stores shopper cart state.
- `merchOrders` stores order snapshots and status.
- `merchInventoryLog` and `inventoryAuditLog` capture stock history.
- `merchDrops`, `merchDropQueueEntries`, and `merchDropQueueSlots` model timed
  drop behavior and queue admission.
- `merchWishlist` and `merchRecentlyViewed` capture user shopping state.

If you work on the store, check queue and inventory tables together. Several
behaviors depend on explicit drop gating instead of plain product availability.

## Rewards and progression

These tables manage points, quests, streaks, and redemption.

- `userRewards` stores balances and streak summaries per user.
- `pointTransactions` is the immutable points ledger.
- `quests` and `questProgress` track quest definitions and user progress.
- `streakBonus`, `streakMilestones`, and `userStreakMilestones` support streak
  logic.
- `rewards` stores the reward catalog.
- `userRedemptions` stores redemption history and current status.

This area mixes balance summaries with immutable audit tables. Treat
`pointTransactions` and `userRedemptions` as the ledger sources.

## Music and leaderboard

These tables support song submissions, score aggregation, and Spotify-linked
metadata.

- `songLeaderboard` stores aggregate leaderboard entries.
- `leaderboardCache` stores prepared leaderboard outputs.
- `songSubmissions` stores submission records and exposes a search index.
- `submissionVotes` stores per-user voting.
- `spotifySongs` stores synced Spotify metadata.

This domain is ranking-specific. If you are debugging charts or submissions,
expect to touch both cache and source tables.

## Platform operations

These tables support cross-cutting platform behavior.

- `offlineQueue` stores client actions that must be retried later.
- `analyticsEvents` stores captured analytics events and time-series access
  patterns.

These tables are not feature-specific, but they matter when you work on
resilience, telemetry, or replay behavior.

## Next steps

When you need implementation-level detail:

1. Open `convex/schema.ts`.
2. Confirm related query and mutation files under `convex/`.
3. Update this guide only after the schema change lands.
