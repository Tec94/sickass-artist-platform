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
      } catch {
        // Silently ignore deletion errors
      }
    }
    
    return { 
      deletedCount,
      message: deletedCount > 0 ? `Cleaned up ${deletedCount} expired typing indicators` : "No expired indicators found"
    };
  },
});

const QUEUE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Expire old queue entries
 * This function marks queue entries as 'expired' when they pass expiresAtUtc
 * Run every 5 minutes to prevent users from getting stuck in queues indefinitely
 */
export const expireOldQueueEntries = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Query all expired entries using the by_expires index for fast O(log n) lookup
    // This finds ALL expired entries across all events (no pagination needed)
    const expiredEntries = await ctx.db
      .query('eventQueue')
      .withIndex('by_expires', (q) => q.lt('expiresAtUtc', now))
      .collect();
    
    let expiredCount = 0;
    let errorCount = 0;
    
    // Batch update each expired entry
    for (const entry of expiredEntries) {
      try {
        // Only update if status is not already 'expired' or 'left' (idempotent)
        if (entry.status !== 'expired' && entry.status !== 'left') {
          await ctx.db.patch(entry._id, { 
            status: 'expired'
          });
          expiredCount++;
        }
      } catch (error) {
        console.error(`Failed to expire queue entry ${entry._id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Queue expiry: ${expiredCount} entries marked expired, ${errorCount} errors`);
    return {
      expiredCount,
      errorCount,
      success: errorCount === 0,
    };
  },
});

/**
 * Clean up expired checkout sessions
 * This function deletes checkout sessions that have passed expiresAtUtc
 * Run every 5 minutes to free up checkout slots and prevent thundering herd
 */
export const cleanupExpiredCheckoutSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Query all expired sessions using the by_expires index for fast O(log n) lookup
    const expiredSessions = await ctx.db
      .query('checkoutSessions')
      .withIndex('by_expires', (q) => q.lt('expiresAtUtc', now))
      .collect();
    
    let deletedCount = 0;
    let errorCount = 0;
    
    // Batch delete each expired session
    for (const session of expiredSessions) {
      try {
        await ctx.db.delete(session._id);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete checkout session ${session._id}:`, error);
        errorCount++;
      }
    }
    
    // Defensive reconciliation: verify cleanup was complete
    const remainingExpired = await ctx.db
      .query('checkoutSessions')
      .withIndex('by_expires', (q) => q.lt('expiresAtUtc', now))
      .count();
    
    if (remainingExpired > 0) {
      console.warn(`⚠️ Reconciliation: ${remainingExpired} expired sessions remain after cleanup`);
    }
    
    console.log(`Checkout cleanup: ${deletedCount} sessions deleted, ${errorCount} errors, ${remainingExpired} remain`);
    return {
      deletedCount,
      errorCount,
      remainingExpired,
      success: errorCount === 0 && remainingExpired === 0,
    };
  },
});

/**
 * Defensive reconciliation for event data consistency
 * This function detects and fixes data consistency issues in the events system
 * Run every 30 minutes to ensure data integrity
 */
export const reconcileEventData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const issues: string[] = [];
    let fixedCount = 0;
    
    // Check 1: No event oversold (ticketsSold > capacity)
    const allEvents = await ctx.db.query('events').collect();
    for (const event of allEvents) {
      if (event.ticketsSold > event.capacity) {
        const issue = `Event ${event._id}: oversold (${event.ticketsSold}/${event.capacity})`;
        issues.push(issue);
        console.warn(`⚠️ Reconciliation: ${issue}`);
        
        if (event.saleStatus !== 'sold_out') {
          try {
            await ctx.db.patch(event._id, { saleStatus: 'sold_out' });
            fixedCount++;
          } catch (error) {
            console.error(`Failed to fix oversold event ${event._id}:`, error);
          }
        }
      }
    }
    
    // Check 2: No old admitted queue entries (admitted for >30 minutes)
    const oldAdmitted = await ctx.db
      .query('eventQueue')
      .filter((q) => 
        q.and(
          q.eq(q.field('status'), 'admitted'),
          q.lt(q.field('joinedAtUtc'), now - QUEUE_EXPIRY_MS)
        )
      )
      .collect();
    
    for (const entry of oldAdmitted) {
      const issue = `Queue entry ${entry._id}: admitted for >30min (should be expired)`;
      issues.push(issue);
      console.warn(`⚠️ Reconciliation: ${issue}`);
      
      try {
        await ctx.db.patch(entry._id, { status: 'expired' });
        fixedCount++;
      } catch (error) {
        console.error(`Failed to fix old admitted queue entry ${entry._id}:`, error);
      }
    }
    
    console.log(`Reconciliation: ${issues.length} issues found, ${fixedCount} fixed`);
    return {
      issues,
      fixedCount,
      success: issues.length === 0,
    };
  },
});