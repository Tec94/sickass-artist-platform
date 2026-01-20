# Convex Schema Documentation

## Overview
This schema supports both chat and forum features with proper indexing, access control, and denormalized fields for performance.

## Tables

### 1. users
User profiles integrated with Auth0 authentication.
- **Indexes**: by_clerkId, by_username, by_role, by_fanTier

### 2. channels
Chat channels with role/tier-based access control.
- **Fields**: name, slug, description, requiredRole, requiredFanTier, category, pinnedMessageId, createdBy, createdAt, updatedAt, messageCount, lastMessageAt, lastMessageId
- **Denormalized fields**:
  - `messageCount`: Total messages in channel (update on message create/delete)
  - `lastMessageAt`: Timestamp of most recent message (update on message create)
  - `lastMessageId`: ID of most recent message (update on message create)
- **Indexes**: by_slug, by_category

### 3. messages
Chat messages with author snapshot and tombstone pattern.
- **Fields**: channelId, authorId, authorDisplayName, authorAvatar, authorTier, content, editedAt, isPinned, isDeleted, deletedAt, deletedBy, reactionEmojis, reactionCount, idempotencyKey, createdAt
- **Denormalized fields**:
  - `authorDisplayName`, `authorAvatar`, `authorTier`: Author snapshot (never update)
  - `reactionEmojis`: Array of unique emoji strings (update on reaction add/remove)
  - `reactionCount`: Total reaction count (update on reaction add/remove)
- **Indexes**: by_channel, by_author, by_idempotency
- **Tombstone pattern**: Use `isDeleted: true` instead of deletion to preserve order

### 4. reactions
Individual message reactions.
- **Fields**: messageId, emoji, userId, createdAt
- **Indexes**: by_message_emoji, by_message_user

### 5. threads
Forum threads with voting and tracking.
- **Fields**: title, content, authorId, authorDisplayName, authorAvatar, authorTier, categoryId, tags, upVoterIds, downVoterIds, upVoteCount, downVoteCount, netVoteCount, replyCount, viewCount, lastReplyAt, lastReplyById, isDeleted, deletedAt, createdAt, updatedAt
- **Denormalized fields**:
  - `authorDisplayName`, `authorAvatar`, `authorTier`: Author snapshot (never update)
  - `upVoterIds`, `downVoterIds`: Arrays of user IDs for vote tracking
  - `upVoteCount`, `downVoteCount`: Vote counts (update on vote)
  - `netVoteCount`: upVoteCount - downVoteCount (update on vote, for sorting)
  - `replyCount`: Total replies (update on reply create/delete)
  - `lastReplyAt`: Timestamp of most recent reply (update on reply)
  - `lastReplyById`: User ID of most recent reply (update on reply)
- **Indexes**: by_category, by_category_netVote, by_category_lastReply, by_author
- **Tombstone pattern**: Use `isDeleted: true` instead of deletion

### 6. replies
Forum thread replies with voting.
- **Fields**: threadId, authorId, authorDisplayName, authorAvatar, authorTier, content, editedAt, upVoterIds, downVoterIds, upVoteCount, downVoteCount, isDeleted, deletedAt, createdAt
- **Denormalized fields**:
  - `authorDisplayName`, `authorAvatar`, `authorTier`: Author snapshot (never update)
  - `upVoterIds`, `downVoterIds`: Arrays of user IDs for vote tracking
  - `upVoteCount`, `downVoteCount`: Vote counts (update on vote)
- **Indexes**: by_thread, by_author
- **Tombstone pattern**: Use `isDeleted: true` instead of deletion

### 7. categories
Forum categories with access control.
- **Fields**: name, slug, description, icon, color, order, requiredRole, requiredFanTier, threadCount, lastThreadAt, createdAt
- **Denormalized fields**:
  - `threadCount`: Total threads in category (update on thread create/delete)
  - `lastThreadAt`: Timestamp of most recent thread (update on thread create)
- **Indexes**: by_slug

### 8. userTypingIndicators
Ephemeral typing indicators for real-time chat.
- **Fields**: channelId, userId, displayName, expiresAt, createdAt
- **Cleanup**: Use a scheduler function to delete expired entries (where expiresAt < Date.now())
- **Indexes**: by_channel

### 9. offlineQueue
Offline action queue for synchronization.
- **Fields**: userId, type, payload, status, retryCount, lastError, lastRetryAt, createdAt, processedAt
- **Types**: message, vote_thread, vote_reply, reaction
- **Status**: pending, synced, failed
- **Indexes**: by_user_status

## Idempotency Keys

Format: `${userId}|${channelId}|${timestamp}-${nonce}`

Used to prevent duplicate message submissions. Store in messages.idempotencyKey and use the `by_idempotency` index to check for duplicates before creating new messages.

## Access Control

Use the helpers in `helpers.ts`:
- `getCurrentUser(ctx)`: Get authenticated user
- `canAccessChannel(ctx, userId, channelId)`: Check channel access
- `canAccessCategory(ctx, userId, categoryId)`: Check category access
- `isModerator(user)`: Check if user is mod/admin/artist

Role hierarchy (highest to lowest): artist > admin > mod > crew > fan

Tier hierarchy (highest to lowest): platinum > gold > silver > bronze

## Data Consistency Rules

1. **Author snapshots**: Never update authorDisplayName, authorAvatar, authorTier
2. **Vote tracking**: Always update both voterId arrays AND counts
3. **Tombstone pattern**: Use isDeleted flag, don't delete documents
4. **Denormalized fields**: Update in all relevant mutations
5. **Idempotency**: Always check for duplicates before creating messages

## Index Usage

- **by_slug**: Get channel/category by unique slug
- **by_category**: Get threads/replies in a category (chronological)
- **by_category_netVote**: Get threads in a category (sorted by votes)
- **by_category_lastReply**: Get threads in a category (sorted by recent activity)
- **by_channel**: Get messages in a channel (chronological)
- **by_idempotency**: Check for duplicate messages
- **by_message_emoji**: Get reactions by message + emoji
- **by_message_user**: Check if user reacted to message
- **by_thread**: Get replies in a thread (chronological)
- **by_author**: Get user's messages/threads/replies
- **by_user_status**: Get user's offline queue items

## Maintenance Notes

When updating denormalized fields:
1. Always use transactions or sequential updates in the same mutation
2. Update source and destination fields atomically
3. Consider using scheduled functions for cleanup tasks
