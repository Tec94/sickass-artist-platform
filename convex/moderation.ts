import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { canAccessCategory, canAccessChannel, getCurrentUser, isModerator } from "./helpers";
import { DEFAULT_MODERATION_POLICY, getModerationPolicy } from "./moderationUtils";

type ModerationContentType = "chat_message" | "forum_thread" | "forum_reply";

const DAY_MS = 24 * 60 * 60 * 1000;
const TEMP_BAN_DURATION_MS = 30 * DAY_MS;

const requireModerator = async (ctx: any) => {
  const user = await getCurrentUser(ctx);
  if (!isModerator(user)) {
    throw new ConvexError("Access denied: moderator only");
  }
  return user;
};

const sanitizeReason = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new ConvexError("A reason is required.");
  }
  if (trimmed.length > 80) {
    throw new ConvexError("Reason must be 80 characters or less.");
  }
  return trimmed;
};

const sanitizeNote = (value: string | undefined) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, 500);
};

const computeSeverity = (reportCount: number): "low" | "medium" | "high" => {
  if (reportCount >= 5) return "high";
  if (reportCount >= 3) return "medium";
  return "low";
};

const ensureUserStatus = async (ctx: any, userId: Id<"users">, now: number) => {
  const existing = await ctx.db
    .query("userModerationStatus")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();

  if (existing) return existing;

  const statusId = await ctx.db.insert("userModerationStatus", {
    userId,
    isBanned: false,
    timeoutUntil: undefined,
    notes: "",
    updatedAt: now,
  });

  return await ctx.db.get(statusId);
};

const resolveContent = async (
  ctx: any,
  userId: Id<"users">,
  contentType: ModerationContentType,
  contentId: Id<"messages"> | Id<"threads"> | Id<"replies">,
  bypassAccess: boolean
) => {
  if (contentType === "chat_message") {
    const message = await ctx.db.get(contentId as Id<"messages">);
    if (!message) {
      throw new ConvexError("Message not found");
    }
    if (!bypassAccess) {
      const hasAccess = await canAccessChannel(ctx, userId, message.channelId);
      if (!hasAccess) throw new ConvexError("Access denied");
    }
    return {
      content: message,
      targetUserId: message.authorId,
      channelId: message.channelId,
      categoryId: undefined,
      threadId: undefined,
    } as const;
  }

  if (contentType === "forum_thread") {
    const thread = await ctx.db.get(contentId as Id<"threads">);
    if (!thread) {
      throw new ConvexError("Thread not found");
    }
    if (!bypassAccess) {
      const hasAccess = await canAccessCategory(ctx, userId, thread.categoryId);
      if (!hasAccess) throw new ConvexError("Access denied");
    }
    return {
      content: thread,
      targetUserId: thread.authorId,
      channelId: undefined,
      categoryId: thread.categoryId,
      threadId: thread._id,
    } as const;
  }

  const reply = await ctx.db.get(contentId as Id<"replies">);
  if (!reply) {
    throw new ConvexError("Reply not found");
  }
  const thread = await ctx.db.get(reply.threadId);
  if (!thread) {
    throw new ConvexError("Thread not found");
  }
  if (!bypassAccess) {
    const hasAccess = await canAccessCategory(ctx, userId, thread.categoryId);
    if (!hasAccess) throw new ConvexError("Access denied");
  }
  return {
    content: reply,
    targetUserId: reply.authorId,
    channelId: undefined,
    categoryId: thread.categoryId,
    threadId: thread._id,
    thread,
  } as const;
};

const resolveReportsForContent = async (
  ctx: any,
  contentType: ModerationContentType | undefined,
  contentId: Id<"messages"> | Id<"threads"> | Id<"replies"> | undefined,
  moderatorId: Id<"users">,
  now: number
) => {
  if (!contentType || !contentId) return 0;

  const reports = await ctx.db
    .query("moderationReports")
    .withIndex("by_content", (q: any) => q.eq("contentType", contentType).eq("contentId", contentId))
    .collect();

  const openReports = reports.filter((report: any) => report.status === "open");
  for (const report of openReports) {
    await ctx.db.patch(report._id, {
      status: "resolved",
      resolvedAt: now,
      resolvedBy: moderatorId,
    });
  }

  return openReports.length;
};

const refreshChannelLastMessage = async (ctx: any, channelId: Id<"channels">, now: number) => {
  const channel = await ctx.db.get(channelId);
  if (!channel) return;

  const recentMessages = await ctx.db
    .query("messages")
    .withIndex("by_channel", (q: any) => q.eq("channelId", channelId))
    .order("desc")
    .take(10);

  const lastActive = recentMessages.find((message: any) => !message.isDeleted) ?? null;

  await ctx.db.patch(channelId, {
    lastMessageAt: lastActive?.createdAt,
    lastMessageId: lastActive?._id,
    updatedAt: now,
  });
};

const removeChatMessage = async (
  ctx: any,
  messageId: Id<"messages">,
  moderatorId: Id<"users">,
  _reason: string,
  now: number
) => {
  const message = await ctx.db.get(messageId);
  if (!message) return false;

  const wasActive = !message.isDeleted;

  for (const attachment of message.attachments ?? []) {
    try {
      await ctx.storage.delete(attachment.storageId);
    } catch (error) {
      console.warn("Failed to delete attachment for moderated message", attachment.storageId, error);
    }
  }

  const votes = await ctx.db
    .query("messageVotes")
    .withIndex("by_message", (q: any) => q.eq("messageId", messageId))
    .collect();
  for (const vote of votes) {
    await ctx.db.delete(vote._id);
  }

  const reactions = await ctx.db
    .query("reactions")
    .withIndex("by_message_emoji", (q: any) => q.eq("messageId", messageId))
    .collect();
  for (const reaction of reactions) {
    await ctx.db.delete(reaction._id);
  }

  await ctx.db.patch(messageId, {
    isDeleted: true,
    deletedAt: now,
    deletedBy: moderatorId,
    content: "[removed by moderation]",
    messageType: "text",
    attachments: undefined,
    stickerId: undefined,
    reactionEmojis: [],
    reactionCount: 0,
    upVoteCount: 0,
    downVoteCount: 0,
    netVoteCount: 0,
  });

  if (wasActive) {
    const channel = await ctx.db.get(message.channelId);
    if (channel) {
      await ctx.db.patch(message.channelId, {
        messageCount: Math.max(0, channel.messageCount - 1),
        updatedAt: now,
      });
    }
  }

  await refreshChannelLastMessage(ctx, message.channelId, now);

  return wasActive;
};

const removeForumReply = async (
  ctx: any,
  replyId: Id<"replies">,
  moderatorId: Id<"users">,
  reason: string,
  now: number
) => {
  const reply = await ctx.db.get(replyId);
  if (!reply) return false;

  const wasActive = !reply.isDeleted && (reply.moderationStatus ?? "active") === "active";

  await ctx.db.patch(replyId, {
    isDeleted: true,
    deletedAt: now,
    moderationStatus: "removed",
    removedAt: now,
    removedBy: moderatorId,
    removalReason: reason,
    content: "[removed by moderation]",
  });

  if (!wasActive) return false;

  const thread = await ctx.db.get(reply.threadId);
  if (!thread) return true;

  const recentReplies = await ctx.db
    .query("replies")
    .withIndex("by_thread", (q: any) => q.eq("threadId", reply.threadId))
    .order("desc")
    .take(10);

  const lastActiveReply = recentReplies.find(
    (item: any) => !item.isDeleted && (item.moderationStatus ?? "active") === "active"
  );

  await ctx.db.patch(reply.threadId, {
    replyCount: Math.max(0, (thread.replyCount || 0) - 1),
    lastReplyAt: lastActiveReply?.createdAt,
    lastReplyById: lastActiveReply?.authorId,
    updatedAt: now,
  });

  return true;
};

const removeForumThread = async (
  ctx: any,
  threadId: Id<"threads">,
  moderatorId: Id<"users">,
  reason: string,
  now: number
) => {
  const thread = await ctx.db.get(threadId);
  if (!thread) return false;

  const wasActive = !thread.isDeleted && (thread.moderationStatus ?? "active") === "active";

  await ctx.db.patch(threadId, {
    isDeleted: true,
    deletedAt: now,
    moderationStatus: "removed",
    removedAt: now,
    removedBy: moderatorId,
    removalReason: reason,
    content: "[removed by moderation]",
    updatedAt: now,
  });

  const replies = await ctx.db
    .query("replies")
    .withIndex("by_thread", (q: any) => q.eq("threadId", threadId))
    .collect();
  for (const reply of replies) {
    if (reply.isDeleted && (reply.moderationStatus ?? "active") !== "active") continue;
    await ctx.db.patch(reply._id, {
      isDeleted: true,
      deletedAt: now,
      moderationStatus: "removed",
      removedAt: now,
      removedBy: moderatorId,
      removalReason: reason,
      content: "[removed by moderation]",
    });
  }

  if (wasActive) {
    const category = await ctx.db.get(thread.categoryId);
    if (category) {
      await ctx.db.patch(thread.categoryId, {
        threadCount: Math.max(0, category.threadCount - 1),
        lastThreadAt: now,
      });
    }
  }

  return wasActive;
};

const applyTimeout = async (
  ctx: any,
  userId: Id<"users">,
  durationMs: number,
  now: number
) => {
  const status = await ensureUserStatus(ctx, userId, now);
  await ctx.db.patch(status._id, {
    isBanned: false,
    timeoutUntil: now + durationMs,
    updatedAt: now,
  });
};

export const reportContent = mutation({
  args: {
    contentType: v.union(
      v.literal("chat_message"),
      v.literal("forum_thread"),
      v.literal("forum_reply")
    ),
    contentId: v.union(v.id("messages"), v.id("threads"), v.id("replies")),
    reason: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;
    const now = Date.now();

    const resolved = await resolveContent(
      ctx,
      userId,
      args.contentType,
      args.contentId as any,
      false
    );

    const reason = sanitizeReason(args.reason);
    const note = sanitizeNote(args.note);

    const existingReports = await ctx.db
      .query("moderationReports")
      .withIndex("by_content", (q: any) =>
        q.eq("contentType", args.contentType).eq("contentId", args.contentId)
      )
      .collect();

    const existingUserReport = existingReports.find(
      (report: any) => report.reportedBy === userId && report.status === "open"
    );
    if (existingUserReport) {
      return { reportId: existingUserReport._id, deduped: true };
    }

    const reportId = await ctx.db.insert("moderationReports", {
      contentType: args.contentType,
      contentId: args.contentId as any,
      reportedBy: userId,
      reason,
      note,
      status: "open",
      createdAt: now,
    });

    return {
      reportId,
      deduped: false,
      targetUserId: resolved.targetUserId,
      createdAt: now,
    };
  },
});

export const getQueue = query({
  args: {
    status: v.optional(v.union(v.literal("open"), v.literal("resolved"))),
    contentType: v.optional(
      v.union(
        v.literal("chat_message"),
        v.literal("forum_thread"),
        v.literal("forum_reply")
      )
    ),
    channelId: v.optional(v.id("channels")),
    categoryId: v.optional(v.id("categories")),
    severity: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireModerator(ctx);

    const status = args.status ?? "open";
    const limit = Math.max(1, Math.min(args.limit ?? 25, 100));
    const batchSize = Math.min(limit * 5, 500);

    const reportQuery = args.cursor
      ? ctx.db
          .query("moderationReports")
          .withIndex("by_status_createdAt", (q: any) =>
            q.eq("status", status).lt("createdAt", args.cursor!)
          )
      : ctx.db
          .query("moderationReports")
          .withIndex("by_status_createdAt", (q: any) => q.eq("status", status));

    const rawReports = await reportQuery.order("desc").take(batchSize);
    const filteredReports = args.contentType
      ? rawReports.filter((report: any) => report.contentType === args.contentType)
      : rawReports;

    const grouped = new Map<string, { reports: any[]; latestCreatedAt: number }>();
    for (const report of filteredReports) {
      const key = `${report.contentType}:${report.contentId}`;
      const existing = grouped.get(key);
      if (existing) {
        existing.reports.push(report);
        existing.latestCreatedAt = Math.max(existing.latestCreatedAt, report.createdAt);
      } else {
        grouped.set(key, { reports: [report], latestCreatedAt: report.createdAt });
      }
    }

    const items: any[] = [];
    for (const group of grouped.values()) {
      const reports = group.reports.sort((a, b) => b.createdAt - a.createdAt);
      const contentType = reports[0].contentType as ModerationContentType;
      const contentId = reports[0].contentId as any;

      let resolved;
      try {
        resolved = await resolveContent(ctx, reports[0].reportedBy, contentType, contentId, true);
      } catch (error) {
        console.warn("Skipping moderation group with missing content", contentType, contentId, error);
        continue;
      }
      const reportCount = reports.length;
      const severity = computeSeverity(reportCount);

      if (args.severity && args.severity !== severity) continue;
      if (args.channelId && resolved.channelId !== args.channelId) continue;
      if (args.categoryId && resolved.categoryId !== args.categoryId) continue;

      const reasons = reports.reduce<Record<string, number>>((acc, report) => {
        acc[report.reason] = (acc[report.reason] || 0) + 1;
        return acc;
      }, {});

      const notes = reports.map((report) => report.note).filter(Boolean);

      items.push({
        contentType,
        contentId,
        targetUserId: resolved.targetUserId,
        channelId: resolved.channelId,
        categoryId: resolved.categoryId,
        threadId: resolved.threadId,
        reportCount,
        severity,
        latestCreatedAt: reports[0].createdAt,
        reasons,
        notes,
        reports,
        content: resolved.content,
      });
    }

    items.sort((a, b) => b.latestCreatedAt - a.latestCreatedAt);
    const pageItems = items.slice(0, limit);

    const hasMore = rawReports.length === batchSize;
    const nextCursor = hasMore ? rawReports[rawReports.length - 1].createdAt : null;

    return { items: pageItems, nextCursor };
  },
});

export const getPolicy = query({
  args: {},
  handler: async (ctx) => {
    await requireModerator(ctx);
    const policyDoc = await ctx.db.query("moderationPolicy").first();
    return policyDoc ? { ...DEFAULT_MODERATION_POLICY, ...policyDoc } : DEFAULT_MODERATION_POLICY;
  },
});

export const getModerationStats = query({
  args: {},
  handler: async (ctx) => {
    await requireModerator(ctx);

    const now = Date.now();
    const oneDayAgo = now - DAY_MS;

    const openReports = await ctx.db
      .query("moderationReports")
      .withIndex("by_status_createdAt", (q: any) => q.eq("status", "open"))
      .collect();

    const removals = await ctx.db
      .query("moderationActions")
      .withIndex("by_actionType_createdAt", (q: any) =>
        q.eq("actionType", "remove").gt("createdAt", oneDayAgo)
      )
      .collect();

    const statuses = await ctx.db.query("userModerationStatus").collect();
    const bannedCount = statuses.filter((status: any) => status.isBanned).length;
    const activeTimeouts = statuses.filter(
      (status: any) => !status.isBanned && status.timeoutUntil && status.timeoutUntil > now
    ).length;

    const channelCounts = new Map<Id<"channels">, number>();
    const messageChannelCache = new Map<string, Id<"channels"> | null>();

    for (const report of openReports) {
      if (report.contentType !== "chat_message") continue;

      const cacheKey = String(report.contentId);
      if (!messageChannelCache.has(cacheKey)) {
        const message = await ctx.db.get(report.contentId as Id<"messages">);
        messageChannelCache.set(cacheKey, message?.channelId ?? null);
      }
      const channelId = messageChannelCache.get(cacheKey);
      if (!channelId) continue;
      channelCounts.set(channelId, (channelCounts.get(channelId) || 0) + 1);
    }

    const topFlaggedChannels = Array.from(channelCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([channelId, count]) => ({ channelId, count }));

    return {
      openReports: openReports.length,
      removalsLast24h: removals.length,
      bannedCount,
      activeTimeouts,
      topFlaggedChannels,
    };
  },
});

export const getUserHistory = query({
  args: {
    targetUserId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireModerator(ctx);

    const limit = Math.max(1, Math.min(args.limit ?? 50, 200));
    const actions = await ctx.db
      .query("moderationActions")
      .withIndex("by_targetUser_createdAt", (q: any) => q.eq("targetUserId", args.targetUserId))
      .order("desc")
      .take(limit);

    const policy = await getModerationPolicy(ctx);
    const windowStart = Date.now() - policy.warningWindowDays * DAY_MS;
    const windowActions = await ctx.db
      .query("moderationActions")
      .withIndex("by_targetUser_createdAt", (q: any) =>
        q.eq("targetUserId", args.targetUserId).gt("createdAt", windowStart)
      )
      .collect();

    const warnings = windowActions.filter((action: any) => action.actionType === "warn").length;
    const timeouts = windowActions.filter((action: any) => action.actionType === "timeout").length;
    const bans = windowActions.filter((action: any) => action.actionType === "ban").length;

    const status = await ctx.db
      .query("userModerationStatus")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.targetUserId))
      .first();

    return {
      actions,
      summary: {
        warnings,
        timeouts,
        bans,
        warningThreshold: policy.warningThreshold,
        warningWindowDays: policy.warningWindowDays,
      },
      status,
    };
  },
});

export const takeAction = mutation({
  args: {
    actionType: v.union(
      v.literal("dismiss"),
      v.literal("warn"),
      v.literal("remove"),
      v.literal("timeout"),
      v.literal("ban")
    ),
    targetUserId: v.id("users"),
    contentType: v.optional(
      v.union(
        v.literal("chat_message"),
        v.literal("forum_thread"),
        v.literal("forum_reply")
      )
    ),
    contentId: v.optional(v.union(v.id("messages"), v.id("threads"), v.id("replies"))),
    reason: v.optional(v.string()),
    durationMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const moderator = await requireModerator(ctx);
    const now = Date.now();
    const policy = await getModerationPolicy(ctx);

    if ((args.contentType && !args.contentId) || (!args.contentType && args.contentId)) {
      throw new ConvexError("Content type and content id must be provided together");
    }

    const existingStatus = await ctx.db
      .query("userModerationStatus")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.targetUserId))
      .first();
    const alreadyBanned = existingStatus?.isBanned ?? false;

    const windowStart = now - policy.warningWindowDays * DAY_MS;
    const allActions = await ctx.db
      .query("moderationActions")
      .withIndex("by_targetUser_createdAt", (q: any) => q.eq("targetUserId", args.targetUserId))
      .order("desc")
      .take(500);

    const warningCount = allActions.filter(
      (action: any) => action.actionType === "warn" && action.createdAt >= windowStart
    ).length;
    const timeoutCount = allActions.filter((action: any) => action.actionType === "timeout").length;
    const banCount = allActions.filter((action: any) => action.actionType === "ban").length;

    let resolvedContent: any = null;
    if (args.contentType && args.contentId) {
      try {
        resolvedContent = await resolveContent(
          ctx,
          moderator._id,
          args.contentType,
          args.contentId as any,
          true
        );
        if (resolvedContent.targetUserId && resolvedContent.targetUserId !== args.targetUserId) {
          throw new ConvexError("Target user does not match the content author");
        }
      } catch (error) {
        console.warn("Moderation action proceeding without content resolution", args.contentType, args.contentId, error);
        resolvedContent = null;
      }
    }

    const defaultReasons: Record<string, string> = {
      dismiss: "Dismissed after review",
      warn: "Warning issued",
      remove: "Content removed",
      timeout: "Timeout applied",
      ban: "Ban applied",
    };
    const reason = sanitizeReason(args.reason ?? defaultReasons[args.actionType]);

    let durationMs: number | undefined;
    let escalationLevel = 0;

    if (args.actionType === "timeout") {
      escalationLevel = timeoutCount + 1;
      const policyDuration = policy.timeoutDurationsMs[Math.min(timeoutCount, policy.timeoutDurationsMs.length - 1)];
      const maxPolicyDuration = policy.timeoutDurationsMs[policy.timeoutDurationsMs.length - 1];
      durationMs = args.durationMs && args.durationMs > 0 ? Math.min(args.durationMs, maxPolicyDuration) : policyDuration;
      if (!alreadyBanned) {
        await applyTimeout(ctx, args.targetUserId, durationMs, now);
      }
    }

    if (args.actionType === "ban") {
      escalationLevel = banCount + 1;
      if (alreadyBanned) {
        const status = existingStatus ?? (await ensureUserStatus(ctx, args.targetUserId, now));
        await ctx.db.patch(status._id, {
          isBanned: true,
          timeoutUntil: undefined,
          updatedAt: now,
        });
      } else if (escalationLevel >= policy.banThreshold) {
        const status = await ensureUserStatus(ctx, args.targetUserId, now);
        await ctx.db.patch(status._id, {
          isBanned: true,
          timeoutUntil: undefined,
          updatedAt: now,
        });
      } else {
        durationMs = TEMP_BAN_DURATION_MS;
        await applyTimeout(ctx, args.targetUserId, durationMs, now);
      }
    }

    if (args.actionType === "warn") {
      escalationLevel = warningCount + 1;
    }

    if (args.actionType === "remove" && (!args.contentType || !args.contentId)) {
      throw new ConvexError("Remove actions require a content type and content id");
    }

    if (args.actionType === "remove" && resolvedContent) {
      if (args.contentType === "chat_message") {
        await removeChatMessage(ctx, args.contentId as Id<"messages">, moderator._id, reason || "Removed by moderation", now);
      } else if (args.contentType === "forum_thread") {
        await removeForumThread(ctx, args.contentId as Id<"threads">, moderator._id, reason || "Removed by moderation", now);
      } else if (args.contentType === "forum_reply") {
        await removeForumReply(ctx, args.contentId as Id<"replies">, moderator._id, reason || "Removed by moderation", now);
      }
    }

    const actionId = await ctx.db.insert("moderationActions", {
      actionType: args.actionType,
      targetUserId: args.targetUserId,
      contentId: args.contentId as any,
      contentType: args.contentType,
      durationMs,
      reason,
      escalationLevel: escalationLevel || undefined,
      moderatorId: moderator._id,
      createdAt: now,
    });

    if (args.actionType === "warn") {
      const updatedWarningCount = warningCount + 1;
      if (!alreadyBanned && updatedWarningCount >= policy.warningThreshold) {
        const nextTimeoutLevel = timeoutCount + 1;
        const autoDuration = policy.timeoutDurationsMs[Math.min(timeoutCount, policy.timeoutDurationsMs.length - 1)];
        await applyTimeout(ctx, args.targetUserId, autoDuration, now);
        await ctx.db.insert("moderationActions", {
          actionType: "timeout",
          targetUserId: args.targetUserId,
          contentId: args.contentId as any,
          contentType: args.contentType,
          durationMs: autoDuration,
          reason: "Auto-timeout after warning threshold",
          escalationLevel: nextTimeoutLevel,
          moderatorId: moderator._id,
          createdAt: now,
        });
        durationMs = autoDuration;
      }
    }

    const resolvedReportCount = await resolveReportsForContent(
      ctx,
      args.contentType,
      args.contentId as any,
      moderator._id,
      now
    );

    const status = await ctx.db
      .query("userModerationStatus")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.targetUserId))
      .first();

    return {
      actionId,
      resolvedReportCount,
      status,
      durationMs,
    };
  },
});
