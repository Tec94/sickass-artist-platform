import { query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getCurrentUser, canAccessChannel, canAccessCategory } from "./helpers";

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
    const threads = await ctx.db
      .query("threads")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) => q.eq("isDeleted", false))
      .collect();

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
      
      return b.netVoteCount - a.netVoteCount;
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
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .filter((q) => q.eq("isDeleted", false))
      .collect();

    // Search in content
    const results = messages
      .filter((message) => message.content.toLowerCase().includes(searchTerm))
      .sort((a, b) => b.createdAt - a.createdAt); // Newest first

    return results.slice(0, limit);
  },
});