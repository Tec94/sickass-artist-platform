import { httpAction } from './_generated/server'

// Cron job to cleanup expired entries every 5 minutes
// This leverages the existing cleanup functions from scheduler.ts
export const cleanupCron = httpAction(async (ctx) => {
  try {
    console.log('[Cron] Starting cleanup of expired entries...')
    
    // Run existing cleanup functions
    const [queueResult, checkoutResult, typingResult] = await Promise.all([
      ctx.runMutation(ctx.api.scheduler.expireOldQueueEntries),
      ctx.runMutation(ctx.api.scheduler.cleanupExpiredCheckoutSessions),
      ctx.runMutation(ctx.api.scheduler.cleanupExpiredTypingIndicators),
    ])
    
    // Run our new comprehensive cleanup
    const cleanupResult = await ctx.runMutation(ctx.api.events.cleanupExpiredEntries)
    
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
export const updateEventStatusCron = httpAction(async (ctx) => {
  try {
    console.log('[Cron] Updating event sale statuses...')
    
    const now = Date.now()
    let updatedCount = 0
    
    // Get all events that need status updates
    const events = await ctx.db.query('events').collect()
    
    for (const event of events) {
      let newStatus = event.saleStatus
      
      // Update based on current time and event timings
      if (event.saleStatus === 'upcoming' && now >= event.startAtUtc) {
        newStatus = event.ticketsSold >= event.capacity ? 'sold_out' : 'on_sale'
      }
      
      // Check ticket sales vs capacity
      if (event.ticketsSold >= event.capacity && event.saleStatus === 'on_sale') {
        newStatus = 'sold_out'
      }
      
      if (newStatus !== event.saleStatus) {
        await ctx.db.patch(event._id, {
          saleStatus: newStatus,
          updatedAt: now,
        })
        updatedCount++
      }
    }
    
    console.log(`[Cron] Updated ${updatedCount} event statuses`)
    
    return new Response(JSON.stringify({ 
      success: true, 
      updatedCount,
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
    
    const result = await ctx.runMutation(ctx.api.scheduler.reconcileEventData)
    
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
export const healthCheck = httpAction(async (ctx) => {
  try {
    const now = Date.now()
    
    // Basic health checks
    const checks = {
      timestamp: now,
      database: 'ok',
      events: 'ok',
      queues: 'ok',
    }
    
    // Test database connectivity
    try {
      await ctx.db.query('events').take(1)
    } catch {
      checks.database = 'error'
    }
    
    // Test events table
    try {
      const eventCount = await ctx.db.query('events').count()
      checks.events = eventCount >= 0 ? 'ok' : 'error'
    } catch {
      checks.events = 'error'
    }
    
    // Test queue operations
    try {
      const queueCount = await ctx.db.query('eventQueue').count()
      checks.queues = queueCount >= 0 ? 'ok' : 'error'
    } catch {
      checks.queues = 'error'
    }
    
    const allHealthy = Object.values(checks).every(check => check === 'ok')
    
    return new Response(JSON.stringify({
      healthy: allHealthy,
      checks,
      timestamp: new Date().toISOString(),
    }), {
      status: allHealthy ? 200 : 503,
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

// Configuration notes for deployment:
/*
To configure these cron jobs, set up external cron triggers:

1. Every 5 minutes - Cleanup expired entries:
   curl -X POST "https://your-convex-app.convex.cloud/cron/cleanupCron" \
   -H "Authorization: Bearer YOUR_CRON_SECRET"

2. Every 10 minutes - Update event statuses:
   curl -X POST "https://your-convex-app.convex.cloud/cron/updateEventStatusCron" \
   -H "Authorization: Bearer YOUR_CRON_SECRET"

3. Every 30 minutes - Data reconciliation:
   curl -X POST "https://your-convex-app.convex.cloud/cron/reconcileCron" \
   -H "Authorization: Bearer YOUR_CRON_SECRET"

4. Health check endpoint (can be used for monitoring):
   curl "https://your-convex-app.convex.cloud/cron/healthCheck"
*/