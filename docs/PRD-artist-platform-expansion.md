# PRD: Artist Platform Expansion (Chat, Rankings, Merch, Scale)

## Context
The platform already ships a real-time chat, leaderboard logic, merch store, and Instagram gallery. The next release should deepen community engagement with richer chat features, turn the song ranking page into a real, premium-feeling game, and add artist-branded merch including a 3D mini-figurine PDP experience. This PRD also covers performance and scalability planning for large traffic spikes.

## Goals
- Expand chat with server settings, media uploads, and custom stickers.
- Add moderation pipeline for chatrooms and forums with a comprehensive, live admin console.
- Convert the ranking page to use live leaderboard data and allow editable, freely arranged submissions.
- Make rankings live on the dashboard (and decide whether to keep or retire the standalone ranking page).
- Update the artist Instagram links to https://www.instagram.com/roapr__/ across the site.
- Add artist-branded merch, including a mini-figurine with a 3D interactive model on its product page.
- Reorganize merch product images by item and variation, and show variation-specific galleries on PDP.
- Sync active quests on user profiles directly from the database.
- Update the community gallery to only show Spotify albums (remove Instagram posts).
- Polish chatroom UI: group consecutive messages, tighten spacing, fix avatar crop, and center media modals/chat bar content.
- Prepare backend and frontend for high-scale usage (spikes in chat, rankings, and merch traffic).

## Non-goals (this release)
- Social login changes or new auth providers.
- Automated ML moderation (auto-removal, trust scoring, or sentiment moderation).
- Full analytics overhaul (only feature-specific events).

## Current State Summary (from codebase)
- Chat: Convex-based channels and messages, real-time subscription, mute/deafen per channel, no media or stickers yet.
- Admin: Chat moderation UI exists but uses placeholders and does not reflect real moderation data.
- Rankings: Leaderboard logic exists in Convex, but `src/pages/Ranking.tsx` uses mock data. Submission UI exists but does not load/edit existing submissions.
- Dashboard: Has leaderboard widgets and period filters (weekly, monthly, all-time) but not a full ranking workflow.
- Merch: Product listing and detail pages are functional; no 3D model support.
- Instagram: Several hardcoded links point to the old account.

---

## Feature 1: Chatroom Expansion + Moderation

### Problem
The chat experience feels limited for a premium fan community. There are no attachments, sticker culture, or server-level configuration. Moderation tooling is fragmented and does not reflect live data across chat and forum.

### Scope
In scope:
- Server settings for admins (slow mode, media limits, sticker packs, retention).
- User settings (mute defaults, media autoplay, sticker visibility, compact mode).
- Upload images and videos in chat.
- Custom chat stickers (admin-managed packs, user selection).
- User-uploaded stickers that are saved per account.
- Moderation pipeline for chat and forum (reports, review queue, actions, audit log).
- Admin console that links settings, moderation, and live content data.

Out of scope:
- Voice/video rooms.
- Automated ML moderation and auto-removal.

### User Stories
- As a fan, I can upload an image or video in chat.
- As a fan, I can use custom stickers in my messages.
- As a fan, I can upload my own stickers and use them from my account.
- As an admin, I can configure media limits and slow mode.
- As a user, I can control media autoplay and sticker visibility.
- As a user, I can report a chat message or forum post.
- As a moderator, I can review reports and take actions (warn, remove, timeout, ban).
- As an admin, I can see real-time moderation queues and content health metrics.

### User Flows
1) Media upload:
   - User clicks upload -> selects image/video -> sees local preview -> send -> message shows media thumbnail -> click to expand.
2) Sticker message:
   - User opens sticker picker -> selects sticker -> message posts as sticker-only or sticker + text.
3) Admin settings:
   - Admin opens Chat Settings in Admin panel -> updates limits -> changes apply immediately.
4) User settings:
   - User opens Chat Settings -> toggles autoplay and compact mode -> preferences persist.
5) Moderation pipeline:
   - User reports content -> content enters review queue -> moderator reviews -> action applied -> audit log stored.

### Functional Requirements
- Support image uploads (JPG, PNG, WebP) and video uploads (MP4, WebM).
- Attachments are optional per message; text-only and media-only messages allowed.
- Sticker picker with search, pack tabs, and recent stickers.
- Chat bar includes a visible sticker button for quick access.
- Admin settings include:
  - Slow mode per channel (0s, 5s, 10s, 30s).
  - Max attachment size (image and video).
  - Allowed media types list.
  - Enabled sticker packs.
  - Message retention days (optional, for pruning).
- User settings include:
  - Autoplay media (on/off).
  - Show stickers (on/off).
  - Compact message mode (on/off).
- Moderation pipeline:
  - Report chat messages and forum posts/replies with reason and optional note.
  - Central review queue with filters (type, status, channel/category, severity).
  - Actions: dismiss, warn, remove content, timeout user, ban user.
  - Warning policy: 3 warnings within a rolling period (configurable, default 30 days) triggers auto-timeout.
  - Timeout policy: escalating durations (ex: 10m, 1h, 24h, 7d).
  - Ban policy: escalating to permanent after N bans (default 2).
  - Action metadata includes moderator id, reason, duration, and escalation level.
  - Content filter: allow common expletives, block slurs (server-managed allowlist/denylist).
- Audit log of all actions and outcomes.
- Admin console:
  - Unified "Moderation Hub" linking Chat and Forum.
  - Live stats (open reports, removals, top flagged channels).
  - All admin controls read/write Convex data (no placeholders).
  - Admin-only testing toggles (seed data, feature flags) that reflect on live UI.

### Technical Stack
- Frontend: React + Vite, Tailwind classes, Framer Motion for picker animations.
- Backend: Convex mutations/queries, Convex Storage for uploads.
- Media processing: start with raw uploads; optional Phase 2 integration with Cloudinary or Mux for transcoding/thumbnails.

### Data Model Changes (Convex)
- `messages` add:
  - `messageType`: 'text' | 'media' | 'sticker' | 'mixed'
  - `attachments`: array of { type, storageId, url, thumbnailUrl, width, height, durationMs, sizeBytes, contentType }
  - `stickerId`: optional id of sticker used
- `threads` / `replies` add:
  - `moderationStatus`: 'active' | 'removed'
  - `removedAt`, `removedBy`, `removalReason`
- `moderationReports`:
  - `contentType`: 'chat_message' | 'forum_thread' | 'forum_reply'
  - `contentId`, `reportedBy`, `reason`, `note`, `status`, `createdAt`, `resolvedAt`, `resolvedBy`
- `moderationActions`:
  - `actionType`: 'dismiss' | 'warn' | 'remove' | 'timeout' | 'ban'
  - `targetUserId`, `contentId`, `contentType`, `durationMs`, `reason`, `moderatorId`, `createdAt`
- `moderationPolicy`:
  - `warningWindowDays`, `warningThreshold`, `timeoutDurationsMs`, `banThreshold`, `denylist`, `allowlist`
- `userModerationStatus`:
  - `userId`, `isBanned`, `timeoutUntil`, `notes`, `updatedAt`
- `chatStickerPacks`:
  - `name`, `description`, `isActive`, `createdAt`
- `chatStickers`:
  - `packId`, `name`, `imageUrl`, `storageId`, `tags`, `createdAt`, `isActive`
- `userStickers`:
  - `userId`, `name`, `imageUrl`, `storageId`, `tags`, `createdAt`, `isActive`
- `chatServerSettings`:
  - `slowModeSeconds`, `maxImageMb`, `maxVideoMb`, `allowedMediaTypes`, `enabledStickerPackIds`, `retentionDays`
- `userChatSettings`:
  - `userId`, `autoplayMedia`, `showStickers`, `compactMode`, `updatedAt`

### API Changes
- `chat.generateUploadUrl` mutation (mirrors avatar upload).
- `chat.sendMessage` accepts optional attachments and stickerId.
- `chat.getServerSettings` query and `admin.updateServerSettings` mutation.
- `chat.getStickerPacks` query and `admin.createStickerPack` / `admin.uploadSticker` mutations.
- `chat.uploadUserSticker` mutation and `chat.getUserStickers` query.
- `moderation.reportContent` mutation.
- `moderation.getQueue` query with filters and pagination.
- `moderation.takeAction` mutation (warn/remove/timeout/ban).
- `moderation.getUserHistory` query.
- `moderation.getPolicy` and `admin.updateModerationPolicy` mutations.

### Edge Cases
- Large video upload fails mid-transfer (show retry).
- User disabled stickers, but sticker-only messages still appear as placeholder.
- Slow mode enforced across multiple tabs/devices.
- Multiple reports for the same content should be grouped.
- Moderation action on already-deleted content should be idempotent.
- Warning counters reset after the policy window.
- Slur detection should not trigger on partial word matches in legitimate words.

### Acceptance Criteria
- Users can send and view image/video messages in chat.
- Sticker picker works with at least one admin-created pack.
- Users can upload and use their own custom stickers (account-specific).
- Sticker button is visible in the main chat bar and opens the picker.
- Admin can update slow mode and media limits without redeploy.
- User chat settings persist and take effect immediately.
- Reported chat and forum content appear in a live moderation queue.
- Moderator actions reflect immediately on the site and log to audit trail.
- Admin console controls are responsive and reflect live Convex data.
- Warning escalation, timeout escalation, and ban escalation follow policy defaults.
- Content filter blocks slurs but permits expletives.

---

## Feature 2: Song Ranking Experience (Premium, Editable)

### Problem
The ranking page is mostly static and does not reflect real submissions. Users cannot edit or re-order their rankings freely. The dashboard already has leaderboard widgets, but the core ranking workflow is split across pages.

### Scope
In scope:
- Replace mock leaderboard with live data from `api.leaderboard.getLeaderboard`.
- New gamified ranking submission flow with drag-and-drop ordering.
- Allow users to edit or revise their submissions.
- Make leaderboard live on the dashboard and reuse the same filters (weekly, monthly, all-time).
- Evaluate consolidating the standalone ranking page into the dashboard ranking section.

Out of scope:
- Full social sharing system for rankings (basic share link only).

### User Stories
- As a fan, I can drag songs into my preferred order and submit.
- As a fan, I can reopen my submission and edit it later.
- As a fan, I can see a live leaderboard based on community submissions.

### User Flows
1) Submit ranking:
   - Open dashboard ranking section -> click "Rank your songs" -> search songs -> drag to order -> submit -> confirmation + points.
2) Edit submission:
   - Open dashboard ranking section -> see "Your submission" -> edit -> resubmit -> leaderboard updates on next compute cycle.
3) View leaderboard:
   - Choose period (weekly, monthly, all-time) -> list updates hourly.
4) Standalone page (optional):
   - If `/ranking` remains, it renders the same components and filters as the dashboard section.

### Functional Requirements
- Leaderboard pulls real data and renders top 50.
- Live updates: use Convex queries for real-time updates on the dashboard; if load is heavy, poll every 30-60s.
- Submission UI supports free reordering (drag-and-drop).
- Users can edit their latest submission for a period.
- Editing does not count as a new submission for weekly limit; it replaces the previous submission.
- Upvote existing submissions (existing feature) remains.
- Filters match dashboard options (weekly, monthly, all-time) and apply across all ranking views.

### Technical Stack
- Frontend: React + Framer Motion, add `@dnd-kit` for drag-and-drop.
- Backend: Convex queries and mutations, reuse Spotify search endpoint.

### Data Model Changes
- `songSubmissions` add:
  - `revision`: number
  - `lastEditedAt`: number
  - `isActive`: boolean (optional for soft replacement)
- Optional: `userSubmissionLocks` to prevent rapid spam edits.

### API Changes
- `leaderboard.getUserSubmissionForPeriod` query (single latest).
- `leaderboard.updateSongSubmission` mutation (validates, replaces rankedSongs).
- `leaderboard.getLeaderboard` unchanged but ensure it reads current data.

### Edge Cases
- User edits after leaderboard compute starts (use updatedAt in scoring).
- Duplicate track detection on edits.
- Submission limit enforced for brand new submissions only.

### Acceptance Criteria
- Dashboard ranking section shows real leaderboard data.
- Users can drag to reorder and submit.
- Users can edit their submission for the current period.
- Updates reflect in leaderboard within 1 hour of submission or edit.

### UX Decision: Standalone Ranking Page
Option A selected: Keep `/ranking` as a deep-dive page.
- Pros: dedicated space for rankings, shareable route, clear nav entry.
- Cons: duplicate UI surface to maintain.

Implementation note: `/ranking` uses the same components and filters as the dashboard section.

---

## Feature 3: Sitewide Instagram Link Update

### Scope
- Replace all static Instagram links and labels with https://www.instagram.com/roapr__/

### Acceptance Criteria
- All hardcoded Instagram links and labels use the new account.

---

## Feature 4: Artist Merch Expansion + 3D Mini-Figurine PDP

### Problem
Merch selection is generic and lacks a hero product experience for artist branding.

### Scope
In scope:
- Add artist-branded merch collection with a hero mini-figurine.
- Mini-figurine product detail page includes an interactive 3D model.

Out of scope:
- AR try-on or multi-view photo studio.

### User Stories
- As a fan, I can view a 3D model of the mini-figurine directly on the product page.
- As a fan, I can rotate and zoom the model smoothly.
- As an admin, I can upload or update the 3D asset.

### Functional Requirements
- A new merch product "Mini Figurine" is available with dedicated PDP layout.
- PDP includes:
  - 3D model viewer with rotate, zoom, auto-rotate toggle.
  - Fallback poster image while model loads.
  - Mobile-friendly controls and reduced motion support.
- Add merch collection and tags for artist branding (ex: "ROAPR Studio", "Limited Drop").

### Technical Stack
- Frontend: Use `@google/model-viewer` web component for the 3D viewer.
- Backend: Convex Storage for `.glb` model and poster image.
- Optional Phase 2: CDN for large 3D assets.

### Data Model Changes
- `merchProducts` add:
  - `model3dUrl` (string, optional)
  - `modelPosterUrl` (string, optional)
  - `modelConfig` (object: autoRotate, cameraOrbit, minFov, maxFov)

### Edge Cases
- Slow 3D asset load on mobile (fallback poster, load spinner).
- Model not supported (show static image and disable 3D controls).

### Acceptance Criteria
- Mini-figurine PDP renders a 3D model with rotate/zoom.
- Page remains usable on mobile and low-end devices.

---

## Feature 5: Merch Image Variations + Public Asset Reorg

### Problem
Merch product images are not organized by item/variation, and PDP image galleries do not change when a user selects a different color/design variation.

### Scope
In scope:
- Reorganize public merch assets into item folders (ex: jackets, tees) with consistent variation naming.
- Define a file naming convention to map variation images to PDP galleries.
- Update PDP to default to variation 1 images and switch galleries on variation change.
- Infer variations and image sets from filenames (no new product metadata yet).

Out of scope:
- CDN hosting or runtime image transformation (use current static assets).
- New product variants beyond existing catalog.

### User Stories
- As a fan, I see the default variation images when I open a product page.
- As a fan, when I switch color/design, the image gallery updates to that variation.
- As an admin, I can add new variation images by following a simple naming convention.

### Asset Organization Convention
Proposed structure:
- `public/merch/{category}/{productSlug}/`
- Filenames: `{productSlug}-{variationIndex}-{imageIndex}.jpg`

Example:
- `public/merch/jackets/jacket1/jacket1-1-1.jpg` (variation 1, image 1)
- `public/merch/jackets/jacket1/jacket1-2-1.jpg` (variation 2, image 1)
- `public/merch/jackets/jacket1/jacket1-2-2.jpg` (variation 2, image 2)

Parsing rules:
- `productSlug` is inferred from the filename prefix before the first `-`.
- `variationIndex` is the first numeric segment after the slug.
- `imageIndex` is the second numeric segment after the slug.

### Functional Requirements
- PDP defaults to `variationIndex = 1` if no selection is made.
- Variation selector updates gallery to the matching image set.
- If a variation has missing images, fall back to variation 1.
- Gallery uses deterministic ordering by `imageIndex`.
- Product variation options (labels, colors) continue to come from existing UI config; images are mapped by filename inference.

### Data Model Changes
- None for Phase 1 (variation images are inferred from filenames).

### Edge Cases
- Variation selected that has no images: show fallback + toast (optional).
- Mixed file extensions (jpg/png/webp): maintain consistent extension per variation.
- Asset missing from public folder: log warning in dev, fail gracefully in prod.

### Acceptance Criteria
- Public merch assets are organized by category and product.
- PDP shows variation 1 images by default.
- Switching variations updates the gallery without reload.
- Missing variation assets fall back to variation 1 without breaking layout.

---

## Feature 6: User Profile Active Quests Sync

### Problem
The active quests shown on a user profile can drift from the database state.

### Scope
In scope:
- Replace any hardcoded or cached active quest list with a live query.
- Ensure profile page reflects real-time active quests and their statuses.

Out of scope:
- New quest types or quest logic changes.

### Functional Requirements
- Profile pulls active quests from the database on page load.
- Data refresh happens on profile re-entry (no real-time subscription required).
- Empty state for users with no active quests.

### Acceptance Criteria
- Active quests on profile always match the database.
- Changes to quests appear on profile without manual refresh.

---

## Feature 7: Community Gallery Spotify-Only View

### Problem
The community gallery currently shows Instagram posts that should be removed.

### Scope
In scope:
- Remove Instagram posts from the community gallery.
- Display only Spotify albums.
 - Remove Instagram fetches from the data layer and delete Instagram entries in the database.

Out of scope:
- New social providers or Instagram replacements.

### Functional Requirements
- Gallery data source filters to Spotify-only content.
- Database no longer stores or reads Instagram content for gallery.
- Empty state if no albums are available.

### Acceptance Criteria
- Community gallery contains only Spotify albums.
- No Instagram content is rendered or fetched for the gallery.
- Instagram entries are removed from the database layer used by the gallery.

---

## Feature 8: Chatroom UX Polish

### Problem
Consecutive messages feel overly spaced, avatars render as stretched, media modals are not centered on the viewport, and chat bar content is not horizontally centered.

### Scope
In scope:
- Group consecutive messages from the same user within a short time window.
- Tighten vertical padding for consecutive messages.
- Ensure avatars render as perfect circles (no stretch).
- Center media modal on the viewport (not the chat container).
- Horizontally center chat bar contents within the outer container.

Out of scope:
- Changing message storage schema (UI-only grouping).

### Functional Requirements
- Define a grouping window (default: 2 minutes).
- If two consecutive messages are from the same user and within the window:
  - Render as a single message block with stacked body content.
  - Suppress repeated avatar and username for subsequent entries.
- Reduce top/bottom padding between consecutive messages.
- Avatar images use `object-fit: cover` and equal width/height.
- Media modal uses fixed positioning and centers on viewport.
- Chat bar contents align center horizontally and preserve spacing between controls.

### Edge Cases
- Mixed media + text in grouped messages (render each item in order).
- Editing/deleting a message within a group should not break layout.
- Messages crossing the time window should render as separate blocks.

### Acceptance Criteria
- Consecutive messages within 2 minutes from the same user render as one block (text and media included).
- Avatar appears perfectly circular at all sizes.
- Media modal opens centered on the screen and can be dismissed by click outside or X.
- Chat bar contents are centered within the outer container.

---

## Performance and Scale Plan
This section covers current codebase risks (not just new features) and the changes required to scale.

### Observed Risks in Current Code
- `chat.getMessages` and `chat.subscribeToMessages` load and sort all messages in memory per channel.
- Large arrays for message votes can grow unbounded.
- `leaderboard.getTrendingSubmissions` sorts in memory without an index when no leaderboardId is passed.
- Leaderboard recompute loops through every submission and does per-user lookups.
- `leaderboard.searchSubmissions` does full table scans.
- Dashboard loads multiple heavy widgets at once; no virtualization for long lists.
- Merch list filtering is mostly client-side; large catalogs will over-fetch.
- Hero media uses high-res images/video without adaptive loading or preloading strategy.
- Typing indicators and channel lists use full collection reads before filtering.

### Planned Changes
- Chat:
  - Change message queries to use index ordering and `take` with cursor-based pagination.
  - Limit real-time subscriptions to a recent window (ex: last 50 messages) plus incremental updates.
  - Move message votes into a `messageVotes` table and keep counts on message docs.
  - Add per-user and per-channel rate limits for sendMessage.
- Leaderboards:
  - Add indexes for trending queries by leaderboardId and createdAt.
  - Cache leaderboard results in a separate table and serve from cache.
  - Batch user lookups inside compute cycle with a memoized map.
  - Replace full-table scans with search indexes or capped windows.
- Merch:
  - Serve large assets via CDN, use pre-sized images.
  - Lazy-load 3D assets and gate auto-rotate on `prefers-reduced-motion`.
  - Move product filters to server-side queries with pagination.
- Frontend:
  - Use `react-window` for chat message lists and leaderboard lists.
  - Defer non-critical widgets on dashboard.
  - Add responsive image sources and reduce hero media payload size.
  - Limit typing indicator and channel queries with indexed lookups.

### Load Balancing and Infra
- Use CDN caching for static assets and media thumbnails.
- Use Convex scheduled jobs for heavy recompute tasks (leaderboards, pruning).
- Add rate limiting and backoff for spikes in chat and ranking submissions.
- Monitor Core Web Vitals and server latency; alert on p95 regressions.

### Scale Acceptance Criteria
- Chat: initial message load under 500ms at 50k concurrent users.
- Leaderboard recompute completes under 2 minutes per period at 100k submissions.
- Merch PDP LCP under 2.5s on 4G for the 3D product page.

---

## Release Plan (Suggested)
1) Phase 1: Instagram update + live rankings on dashboard + editable submissions.
2) Phase 2: Moderation pipeline + admin console updates (chat + forum).
3) Phase 3: Chat media uploads + stickers + server/user settings.
4) Phase 4: Merch 3D mini-figurine and collection rollout.
