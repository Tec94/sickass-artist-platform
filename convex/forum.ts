import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import {
  getCurrentUser,
  canAccessCategory,
  isModerator,
} from "./helpers";

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

    // Apply cursor pagination
    if (args.cursor) {
      const cursorIndex = threads.findIndex(
        (t) => t._id === args.cursor!.threadId
      );
      if (cursorIndex !== -1) {
        threads = threads.slice(cursorIndex + 1);
      }
    }

    const paginatedThreads = threads.slice(0, limit);

    // Determine which field to use for next cursor
    const sortField =
      args.sort === "newest"
        ? "createdAt"
        : args.sort === "top"
        ? "netVoteCount"
        : "replyCount";

    return {
      threads: paginatedThreads,
      nextCursor:
        threads.length > limit
          ? {
              threadId: paginatedThreads[paginatedThreads.length - 1]._id,
              sortValue: paginatedThreads[paginatedThreads.length - 1][
                sortField as keyof Doc<"threads">
              ] as number,
            }
          : null,
    };
  },
});

export const getThreadDetail = query({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      throw new ConvexError("Thread not found");
    }

    if (thread.isDeleted) {
      throw new ConvexError("Thread is deleted");
    }

    const hasAccess = await canAccessCategory(ctx, userId, thread.categoryId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    const replies = await ctx.db
      .query("replies")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .collect();

    const nonDeletedReplies = replies.filter((r) => !r.isDeleted);

    return {
      thread,
      replies: nonDeletedReplies,
      replyCount: nonDeletedReplies.length,
    };
  },
});

export const subscribeToThread = query({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.isDeleted) {
      return null;
    }

    const hasAccess = await canAccessCategory(ctx, userId, thread.categoryId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    const replies = await ctx.db
      .query("replies")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .collect();

    const nonDeletedReplies = replies.filter((r) => !r.isDeleted);

    return {
      thread,
      replies: nonDeletedReplies,
    };
  },
});

// MUTATIONS

export const createThread = mutation({
  args: {
    categoryId: v.id("categories"),
    title: v.string(),
    content: v.string(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    const hasAccess = await canAccessCategory(ctx, userId, args.categoryId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    const trimmedTitle = args.title.trim();
    if (!trimmedTitle) {
      throw new ConvexError("Title cannot be empty");
    }

    if (trimmedTitle.length > 200) {
      throw new ConvexError("Title must be 200 characters or less");
    }

    const trimmedContent = args.content.trim();
    if (!trimmedContent) {
      throw new ConvexError("Content cannot be empty");
    }

    if (trimmedContent.length > 10000) {
      throw new ConvexError("Content must be 10000 characters or less");
    }

    if (args.tags) {
      for (const tag of args.tags) {
        if (tag.length > 20) {
          throw new ConvexError("Each tag must be 20 characters or less");
        }
      }
    }

    const now = Date.now();

    const threadId = await ctx.db.insert("threads", {
      title: trimmedTitle,
      content: trimmedContent,
      authorId: userId,
      authorDisplayName: user.displayName,
      authorAvatar: user.avatar,
      authorTier: user.fanTier,
      categoryId: args.categoryId,
      tags: args.tags || [],
      upVoterIds: [],
      downVoterIds: [],
      upVoteCount: 0,
      downVoteCount: 0,
      netVoteCount: 0,
      replyCount: 0,
      viewCount: 0,
      lastReplyAt: undefined,
      lastReplyById: undefined,
      isDeleted: false,
      deletedAt: undefined,
      createdAt: now,
      updatedAt: now,
    });

    const category = await ctx.db.get(args.categoryId);
    if (category) {
      await ctx.db.patch(args.categoryId, {
        threadCount: category.threadCount + 1,
        lastThreadAt: now,
      });
    }

    const thread = await ctx.db.get(threadId);
    return thread;
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

    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      throw new ConvexError("Thread not found");
    }

    if (thread.isDeleted) {
      throw new ConvexError("Thread is deleted");
    }

    const hasAccess = await canAccessCategory(ctx, userId, thread.categoryId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    const trimmedContent = args.content.trim();
    if (!trimmedContent) {
      throw new ConvexError("Content cannot be empty");
    }

    if (trimmedContent.length > 5000) {
      throw new ConvexError("Content must be 5000 characters or less");
    }

    const now = Date.now();

    const replyId = await ctx.db.insert("replies", {
      threadId: args.threadId,
      authorId: userId,
      authorDisplayName: user.displayName,
      authorAvatar: user.avatar,
      authorTier: user.fanTier,
      content: trimmedContent,
      editedAt: undefined,
      upVoterIds: [],
      downVoterIds: [],
      upVoteCount: 0,
      downVoteCount: 0,
      isDeleted: false,
      deletedAt: undefined,
      createdAt: now,
    });

    await ctx.db.patch(args.threadId, {
      replyCount: thread.replyCount + 1,
      lastReplyAt: now,
      lastReplyById: replyId,
      updatedAt: now,
    });

    const reply = await ctx.db.get(replyId);
    return reply;
  },
});

export const castThreadVote = mutation({
  args: {
    threadId: v.id("threads"),
    direction: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      throw new ConvexError("Thread not found");
    }

    if (thread.isDeleted) {
      throw new ConvexError("Thread is deleted");
    }

    const hasAccess = await canAccessCategory(ctx, userId, thread.categoryId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    // Read current state for atomic vote operation
    const userAlreadyVotedUp = thread.upVoterIds.includes(userId);
    const userAlreadyVotedDown = thread.downVoterIds.includes(userId);

    // Build new state
    let newUpVoters = [...thread.upVoterIds];
    let newDownVoters = [...thread.downVoterIds];

    if (args.direction === "up") {
      if (userAlreadyVotedUp) {
        // Toggle off
        newUpVoters = newUpVoters.filter((id) => id !== userId);
      } else {
        // Add up vote, remove down if exists
        newUpVoters.push(userId);
        newDownVoters = newDownVoters.filter((id) => id !== userId);
      }
    } else {
      if (userAlreadyVotedDown) {
        // Toggle off
        newDownVoters = newDownVoters.filter((id) => id !== userId);
      } else {
        // Add down vote, remove up if exists
        newDownVoters.push(userId);
        newUpVoters = newUpVoters.filter((id) => id !== userId);
      }
    }

    const netVoteCount = newUpVoters.length - newDownVoters.length;

    // Patch atomically
    await ctx.db.patch(args.threadId, {
      upVoterIds: newUpVoters,
      downVoterIds: newDownVoters,
      upVoteCount: newUpVoters.length,
      downVoteCount: newDownVoters.length,
      netVoteCount,
      updatedAt: Date.now(),
    });

    const updated = await ctx.db.get(args.threadId);

    // Determine user's current vote
    let userVote: "up" | "down" | null = null;
    if (newUpVoters.includes(userId)) {
      userVote = "up";
    } else if (newDownVoters.includes(userId)) {
      userVote = "down";
    }

    return {
      threadId: args.threadId,
      upVoteCount: updated!.upVoteCount,
      downVoteCount: updated!.downVoteCount,
      netVoteCount: updated!.netVoteCount,
      userVote,
    };
  },
});

export const castReplyVote = mutation({
  args: {
    replyId: v.id("replies"),
    direction: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    const reply = await ctx.db.get(args.replyId);
    if (!reply) {
      throw new ConvexError("Reply not found");
    }

    if (reply.isDeleted) {
      throw new ConvexError("Reply is deleted");
    }

    const thread = await ctx.db.get(reply.threadId);
    if (thread) {
      const hasAccess = await canAccessCategory(ctx, userId, thread.categoryId);
      if (!hasAccess) {
        throw new ConvexError("Access denied");
      }
    }

    // Read current state for atomic vote operation
    const userAlreadyVotedUp = reply.upVoterIds.includes(userId);
    const userAlreadyVotedDown = reply.downVoterIds.includes(userId);

    // Build new state
    let newUpVoters = [...reply.upVoterIds];
    let newDownVoters = [...reply.downVoterIds];

    if (args.direction === "up") {
      if (userAlreadyVotedUp) {
        // Toggle off
        newUpVoters = newUpVoters.filter((id) => id !== userId);
      } else {
        // Add up vote, remove down if exists
        newUpVoters.push(userId);
        newDownVoters = newDownVoters.filter((id) => id !== userId);
      }
    } else {
      if (userAlreadyVotedDown) {
        // Toggle off
        newDownVoters = newDownVoters.filter((id) => id !== userId);
      } else {
        // Add down vote, remove up if exists
        newDownVoters.push(userId);
        newUpVoters = newUpVoters.filter((id) => id !== userId);
      }
    }

    // Patch atomically
    await ctx.db.patch(args.replyId, {
      upVoterIds: newUpVoters,
      downVoterIds: newDownVoters,
      upVoteCount: newUpVoters.length,
      downVoteCount: newDownVoters.length,
    });

    const updated = await ctx.db.get(args.replyId);

    // Determine user's current vote
    let userVote: "up" | "down" | null = null;
    if (newUpVoters.includes(userId)) {
      userVote = "up";
    } else if (newDownVoters.includes(userId)) {
      userVote = "down";
    }

    return {
      replyId: args.replyId,
      upVoteCount: updated!.upVoteCount,
      downVoteCount: updated!.downVoteCount,
      userVote,
    };
  },
});

export const editThread = mutation({
  args: {
    threadId: v.id("threads"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      throw new ConvexError("Thread not found");
    }

    const isOwner = thread.authorId === userId;
    const mod = isModerator(user);

    if (!isOwner && !mod) {
      throw new ConvexError("Only thread author or mods can edit");
    }

    if (args.title !== undefined) {
      const trimmedTitle = args.title.trim();
      if (!trimmedTitle) {
        throw new ConvexError("Title cannot be empty");
      }
      if (trimmedTitle.length > 200) {
        throw new ConvexError("Title must be 200 characters or less");
      }
    }

    if (args.content !== undefined) {
      const trimmedContent = args.content.trim();
      if (!trimmedContent) {
        throw new ConvexError("Content cannot be empty");
      }
      if (trimmedContent.length > 10000) {
        throw new ConvexError("Content must be 10000 characters or less");
      }
    }

    const updateData: Partial<Doc<"threads">> = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) {
      updateData.title = args.title.trim();
    }

    if (args.content !== undefined) {
      updateData.content = args.content.trim();
    }

    await ctx.db.patch(args.threadId, updateData);

    const updated = await ctx.db.get(args.threadId);
    return updated;
  },
});

export const deleteThread = mutation({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      throw new ConvexError("Thread not found");
    }

    const isOwner = thread.authorId === userId;
    const mod = isModerator(user);

    if (!isOwner && !mod) {
      throw new ConvexError("Only thread author or mods can delete");
    }

    // Tombstone deletion
    await ctx.db.patch(args.threadId, {
      isDeleted: true,
      deletedAt: Date.now(),
    });

    // Update category stats
    const category = await ctx.db.get(thread.categoryId);
    if (category) {
      await ctx.db.patch(thread.categoryId, {
        threadCount: Math.max(0, category.threadCount - 1),
      });
    }

    return { success: true };
  },
});
