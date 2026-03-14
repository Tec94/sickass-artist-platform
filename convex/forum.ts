import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { api, internal } from "./_generated/api";
import { getCurrentUser, canAccessCategory, isModerator, updateUserSocialPoints } from "./helpers";

// QUERIES

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const allCategories = await ctx.db.query("categories").collect();

    // Check if user is authenticated for role/tier filtering
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Return public categories (those without role/tier requirements)
      return allCategories
        .filter((c) => !c.requiredRole && !c.requiredFanTier)
        .sort((a, b) => a.order - b.order);
    }

    const clerkId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      // Return public categories if user record not found
      return allCategories
        .filter((c) => !c.requiredRole && !c.requiredFanTier)
        .sort((a, b) => a.order - b.order);
    }

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
    // Get category to check access requirements
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new ConvexError("Category not found");
    }

    // Check if category requires authentication
    const requiresAuth = category.requiredRole || category.requiredFanTier;

    if (requiresAuth) {
      // For restricted categories, require authentication
      const user = await getCurrentUser(ctx);
      const userId = user._id;

      const hasAccess = await canAccessCategory(ctx, userId, args.categoryId);
      if (!hasAccess) {
        throw new ConvexError("Access denied");
      }
    }
    // For public categories, allow viewing without authentication

    let limit = args.limit;
    if (limit > 50) {
      limit = 50;
    }

    let threads = await ctx.db
      .query("threads")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    threads = threads.filter(
      (t) => !t.isDeleted && (t.moderationStatus ?? "active") === "active"
    );

    // Sort based on requested field
    if (args.sort === "newest") {
      threads.sort((a, b) => b.createdAt - a.createdAt);
    } else if (args.sort === "top") {
      threads.sort((a, b) => (b.netVoteCount || 0) - (a.netVoteCount || 0));
    } else if (args.sort === "mostReplies") {
      threads.sort((a, b) => (b.replyCount || 0) - (a.replyCount || 0));
    }

    // Handle cursor for pagination
    if (args.cursor) {
      const cursorIndex = threads.findIndex((t) => t._id === args.cursor!.threadId);
      if (cursorIndex !== -1) {
        threads = threads.slice(cursorIndex + 1);
      }
    }

    return threads.slice(0, limit).map(t => ({
      ...t,
      upVoteCount: t.upVoteCount || 0,
      downVoteCount: t.downVoteCount || 0,
      netVoteCount: t.netVoteCount || 0,
      upVoterIds: t.upVoterIds || [],
      downVoterIds: t.downVoterIds || [],
    }));
  },
});

export const getThreadDetail = query({
  args: {
    threadId: v.id("threads"),
    categoryId: v.id("categories")
  },
  handler: async (ctx, args) => {
    // Get category to check access requirements
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new ConvexError("Category not found");
    }

    // Check if category requires authentication
    const requiresAuth = category.requiredRole || category.requiredFanTier;

    if (requiresAuth) {
      // For restricted categories, require authentication
      const user = await getCurrentUser(ctx);
      const userId = user._id;

      const hasAccess = await canAccessCategory(ctx, userId, args.categoryId);
      if (!hasAccess) {
        throw new ConvexError("Access denied");
      }
    }
    // For public categories, allow viewing without authentication

    const thread = await ctx.db.get(args.threadId);
    if (
      !thread ||
      thread.isDeleted ||
      (thread.moderationStatus ?? "active") !== "active"
    ) {
      throw new ConvexError("Thread not found");
    }

    // Note: View count increment should be done via a separate mutation
    // Queries cannot mutate data

    return {
      ...thread,
      upVoteCount: thread.upVoteCount || 0,
      downVoteCount: thread.downVoteCount || 0,
      netVoteCount: thread.netVoteCount || 0,
      upVoterIds: thread.upVoterIds || [],
      downVoterIds: thread.downVoterIds || [],
    };
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
    let filteredReplies = allReplies.filter(
      (r) => !r.isDeleted && (r.moderationStatus ?? "active") === "active"
    );

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
    return filteredReplies.slice(0, args.limit).map(r => ({
      ...r,
      upVoteCount: r.upVoteCount || 0,
      downVoteCount: r.downVoteCount || 0,
      upVoterIds: r.upVoterIds || [],
      downVoterIds: r.downVoterIds || [],
    }));
  },
});

// Combined query for thread detail page - returns thread and all replies
export const subscribeToThread = query({
  args: {
    threadId: v.id("threads"),
  },
  handler: async (ctx, args) => {
    // Get thread
    const thread = await ctx.db.get(args.threadId);
    if (
      !thread ||
      thread.isDeleted ||
      (thread.moderationStatus ?? "active") !== "active"
    ) {
      return null;
    }

    // Get all replies for this thread
    const allReplies = await ctx.db
      .query("replies")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .collect();

    const replies = allReplies
      .filter((r) => !r.isDeleted && (r.moderationStatus ?? "active") === "active")
      .sort((a, b) => a.createdAt - b.createdAt)
      .map(r => ({
        ...r,
        upVoteCount: r.upVoteCount || 0,
        downVoteCount: r.downVoteCount || 0,
        upVoterIds: r.upVoterIds || [],
        downVoterIds: r.downVoterIds || [],
      }));

    return {
      thread: {
        ...thread,
        upVoteCount: thread.upVoteCount || 0,
        downVoteCount: thread.downVoteCount || 0,
        netVoteCount: thread.netVoteCount || 0,
        upVoterIds: thread.upVoterIds || [],
        downVoterIds: thread.downVoterIds || [],
      },
      replies,
    };
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
      moderationStatus: "active",
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

    // Award points for thread creation
    const idempotencyKey = `thread-${threadId}`;
    try {
      await ctx.runMutation(api.points.awardPoints, {
        userId: userId,
        type: 'thread_post',
        amount: 20,
        description: 'Posted in forum',
        idempotencyKey,
      });
    } catch (error) {
      console.error('Failed to award points:', error);
      // Don't fail thread creation if points fail
    }

    try {
      await ctx.runMutation(internal.quests.incrementQuestProgress, {
        userId,
        questType: 'thread_post',
        amount: 1,
      });
    } catch (error) {
      console.error('Failed to increment quest progress:', error);
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
    if (
      !thread ||
      thread.isDeleted ||
      (thread.moderationStatus ?? "active") !== "active"
    ) {
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
      moderationStatus: "active",
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

    // Award points for forum reply
    const idempotencyKey = `reply-${replyId}`;
    try {
      await ctx.runMutation(api.points.awardPoints, {
        userId: userId,
        type: 'forum_reply',
        amount: 10,
        description: 'Replied in forum',
        idempotencyKey,
      });
    } catch (error) {
      console.error('Failed to award points:', error);
    }

    try {
      await ctx.runMutation(internal.quests.incrementQuestProgress, {
        userId,
        questType: 'forum_reply',
        amount: 1,
      });
    } catch (error) {
      console.error('Failed to increment quest progress:', error);
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
    if (
      !thread ||
      thread.isDeleted ||
      (thread.moderationStatus ?? "active") !== "active"
    ) {
      throw new ConvexError("Thread not found");
    }

    // Check category access
    const hasAccess = await canAccessCategory(ctx, userId, thread.categoryId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    // Update vote arrays
    const isCurrentlyUpvoted = thread.upVoterIds?.includes(userId) || false;
    const isCurrentlyDownvoted = thread.downVoterIds?.includes(userId) || false;

    let newUpVoterIds: typeof thread.upVoterIds = thread.upVoterIds || [];
    let newDownVoterIds: typeof thread.downVoterIds = thread.downVoterIds || [];
    let newUpVoteCount = thread.upVoteCount || 0;
    let newDownVoteCount = thread.downVoteCount || 0;

    if (args.voteType === "up") {
      if (isCurrentlyUpvoted) {
        // Remove upvote
        newUpVoterIds = newUpVoterIds.filter((id) => id !== userId);
        newUpVoteCount = Math.max(0, newUpVoteCount - 1);
      } else {
        // Add upvote and remove downvote if present
        newUpVoterIds = [...newUpVoterIds, userId];
        newUpVoteCount = newUpVoteCount + 1;
        if (isCurrentlyDownvoted) {
          newDownVoterIds = newDownVoterIds.filter((id) => id !== userId);
          newDownVoteCount = Math.max(0, newDownVoteCount - 1);
        }
      }
    } else {
      if (isCurrentlyDownvoted) {
        // Remove downvote
        newDownVoterIds = newDownVoterIds.filter((id) => id !== userId);
        newDownVoteCount = Math.max(0, newDownVoteCount - 1);
      } else {
        // Add downvote and remove upvote if present
        newDownVoterIds = [...newDownVoterIds, userId];
        newDownVoteCount = newDownVoteCount + 1;
        if (isCurrentlyUpvoted) {
          newUpVoterIds = newUpVoterIds.filter((id) => id !== userId);
          newUpVoteCount = Math.max(0, newUpVoteCount - 1);
        }
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

    // Sync points to author
    const oldNetVoteCount = thread.netVoteCount || 0;
    const pointDelta = newNetVoteCount - oldNetVoteCount;
    await updateUserSocialPoints(ctx, thread.authorId, pointDelta);

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
    const isCurrentlyUpvoted = reply.upVoterIds?.includes(userId) || false;
    const isCurrentlyDownvoted = reply.downVoterIds?.includes(userId) || false;

    let newUpVoterIds: typeof reply.upVoterIds = reply.upVoterIds || [];
    let newDownVoterIds: typeof reply.downVoterIds = reply.downVoterIds || [];
    let newUpVoteCount = reply.upVoteCount || 0;
    let newDownVoteCount = reply.downVoteCount || 0;

    if (args.voteType === "up") {
      if (isCurrentlyUpvoted) {
        // Remove upvote
        newUpVoterIds = newUpVoterIds.filter((id) => id !== userId);
        newUpVoteCount = Math.max(0, newUpVoteCount - 1);
      } else {
        // Add upvote and remove downvote if present
        newUpVoterIds = [...newUpVoterIds, userId];
        newUpVoteCount = newUpVoteCount + 1;
        if (isCurrentlyDownvoted) {
          newDownVoterIds = newDownVoterIds.filter((id) => id !== userId);
          newDownVoteCount = Math.max(0, newDownVoteCount - 1);
        }
      }
    } else {
      if (isCurrentlyDownvoted) {
        // Remove downvote
        newDownVoterIds = newDownVoterIds.filter((id) => id !== userId);
        newDownVoteCount = Math.max(0, newDownVoteCount - 1);
      } else {
        // Add downvote and remove upvote if present
        newDownVoterIds = [...newDownVoterIds, userId];
        newDownVoteCount = newDownVoteCount + 1;
        if (isCurrentlyUpvoted) {
          newUpVoterIds = newUpVoterIds.filter((id) => id !== userId);
          newUpVoteCount = Math.max(0, newUpVoteCount - 1);
        }
      }
    }

    // Update the reply
    await ctx.db.patch(args.replyId, {
      upVoterIds: newUpVoterIds,
      downVoterIds: newDownVoterIds,
      upVoteCount: newUpVoteCount,
      downVoteCount: newDownVoteCount,
    });

    // Sync points to author
    const oldNetVoteCount = (reply.upVoteCount || 0) - (reply.downVoteCount || 0);
    const newNetVoteCount = newUpVoteCount - newDownVoteCount;
    const pointDelta = newNetVoteCount - oldNetVoteCount;
    await updateUserSocialPoints(ctx, reply.authorId, pointDelta);

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
      moderationStatus: "removed",
      removedAt: Date.now(),
      removedBy: userId,
      removalReason: "Removed by author/moderator",
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
      moderationStatus: "removed",
      removedAt: Date.now(),
      removedBy: userId,
      removalReason: "Removed by author/moderator",
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

// Toggle a bookmark for a thread for the current user.
export const toggleThreadBookmark = mutation({
  args: {
    threadId: v.id("threads"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.isDeleted || (thread.moderationStatus ?? "active") !== "active") {
      throw new ConvexError("Thread not found");
    }

    const existing = await ctx.db
      .query("forumThreadBookmarks")
      .withIndex("by_user_thread", (q) => q.eq("userId", userId).eq("threadId", args.threadId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { bookmarked: false };
    }

    const now = Date.now();
    await ctx.db.insert("forumThreadBookmarks", {
      userId,
      threadId: args.threadId,
      createdAt: now,
      updatedAt: now,
    });

    return { bookmarked: true };
  },
});

// Returns bookmarked thread ids for current user ordered by newest bookmark first.
export const getBookmarkedThreadIds = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return [];

    const bookmarks = await ctx.db
      .query("forumThreadBookmarks")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(500);

    return bookmarks.map((bookmark) => bookmark.threadId);
  },
});

// Aggregate forum insights for the sidebar.
export const getForumInsights = query({
  args: {
    categoryId: v.optional(v.id("categories")),
    range: v.optional(v.union(v.literal("24h"), v.literal("7d"), v.literal("30d"))),
  },
  handler: async (ctx, args) => {
    const range = args.range ?? "7d";
    const now = Date.now();
    const rangeMs =
      range === "24h" ? 24 * 60 * 60 * 1000 : range === "30d" ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    const cutoff = now - rangeMs;

    const categories = await ctx.db.query("categories").collect();
    const categoryNameById = new Map(categories.map((category) => [String(category._id), category.name]));

    const allThreads = await ctx.db.query("threads").collect();
    const scopedThreads = allThreads.filter((thread) => {
      if (thread.isDeleted) return false;
      if ((thread.moderationStatus ?? "active") !== "active") return false;
      if (args.categoryId && thread.categoryId !== args.categoryId) return false;
      return thread.createdAt >= cutoff;
    });

    const scopedThreadIdSet = new Set(scopedThreads.map((thread) => String(thread._id)));
    const allReplies = await ctx.db.query("replies").collect();
    const scopedReplies = allReplies.filter((reply) => {
      if (reply.isDeleted) return false;
      if ((reply.moderationStatus ?? "active") !== "active") return false;
      if (!scopedThreadIdSet.has(String(reply.threadId))) return false;
      return reply.createdAt >= cutoff;
    });

    const userMetrics = new Map<
      string,
      {
        userId: string;
        displayName: string;
        avatar: string;
        threadCount: number;
        replyCount: number;
        score: number;
      }
    >();

    const ensureUserMetric = (userId: string, displayName: string, avatar: string) => {
      const existing = userMetrics.get(userId);
      if (existing) return existing;
      const next = {
        userId,
        displayName,
        avatar,
        threadCount: 0,
        replyCount: 0,
        score: 0,
      };
      userMetrics.set(userId, next);
      return next;
    };

    for (const thread of scopedThreads) {
      const metric = ensureUserMetric(String(thread.authorId), thread.authorDisplayName, thread.authorAvatar);
      metric.threadCount += 1;
      metric.score += (thread.netVoteCount || 0) * 2 + (thread.replyCount || 0);
    }

    for (const reply of scopedReplies) {
      const metric = ensureUserMetric(String(reply.authorId), reply.authorDisplayName, reply.authorAvatar);
      metric.replyCount += 1;
      metric.score += (reply.upVoteCount || 0) - (reply.downVoteCount || 0) + 1;
    }

    const topUsers = Array.from(userMetrics.values())
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.threadCount !== a.threadCount) return b.threadCount - a.threadCount;
        return b.replyCount - a.replyCount;
      })
      .slice(0, 8);

    const categoryCounts = new Map<string, number>();
    for (const thread of scopedThreads) {
      const key = String(thread.categoryId);
      categoryCounts.set(key, (categoryCounts.get(key) ?? 0) + 1);
    }

    const activeTopics = Array.from(categoryCounts.entries())
      .map(([categoryId, threadCount]) => ({
        categoryId,
        name: categoryNameById.get(categoryId) ?? "Unknown",
        threadCount,
      }))
      .sort((a, b) => b.threadCount - a.threadCount)
      .slice(0, 8);

    const hotThreads = [...scopedThreads]
      .sort((a, b) => {
        const aScore = (a.netVoteCount || 0) * 2 + (a.replyCount || 0) + Math.floor((a.viewCount || 0) / 25);
        const bScore = (b.netVoteCount || 0) * 2 + (b.replyCount || 0) + Math.floor((b.viewCount || 0) / 25);
        return bScore - aScore;
      })
      .slice(0, 6)
      .map((thread) => ({
        _id: thread._id,
        title: thread.title,
        authorDisplayName: thread.authorDisplayName,
        categoryId: thread.categoryId,
        categoryName: categoryNameById.get(String(thread.categoryId)) ?? "Unknown",
        replyCount: thread.replyCount || 0,
        viewCount: thread.viewCount || 0,
        netVoteCount: thread.netVoteCount || 0,
        createdAt: thread.createdAt,
      }));

    const uniqueAuthors = new Set<string>();
    for (const thread of scopedThreads) uniqueAuthors.add(String(thread.authorId));
    for (const reply of scopedReplies) uniqueAuthors.add(String(reply.authorId));

    return {
      range,
      topUsers,
      activeTopics,
      hotThreads,
      stats: {
        totalThreads: scopedThreads.length,
        totalReplies: scopedReplies.length,
        uniqueAuthors: uniqueAuthors.size,
      },
      generatedAt: now,
    };
  },
});

// Seed default categories (run once to initialize)
export const seedCategories = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if categories already exist
    const existingCategories = await ctx.db.query("categories").first();
    if (existingCategories) {
      return { message: "Categories already exist" };
    }

    const defaultCategories = [
      {
        name: "General Discussion",
        slug: "general",
        description: "Chat about anything and everything",
        icon: "solar:chat-round-dots-linear",
        color: "#6366f1",
        order: 1,
      },
      {
        name: "Art & Creations",
        slug: "art",
        description: "Share and discuss artwork and creative projects",
        icon: "solar:palette-linear",
        color: "#ec4899",
        order: 2,
      },
      {
        name: "Music",
        slug: "music",
        description: "Discuss tracks, albums, and music production",
        icon: "solar:music-notes-linear",
        color: "#10b981",
        order: 3,
      },
      {
        name: "Announcements",
        slug: "announcements",
        description: "Official news and updates",
        icon: "solar:megaphone-linear",
        color: "#f59e0b",
        order: 0,
      },
      {
        name: "Feedback & Suggestions",
        slug: "feedback",
        description: "Share your ideas to help improve the platform",
        icon: "solar:lightbulb-linear",
        color: "#8b5cf6",
        order: 4,
      },
    ];

    const now = Date.now();
    for (const category of defaultCategories) {
      await ctx.db.insert("categories", {
        ...category,
        threadCount: 0,
        createdAt: now,
      });
    }

    return { message: "Categories seeded successfully", count: defaultCategories.length };
  },
});
