import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getCurrentUser, canAccessCategory, isModerator } from "./helpers";

// QUERIES

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const clerkId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      return [];
    }

    const allCategories = await ctx.db.query("categories").collect();

    const tierHierarchy: Record<string, number> = {
      bronze: 0,
      silver: 1,
      gold: 2,
      platinum: 3,
    };

    const accessibleCategories = allCategories.filter((category) => {
      if (category.requiredRole && user.role !== category.requiredRole) {
        if (user.role !== "admin") {
          return false;
        }
      }

      if (category.requiredFanTier) {
        if (
          tierHierarchy[user.fanTier] <
          tierHierarchy[category.requiredFanTier]
        ) {
          return false;
        }
      }

      return true;
    });

    return accessibleCategories.sort((a, b) => a.order - b.order);
  },
});

export const getThreads = query({
  args: {
    categoryId: v.id("categories"),
    sort: v.union(
      v.literal("newest"),
      v.literal("top"),
      v.literal("mostReplies")
    ),
    limit: v.number(),
    cursor: v.optional(
      v.object({
        threadId: v.id("threads"),
        sortValue: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    const hasAccess = await canAccessCategory(ctx, userId, args.categoryId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    let limit = args.limit;
    if (limit > 50) {
      limit = 50;
    }

    let threads = await ctx.db
      .query("threads")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    threads = threads.filter((t) => !t.isDeleted);

    // Sort based on requested field
    if (args.sort === "newest") {
      threads.sort((a, b) => b.createdAt - a.createdAt);
    } else if (args.sort === "top") {
      threads.sort((a, b) => b.netVoteCount - a.netVoteCount);
    } else if (args.sort === "mostReplies") {
      threads.sort((a, b) => b.replyCount - a.replyCount);
    }

    // Handle cursor for pagination
    if (args.cursor) {
      const cursorIndex = threads.findIndex((t) => t._id === args.cursor!.threadId);
      if (cursorIndex !== -1) {
        threads = threads.slice(cursorIndex + 1);
      }
    }

    return threads.slice(0, limit);
  },
});

export const getThreadDetail = query({
  args: { 
    threadId: v.id("threads"),
    categoryId: v.id("categories")
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    const hasAccess = await canAccessCategory(ctx, userId, args.categoryId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.isDeleted) {
      throw new ConvexError("Thread not found");
    }

    // Note: View count increment should be done via a separate mutation
    // Queries cannot mutate data

    return thread;
  },
});

export const getReplies = query({
  args: {
    threadId: v.id("threads"),
    limit: v.number(),
    cursor: v.optional(
      v.object({
        replyId: v.id("replies"),
        createdAt: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    // Get thread to check access
    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      throw new ConvexError("Thread not found");
    }

    const hasAccess = await canAccessCategory(ctx, userId, thread.categoryId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    const allReplies = await ctx.db
      .query("replies")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .collect();

    // Filter out deleted replies and apply cursor if provided
    let filteredReplies = allReplies.filter((r) => !r.isDeleted);
    
    if (args.cursor) {
      const cursorIndex = filteredReplies.findIndex(
        (r) => r._id === args.cursor!.replyId
      );
      if (cursorIndex !== -1) {
        filteredReplies = filteredReplies.slice(cursorIndex + 1);
      }
    }

    // Sort by createdAt descending and take limit
    filteredReplies.sort((a, b) => b.createdAt - a.createdAt);
    return filteredReplies.slice(0, args.limit);
  },
});

// MUTATIONS

export const createThread = mutation({
  args: {
    categoryId: v.id("categories"),
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    // Rate limiting: max 3 threads per hour per user per category
    const oneHourAgo = Date.now() - 3600000;
    const allRecentThreads = await ctx.db
      .query("threads")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .collect();
    
    const recentThreads = allRecentThreads.filter(
      (t) => t.createdAt > oneHourAgo && t.categoryId === args.categoryId
    );

    if (recentThreads.length >= 3) {
      throw new ConvexError("Too many threads. Please wait before posting again.");
    }

    // Check category access
    const hasAccess = await canAccessCategory(ctx, userId, args.categoryId);
    if (!hasAccess) {
      throw new ConvexError("Access denied to this category");
    }

    // Validate title and content
    if (!args.title || args.title.trim().length === 0) {
      throw new ConvexError("Thread title cannot be empty");
    }
    if (args.title.length > 200) {
      throw new ConvexError("Thread title too long (max 200 characters)");
    }
    if (!args.content || args.content.trim().length === 0) {
      throw new ConvexError("Thread content cannot be empty");
    }
    if (args.content.length > 10000) {
      throw new ConvexError("Thread content too long (max 10000 characters)");
    }

    // Validate tags
    if (args.tags.length > 10) {
      throw new ConvexError("Too many tags (max 10)");
    }
    args.tags.forEach((tag) => {
      if (tag.length > 50) {
        throw new ConvexError("Tag too long (max 50 characters)");
      }
    });

    const threadId = await ctx.db.insert("threads", {
      title: args.title,
      content: args.content,
      authorId: userId,
      authorDisplayName: user.displayName,
      authorAvatar: user.avatar,
      authorTier: user.fanTier,
      categoryId: args.categoryId,
      tags: args.tags,
      upVoterIds: [],
      downVoterIds: [],
      upVoteCount: 0,
      downVoteCount: 0,
      netVoteCount: 0,
      replyCount: 0,
      viewCount: 0,
      isDeleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update category thread count and last thread
    const category = await ctx.db.get(args.categoryId);
    if (category) {
      await ctx.db.patch(args.categoryId, {
        threadCount: (category.threadCount || 0) + 1,
        lastThreadAt: Date.now(),
      });
    }

    return { threadId };
  },
});

export const editThread = mutation({
  args: {
    threadId: v.id("threads"),
    newTitle: v.optional(v.string()),
    newContent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    // Get the thread
    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      throw new ConvexError("Thread not found");
    }

    // Check permissions: only owner or mods can edit
    const canEdit = thread.authorId === userId || isModerator(user);
    if (!canEdit) {
      throw new ConvexError("Only thread author or mods can edit");
    }

    // Validate new content if provided
    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.newTitle !== undefined) {
      if (!args.newTitle || args.newTitle.trim().length === 0) {
        throw new ConvexError("Thread title cannot be empty");
      }
      if (args.newTitle.length > 200) {
        throw new ConvexError("Thread title too long (max 200 characters)");
      }
      updates.title = args.newTitle;
    }

    if (args.newContent !== undefined) {
      if (!args.newContent || args.newContent.trim().length === 0) {
        throw new ConvexError("Thread content cannot be empty");
      }
      if (args.newContent.length > 10000) {
        throw new ConvexError("Thread content too long (max 10000 characters)");
      }
      updates.content = args.newContent;
    }

    // Update the thread
    const updatedThread = await ctx.db.patch(args.threadId, updates);

    return updatedThread;
  },
});

export const createReply = mutation({
  args: {
    threadId: v.id("threads"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    // Rate limiting: max 10 replies per 30 minutes per user
    const thirtyMinutesAgo = Date.now() - 1800000;
    const allRecentReplies = await ctx.db
      .query("replies")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .collect();
    
    const recentReplies = allRecentReplies.filter(
      (r) => r.createdAt > thirtyMinutesAgo
    );

    if (recentReplies.length >= 10) {
      throw new ConvexError("Too many replies. Please slow down.");
    }

    // Get thread and check access
    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.isDeleted) {
      throw new ConvexError("Thread not found");
    }

    const hasAccess = await canAccessCategory(ctx, userId, thread.categoryId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    // Validate content
    if (!args.content || args.content.trim().length === 0) {
      throw new ConvexError("Reply content cannot be empty");
    }
    if (args.content.length > 5000) {
      throw new ConvexError("Reply content too long (max 5000 characters)");
    }

    const replyId = await ctx.db.insert("replies", {
      threadId: args.threadId,
      authorId: userId,
      authorDisplayName: user.displayName,
      authorAvatar: user.avatar,
      authorTier: user.fanTier,
      content: args.content,
      upVoterIds: [],
      downVoterIds: [],
      upVoteCount: 0,
      downVoteCount: 0,
      isDeleted: false,
      createdAt: Date.now(),
    });

    // Update thread stats
    await ctx.db.patch(args.threadId, {
      replyCount: (thread.replyCount || 0) + 1,
      lastReplyAt: Date.now(),
      lastReplyById: userId,
      updatedAt: Date.now(),
    });

    // Update category last thread time
    const category = await ctx.db.get(thread.categoryId);
    if (category) {
      await ctx.db.patch(thread.categoryId, {
        lastThreadAt: Date.now(),
      });
    }

    return { replyId };
  },
});

export const editReply = mutation({
  args: {
    replyId: v.id("replies"),
    newContent: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    // Get the reply
    const reply = await ctx.db.get(args.replyId);
    if (!reply) {
      throw new ConvexError("Reply not found");
    }

    // Check permissions: only owner or mods can edit
    const canEdit = reply.authorId === userId || isModerator(user);
    if (!canEdit) {
      throw new ConvexError("Only reply author or mods can edit");
    }

    // Validate new content
    if (!args.newContent || args.newContent.trim().length === 0) {
      throw new ConvexError("Reply content cannot be empty");
    }
    if (args.newContent.length > 5000) {
      throw new ConvexError("Reply content too long (max 5000 characters)");
    }

    // Update the reply
    const updatedReply = await ctx.db.patch(args.replyId, {
      content: args.newContent,
      editedAt: Date.now(),
    });

    return updatedReply;
  },
});

export const castThreadVote = mutation({
  args: {
    threadId: v.id("threads"),
    voteType: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    // Rate limiting: max 20 votes per 60 seconds per user
    const sixtySecondsAgo = Date.now() - 60000;
    const allRecentVotes = await ctx.db
      .query("offlineQueue")
      .withIndex("by_user_status", (q) => q.eq("userId", userId))
      .collect();
    
    const recentVotes = allRecentVotes.filter(
      (v) => v.createdAt > sixtySecondsAgo && 
             (v.type === "vote_thread" || v.type === "vote_reply")
    );

    if (recentVotes.length >= 20) {
      throw new ConvexError("Voting too fast. Please slow down.");
    }

    // Get thread
    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.isDeleted) {
      throw new ConvexError("Thread not found");
    }

    // Check category access
    const hasAccess = await canAccessCategory(ctx, userId, thread.categoryId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    // Update vote arrays
    const isCurrentlyUpvoted = thread.upVoterIds.includes(userId);
    const isCurrentlyDownvoted = thread.downVoterIds.includes(userId);

    let newUpVoterIds: typeof thread.upVoterIds;
    let newDownVoterIds: typeof thread.downVoterIds;
    let newUpVoteCount: number;
    let newDownVoteCount: number;

    if (args.voteType === "up") {
      if (isCurrentlyUpvoted) {
        // Remove upvote
        newUpVoterIds = thread.upVoterIds.filter((id) => id !== userId);
        newUpVoteCount = thread.upVoteCount - 1;
        newDownVoterIds = thread.downVoterIds;
        newDownVoteCount = thread.downVoteCount;
      } else {
        // Add upvote and remove downvote if present
        newUpVoterIds = [...thread.upVoterIds, userId];
        newUpVoteCount = thread.upVoteCount + 1;
        newDownVoterIds = thread.downVoterIds.filter((id) => id !== userId);
        newDownVoteCount = isCurrentlyDownvoted
          ? thread.downVoteCount - 1
          : thread.downVoteCount;
      }
    } else {
      if (isCurrentlyDownvoted) {
        // Remove downvote
        newDownVoterIds = thread.downVoterIds.filter((id) => id !== userId);
        newDownVoteCount = thread.downVoteCount - 1;
        newUpVoterIds = thread.upVoterIds;
        newUpVoteCount = thread.upVoteCount;
      } else {
        // Add downvote and remove upvote if present
        newDownVoterIds = [...thread.downVoterIds, userId];
        newDownVoteCount = thread.downVoteCount + 1;
        newUpVoterIds = thread.upVoterIds.filter((id) => id !== userId);
        newUpVoteCount = isCurrentlyUpvoted
          ? thread.upVoteCount - 1
          : thread.upVoteCount;
      }
    }

    const newNetVoteCount = newUpVoteCount - newDownVoteCount;

    // Update the thread
    await ctx.db.patch(args.threadId, {
      upVoterIds: newUpVoterIds,
      downVoterIds: newDownVoterIds,
      upVoteCount: newUpVoteCount,
      downVoteCount: newDownVoteCount,
      netVoteCount: newNetVoteCount,
      updatedAt: Date.now(),
    });

    const updatedThread = await ctx.db.get(args.threadId);
    return updatedThread;
  },
});

export const castReplyVote = mutation({
  args: {
    replyId: v.id("replies"),
    voteType: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    // Rate limiting: max 20 votes per 60 seconds per user
    const sixtySecondsAgo = Date.now() - 60000;
    const allRecentVotes = await ctx.db
      .query("offlineQueue")
      .withIndex("by_user_status", (q) => q.eq("userId", userId))
      .collect();
    
    const recentVotes = allRecentVotes.filter(
      (v) => v.createdAt > sixtySecondsAgo && 
             (v.type === "vote_thread" || v.type === "vote_reply")
    );

    if (recentVotes.length >= 20) {
      throw new ConvexError("Voting too fast. Please slow down.");
    }

    // Get reply
    const reply = await ctx.db.get(args.replyId);
    if (!reply) {
      throw new ConvexError("Reply not found");
    }

    // Get thread to check access
    const thread = await ctx.db.get(reply.threadId);
    if (!thread) {
      throw new ConvexError("Thread not found");
    }

    // Check category access
    const hasAccess = await canAccessCategory(ctx, userId, thread.categoryId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    // Update vote arrays
    const isCurrentlyUpvoted = reply.upVoterIds.includes(userId);
    const isCurrentlyDownvoted = reply.downVoterIds.includes(userId);

    let newUpVoterIds: typeof reply.upVoterIds;
    let newDownVoterIds: typeof reply.downVoterIds;
    let newUpVoteCount: number;
    let newDownVoteCount: number;

    if (args.voteType === "up") {
      if (isCurrentlyUpvoted) {
        // Remove upvote
        newUpVoterIds = reply.upVoterIds.filter((id) => id !== userId);
        newUpVoteCount = reply.upVoteCount - 1;
        newDownVoterIds = reply.downVoterIds;
        newDownVoteCount = reply.downVoteCount;
      } else {
        // Add upvote and remove downvote if present
        newUpVoterIds = [...reply.upVoterIds, userId];
        newUpVoteCount = reply.upVoteCount + 1;
        newDownVoterIds = reply.downVoterIds.filter((id) => id !== userId);
        newDownVoteCount = isCurrentlyDownvoted
          ? reply.downVoteCount - 1
          : reply.downVoteCount;
      }
    } else {
      if (isCurrentlyDownvoted) {
        // Remove downvote
        newDownVoterIds = reply.downVoterIds.filter((id) => id !== userId);
        newDownVoteCount = reply.downVoteCount - 1;
        newUpVoterIds = reply.upVoterIds;
        newUpVoteCount = reply.upVoteCount;
      } else {
        // Add downvote and remove upvote if present
        newDownVoterIds = [...reply.downVoterIds, userId];
        newDownVoteCount = reply.downVoteCount + 1;
        newUpVoterIds = reply.upVoterIds.filter((id) => id !== userId);
        newUpVoteCount = isCurrentlyUpvoted
          ? reply.upVoteCount - 1
          : reply.upVoteCount;
      }
    }

    // Update the reply
    await ctx.db.patch(args.replyId, {
      upVoterIds: newUpVoterIds,
      downVoterIds: newDownVoterIds,
      upVoteCount: newUpVoteCount,
      downVoteCount: newDownVoteCount,
    });

    const updatedReply = await ctx.db.get(args.replyId);
    return updatedReply;
  },
});

export const deleteThread = mutation({
  args: {
    threadId: v.id("threads"),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    // Get thread
    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      throw new ConvexError("Thread not found");
    }

    // Check permissions: only owner, mods, or admins can delete
    const canDelete = thread.authorId === userId || isModerator(user);
    if (!canDelete) {
      throw new ConvexError("Only thread owner or mods can delete");
    }

    // Check category access
    const hasAccess = await canAccessCategory(ctx, userId, args.categoryId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    // Soft delete the thread
    await ctx.db.patch(args.threadId, {
      isDeleted: true,
      deletedAt: Date.now(),
    });

    return { success: true };
  },
});

export const deleteReply = mutation({
  args: {
    replyId: v.id("replies"),
    threadId: v.id("threads"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    // Get reply
    const reply = await ctx.db.get(args.replyId);
    if (!reply) {
      throw new ConvexError("Reply not found");
    }

    // Check permissions: only owner, mods, or admins can delete
    const canDelete = reply.authorId === userId || isModerator(user);
    if (!canDelete) {
      throw new ConvexError("Only reply owner or mods can delete");
    }

    // Get thread to check access
    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      throw new ConvexError("Thread not found");
    }

    // Check category access
    const hasAccess = await canAccessCategory(ctx, userId, thread.categoryId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    // Soft delete the reply
    await ctx.db.patch(args.replyId, {
      isDeleted: true,
      deletedAt: Date.now(),
    });

    return { success: true };
  },
});

// Record offline vote helper
export const recordOfflineVote = mutation({
  args: {
    threadId: v.optional(v.id("threads")),
    replyId: v.optional(v.id("replies")),
    voteType: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;
    
    // Determine vote type and validate
    const voteType = args.threadId ? "vote_thread" : "vote_reply";
    const targetId = args.threadId || args.replyId;
    
    if (!targetId) {
      throw new ConvexError("Must provide either threadId or replyId");
    }
    
    // Insert into offline queue
    const queueItemId = await ctx.db.insert("offlineQueue", {
      userId,
      type: voteType,
      payload: {
        threadId: args.threadId,
        replyId: args.replyId,
        voteType: args.voteType,
      },
      status: "pending",
      retryCount: 0,
      createdAt: Date.now(),
    });
    
    return { queueItemId };
  },
});