import { query, mutation, action } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { api } from "./_generated/api";
import { getCurrentUser } from "./helpers";

 
interface QueueItem {
  _id: string;
  type: string;
  payload?: Record<string, any>;
  retryCount: number;
  lastRetryAt?: number;
}

// Type for queue item processing result
interface ProcessResult {
  processed: number;
  failed: number;
  errors: string[];
}

// Helper to determine exponential backoff delay
const getRetryDelay = (retryCount: number): number => {
  // Exponential backoff: 2^retryCount * 1000ms
  return Math.pow(2, retryCount) * 1000;
};

// Helper to check if an item should be retried
const shouldRetryItem = (item: any): boolean => {
  const maxRetries = 3;
  if (item.retryCount >= maxRetries) {
    return false;
  }
  
  const now = Date.now();
  const lastRetry = item.lastRetryAt || 0;
  const retryDelay = getRetryDelay(item.retryCount);
  
  // Only retry if enough time has passed
  return now - lastRetry >= retryDelay;
};

// Helper to process a single queue item
const processQueueItem = async (ctx: any, item: QueueItem): Promise<{ success: boolean; error?: string }> => {
  try {
    switch (item.type) {
      case 'message': {
        const payload = item.payload;
        if (!payload?.channelId || !payload?.content) {
          throw new Error('Invalid message payload');
        }
        
        // Call the sendMessage mutation
        await ctx.api.mutation("chat:sendMessage", {
          channelId: payload.channelId,
          content: payload.content,
          idempotencyKey: payload.idempotencyKey || `offline-${Date.now()}`,
        });
        return { success: true };
      }
      
      case 'vote_thread': {
        const payload = item.payload;
        if (!payload?.threadId || !payload?.voteType) {
          throw new Error('Invalid vote payload');
        }
        
        // Call the castThreadVote mutation
        await ctx.api.mutation("forum:castThreadVote", {
          threadId: payload.threadId,
          voteType: payload.voteType,
        });
        return { success: true };
      }
      
      case 'vote_reply': {
        const payload = item.payload;
        if (!payload?.replyId || !payload?.voteType) {
          throw new Error('Invalid vote payload');
        }
        
        // Call the castReplyVote mutation
        await ctx.api.mutation("forum:castReplyVote", {
          replyId: payload.replyId,
          voteType: payload.voteType,
        });
        return { success: true };
      }
      
      case 'reaction': {
        const payload = item.payload;
        if (!payload?.messageId || !payload?.emoji) {
          throw new Error('Invalid reaction payload');
        }
        
        // Call the addReaction mutation
        await ctx.api.mutation("chat:addReaction", {
          messageId: payload.messageId,
          emoji: payload.emoji,
        });
        return { success: true };
      }
      
      default:
        throw new Error(`Unknown queue item type: ${item.type}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

/**
 * Process offline queue items for the current user
 * Called when user comes online
 */
export const processOfflineQueue = action({
  args: {},
  handler: async (ctx) => {
    // Get user identity from auth
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }
    
    // Get user via query
    const user = await ctx.runQuery(api.offlineQueue.getUserByClerkId, {
      clerkId: identity.subject,
    });
    if (!user) {
      throw new ConvexError("User not found");
    }
    const userId = user._id;
    
    const result: ProcessResult = {
      processed: 0,
      failed: 0,
      errors: [],
    };
    
    // Get all pending items for this user via query
    const pendingItems = await ctx.runQuery(api.offlineQueue.getPendingItemsForUser, {
      userId,
    });
    
    if (pendingItems.length === 0) {
      return result;
    }
    
    // Process each item
    for (const item of pendingItems) {
      // Check if we should retry failed items
      if (item.status === 'failed' && !shouldRetryItem(item)) {
        result.failed++;
        continue;
      }
      
      try {
        // Attempt to process the item
        const processResult = await processQueueItem(ctx, item);
        
        if (processResult.success) {
          // Mark as synced via mutation
          await ctx.runMutation(api.offlineQueue.updateQueueItem, {
            itemId: item._id,
            status: 'synced',
            processedAt: Date.now(),
          });
          result.processed++;
        } else {
          // Mark as failed and increment retry count
          const newRetryCount = (item.retryCount || 0) + 1;
          await ctx.runMutation(api.offlineQueue.updateQueueItem, {
            itemId: item._id,
            status: newRetryCount >= 3 ? 'failed' : 'pending',
            retryCount: newRetryCount,
            lastError: processResult.error,
            lastRetryAt: Date.now(),
          });
          
          if (newRetryCount >= 3) {
            result.failed++;
            result.errors.push(`Item ${item._id}: ${processResult.error}`);
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.failed++;
        result.errors.push(errorMessage);
        
        // Update item with failure
        const newRetryCount = (item.retryCount || 0) + 1;
        await ctx.runMutation(api.offlineQueue.updateQueueItem, {
          itemId: item._id,
          status: newRetryCount >= 3 ? 'failed' : 'pending',
          retryCount: newRetryCount,
          lastError: errorMessage,
          lastRetryAt: Date.now(),
        });
      }
    }
    
    return result;
  },
});

/**
 * Retry failed queue items that haven't exceeded max retries
 * Can be called manually or run on schedule
 */
export const retryFailedQueueItems = action({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const maxRetries = 3;
    
    // Find failed items that can be retried via query
    const allFailedItems = await ctx.runQuery(api.offlineQueue.getFailedItems, {});
    const failedItems = allFailedItems.filter((item: any) => item.retryCount < maxRetries);
    
    const result: ProcessResult = {
      processed: 0,
      failed: 0,
      errors: [],
    };
    
    for (const item of failedItems) {
      // Check if enough time has passed for retry
      const lastRetry = item.lastRetryAt || 0;
      const retryDelay = getRetryDelay(item.retryCount);
      
      if (now - lastRetry < retryDelay) {
        continue; // Not ready for retry yet
      }
      
      try {
        // Reset status to pending and increment retry count via mutation
        await ctx.runMutation(api.offlineQueue.updateQueueItem, {
          itemId: item._id,
          status: 'pending',
          retryCount: item.retryCount + 1,
          lastRetryAt: now,
        });
        
        // The item will be processed by processOfflineQueue
        result.processed++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.failed++;
        result.errors.push(errorMessage);
      }
    }
    
    return result;
  },
});

/**
 * Clean up old queue items
 * Deletes synced items older than 7 days
 * Keeps failed items for inspection
 */
export const cleanupOldQueue = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    
    // Find synced items older than 7 days
    const allSyncedItems = await ctx.db
      .query("offlineQueue")
      .collect();
    
    const oldSyncedItems = allSyncedItems.filter(
      (item) => item.status === "synced" && 
                 item.processedAt && 
                 item.processedAt < sevenDaysAgo
    );
    
    let deletedCount = 0;
    
    // Delete them
    for (const item of oldSyncedItems) {
      try {
        await ctx.db.delete(item._id);
        deletedCount++;
      } catch (error) {
        // Silently ignore deletion errors
      }
    }
    
    return { deletedCount };
  },
});

/**
 * Record a failed message in the offline queue for later sync
 */
export const recordOfflineMessage = mutation({
  args: {
    channelId: v.id("channels"),
    content: v.string(),
    idempotencyKey: v.string(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const userId = user._id;
    
    // Validate content
    if (args.content.length > 5000) {
      throw new ConvexError("Message content too long (max 5000 characters)");
    }
    
    // Insert into offline queue
    const queueItemId = await ctx.db.insert("offlineQueue", {
      userId,
      type: "message",
      payload: {
        channelId: args.channelId,
        content: args.content,
      },
      status: "pending",
      retryCount: 0,
      createdAt: args.createdAt,
    });
    
    return { queueItemId };
  },
});

/**
 * Helper query: Get user by auth subject (`sub`) (for actions)
 */
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
    return user;
  },
});

/**
 * Helper query: Get pending items for a user (for actions)
 */
export const getPendingItemsForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const allItems = await ctx.db
      .query("offlineQueue")
      .withIndex("by_user_status", (q) => q.eq("userId", args.userId))
      .collect();
    
    return allItems.filter((item) => item.status === "pending");
  },
});

/**
 * Helper query: Get failed items (for actions)
 */
export const getFailedItems = query({
  args: {},
  handler: async (ctx) => {
    const allItems = await ctx.db
      .query("offlineQueue")
      .collect();
    
    return allItems.filter((item) => item.status === "failed");
  },
});

/**
 * Helper mutation: Update queue item (for actions)
 */
export const updateQueueItem = mutation({
  args: {
    itemId: v.id("offlineQueue"),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("synced"),
      v.literal("failed")
    )),
    processedAt: v.optional(v.number()),
    retryCount: v.optional(v.number()),
    lastError: v.optional(v.string()),
    lastRetryAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {};
    if (args.status !== undefined) updates.status = args.status;
    if (args.processedAt !== undefined) updates.processedAt = args.processedAt;
    if (args.retryCount !== undefined) updates.retryCount = args.retryCount;
    if (args.lastError !== undefined) updates.lastError = args.lastError;
    if (args.lastRetryAt !== undefined) updates.lastRetryAt = args.lastRetryAt;
    
    await ctx.db.patch(args.itemId, updates);
  },
});

/**
 * Get pending queue items for a user
 */
export const getPendingItems = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    // Users can only see their own pending items
    if (user._id !== args.userId) {
      throw new ConvexError("Access denied");
    }
    
    // Get all pending items for this user
    const allItems = await ctx.db
      .query("offlineQueue")
      .withIndex("by_user_status", (q) => q.eq("userId", args.userId))
      .collect();
    
    return allItems.filter((item) => item.status === "pending");
  },
});

/**
 * Record a failed vote in the offline queue for later sync
 */
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