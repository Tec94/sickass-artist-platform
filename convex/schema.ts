import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),           // Clerk user ID (unique)
    email: v.string(),             // Email from Clerk
    username: v.string(),          // Username (unique, editable)
    displayName: v.string(),       // Display name (editable)
    bio: v.string(),               // Bio/description (editable, max 500 chars)
    avatar: v.string(),            // Avatar URL (editable)

    // Role & permissions
    role: v.union(
      v.literal('artist'),
      v.literal('admin'),
      v.literal('mod'),
      v.literal('crew'),
      v.literal('fan')
    ),

    // Fan tier (bronze | silver | gold | platinum)
    fanTier: v.union(
      v.literal('bronze'),
      v.literal('silver'),
      v.literal('gold'),
      v.literal('platinum')
    ),

    // Social profiles
    socials: v.object({
      twitter: v.optional(v.string()),
      instagram: v.optional(v.string()),
      tiktok: v.optional(v.string()),
    }),

    // Location info
    location: v.string(),

    // XP & Level system
    xp: v.number(),
    level: v.number(),

    // Badges earned
    badges: v.array(v.string()),

    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
    lastSignIn: v.optional(v.number()),
  })
    .index('by_clerkId', ['clerkId'])
    .index('by_username', ['username'])
    .index('by_role', ['role'])
    .index('by_fanTier', ['fanTier']),

  // Chat channels
  channels: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    requiredRole: v.optional(
      v.union(
        v.literal('artist'),
        v.literal('admin'),
        v.literal('mod'),
        v.literal('crew'),
        v.literal('fan')
      )
    ),
    requiredFanTier: v.optional(
      v.union(
        v.literal('bronze'),
        v.literal('silver'),
        v.literal('gold'),
        v.literal('platinum')
      )
    ),
    category: v.union(
      v.literal('general'),
      v.literal('mod'),
      v.literal('fan-only'),
      v.literal('announcements')
    ),
    pinnedMessageId: v.optional(v.id('messages')),
    createdBy: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
    messageCount: v.number(),
    lastMessageAt: v.optional(v.number()),
    lastMessageId: v.optional(v.id('messages')),
  })
    .index('by_slug', ['slug'])
    .index('by_category', ['category']),

  // Chat messages
  messages: defineTable({
    channelId: v.id('channels'),
    authorId: v.id('users'),
    authorDisplayName: v.string(),
    authorAvatar: v.string(),
    authorTier: v.union(
      v.literal('bronze'),
      v.literal('silver'),
      v.literal('gold'),
      v.literal('platinum')
    ),
    content: v.string(),
    editedAt: v.optional(v.number()),
    isPinned: v.boolean(),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
    deletedBy: v.optional(v.id('users')),
    reactionEmojis: v.array(v.string()),
    reactionCount: v.number(),
    idempotencyKey: v.string(),
    createdAt: v.number(),
  })
    .index('by_channel', ['channelId', 'createdAt'])
    .index('by_author', ['authorId', 'createdAt'])
    .index('by_idempotency', ['channelId', 'authorId', 'idempotencyKey']),

  // Message reactions
  reactions: defineTable({
    messageId: v.id('messages'),
    emoji: v.string(),
    userId: v.id('users'),
    createdAt: v.number(),
  })
    .index('by_message_emoji', ['messageId', 'emoji'])
    .index('by_message_user', ['messageId', 'userId']),

  // Forum threads
  threads: defineTable({
    title: v.string(),
    content: v.string(),
    authorId: v.id('users'),
    authorDisplayName: v.string(),
    authorAvatar: v.string(),
    authorTier: v.union(
      v.literal('bronze'),
      v.literal('silver'),
      v.literal('gold'),
      v.literal('platinum')
    ),
    categoryId: v.id('categories'),
    tags: v.array(v.string()),
    upVoterIds: v.array(v.id('users')),
    downVoterIds: v.array(v.id('users')),
    upVoteCount: v.number(),
    downVoteCount: v.number(),
    netVoteCount: v.number(),
    replyCount: v.number(),
    viewCount: v.number(),
    lastReplyAt: v.optional(v.number()),
    lastReplyById: v.optional(v.id('users')),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_category', ['categoryId', 'createdAt'])
    .index('by_category_netVote', ['categoryId', 'netVoteCount'])
    .index('by_category_lastReply', ['categoryId', 'lastReplyAt'])
    .index('by_author', ['authorId', 'createdAt']),

  // Forum replies
  replies: defineTable({
    threadId: v.id('threads'),
    authorId: v.id('users'),
    authorDisplayName: v.string(),
    authorAvatar: v.string(),
    authorTier: v.union(
      v.literal('bronze'),
      v.literal('silver'),
      v.literal('gold'),
      v.literal('platinum')
    ),
    content: v.string(),
    editedAt: v.optional(v.number()),
    upVoterIds: v.array(v.id('users')),
    downVoterIds: v.array(v.id('users')),
    upVoteCount: v.number(),
    downVoteCount: v.number(),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('by_thread', ['threadId', 'createdAt'])
    .index('by_author', ['authorId', 'createdAt']),

  // Forum categories
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    icon: v.string(),
    color: v.string(),
    order: v.number(),
    requiredRole: v.optional(
      v.union(
        v.literal('artist'),
        v.literal('admin'),
        v.literal('mod'),
        v.literal('crew'),
        v.literal('fan')
      )
    ),
    requiredFanTier: v.optional(
      v.union(
        v.literal('bronze'),
        v.literal('silver'),
        v.literal('gold'),
        v.literal('platinum')
      )
    ),
    threadCount: v.number(),
    lastThreadAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('by_slug', ['slug']),

  // User typing indicators (ephemeral, cleaned by scheduler)
  userTypingIndicators: defineTable({
    channelId: v.id('channels'),
    userId: v.id('users'),
    displayName: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index('by_channel', ['channelId', 'expiresAt']),

  // Offline queue for sync
  offlineQueue: defineTable({
    userId: v.id('users'),
    type: v.union(
      v.literal('message'),
      v.literal('vote_thread'),
      v.literal('vote_reply'),
      v.literal('reaction')
    ),
    payload: v.optional(
      v.object({
        channelId: v.optional(v.id('channels')),
        threadId: v.optional(v.id('threads')),
        replyId: v.optional(v.id('replies')),
        messageId: v.optional(v.id('messages')),
        content: v.optional(v.string()),
        emoji: v.optional(v.string()),
        voteType: v.optional(v.union(v.literal('up'), v.literal('down'))),
      })
    ),
    status: v.union(
      v.literal('pending'),
      v.literal('synced'),
      v.literal('failed')
    ),
    retryCount: v.number(),
    lastError: v.optional(v.string()),
    lastRetryAt: v.optional(v.number()),
    createdAt: v.number(),
    processedAt: v.optional(v.number()),
  })
    .index('by_user_status', ['userId', 'status', 'createdAt']),

  // Gallery content
  galleryContent: defineTable({
    contentId: v.string(),
    type: v.union(
      v.literal('show'),
      v.literal('bts'),
      v.literal('edit'),
      v.literal('wip'),
      v.literal('exclusive')
    ),
    title: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    thumbnailUrl: v.string(),
    creatorId: v.id('users'),
    requiredFanTier: v.optional(
      v.union(
        v.literal('bronze'),
        v.literal('silver'),
        v.literal('gold'),
        v.literal('platinum')
      )
    ),
    tags: v.array(v.string()),
    likeCount: v.number(),
    viewCount: v.number(),
    pinned: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_type', ['type'])
    .index('by_creator', ['creatorId'])
    .index('by_tier', ['requiredFanTier']),

  // User-generated content
  ugcContent: defineTable({
    ugcId: v.string(),
    creatorId: v.id('users'),
    creatorDisplayName: v.string(),
    creatorAvatar: v.string(),
    creatorTier: v.union(
      v.literal('bronze'),
      v.literal('silver'),
      v.literal('gold'),
      v.literal('platinum')
    ),
    title: v.string(),
    description: v.string(),
    imageUrls: v.array(v.string()),
    uploadedFile: v.optional(v.string()),
    likeCount: v.number(),
    viewCount: v.number(),
    downloadCount: v.number(),
    category: v.union(
      v.literal('user-edit'),
      v.literal('fan-art'),
      v.literal('repost')
    ),
    tags: v.array(v.string()),
    isApproved: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_creator', ['creatorId'])
    .index('by_category', ['category'])
    .index('by_createdAt', ['createdAt'])
    .index('by_approved', ['isApproved']),

  // Gallery likes (for both gallery and UGC content)
  galleryLikes: defineTable({
    userId: v.id('users'),
    contentId: v.string(),
    type: v.union(
      v.literal('gallery'),
      v.literal('ugc')
    ),
    createdAt: v.number(),
  })
    .index('by_user_type', ['userId', 'type'])
    .index('by_content_type', ['contentId', 'type']),

  // Precomputed trending scores for gallery and UGC content
  // Refreshed hourly by scheduled job
  trendingScores: defineTable({
    contentId: v.string(), // galleryContent.contentId or ugcContent.ugcId
    contentType: v.union(
      v.literal('gallery'),
      v.literal('ugc')
    ),
    trendingScore: v.number(),
    recencyFactor: v.number(),
    engagementScore: v.number(), // likes * 2 + views * 0.5 + comments * 1.5
    likeCount: v.number(),
    viewCount: v.number(),
    commentCount: v.number(),
    createdAt: v.number(), // When the content was created
    computedAt: v.number(), // When this score was computed (for staleness check)
  })
    .index('by_content_type', ['contentType', 'trendingScore'])
    .index('by_contentId', ['contentId', 'contentType']),
})
