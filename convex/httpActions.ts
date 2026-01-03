import { httpAction } from './_generated/server'
import { api } from './_generated/api'

// Cron job to cleanup expired entries every 5 minutes
// This leverages the existing cleanup functions from scheduler.ts
export const cleanupCron = httpAction(async (ctx) => {
  try {
    console.log('[Cron] Starting cleanup of expired entries...')
    
    // Run existing cleanup functions
    const [queueResult, checkoutResult, typingResult] = await Promise.all([
      ctx.runMutation(api.scheduler.expireOldQueueEntries),
      ctx.runMutation(api.scheduler.cleanupExpiredCheckoutSessions),
      ctx.runMutation(api.scheduler.cleanupExpiredTypingIndicators),
    ])
    
    // Run our new comprehensive cleanup
    const cleanupResult = await ctx.runMutation(api.events.cleanupExpiredEntries)
    
    console.log('[Cron] Cleanup completed:', {
      queue: queueResult,
      checkout: checkoutResult,
      typing: typingResult,
      comprehensive: cleanupResult,
    })
    
    return new Response(JSON.stringify({ 
      success: true, 
      cleaned: {
        queueExpired: queueResult.expiredCount,
        checkoutDeleted: checkoutResult.deletedCount,
        typingDeleted: typingResult.deletedCount,
        comprehensive: cleanupResult,
      },
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('[Cron] Cleanup failed:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

// Cron job to update event sale status based on time
// Note: This requires a mutation to be created in events.ts or scheduler.ts
// For now, this is a placeholder that can be called via external cron
export const updateEventStatusCron = httpAction(async () => {
  try {
    console.log('[Cron] Updating event sale statuses...')
    
    // TODO: Create updateEventStatuses mutation in events.ts or scheduler.ts
    // For now, return success but no actual update
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Event status update not yet implemented - requires mutation',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('[Cron] Status update failed:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

// Cron job for data reconciliation and consistency checks
export const reconcileCron = httpAction(async (ctx) => {
  try {
    console.log('[Cron] Starting data reconciliation...')
    
    const result = await ctx.runMutation(api.scheduler.reconcileEventData)
    
    console.log('[Cron] Reconciliation completed:', result)
    
    return new Response(JSON.stringify({ 
      success: true, 
      reconciled: result,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('[Cron] Reconciliation failed:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

// Health check endpoint
export const healthCheck = httpAction(async () => {
  try {
    // Basic health check - just verify the endpoint is accessible
    // For more detailed checks, create queries/mutations
    return new Response(JSON.stringify({
      healthy: true,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch {
    return new Response(JSON.stringify({
      healthy: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

