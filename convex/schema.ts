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

    // Social Points (Karma)
    votedPoints: v.optional(v.number()),

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

    // Voting
    upVoterIds: v.optional(v.array(v.id('users'))),
    downVoterIds: v.optional(v.array(v.id('users'))),
    upVoteCount: v.optional(v.number()),
    downVoteCount: v.optional(v.number()),
    netVoteCount: v.optional(v.number()),

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
    upVoterIds: v.optional(v.array(v.id('users'))),
    downVoterIds: v.optional(v.array(v.id('users'))),
    upVoteCount: v.optional(v.number()),
    downVoteCount: v.optional(v.number()),
    netVoteCount: v.optional(v.number()),
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
    upVoterIds: v.optional(v.array(v.id('users'))),
    downVoterIds: v.optional(v.array(v.id('users'))),
    upVoteCount: v.optional(v.number()),
    downVoteCount: v.optional(v.number()),
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
      v.literal('reaction'),
      v.literal('like_gallery'),
      v.literal('like_ugc')
    ),
    action: v.optional(v.union(v.literal('like'), v.literal('unlike'))),
    payload: v.optional(
      v.object({
        channelId: v.optional(v.id('channels')),
        threadId: v.optional(v.id('threads')),
        replyId: v.optional(v.id('replies')),
        messageId: v.optional(v.id('messages')),
        content: v.optional(v.string()),
        emoji: v.optional(v.string()),
        voteType: v.optional(v.union(v.literal('up'), v.literal('down'))),
        contentId: v.optional(v.string()),
        ugcId: v.optional(v.string()),
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

  // ==================== EVENTS & TICKETING SYSTEM ====================

  // Venues table - Reusable venue definitions with timezone support
  // Stores physical locations where events take place
  venues: defineTable({
    name: v.string(),                   // Venue name (1-100 chars)
    city: v.string(),                   // City name (1-50 chars)
    country: v.string(),                // Country (2-letter ISO code or full name)
    address: v.string(),                // Full address for map link (5-500 chars)
    latitude: v.optional(v.number()),   // GPS latitude (-90 to 90) for future map features
    longitude: v.optional(v.number()),  // GPS longitude (-180 to 180) for future map features
    capacity: v.optional(v.number()),   // Venue max capacity (for validation)
    timezone: v.string(),               // IANA timezone (e.g., 'America/New_York')
    createdAt: v.number(),              // Creation timestamp (UTC milliseconds)
  })
    .index('by_city', ['city'])         // Query venues by city
    .index('by_timezone', ['timezone']), // Query venues by timezone (for filtering)

  // Events table - Main event records with snapshotted venue data
  // Stores all event details with immutable venue snapshot to handle deletions/DST
  events: defineTable({
    title: v.string(),                  // Event title (1-200 chars)
    description: v.string(),            // Event description (1-2000 chars)
    imageUrl: v.string(),               // Event banner image (CDN path, required)
    thumbnailUrl: v.optional(v.string()), // Thumbnail for lists (optional)
    startAtUtc: v.number(),             // Event start time (UTC milliseconds, must be > now)
    endAtUtc: v.number(),               // Event end time (UTC milliseconds, must be > startAtUtc)

    // Venue reference + snapshot (immutable after creation)
    venueId: v.id('venues'),            // Reference to venues table
    venueName: v.string(),              // Snapshot of venue.name (for searches if venue deleted)
    city: v.string(),                   // Snapshot of venue.city (for filtering)
    country: v.string(),                // Snapshot of venue.country
    address: v.string(),                // Snapshot of venue.address (for map link)
    timezone: v.string(),               // Snapshot of venue.timezone (immutable, handles DST)

    // Capacity & sales tracking
    capacity: v.number(),               // Total tickets available (1-100,000)
    ticketsSold: v.number(),            // Current tickets sold (starts at 0, incremented atomically)

    // Sale status management
    saleStatus: v.union(
      v.literal('upcoming'),            // Sales not started yet
      v.literal('on_sale'),             // Sales active
      v.literal('sold_out'),            // All tickets sold
      v.literal('cancelled')            // Event cancelled
    ),

    // Creator & search
    artistId: v.id('users'),            // Event creator (artist/admin/mod)
    searchText: v.string(),             // Computed: title + " " + venueName + " " + city (for search index)
    dedupeKey: v.string(),              // Unique: artistId:venueId:startAtUtc:slug(title) (prevents duplicates)

    // Queue management
    nextQueueSeq: v.number(),           // Atomic counter for queue sequence (starts at 0, incremented in joinQueue)

    // Metadata
    createdAt: v.number(),              // Creation timestamp (UTC milliseconds)
    updatedAt: v.number(),              // Last update timestamp (UTC milliseconds)
  })
    .index('by_status_start', ['saleStatus', 'startAtUtc'])  // Main query: list upcoming events
    .index('by_city_start', ['city', 'startAtUtc'])          // Filter by city + sort by start time
    .index('by_artist_start', ['artistId', 'startAtUtc'])    // Creator's events
    .index('by_dedupe', ['dedupeKey'])                       // Unique constraint check + duplicate prevention
    .searchIndex('search_events', {
      searchField: 'searchText',
      filterFields: ['saleStatus', 'city']                   // Fast keyword search + field filtering
    }),

  // Event Tickets table - Ticket type definitions per event
  // Stores ticket types (general, vip, early_bird) with inventory tracking
  eventTickets: defineTable({
    eventId: v.id('events'),            // Parent event reference
    type: v.union(
      v.literal('general'),             // General admission
      v.literal('vip'),                 // VIP access
      v.literal('early_bird')           // Early bird pricing
    ),
    price: v.number(),                  // Price in cents (0-999,999), e.g., 9999 = $99.99
    quantity: v.number(),               // Total available for this type (1-100,000)
    quantitySold: v.number(),           // Current sold count (starts at 0, incremented atomically)
    description: v.optional(v.string()), // Optional description (e.g., "VIP meet & greet")
    saleStartsAtUtc: v.number(),        // Sale window start (UTC milliseconds)
    saleEndsAtUtc: v.number(),          // Sale window end (UTC milliseconds, must be <= event.startAtUtc)
    createdAt: v.number(),              // Creation timestamp (UTC milliseconds)
  })
    .index('by_event_type', ['eventId', 'type'])  // Query all ticket types for an event
    .index('by_event', ['eventId']),               // Query all ticket types (for validation)

  // User Tickets table - Purchased tickets owned by users
  // Stores individual ticket purchases with validation codes
  userTickets: defineTable({
    userId: v.id('users'),              // Ticket owner
    eventId: v.id('events'),            // Event reference
    ticketType: v.union(
      v.literal('general'),
      v.literal('vip'),
      v.literal('early_bird')
    ),
    quantity: v.number(),               // Number of tickets purchased (1-10 per transaction)
    ticketNumber: v.string(),           // Unique identifier (format: EVENT_ID-SEQ)
    confirmationCode: v.string(),       // 8-char alphanumeric code (for entry gate validation)
    purchasedAtUtc: v.number(),         // Purchase timestamp (UTC milliseconds)
    status: v.union(
      v.literal('valid'),               // Ticket is valid
      v.literal('used'),                // Ticket has been used (checked in)
      v.literal('cancelled')            // Ticket cancelled/refunded
    ),
    createdAt: v.number(),              // Creation timestamp (UTC milliseconds)
  })
    .index('by_user', ['userId'])
    .index('by_event_user', ['eventId', 'userId'])      // Check if user has tickets for event
    .index('by_user_status', ['userId', 'status']),     // Filter my tickets by status

  // Event Queue table - Virtual queue for high-demand events
  // Manages user position in line with automatic expiry
  // Error mitigation: Oversell prevention via atomic sequence allocation
  eventQueue: defineTable({
    eventId: v.id('events'),            // Event reference
    userId: v.id('users'),              // User in queue
    seq: v.number(),                    // Queue position (monotonically allocated from event.nextQueueSeq)
    status: v.union(
      v.literal('waiting'),             // User is waiting in queue
      v.literal('admitted'),            // User admitted to checkout
      v.literal('expired'),             // Queue entry expired (30min default)
      v.literal('left')                 // User left queue voluntarily
    ),
    joinedAtUtc: v.number(),            // Join timestamp (UTC milliseconds)
    expiresAtUtc: v.number(),           // Expiry timestamp (joinedAtUtc + 30*60*1000 default)
    cooldownUntilUtc: v.optional(v.number()), // Cooldown after leaving (prevents rejoin spam, 1h default)
    notifiedAtUtc: v.optional(v.number()),    // When user was notified of position change (future use)
    createdAt: v.number(),              // Creation timestamp (UTC milliseconds)
  })
    .index('by_event_user', ['eventId', 'userId'])          // Upsert check: is user already in queue?
    .index('by_event_status_seq', ['eventId', 'status', 'seq']) // Query position: count waiting with seq < mine
    .index('by_event_expires', ['eventId', 'expiresAtUtc'])     // Cron: query expired entries by event
    .index('by_expires', ['expiresAtUtc']),                     // Cron: global cleanup of all expired entries

  // Checkout Sessions table - Throttles concurrent checkouts
  // Prevents thundering herd problem during high-demand sales
  // Error mitigation: Limits concurrent checkouts per event (e.g., max 5)
  checkoutSessions: defineTable({
    eventId: v.id('events'),            // Event reference
    userId: v.id('users'),              // User checking out
    createdAtUtc: v.number(),           // Session start timestamp (UTC milliseconds)
    expiresAtUtc: v.number(),           // Session expiry (createdAtUtc + 10*60*1000 for 10-minute window)
  })
    .index('by_event', ['eventId'])                         // Count active sessions per event (for throttling)
    .index('by_event_user', ['eventId', 'userId'])          // Enforce 1 session per user per event
    .index('by_expires', ['expiresAtUtc']),                 // Cron: cleanup expired sessions every 5 minutes

  // ==================== MERCHANDISE SYSTEM ====================

  // Products table - Main product catalog with pricing and inventory
  merchProducts: defineTable({
    // Basic info
    name: v.string(),                  // "Tour T-Shirt"
    description: v.string(),           // Short description
    longDescription: v.optional(v.string()), // Markdown/rich text

    // Pricing (in cents, e.g., 9999 = $99.99)
    price: v.number(),                  // Base price
    discount: v.optional(v.number()),  // Discount percentage (0-100)

    // Inventory management
    totalStock: v.number(),             // Total across all variants
    lowStockThreshold: v.number(),      // Alert at this count (default: 10)

    // Images
    imageUrls: v.array(v.string()),     // Gallery of images (max 10)
    thumbnailUrl: v.string(),           // Main thumbnail

    // Categorization
    category: v.union(
      v.literal('apparel'),
      v.literal('accessories'),
      v.literal('vinyl'),
      v.literal('limited'),
      v.literal('other')
    ),
    tags: v.array(v.string()),          // For search/filtering (max 5)

    // Status & visibility
    status: v.union(
      v.literal('active'),
      v.literal('draft'),
      v.literal('archived'),
      v.literal('discontinued')
    ),

    // Drops & pre-orders
    isPreOrder: v.boolean(),
    preOrderDeadline: v.optional(v.number()), // Timestamp (ms)
    isDropProduct: v.boolean(),
    dropStartsAt: v.optional(v.number()),     // Timestamp (ms)
    dropEndsAt: v.optional(v.number()),       // Timestamp (ms)

    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id('users'),            // Artist/admin who created
  })
    .index('by_status', ['status'])
    .index('by_category', ['category'])
    .index('by_created', ['createdAt'])
    .index('by_drop', ['isDropProduct', 'dropStartsAt']),

  // Product variants - Size/color/style combinations
  merchVariants: defineTable({
    productId: v.id('merchProducts'),
    sku: v.string(),                    // Unique SKU (e.g., "TOUR-TSH-XL-BLK")

    // Variant options
    size: v.optional(v.string()),       // "XL", "One Size", etc.
    color: v.optional(v.string()),      // "Black", "White", etc.
    style: v.optional(v.string()),      // "Crewneck", "Hoodie", etc.

    // Pricing & stock
    price: v.optional(v.number()),      // Override product price (if different)
    stock: v.number(),                  // Quantity available (>= 0)
    weight: v.optional(v.number()),     // In grams, for shipping

    // Status
    status: v.union(
      v.literal('available'),
      v.literal('low_stock'),
      v.literal('out_of_stock'),
      v.literal('discontinued')
    ),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_product', ['productId'])
    .index('by_sku', ['sku']),

  // Shopping cart items - User's cart with price locking
  merchCart: defineTable({
    userId: v.id('users'),
    items: v.array(v.object({
      variantId: v.id('merchVariants'),
      quantity: v.number(),             // 1-100
      priceAtAddTime: v.number(),       // Lock price when added (prevent manipulation)
      addedAt: v.number(),              // Timestamp when added
    })),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId']),

  // Orders - Completed purchases with full snapshot
  merchOrders: defineTable({
    userId: v.id('users'),
    orderNumber: v.string(),            // "ORD-1704067200000" (unique)

    // Items ordered
    items: v.array(v.object({
      variantId: v.id('merchVariants'),
      productName: v.string(),
      variantName: v.string(),          // "XL Black" (display)
      quantity: v.number(),
      pricePerUnit: v.number(),         // Price at purchase time
      totalPrice: v.number(),           // quantity × pricePerUnit
    })),

    // Pricing breakdown (in cents)
    subtotal: v.number(),
    tax: v.number(),                    // 10% of subtotal
    shipping: v.number(),               // $10 = 1000
    discount: v.optional(v.number()),   // Future: coupon codes
    total: v.number(),                  // subtotal + tax + shipping - discount

    // Shipping address
    shippingAddress: v.object({
      name: v.string(),
      email: v.string(),
      addressLine1: v.string(),
      addressLine2: v.optional(v.string()),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
    }),

    // Status & tracking
    status: v.union(
      v.literal('pending'),
      v.literal('paid'),
      v.literal('processing'),
      v.literal('shipped'),
      v.literal('delivered'),
      v.literal('cancelled')
    ),

    trackingNumber: v.optional(v.string()),
    trackingUrl: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    shippedAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
  })
    .index('by_user', ['userId'])
    .index('by_order_number', ['orderNumber'])
    .index('by_status', ['status']),

  // Inventory audit log - Track all stock changes
  merchInventoryLog: defineTable({
    variantId: v.id('merchVariants'),
    change: v.number(),                // Positive (restock) or negative (purchase/loss)
    reason: v.union(
      v.literal('purchase'),
      v.literal('restock'),
      v.literal('manual_correction'),
      v.literal('return'),
      v.literal('damage')
    ),
    orderId: v.optional(v.id('merchOrders')),
    notes: v.optional(v.string()),      // For manual corrections
    createdBy: v.optional(v.id('users')), // For manual adjustments
    createdAt: v.number(),
  })
    .index('by_variant', ['variantId'])
    .index('by_created', ['createdAt']),

  // Drop schedules - Limited-time product drops
  merchDrops: defineTable({
    name: v.string(),                   // "Summer Collection Drop"
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),

    // Timing
    startsAt: v.number(),               // Timestamp (ms)
    endsAt: v.number(),                 // Timestamp (ms)

    // Products in this drop
    products: v.array(v.id('merchProducts')),

    // Display order
    priority: v.number(),               // For ordering (0 = highest)

    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id('users'),
  })
    .index('by_starts', ['startsAt'])
    .index('by_status', ['startsAt', 'endsAt']),

  // Inventory audit log - Tracks inventory inconsistency checks and issues
  inventoryAuditLog: defineTable({
    timestamp: v.number(),              // When the audit was run
    issues: v.array(v.object({
      variantId: v.id('merchVariants'),
      sku: v.string(),
      type: v.union(
        v.literal('negative_stock'),
        v.literal('discrepancy')
      ),
      currentStock: v.optional(v.number()),
      expectedStock: v.optional(v.number()),
      severity: v.union(
        v.literal('warning'),
        v.literal('critical')
      ),
      timestamp: v.number(),
    })),
    resolvedAt: v.optional(v.number()), // When issues were resolved
    resolvedBy: v.optional(v.id('users')), // Admin who resolved issues
  }),

  // User settings for specific channels (mute, deafen)
  userChannelSettings: defineTable({
    userId: v.id('users'),
    channelId: v.id('channels'),
    muted: v.boolean(),
    deafened: v.boolean(),
    updatedAt: v.number(),
  })
    .index('by_user_channel', ['userId', 'channelId'])
    .index('by_user', ['userId']),

  // Merch wishlist - User's favorite products
  merchWishlist: defineTable({
    userId: v.id('users'),
    productId: v.id('merchProducts'),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_product', ['productId'])
    .index('by_user_product', ['userId', 'productId']),
})
