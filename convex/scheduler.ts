import { mutation } from "./_generated/server";

/**
 * Cleanup expired typing indicators
 * This function is designed to be called on a schedule (e.g., every 5 minutes)
 * It removes typing indicators that have expired (where expiresAt < now())
 */
export const cleanupExpiredTypingIndicators = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Find all expired typing indicators
    const expiredIndicators = await ctx.db
      .query("userTypingIndicators")
      .withIndex("by_channel", (q) => q.lt("expiresAt", now))
      .collect();
    
    let deletedCount = 0;
    
    // Delete them
    for (const indicator of expiredIndicators) {
      try {
        await ctx.db.delete(indicator._id);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete typing indicator ${indicator._id}:`, error);
      }
    }
    
    return { 
      deletedCount,
      message: deletedCount > 0 ? `Cleaned up ${deletedCount} expired typing indicators` : "No expired indicators found"
    };
  },
});