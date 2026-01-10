# Core Schema

Chat, forum, and user database schema with Convex backend.

## Users

User profiles integrated with Clerk authentication.

**Fields:**
- `clerkId`, `username`, `email`
- `displayName`, `avatarUrl`, `bio`
- `role`: 'artist' | 'admin' | 'mod' | 'crew' | 'fan'
- `fanTier`: 'bronze' | 'silver' | 'gold' | 'platinum'
- `createdAt`, `updatedAt`

**Indexes:** `by_clerkId`, `by_username`, `by_role`, `by_fanTier`

**Hierarchy:**
- **Roles**: artist > admin > mod > crew > fan
- **Tiers**: platinum > gold > silver > bronze

## Chat

### channels
Chat channels with role/tier-based access control.

**Fields:**
- `name`, `slug`, `description`, `category`
- `requiredRole`, `requiredFanTier` - Access control
- `messageCount`, `lastMessageAt`, `lastMessageId` - Denormalized
- `pinnedMessageId`, `createdBy`

**Indexes:** `by_slug`, `by_category`

### messages
Chat messages with author snapshot and tombstone pattern.

**Fields:**
- `channelId`, `authorId`, `content`
- `authorDisplayName`, `authorAvatar`, `authorTier` - Snapshot (immutable)
- `reactionEmojis`, `reactionCount` - Denormalized
- `isPinned`, `isDeleted`, `deletedAt`, `deletedBy`
- `idempotencyKey` - Format: `${userId}|${channelId}|${timestamp}-${nonce}`

**Indexes:** `by_channel`, `by_author`, `by_idempotency`

**Tombstone Pattern**: Use `isDeleted: true` instead of deletion to preserve order.

### reactions
Individual message reactions.

**Fields:**
- `messageId`, `emoji`, `userId`, `createdAt`

**Indexes:** `by_message_emoji`, `by_message_user`

### userTypingIndicators
Ephemeral typing indicators for real-time chat.

**Fields:**
- `channelId`, `userId`, `displayName`, `expiresAt`, `createdAt`

**Cleanup**: Use scheduler function to delete expired entries.

**Indexes:** `by_channel`

## Forum

### categories
Forum categories with access control.

**Fields:**
- `name`, `slug`, `description`, `icon`, `color`, `order`
- `requiredRole`, `requiredFanTier`
- `threadCount`, `lastThreadAt` - Denormalized

**Indexes:** `by_slug`

### threads
Forum threads with voting and tracking.

**Fields:**
- `title`, `content`, `authorId`, `categoryId`, `tags`
- `authorDisplayName`, `authorAvatar`, `authorTier` - Snapshot
- `upVoterIds`, `downVoterIds` - Vote tracking arrays  
- `upVoteCount`, `downVoteCount`, `netVoteCount` - Denormalized
- `replyCount`, `viewCount`
- `lastReplyAt`, `lastReplyById` - Denormalized
- `isDeleted`, `deletedAt`

**Indexes:** `by_category`, `by_category_netVote`, `by_category_lastReply`, `by_author`

### replies
Forum thread replies with voting.

**Fields:**
- `threadId`, `authorId`, `content`
- `authorDisplayName`, `authorAvatar`, `authorTier` - Snapshot
- `upVoterIds`, `downVoterIds` - Vote tracking arrays
- `upVoteCount`, `downVoteCount` - Denormalized
- `isDeleted`, `deletedAt`

**Indexes:** `by_thread`, `by_author`

## Offline Queue

### offlineQueue
Offline action queue for synchronization.

**Fields:**
- `userId`, `type`, `payload`, `status`
- `type`: message | vote_thread | vote_reply | reaction
- `status`: pending | synced | failed
- `retryCount`, `lastError`, `lastRetryAt`

**Indexes:** `by_user_status`

## Data Consistency Rules

1. **Author snapshots**: Never update authorDisplayName, authorAvatar, authorTier
2. **Vote tracking**: Always update both voterId arrays AND counts
3. **Tombstone pattern**: Use isDeleted flag, don't delete documents
4. **Denormalized fields**: Update in all relevant mutations
5. **Idempotency**: Always check for duplicates before creating messages

## Access Control

Use helpers in `convex/helpers.ts`:
- `getCurrentUser(ctx)` - Get authenticated user
- `canAccessChannel(ctx, userId, channelId)` - Check channel access
- `canAccessCategory(ctx, userId, categoryId)` - Check category access
- `isModerator(user)` - Check if user is mod/admin/artist
