import { mutation } from './_generated/server'

export const refreshEventSaleStatuses = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const events = await ctx.db.query('events').collect()
    let updated = 0

    for (const event of events) {
      if (event.saleStatus === 'cancelled') continue

      const nextStatus =
        event.ticketsSold >= event.capacity
          ? 'sold_out'
          : now < event.startAtUtc
            ? 'upcoming'
            : 'on_sale'

      if (event.saleStatus !== nextStatus) {
        await ctx.db.patch(event._id, {
          saleStatus: nextStatus,
          updatedAt: now,
        })
        updated += 1
      }
    }

    return { scanned: events.length, updated, ranAt: now }
  },
})

export const reconcileEventData = mutation({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db.query('events').collect()
    let patchedTicketsSold = 0

    for (const event of events) {
      const tickets = await ctx.db.query('userTickets').collect()

      const soldCount = tickets
        .filter((ticket) => ticket.eventId === event._id)
        .filter((ticket) => ticket.status !== 'cancelled')
        .reduce((sum, ticket) => sum + ticket.quantity, 0)

      if (soldCount !== event.ticketsSold) {
        await ctx.db.patch(event._id, {
          ticketsSold: soldCount,
          updatedAt: Date.now(),
        })
        patchedTicketsSold += 1
      }
    }

    return {
      scannedEvents: events.length,
      patchedTicketsSold,
      ranAt: Date.now(),
    }
  },
})
