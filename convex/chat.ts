import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import {
  getCurrentUser,
  canAccessChannel,
  isModerator,
  validateIdempotencyKey,
  updateUserSocialPoints,
} from "./helpers";

type FanTier = "bronze" | "silver" | "gold" | "platinum";

export const getChannels = query({
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

    const allChannels = await ctx.db.query("channels").collect();

    const tierHierarchy: Record<FanTier, number> = {
      bronze: 0,
      silver: 1,
      gold: 2,
      platinum: 3,
    };

    const accessibleChannels = allChannels.filter((channel) => {
      if (channel.requiredRole && user.role !== channel.requiredRole) {
        if (user.role !== "admin") {
          return false;
        }
      }

      if (channel.requiredFanTier) {
        if (
          tierHierarchy[user.fanTier] <
          tierHierarchy[channel.requiredFanTier as FanTier]
        ) {
          return false;
        }
      }

      return true;
    });

    return accessibleChannels.sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const getChannelDetail = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new ConvexError("Channel not found");
    }

    const hasAccess = await canAccessChannel(ctx, userId, args.channelId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    return channel;
  },
});

export const getMessages = query({
  args: {
    channelId: v.id("channels"),
    limit: v.number(),
    cursor: v.optional(
      v.object({
        messageId: v.id("messages"),
        createdAt: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    const hasAccess = await canAccessChannel(ctx, userId, args.channelId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    let limit = args.limit;
    if (limit > 50) {
      limit = 50;
    }

    let allMessages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .collect();

    allMessages = allMessages.filter((m) => !m.isDeleted);

    allMessages.sort((a, b) => b.createdAt - a.createdAt);

    if (args.cursor) {
      const cursorIndex = allMessages.findIndex(
        (m) => m._id === args.cursor!.messageId
      );
      if (cursorIndex !== -1) {
        allMessages = allMessages.slice(cursorIndex + 1);
      }
    }

    const messages = allMessages.slice(0, limit).map(m => ({
      ...m,
      upVoteCount: m.upVoteCount || 0,
      downVoteCount: m.downVoteCount || 0,
      netVoteCount: m.netVoteCount || 0,
      upVoterIds: m.upVoterIds || [],
      downVoterIds: m.downVoterIds || [],
    }));

    const hasMore = allMessages.length > limit;

    let nextCursor: { messageId: Id<"messages">; createdAt: number } | null =
      null;
    if (hasMore && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      nextCursor = {
        messageId: lastMessage._id,
        createdAt: lastMessage.createdAt,
      };
    }

    return { messages, nextCursor };
  },
});

export const subscribeToMessages = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    const hasAccess = await canAccessChannel(ctx, userId, args.channelId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .collect();

    return messages
      .filter((m) => !m.isDeleted)
      .map(m => ({
        ...m,
        upVoteCount: m.upVoteCount || 0,
        downVoteCount: m.downVoteCount || 0,
        netVoteCount: m.netVoteCount || 0,
        upVoterIds: m.upVoterIds || [],
        downVoterIds: m.downVoterIds || [],
      }))
      .sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const subscribeToTyping = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    const hasAccess = await canAccessChannel(ctx, userId, args.channelId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    const indicators = await ctx.db
      .query("userTypingIndicators")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .collect();

    const now = Date.now();

    return indicators
      .filter((i) => i.expiresAt > now)
      .sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const sendMessage = mutation({
  args: {
    channelId: v.id("channels"),
    content: v.string(),
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new ConvexError("Channel not found");
    }

    const hasAccess = await canAccessChannel(ctx, userId, args.channelId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    const trimmedContent = args.content.trim();
    if (!trimmedContent) {
      throw new ConvexError("Message content cannot be empty");
    }

    if (trimmedContent.length > 5000) {
      throw new ConvexError("Message must be 5000 characters or less");
    }

    const isValidKey = await validateIdempotencyKey(
      ctx,
      args.channelId,
      userId,
      args.idempotencyKey
    );

    if (!isValidKey) {
      const existingMessage = await ctx.db
        .query("messages")
        .withIndex("by_idempotency", (q) =>
          q
            .eq("channelId", args.channelId)
            .eq("authorId", userId)
            .eq("idempotencyKey", args.idempotencyKey)
        )
        .first();

      if (existingMessage) {
        return existingMessage;
      }
    }

    const now = Date.now();

    const messageId = await ctx.db.insert("messages", {
      channelId: args.channelId,
      authorId: userId,
      authorDisplayName: user.displayName,
      authorAvatar: user.avatar,
      authorTier: user.fanTier,
      content: trimmedContent,
      editedAt: undefined,
      isPinned: false,
      isDeleted: false,
      deletedAt: undefined,
      deletedBy: undefined,
      reactionEmojis: [],
      reactionCount: 0,
      upVoterIds: [],
      downVoterIds: [],
      upVoteCount: 0,
      downVoteCount: 0,
      netVoteCount: 0,
      idempotencyKey: args.idempotencyKey,
      createdAt: now,
    });

    await ctx.db.patch(args.channelId, {
      messageCount: channel.messageCount + 1,
      lastMessageAt: now,
      lastMessageId: messageId,
    });

    // Award points for sending a message
    const pointsIdempotencyKey = `message-${messageId}`;
    try {
      await ctx.runMutation(api.points.awardPoints, {
        userId: userId,
        type: 'chat_message',
        amount: 3,
        description: 'Sent chat message',
        idempotencyKey: pointsIdempotencyKey,
      });
    } catch (error) {
      console.error('Failed to award points:', error);
    }

    const message = await ctx.db.get(messageId);
    return message;
  },
});

export const addReaction = mutation({
  args: { messageId: v.id("messages"), emoji: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new ConvexError("Message not found");
    }

    if (message.isDeleted) {
      throw new ConvexError("Message not found");
    }

    const channel = await ctx.db.get(message.channelId);
    if (!channel) {
      throw new ConvexError("Channel not found");
    }

    const hasAccess = await canAccessChannel(ctx, userId, message.channelId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    const existingReaction = await ctx.db
      .query("reactions")
      .withIndex("by_message_user", (q) =>
        q.eq("messageId", args.messageId).eq("userId", userId)
      )
      .collect();

    const alreadyReacted = existingReaction.some((r) => r.emoji === args.emoji);
    if (alreadyReacted) {
      throw new ConvexError("Already reacted with this emoji");
    }

    await ctx.db.insert("reactions", {
      messageId: args.messageId,
      emoji: args.emoji,
      userId: userId,
      createdAt: Date.now(),
    });

    const allReactions = await ctx.db
      .query("reactions")
      .withIndex("by_message_emoji", (q) => q.eq("messageId", args.messageId))
      .collect();

    const uniqueEmojis = Array.from(new Set(allReactions.map((r) => r.emoji)));

    await ctx.db.patch(args.messageId, {
      reactionEmojis: uniqueEmojis,
      reactionCount: allReactions.length,
    });

    return { messageId: args.messageId, emoji: args.emoji };
  },
});

export const removeReaction = mutation({
  args: { messageId: v.id("messages"), emoji: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new ConvexError("Message not found");
    }

    const channel = await ctx.db.get(message.channelId);
    if (!channel) {
      throw new ConvexError("Channel not found");
    }

    const hasAccess = await canAccessChannel(ctx, userId, message.channelId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_message_user", (q) =>
        q.eq("messageId", args.messageId).eq("userId", userId)
      )
      .collect();

    const reactionToRemove = reactions.find((r) => r.emoji === args.emoji);
    if (!reactionToRemove) {
      throw new ConvexError("Reaction not found");
    }

    await ctx.db.delete(reactionToRemove._id);

    const allReactions = await ctx.db
      .query("reactions")
      .withIndex("by_message_emoji", (q) => q.eq("messageId", args.messageId))
      .collect();

    const uniqueEmojis = Array.from(new Set(allReactions.map((r) => r.emoji)));

    await ctx.db.patch(args.messageId, {
      reactionEmojis: uniqueEmojis,
      reactionCount: allReactions.length,
    });

    return { messageId: args.messageId, emoji: args.emoji };
  },
});

export const pinMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    if (!isModerator(user)) {
      throw new ConvexError("Access denied: moderator only");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new ConvexError("Message not found");
    }

    await ctx.db.patch(args.messageId, {
      isPinned: true,
    });

    const channel = await ctx.db.get(message.channelId);
    if (channel) {
      await ctx.db.patch(message.channelId, {
        pinnedMessageId: args.messageId,
      });
    }

    return { success: true };
  },
});
export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new ConvexError("Message not found");
    }

    const isOwner = message.authorId === userId;
    const mod = isModerator(user);

    if (!isOwner && !mod) {
      throw new ConvexError("Only message owner or mods can delete");
    }

    await ctx.db.patch(args.messageId, {
      isDeleted: true,
      deletedAt: Date.now(),
      deletedBy: userId,
      content: "[deleted]",
    });

    return { success: true };
  },
});

export const editMessage = mutation({
  args: { messageId: v.id("messages"), newContent: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new ConvexError("Message not found");
    }

    if (message.authorId !== userId) {
      throw new ConvexError("You can only edit your own messages");
    }

    const trimmedContent = args.newContent.trim();
    if (!trimmedContent) {
      throw new ConvexError("Message content cannot be empty");
    }

    if (trimmedContent.length > 5000) {
      throw new ConvexError("Message must be 5000 characters or less");
    }

    await ctx.db.patch(args.messageId, {
      content: trimmedContent,
      editedAt: Date.now(),
    });

    return { success: true };
  },
});

export const setTypingIndicator = mutation({
  args: { channelId: v.id("channels"), isTyping: v.boolean() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new ConvexError("Channel not found");
    }

    const hasAccess = await canAccessChannel(ctx, userId, args.channelId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    if (args.isTyping) {
      const existingIndicators = await ctx.db
        .query("userTypingIndicators")
        .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
        .collect();

      const userIndicator = existingIndicators.find(
        (i) => i.userId === userId
      );

      const expiresAt = Date.now() + 3000;

      if (userIndicator) {
        await ctx.db.patch(userIndicator._id, {
          expiresAt,
        });
      } else {
        await ctx.db.insert("userTypingIndicators", {
          channelId: args.channelId,
          userId,
          displayName: user.displayName,
          expiresAt,
          createdAt: Date.now(),
        });
      }
    } else {
      const indicators = await ctx.db
        .query("userTypingIndicators")
        .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
        .collect();

      const userIndicator = indicators.find((i) => i.userId === userId);
      if (userIndicator) {
        await ctx.db.delete(userIndicator._id);
      }
    }

    return { success: true };
  },
});

export const castMessageVote = mutation({
  args: {
    messageId: v.id("messages"),
    voteType: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;

    const message = await ctx.db.get(args.messageId);
    if (!message || message.isDeleted) {
      throw new ConvexError("Message not found");
    }

    const hasAccess = await canAccessChannel(ctx, userId, message.channelId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }

    const isCurrentlyUpvoted = message.upVoterIds?.includes(userId) || false;
    const isCurrentlyDownvoted = message.downVoterIds?.includes(userId) || false;

    let newUpVoterIds = message.upVoterIds || [];
    let newDownVoterIds = message.downVoterIds || [];
    let upDelta = 0;
    let downDelta = 0;

    if (args.voteType === "up") {
      if (isCurrentlyUpvoted) {
        // Toggle off
        newUpVoterIds = newUpVoterIds.filter((id) => id !== userId);
        upDelta = -1;
      } else {
        // Vote up
        newUpVoterIds = [...newUpVoterIds, userId];
        upDelta = 1;
        if (isCurrentlyDownvoted) {
          newDownVoterIds = newDownVoterIds.filter((id) => id !== userId);
          downDelta = -1;
        }
      }
    } else {
      if (isCurrentlyDownvoted) {
        // Toggle off
        newDownVoterIds = newDownVoterIds.filter((id) => id !== userId);
        downDelta = -1;
      } else {
        // Vote down
        newDownVoterIds = [...newDownVoterIds, userId];
        downDelta = 1;
        if (isCurrentlyUpvoted) {
          newUpVoterIds = newUpVoterIds.filter((id) => id !== userId);
          upDelta = -1;
        }
      }
    }

    const newUpVoteCount = (message.upVoteCount || 0) + upDelta;
    const newDownVoteCount = (message.downVoteCount || 0) + downDelta;
    const newNetVoteCount = newUpVoteCount - newDownVoteCount;

    await ctx.db.patch(args.messageId, {
      upVoterIds: newUpVoterIds,
      downVoterIds: newDownVoterIds,
      upVoteCount: newUpVoteCount,
      downVoteCount: newDownVoteCount,
      netVoteCount: newNetVoteCount,
    });

    // Sync points to author
    const pointDelta = upDelta - downDelta;
    await updateUserSocialPoints(ctx, message.authorId, pointDelta);

    return { success: true, netVoteCount: newNetVoteCount };
  },
});
