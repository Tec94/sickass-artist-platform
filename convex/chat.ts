import { query, mutation, internalMutation } from "./_generated/server";
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
import {
  findBlockedTerm,
  getModerationPolicy,
  isUserBanned,
  isUserTimedOut,
} from "./moderationUtils";

type FanTier = "bronze" | "silver" | "gold" | "platinum";

const DEFAULT_CHAT_SETTINGS = {
  slowModeSeconds: 0,
  maxImageMb: 6,
  maxVideoMb: 24,
  allowedMediaTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
  ],
  enabledStickerPackIds: [] as Id<"chatStickerPacks">[],
  retentionDays: undefined as number | undefined,
};

const DEFAULT_USER_CHAT_SETTINGS = {
  autoplayMedia: true,
  showStickers: true,
  compactMode: false,
};

const RECENT_MESSAGE_WINDOW = 50;
const MAX_ATTACHMENTS = 4;
const RATE_LIMIT_WINDOW_MS = 30 * 1000;
const RATE_LIMIT_MAX_MESSAGES = 12;

const getServerSettingsInternal = async (ctx: any) => {
  const settings = await ctx.db.query("chatServerSettings").first();
  return settings ? { ...DEFAULT_CHAT_SETTINGS, ...settings } : DEFAULT_CHAT_SETTINGS;
};

const getUserChatSettingsInternal = async (
  ctx: any,
  userId: Id<"users">
) => {
  const settings = await ctx.db
    .query("userChatSettings")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();

  return settings ? { ...DEFAULT_USER_CHAT_SETTINGS, ...settings } : DEFAULT_USER_CHAT_SETTINGS;
};

const getUserModerationStatusInternal = async (ctx: any, userId: Id<"users">) => {
  return await ctx.db
    .query("userModerationStatus")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();
};

const assertUserCanChat = async (ctx: any, userId: Id<"users">) => {
  const status = await getUserModerationStatusInternal(ctx, userId);
  if (isUserBanned(status)) {
    throw new ConvexError("You are banned from chat.");
  }
  if (isUserTimedOut(status)) {
    const secondsRemaining = Math.max(
      1,
      Math.ceil(((status?.timeoutUntil ?? 0) - Date.now()) / 1000)
    );
    throw new ConvexError(`You are timed out for ${secondsRemaining}s.`);
  }
  return status;
};

const normalizeMessage = (message: any) => ({
  ...message,
  messageType: message.messageType ?? "text",
  attachments: message.attachments ?? [],
  upVoteCount: message.upVoteCount || 0,
  downVoteCount: message.downVoteCount || 0,
  netVoteCount: message.netVoteCount || 0,
});

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

    const limit = Math.max(1, Math.min(args.limit, RECENT_MESSAGE_WINDOW));

    const baseQuery = args.cursor
      ? ctx.db
          .query("messages")
          .withIndex("by_channel", (q) =>
            q.eq("channelId", args.channelId).lt("createdAt", args.cursor!.createdAt)
          )
      : ctx.db
          .query("messages")
          .withIndex("by_channel", (q) => q.eq("channelId", args.channelId));

    const rawMessages = await baseQuery.order("desc").take(limit + 1);
    const activeMessages = rawMessages.filter((m) => !m.isDeleted);
    const pageMessages = activeMessages.slice(0, limit);

    const hasMore = rawMessages.length > limit;
    const oldestMessage = pageMessages[pageMessages.length - 1];

    const nextCursor =
      hasMore && oldestMessage
        ? { messageId: oldestMessage._id, createdAt: oldestMessage.createdAt }
        : null;

    return {
      messages: pageMessages.reverse().map(normalizeMessage),
      nextCursor,
    };
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

    const recentMessages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .take(RECENT_MESSAGE_WINDOW);

    return recentMessages
      .filter((m) => !m.isDeleted)
      .reverse()
      .map(normalizeMessage);
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

    const now = Date.now();
    return await ctx.db
      .query("userTypingIndicators")
      .withIndex("by_channel", (q) =>
        q.eq("channelId", args.channelId).gt("expiresAt", now)
      )
      .order("asc")
      .collect();
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const getServerSettings = query({
  args: {},
  handler: async (ctx) => {
    await getCurrentUser(ctx);
    return await getServerSettingsInternal(ctx);
  },
});

export const getUserChatSettings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return await getUserChatSettingsInternal(ctx, user._id);
  },
});

export const updateUserChatSettings = mutation({
  args: {
    autoplayMedia: v.optional(v.boolean()),
    showStickers: v.optional(v.boolean()),
    compactMode: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const existing = await ctx.db
      .query("userChatSettings")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    const nextSettings = {
      autoplayMedia:
        args.autoplayMedia ?? existing?.autoplayMedia ?? DEFAULT_USER_CHAT_SETTINGS.autoplayMedia,
      showStickers:
        args.showStickers ?? existing?.showStickers ?? DEFAULT_USER_CHAT_SETTINGS.showStickers,
      compactMode:
        args.compactMode ?? existing?.compactMode ?? DEFAULT_USER_CHAT_SETTINGS.compactMode,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, nextSettings);
      return { ...existing, ...nextSettings };
    }

    const insertedId = await ctx.db.insert("userChatSettings", {
      userId: user._id,
      ...nextSettings,
    });
    return await ctx.db.get(insertedId);
  },
});

export const getStickerPacks = query({
  args: {},
  handler: async (ctx) => {
    await getCurrentUser(ctx);
    const settings = await getServerSettingsInternal(ctx);

    const packs = await ctx.db
      .query("chatStickerPacks")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const enabledPackIds =
      settings.enabledStickerPackIds.length > 0
        ? new Set(settings.enabledStickerPackIds)
        : null;

    const filteredPacks = enabledPackIds
      ? packs.filter((pack) => enabledPackIds.has(pack._id))
      : packs;

    const packsWithStickers = await Promise.all(
      filteredPacks.map(async (pack) => {
        const stickers = await ctx.db
          .query("chatStickers")
          .withIndex("by_pack", (q) => q.eq("packId", pack._id).eq("isActive", true))
          .collect();

        return {
          ...pack,
          stickers,
        };
      })
    );

    return packsWithStickers;
  },
});

export const sendMessage = mutation({
  args: {
    channelId: v.id("channels"),
    content: v.string(),
    idempotencyKey: v.string(),
    attachments: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          type: v.union(v.literal("image"), v.literal("video")),
          sizeBytes: v.number(),
          contentType: v.string(),
          width: v.optional(v.number()),
          height: v.optional(v.number()),
          durationMs: v.optional(v.number()),
        })
      )
    ),
    stickerId: v.optional(v.id("chatStickers")),
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
    await assertUserCanChat(ctx, userId);

    const trimmedContent = args.content.trim();
    if (trimmedContent.length > 5000) {
      throw new ConvexError("Message must be 5000 characters or less");
    }

    const settings = await getServerSettingsInternal(ctx);
    await assertUserCanChat(ctx, userId);

    const attachmentsInput = args.attachments ?? [];
    if (attachmentsInput.length > MAX_ATTACHMENTS) {
      throw new ConvexError(`You can attach up to ${MAX_ATTACHMENTS} files.`);
    }

    const enforceAllowedTypes = settings.allowedMediaTypes.length > 0;
    const allowedTypes = new Set(settings.allowedMediaTypes);

    const attachments = [];
    for (const attachment of attachmentsInput) {
      if (
        (attachment.type === "image" && !attachment.contentType.startsWith("image/")) ||
        (attachment.type === "video" && !attachment.contentType.startsWith("video/"))
      ) {
        throw new ConvexError("Attachment type does not match content type.");
      }

      if (enforceAllowedTypes && !allowedTypes.has(attachment.contentType)) {
        throw new ConvexError("This media type is not allowed.");
      }

      const maxMb =
        attachment.type === "image" ? settings.maxImageMb : settings.maxVideoMb;
      const maxBytes = Math.max(1, maxMb) * 1024 * 1024;

      if (attachment.sizeBytes <= 0 || attachment.sizeBytes > maxBytes) {
        throw new ConvexError("Attachment exceeds the server size limit.");
      }

      const url = await ctx.storage.getUrl(attachment.storageId);
      if (!url) {
        throw new ConvexError("Upload not found. Please retry the upload.");
      }

      attachments.push({
        type: attachment.type,
        storageId: attachment.storageId,
        url,
        thumbnailUrl: attachment.type === "image" ? url : undefined,
        width: attachment.width,
        height: attachment.height,
        durationMs: attachment.durationMs,
        sizeBytes: attachment.sizeBytes,
        contentType: attachment.contentType,
      });
    }

    let sticker = null;
    if (args.stickerId) {
      sticker = await ctx.db.get(args.stickerId);
      if (!sticker || !sticker.isActive) {
        throw new ConvexError("Sticker not found.");
      }

      const pack = await ctx.db.get(sticker.packId);
      if (!pack || !pack.isActive) {
        throw new ConvexError("Sticker pack is not available.");
      }

      if (
        settings.enabledStickerPackIds.length > 0 &&
        !settings.enabledStickerPackIds.includes(pack._id)
      ) {
        throw new ConvexError("Sticker pack is not enabled on this server.");
      }
    }

    const hasText = trimmedContent.length > 0;
    const hasAttachments = attachments.length > 0;
    const hasSticker = !!sticker;

    if (!hasText && !hasAttachments && !hasSticker) {
      throw new ConvexError("Message content cannot be empty");
    }

    const moderationPolicy = await getModerationPolicy(ctx);
    const blockedTerm = hasText ? findBlockedTerm(trimmedContent, moderationPolicy) : null;
    if (blockedTerm) {
      throw new ConvexError("Message violates the server moderation policy.");
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
        return normalizeMessage(existingMessage);
      }
    }

    const now = Date.now();

    if (settings.slowModeSeconds > 0) {
      const lastMessages = await ctx.db
        .query("messages")
        .withIndex("by_author_channel", (q) =>
          q.eq("authorId", userId).eq("channelId", args.channelId)
        )
        .order("desc")
        .take(1);

      const lastMessage = lastMessages[0];
      if (lastMessage) {
        const nextAllowedAt = lastMessage.createdAt + settings.slowModeSeconds * 1000;
        if (nextAllowedAt > now) {
          const secondsRemaining = Math.ceil((nextAllowedAt - now) / 1000);
          throw new ConvexError(`Slow mode is enabled. Try again in ${secondsRemaining}s.`);
        }
      }
    }

    const recentMessages = await ctx.db
      .query("messages")
      .withIndex("by_author_channel", (q) =>
        q
          .eq("authorId", userId)
          .eq("channelId", args.channelId)
          .gt("createdAt", now - RATE_LIMIT_WINDOW_MS)
      )
      .take(RATE_LIMIT_MAX_MESSAGES + 1);

    if (recentMessages.length > RATE_LIMIT_MAX_MESSAGES) {
      throw new ConvexError("You are sending messages too quickly. Please slow down.");
    }

    let messageType: "text" | "media" | "sticker" | "mixed" = "text";
    if (hasAttachments && (hasText || hasSticker)) {
      messageType = "mixed";
    } else if (hasAttachments) {
      messageType = "media";
    } else if (hasSticker && !hasText) {
      messageType = "sticker";
    } else if (hasSticker && hasText) {
      messageType = "mixed";
    }

    const messageId = await ctx.db.insert("messages", {
      channelId: args.channelId,
      authorId: userId,
      authorDisplayName: user.displayName,
      authorAvatar: user.avatar,
      authorTier: user.fanTier,
      content: trimmedContent,
      messageType,
      attachments: attachments.length > 0 ? attachments : undefined,
      stickerId: sticker?._id,
      editedAt: undefined,
      isPinned: false,
      isDeleted: false,
      deletedAt: undefined,
      deletedBy: undefined,
      reactionEmojis: [],
      reactionCount: 0,
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
    return message ? normalizeMessage(message) : null;
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
    await assertUserCanChat(ctx, userId);

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
    await assertUserCanChat(ctx, userId);

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
    if (trimmedContent.length > 5000) {
      throw new ConvexError("Message must be 5000 characters or less");
    }

    const hasAccess = await canAccessChannel(ctx, userId, message.channelId);
    if (!hasAccess) {
      throw new ConvexError("Access denied");
    }
    await assertUserCanChat(ctx, userId);

    const hasAttachments = (message.attachments?.length ?? 0) > 0;
    const hasSticker = !!message.stickerId;
    const hasText = trimmedContent.length > 0;

    if (!hasText && !hasAttachments && !hasSticker) {
      throw new ConvexError("Message content cannot be empty");
    }

    const moderationPolicy = await getModerationPolicy(ctx);
    const blockedTerm = hasText ? findBlockedTerm(trimmedContent, moderationPolicy) : null;
    if (blockedTerm) {
      throw new ConvexError("Message violates the server moderation policy.");
    }

    let messageType: "text" | "media" | "sticker" | "mixed" = "text";
    if (hasAttachments && (hasText || hasSticker)) {
      messageType = "mixed";
    } else if (hasAttachments) {
      messageType = "media";
    } else if (hasSticker && !hasText) {
      messageType = "sticker";
    } else if (hasSticker && hasText) {
      messageType = "mixed";
    }

    await ctx.db.patch(args.messageId, {
      content: trimmedContent,
      messageType,
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
    await assertUserCanChat(ctx, userId);

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
    await assertUserCanChat(ctx, userId);

    const now = Date.now();
    let voteRecord = await ctx.db
      .query("messageVotes")
      .withIndex("by_message_user", (q) =>
        q.eq("messageId", args.messageId).eq("userId", userId)
      )
      .first();

    if (!voteRecord) {
      const fallbackVoteType = message.upVoterIds?.includes(userId)
        ? "up"
        : message.downVoterIds?.includes(userId)
        ? "down"
        : null;

      if (fallbackVoteType) {
        const seededVoteId = await ctx.db.insert("messageVotes", {
          messageId: args.messageId,
          userId,
          voteType: fallbackVoteType,
          createdAt: now,
        });
        voteRecord = { _id: seededVoteId, voteType: fallbackVoteType } as any;
      }
    }

    const oldUpVoteCount = message.upVoteCount || 0;
    const oldDownVoteCount = message.downVoteCount || 0;
    const oldNetVoteCount = oldUpVoteCount - oldDownVoteCount;

    let upDelta = 0;
    let downDelta = 0;

    if (args.voteType === "up") {
      if (voteRecord?.voteType === "up") {
        await ctx.db.delete(voteRecord._id);
        upDelta = -1;
      } else if (voteRecord?.voteType === "down") {
        await ctx.db.patch(voteRecord._id, { voteType: "up", createdAt: now });
        upDelta = 1;
        downDelta = -1;
      } else {
        await ctx.db.insert("messageVotes", {
          messageId: args.messageId,
          userId,
          voteType: "up",
          createdAt: now,
        });
        upDelta = 1;
      }
    } else {
      if (voteRecord?.voteType === "down") {
        await ctx.db.delete(voteRecord._id);
        downDelta = -1;
      } else if (voteRecord?.voteType === "up") {
        await ctx.db.patch(voteRecord._id, { voteType: "down", createdAt: now });
        upDelta = -1;
        downDelta = 1;
      } else {
        await ctx.db.insert("messageVotes", {
          messageId: args.messageId,
          userId,
          voteType: "down",
          createdAt: now,
        });
        downDelta = 1;
      }
    }

    const newUpVoteCount = Math.max(0, oldUpVoteCount + upDelta);
    const newDownVoteCount = Math.max(0, oldDownVoteCount + downDelta);
    const newNetVoteCount = newUpVoteCount - newDownVoteCount;

    await ctx.db.patch(args.messageId, {
      upVoteCount: newUpVoteCount,
      downVoteCount: newDownVoteCount,
      netVoteCount: newNetVoteCount,
    });

    // Sync points to author
    const pointDelta = newNetVoteCount - oldNetVoteCount;
    await updateUserSocialPoints(ctx, message.authorId, pointDelta);

    return { success: true, netVoteCount: newNetVoteCount };
  },
});

export const pruneMessagesForRetention = internalMutation({
  args: { batchSize: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const settings = await ctx.db.query("chatServerSettings").first();
    const retentionDays = settings?.retentionDays;
    if (!retentionDays || retentionDays <= 0) {
      return { pruned: 0, skipped: true };
    }

    const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    const batchSize = Math.min(Math.max(args.batchSize ?? 200, 1), 500);

    const oldMessages = await ctx.db
      .query("messages")
      .withIndex("by_createdAt", (q) => q.lt("createdAt", cutoff))
      .order("asc")
      .take(batchSize);

    if (oldMessages.length === 0) {
      return { pruned: 0, skipped: false };
    }

    const channelDeletes = new Map<Id<"channels">, number>();

    for (const message of oldMessages) {
      const messageVotes = await ctx.db
        .query("messageVotes")
        .withIndex("by_message", (q) => q.eq("messageId", message._id))
        .collect();
      for (const vote of messageVotes) {
        await ctx.db.delete(vote._id);
      }

      const reactions = await ctx.db
        .query("reactions")
        .withIndex("by_message_emoji", (q) => q.eq("messageId", message._id))
        .collect();
      for (const reaction of reactions) {
        await ctx.db.delete(reaction._id);
      }

      for (const attachment of message.attachments ?? []) {
        try {
          await ctx.storage.delete(attachment.storageId);
        } catch (error) {
          console.warn("Failed to delete attachment during pruning", attachment.storageId, error);
        }
      }

      await ctx.db.delete(message._id);
      channelDeletes.set(
        message.channelId,
        (channelDeletes.get(message.channelId) ?? 0) + 1
      );
    }

    for (const [channelId, deletedCount] of channelDeletes.entries()) {
      const channel = await ctx.db.get(channelId);
      if (!channel) continue;

      const recent = await ctx.db
        .query("messages")
        .withIndex("by_channel", (q) => q.eq("channelId", channelId))
        .order("desc")
        .take(10);

      const lastActive = recent.find((m) => !m.isDeleted) ?? null;

      await ctx.db.patch(channelId, {
        messageCount: Math.max(0, channel.messageCount - deletedCount),
        lastMessageAt: lastActive?.createdAt,
        lastMessageId: lastActive?._id,
        updatedAt: Date.now(),
      });
    }

    return { pruned: oldMessages.length, skipped: false };
  },
});
