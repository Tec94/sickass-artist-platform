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
    // Note: We query all and filter in memory since we need to check expiresAt across all channels
    const allIndicators = await ctx.db
      .query("userTypingIndicators")
      .collect();
    
    const expiredIndicators = allIndicators.filter(
      (indicator) => indicator.expiresAt < now
    );
    
    let deletedCount = 0;
    
    // Delete them
    for (const indicator of expiredIndicators) {
      try {
        await ctx.db.delete(indicator._id);
        deletedCount++;
      } catch (error) {
        // Silently ignore deletion errors
      }
    }
    
    return { 
      deletedCount,
      message: deletedCount > 0 ? `Cleaned up ${deletedCount} expired typing indicators` : "No expired indicators found"
    };
  },
});