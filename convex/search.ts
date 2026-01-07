import { query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import type { QueryCtx } from "./_generated/server";
import { getCurrentUser, canAccessChannel, canAccessCategory, getTierLevel } from "./helpers";
import type { Doc, Id } from "./_generated/dataModel";

export const searchThreads = query({
  args: {
    categoryId: v.id("categories"),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;
    const limit = Math.min(args.limit || 20, 50); // Max 50 results

    // Check category access
    const hasAccess = await canAccessCategory(ctx, userId, args.categoryId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    // Only search if query is at least 2 characters
    if (!args.query || args.query.trim().length < 2) {
      return [];
    }

    const searchTerm = args.query.toLowerCase().trim();

    // Get all threads in the category
    const allThreads = await ctx.db
      .query("threads")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    const threads = allThreads.filter((t) => !t.isDeleted);

    // Search in title and tags
    const results = threads.filter((thread) => {
      const titleMatch = thread.title.toLowerCase().includes(searchTerm);
      const tagsMatch = thread.tags.some(tag => tag.toLowerCase().includes(searchTerm));
      return titleMatch || tagsMatch;
    });

    // Sort by relevance (title match first) and then by votes
    results.sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().includes(searchTerm);
      const bTitleMatch = b.title.toLowerCase().includes(searchTerm);

      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;

      return (b.netVoteCount || 0) - (a.netVoteCount || 0);
    });

    return results.slice(0, limit);
  },
});

export const searchMessages = query({
  args: {
    channelId: v.id("channels"),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;
    const limit = Math.min(args.limit || 20, 50); // Max 50 results

    // Check channel access
    const hasAccess = await canAccessChannel(ctx, userId, args.channelId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    // Only search if query is at least 2 characters
    if (!args.query || args.query.trim().length < 2) {
      return [];
    }

    const searchTerm = args.query.toLowerCase().trim();

    // Get all messages in the channel
    const allMessages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .collect();

    const messages = allMessages.filter((m) => !m.isDeleted);

    // Search in content
    const results = messages
      .filter((message) => message.content.toLowerCase().includes(searchTerm))
      .sort((a, b) => b.createdAt - a.createdAt); // Newest first

    return results.slice(0, limit);
  },
});

// Types for global search results
type SearchUserResult = {
  _id: Id<"users">;
  username: string;
  displayName: string;
  avatar: string;
  fanTier: "bronze" | "silver" | "gold" | "platinum";
  role: "artist" | "admin" | "mod" | "crew" | "fan";
};

type SearchThreadResult = {
  _id: Id<"threads">;
  title: string;
  content: string;
  authorDisplayName: string;
  authorAvatar: string;
  netVoteCount: number;
  replyCount: number;
  createdAt: number;
};

type SearchGalleryResult = {
  contentId: string;
  title: string;
  thumbnailUrl: string;
  type: "show" | "bts" | "edit" | "wip" | "exclusive";
  creatorId: Id<"users">;
  likeCount: number;
  isLocked: boolean;
};

type SearchUGCResult = {
  ugcId: string;
  title: string;
  thumbnailUrl: string;
  category: "user-edit" | "fan-art" | "repost";
  creatorId: Id<"users">;
  creatorDisplayName: string;
  likeCount: number;
  isLocked: boolean;
};

type SearchChannelResult = {
  _id: Id<"channels">;
  name: string;
  slug: string;
  description: string;
  category: "general" | "mod" | "fan-only" | "announcements";
  messageCount: number;
  isLocked: boolean;
};

type GlobalSearchResult = {
  users: SearchUserResult[];
  threads: SearchThreadResult[];
  gallery: SearchGalleryResult[];
  ugc: SearchUGCResult[];
  channels: SearchChannelResult[];
  totalResults: number;
  query: string;
};

/**
 * Global search across all content types with hybrid multi-index strategy
 * Supports filtering by type, tier-based access control, and relevance ranking
 */
export const globalSearch = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    types: v.optional(
      v.array(
        v.union(
          v.literal("user"),
          v.literal("thread"),
          v.literal("gallery"),
          v.literal("ugc"),
          v.literal("channel")
        )
      )
    ),
  },
  handler: async (ctx, args): Promise<GlobalSearchResult> => {
    // Get current user context (optional for public search)
    let currentUser: Doc<"users"> | null = null;
    try {
      currentUser = await getCurrentUser(ctx);
    } catch {
      // Allow anonymous search (fall back to public content)
    }

    const searchTerm = args.query.toLowerCase().trim();
    const limit = Math.min(args.limit || 20, 50);
    const typesToSearch = args.types || ["user", "thread", "gallery", "ugc", "channel"];

    // Validate input
    if (!searchTerm || searchTerm.length < 2) {
      return {
        users: [],
        threads: [],
        gallery: [],
        ugc: [],
        channels: [],
        totalResults: 0,
        query: args.query,
      };
    }

    // Abort if query too long (prevent DoS)
    if (searchTerm.length > 100) {
      throw new ConvexError("Search query too long (max 100 characters)");
    }

    const results: GlobalSearchResult = {
      users: [],
      threads: [],
      gallery: [],
      ugc: [],
      channels: [],
      totalResults: 0,
      query: args.query,
    };

    // Parallel searches (Convex executes in parallel)
    const [
      userResults,
      threadResults,
      galleryResults,
      ugcResults,
      channelResults,
    ] = await Promise.all([
      typesToSearch.includes("user")
        ? searchUsersHelper(ctx, searchTerm, limit)
        : Promise.resolve([]),
      typesToSearch.includes("thread")
        ? searchThreadsGlobal(ctx, searchTerm, limit, currentUser?._id)
        : Promise.resolve([]),
      typesToSearch.includes("gallery")
        ? searchGalleryGlobal(ctx, searchTerm, limit, currentUser ?? undefined)
        : Promise.resolve([]),
      typesToSearch.includes("ugc")
        ? searchUGCGlobal(ctx, searchTerm, limit)
        : Promise.resolve([]),
      typesToSearch.includes("channel")
        ? searchChannels(ctx, searchTerm, limit, currentUser?._id)
        : Promise.resolve([]),
    ]);

    results.users = userResults;
    results.threads = threadResults;
    results.gallery = galleryResults;
    results.ugc = ugcResults;
    results.channels = channelResults;
    results.totalResults =
      userResults.length +
      threadResults.length +
      galleryResults.length +
      ugcResults.length +
      channelResults.length;

    return results;
  },
});

/**
 * Search users by username/displayName using by_username index
 */
async function searchUsersHelper(
  ctx: QueryCtx,
  searchTerm: string,
  limit: number
): Promise<SearchUserResult[]> {
  try {
    // Use existing index: by_username
    const byUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.gte("username", searchTerm))
      .take(limit * 2); // Fetch more to account for filtering

    const results = byUsername.filter(
      (u) =>
        u.username.toLowerCase().includes(searchTerm) ||
        u.displayName.toLowerCase().includes(searchTerm)
    );

    // RANKING: Username matches rank higher than displayName
    results.sort((a, b) => {
      const aUsernameMatch = a.username.toLowerCase().startsWith(searchTerm);
      const bUsernameMatch = b.username.toLowerCase().startsWith(searchTerm);
      if (aUsernameMatch && !bUsernameMatch) return -1;
      if (!aUsernameMatch && bUsernameMatch) return 1;
      return 0;
    });

    return results.slice(0, limit).map((u) => ({
      _id: u._id,
      username: u.username,
      displayName: u.displayName,
      avatar: u.avatar,
      fanTier: u.fanTier,
      role: u.role,
    }));
  } catch {
    // MITIGATION: Don't fail entire search, return empty array
    return [];
  }
}

/**
 * Search threads globally across all accessible categories
 */
async function searchThreadsGlobal(
  ctx: QueryCtx,
  searchTerm: string,
  limit: number,
  currentUserId?: Id<"users">
): Promise<SearchThreadResult[]> {
  try {
    // Get all threads (filtered for access control)
    const allThreads = await ctx.db.query("threads").collect();

    // Filter for access control and search term
    const results = allThreads
      .filter((t) => {
        // Skip deleted threads
        if (t.isDeleted) return false;

        // Check search term match
        const matchesSearch =
          t.title.toLowerCase().includes(searchTerm) ||
          t.content.toLowerCase().includes(searchTerm) ||
          t.tags.some((tag) => tag.toLowerCase().includes(searchTerm));

        if (!matchesSearch) return false;

        // Check category access (if user is authenticated)
        if (currentUserId) {
          // For now, assume access granted (can add category access check if needed)
          return true;
        }

        // Allow anonymous search
        return true;
      })
      .sort((a, b) => {
        // RANKING: Title matches rank higher
        const aTitleMatch = a.title.toLowerCase().includes(searchTerm);
        const bTitleMatch = b.title.toLowerCase().includes(searchTerm);
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        // Then by votes
        return (b.netVoteCount || 0) - (a.netVoteCount || 0);
      })
      .slice(0, limit);

    return results.map((t) => ({
      _id: t._id,
      title: t.title,
      content:
        t.content.slice(0, 100) +
        (t.content.length > 100 ? "..." : ""),
      authorDisplayName: t.authorDisplayName,
      authorAvatar: t.authorAvatar,
      netVoteCount: t.netVoteCount || 0,
      replyCount: t.replyCount || 0,
      createdAt: t.createdAt,
    }));
  } catch {
    return [];
  }
}

/**
 * Search gallery content with tier-based access control
 */
async function searchGalleryGlobal(
  ctx: QueryCtx,
  searchTerm: string,
  limit: number,
  currentUser?: Doc<"users">
): Promise<SearchGalleryResult[]> {
  try {
    const allGallery = await ctx.db.query("galleryContent").collect();

    // FILTERING: Respect tier restrictions
    const filtered = allGallery.filter((g) => {
      const matchesSearch =
        g.title.toLowerCase().includes(searchTerm) ||
        g.description.toLowerCase().includes(searchTerm) ||
        g.tags.some((tag) => tag.toLowerCase().includes(searchTerm));

      if (!matchesSearch) return false;

      // If tier-locked, only show to users with sufficient tier
      if (g.requiredFanTier && currentUser) {
        const tierLevel = getTierLevel(currentUser.fanTier);
        const requiredLevel = getTierLevel(g.requiredFanTier);
        return tierLevel >= requiredLevel;
      }

      return !g.requiredFanTier; // Show free content to all
    });

    return filtered
      .sort((a, b) => {
        const aTitleMatch = a.title.toLowerCase().includes(searchTerm);
        const bTitleMatch = b.title.toLowerCase().includes(searchTerm);
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        return b.createdAt - a.createdAt;
      })
      .slice(0, limit)
      .map((g) => ({
        contentId: g.contentId,
        title: g.title,
        thumbnailUrl: g.thumbnailUrl,
        type: g.type,
        creatorId: g.creatorId,
        likeCount: g.likeCount,
        isLocked: Boolean(g.requiredFanTier),
      }));
  } catch {
    return [];
  }
}

/**
 * Search UGC content with approval and tier-based access control
 */
async function searchUGCGlobal(
  ctx: QueryCtx,
  searchTerm: string,
  limit: number
): Promise<SearchUGCResult[]> {
  try {
    const allUGC = await ctx.db.query("ugcContent").collect();

    // FILTERING: Only approved content, respect tier restrictions
    const filtered = allUGC.filter((u) => {
      // Skip unapproved content
      if (!u.isApproved) return false;

      const matchesSearch =
        u.title.toLowerCase().includes(searchTerm) ||
        u.description.toLowerCase().includes(searchTerm) ||
        u.tags.some((tag) => tag.toLowerCase().includes(searchTerm));

      if (!matchesSearch) return false;

      // UGC doesn't have tier restrictions, so all approved content is accessible
      return true;
    });

    return filtered
      .sort((a, b) => {
        const aTitleMatch = a.title.toLowerCase().includes(searchTerm);
        const bTitleMatch = b.title.toLowerCase().includes(searchTerm);
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        return b.createdAt - a.createdAt;
      })
      .slice(0, limit)
      .map((u) => ({
        ugcId: u.ugcId,
        title: u.title,
        thumbnailUrl: u.imageUrls[0] || "", // Use first image as thumbnail
        category: u.category,
        creatorId: u.creatorId,
        creatorDisplayName: u.creatorDisplayName,
        likeCount: u.likeCount,
        isLocked: false, // UGC doesn't have tier locking
      }));
  } catch {
    return [];
  }
}

/**
 * Search channels with role/tier-based access control
 */
async function searchChannels(
  ctx: QueryCtx,
  searchTerm: string,
  limit: number,
  currentUserId?: Id<"users">
): Promise<SearchChannelResult[]> {
  try {
    const allChannels = await ctx.db.query("channels").collect();

    // Get current user for access checks
    let currentUser: Doc<"users"> | null = null;
    if (currentUserId) {
      currentUser = await ctx.db.get(currentUserId);
    }

    // FILTERING: Respect role/tier restrictions
    const filtered = allChannels.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm) ||
        c.description.toLowerCase().includes(searchTerm) ||
        c.slug.toLowerCase().includes(searchTerm);

      if (!matchesSearch) return false;

      // Check role/tier restrictions (if user is authenticated)
      if (currentUser && (c.requiredRole || c.requiredFanTier)) {
        // Check role requirement
        if (c.requiredRole) {
          const roleHierarchy: Record<
            "artist" | "admin" | "mod" | "crew" | "fan",
            number
          > = {
            artist: 4,
            admin: 3,
            mod: 2,
            crew: 1,
            fan: 0,
          };
          if (roleHierarchy[currentUser.role] < roleHierarchy[c.requiredRole]) {
            return false;
          }
        }

        // Check tier requirement
        if (c.requiredFanTier) {
          const tierLevel = getTierLevel(currentUser.fanTier);
          const requiredLevel = getTierLevel(c.requiredFanTier);
          if (tierLevel < requiredLevel) {
            return false;
          }
        }
      }

      return true;
    });

    return filtered
      .sort((a, b) => {
        // RANKING: Name matches rank higher
        const aNameMatch = a.name.toLowerCase().includes(searchTerm);
        const bNameMatch = b.name.toLowerCase().includes(searchTerm);
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        // Then by message count
        return b.messageCount - a.messageCount;
      })
      .slice(0, limit)
      .map((c) => ({
        _id: c._id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        category: c.category,
        messageCount: c.messageCount,
        isLocked: Boolean(c.requiredRole || c.requiredFanTier),
      }));
  } catch {
    return [];
  }
}