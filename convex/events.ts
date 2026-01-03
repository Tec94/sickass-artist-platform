import { query, mutation } from './_generated/server'
import { v, ConvexError } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'
import { getCurrentUser, isModerator } from './helpers'

const CHECKOUT_LIMIT = 5 // max concurrent checkout sessions per event
const EVENT_WINDOW_DAYS = 90

// Error mitigation constants
const QUEUE_EXPIRY_MS = 30 * 60 * 1000 // 30 minutes
const QUEUE_COOLDOWN_MS = 60 * 60 * 1000 // 1 hour
const CHECKOUT_EXPIRY_MS = 10 * 60 * 1000 // 10 minutes
const MAX_TICKETS_PER_PURCHASE = 10

// Custom error classes for specific scenarios
class OversellError extends ConvexError<{ message: string; retryAfter?: number }> {
  constructor(message: string, retryAfter?: number) {
    super({ message, retryAfter })
  }
}

class QueueError extends ConvexError<{ message: string; code: string }> {
  constructor(message: string, code: string) {
    super({ message, code })
  }
}

class ValidationError extends ConvexError<{ message: string; field: string }> {
  constructor(message: string, field: string) {
    super({ message, field })
  }
}

// Type definitions
export type EventWithCreator = {
  _id: Id<'events'>
  title: string
  imageUrl: string
  startAtUtc: number
  endAtUtc: number
  city: string
  saleStatus: 'upcoming' | 'on_sale' | 'sold_out' | 'cancelled'
  capacity: number
  ticketsSold: number
  availablePercent: number
  creator: {
    _id: Id<'users'>
    displayName: string
    avatar: string
  }
  createdAt: number
}

export type PaginatedResult<T> = {
  items: T[]
  hasMore: boolean
  totalCount: number
  page: number
}

export type EventDetailWithContext = {
  event: {
    _id: Id<'events'>
    title: string
    description: string
    imageUrl: string
    startAtUtc: number
    endAtUtc: number
    city: string
    address: string
    timezone: string
    capacity: number
    ticketsSold: number
    saleStatus: 'upcoming' | 'on_sale' | 'sold_out' | 'cancelled'
    createdAt: number
  }
  creator: {
    _id: Id<'users'>
    displayName: string
    avatar: string
    username: string
  }
  ticketTypes: {
    _id: Id<'eventTickets'>
    type: 'general' | 'vip' | 'early_bird'
    price: number
    quantity: number
    quantitySold: number
    availableQuantity: number
    saleStartsAtUtc: number
    saleEndsAtUtc: number
    description?: string
  }[]
  userContext?: {
    queueEntry?: {
      seq: number
      status: 'waiting' | 'admitted' | 'expired' | 'left'
      position: number
      expiresAtUtc: number
      joinedAtUtc: number
    }
    checkoutSession?: {
      _id: Id<'checkoutSessions'>
      expiresAtUtc: number
      createdAtUtc: number
    }
    tickets?: Doc<'userTickets'>[]
  }
}

export type UserTicketWithEvent = {
  _id: Id<'userTickets'>
  event: {
    _id: Id<'events'>
    title: string
    imageUrl: string
    startAtUtc: number
    endAtUtc: number
    city: string
  }
  ticketType: 'general' | 'vip' | 'early_bird'
  quantity: number
  ticketNumber: string
  confirmationCode: string
  status: 'valid' | 'used' | 'cancelled'
  purchasedAtUtc: number
}

export type QueueStateResponse = {
  status: 'waiting' | 'admitted' | 'expired' | 'left' | null
  seq?: number
  position?: number
  expiresAtUtc?: number
  joinedAtUtc?: number
  estimatedWaitMinutes?: number
  checkoutSessionExists?: boolean
  cooldownUntilUtc?: number
} | null

// Q1: getEvents
export const getEvents = query({
  args: {
    page: v.number(),
    pageSize: v.number(),
    city: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    saleStatus: v.optional(v.union(v.literal('upcoming'), v.literal('on_sale'))),
    sortBy: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
  },
  handler: async (ctx, args): Promise<PaginatedResult<EventWithCreator>> => {
    const pageSize = Math.max(1, Math.min(args.pageSize, 50))
    const page = Math.max(0, args.page)

    const now = Date.now()
    const defaultStart = now
    const defaultEnd = now + EVENT_WINDOW_DAYS * 24 * 60 * 60 * 1000

    const startDate = args.startDate ?? defaultStart
    const endDate = args.endDate ?? defaultEnd

    if (startDate > endDate) {
      throw new ConvexError('Invalid date range')
    }

    let results: Doc<'events'>[] = []

    if (args.saleStatus) {
      results = await ctx.db
        .query('events')
        .withIndex('by_status_start', (q) =>
          q.eq('saleStatus', args.saleStatus!).gte('startAtUtc', startDate).lte('startAtUtc', endDate)
        )
        .collect()
    } else {
      const upcoming = await ctx.db
        .query('events')
        .withIndex('by_status_start', (q) =>
          q.eq('saleStatus', 'upcoming').gte('startAtUtc', startDate).lte('startAtUtc', endDate)
        )
        .collect()
      const onSale = await ctx.db
        .query('events')
        .withIndex('by_status_start', (q) =>
          q.eq('saleStatus', 'on_sale').gte('startAtUtc', startDate).lte('startAtUtc', endDate)
        )
        .collect()
      results = [...upcoming, ...onSale]
    }

    // Filter by city in memory
    if (args.city) {
      const cityLower = args.city.toLowerCase()
      results = results.filter((e) => e.city.toLowerCase() === cityLower)
    }

    // Sort
    const sortOrder = args.sortBy ?? 'asc'
    results.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.startAtUtc - b.startAtUtc
      } else {
        return b.startAtUtc - a.startAtUtc
      }
    })

    const totalCount = results.length
    const skip = page * pageSize
    const pagedResults = results.slice(skip, skip + pageSize)
    const hasMore = totalCount > skip + pageSize

    // Enrich with creator
    const items = await Promise.all(
      pagedResults.map(async (event) => {
        const creator = await ctx.db.get(event.artistId)
        return {
          _id: event._id,
          title: event.title,
          imageUrl: event.imageUrl,
          startAtUtc: event.startAtUtc,
          endAtUtc: event.endAtUtc,
          city: event.city,
          saleStatus: event.saleStatus,
          capacity: event.capacity,
          ticketsSold: event.ticketsSold,
          availablePercent: (event.capacity - event.ticketsSold) / event.capacity,
          creator: {
            _id: creator!._id,
            displayName: creator!.displayName,
            avatar: creator!.avatar,
          },
          createdAt: event.createdAt,
        }
      })
    )

    return {
      items,
      hasMore,
      totalCount,
      page,
    }
  },
})

// Q2: searchEvents
export const searchEvents = query({
  args: {
    query: v.string(),
    limit: v.number(),
    city: v.optional(v.string()),
    saleStatus: v.optional(v.union(v.literal('upcoming'), v.literal('on_sale'))),
  },
  handler: async (ctx, args): Promise<EventWithCreator[]> => {
    if (args.query.length < 2) {
      return []
    }
    const limit = Math.min(args.limit, 100)

    const results = await ctx.db
      .query('events')
      .withSearchIndex('search_events', (q) => {
        let search = q.search('searchText', args.query)
        if (args.saleStatus) {
          search = search.eq('saleStatus', args.saleStatus)
        }
        if (args.city) {
          search = search.eq('city', args.city)
        }
        return search
      })
      .take(limit)

    return await Promise.all(
      results.map(async (event) => {
        const creator = await ctx.db.get(event.artistId)
        return {
          _id: event._id,
          title: event.title,
          imageUrl: event.imageUrl,
          startAtUtc: event.startAtUtc,
          endAtUtc: event.endAtUtc,
          city: event.city,
          saleStatus: event.saleStatus,
          capacity: event.capacity,
          ticketsSold: event.ticketsSold,
          availablePercent: (event.capacity - event.ticketsSold) / event.capacity,
          creator: {
            _id: creator!._id,
            displayName: creator!.displayName,
            avatar: creator!.avatar,
          },
          createdAt: event.createdAt,
        }
      })
    )
  },
})

// Q3: getEventDetail
export const getEventDetail = query({
  args: {
    eventId: v.id('events'),
  },
  handler: async (ctx, args): Promise<EventDetailWithContext> => {
    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new ConvexError('Event not found')
    }

    const [creator, ticketTypes, identity] = await Promise.all([
      ctx.db.get(event.artistId),
      ctx.db
        .query('eventTickets')
        .withIndex('by_event', (q) => q.eq('eventId', args.eventId))
        .collect(),
      ctx.auth.getUserIdentity(),
    ])

    if (!creator) {
      throw new ConvexError('Event creator not found')
    }

    let userContext: EventDetailWithContext['userContext'] = undefined

    if (identity) {
      const user = await ctx.db
        .query('users')
        .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
        .first()

      if (user) {
        const [queueEntry, checkoutSession, tickets] = await Promise.all([
          ctx.db
            .query('eventQueue')
            .withIndex('by_event_user', (q) => q.eq('eventId', args.eventId).eq('userId', user._id))
            .first(),
          ctx.db
            .query('checkoutSessions')
            .withIndex('by_event_user', (q) => q.eq('eventId', args.eventId).eq('userId', user._id))
            .first(),
          ctx.db
            .query('userTickets')
            .withIndex('by_event_user', (q) => q.eq('eventId', args.eventId).eq('userId', user._id))
            .collect(),
        ])

        let queueData: EventDetailWithContext['userContext']['queueEntry'] = undefined
        if (queueEntry) {
          let position = 0
          if (queueEntry.status === 'waiting') {
            const waitingEntries = await ctx.db
              .query('eventQueue')
              .withIndex('by_event_status_seq', (q) =>
                q.eq('eventId', args.eventId).eq('status', 'waiting').lt('seq', queueEntry.seq)
              )
              .collect()
            position = waitingEntries.length
          }

          // Determine status: upgrade waiting to admitted if position is within limit
          let status = queueEntry.status
          if (status === 'waiting' && (position < CHECKOUT_LIMIT || !!checkoutSession)) {
            status = 'admitted'
          }

          queueData = {
            seq: queueEntry.seq,
            status: status as 'waiting' | 'admitted' | 'expired' | 'left',
            position,
            expiresAtUtc: queueEntry.expiresAtUtc,
            joinedAtUtc: queueEntry.joinedAtUtc,
          }
        }

        userContext = {
          queueEntry: queueData,
          checkoutSession: checkoutSession
            ? {
                _id: checkoutSession._id,
                expiresAtUtc: checkoutSession.expiresAtUtc,
                createdAtUtc: checkoutSession.createdAtUtc,
              }
            : undefined,
          tickets: tickets,
        }
      }
    }

    return {
      event: {
        _id: event._id,
        title: event.title,
        description: event.description,
        imageUrl: event.imageUrl,
        startAtUtc: event.startAtUtc,
        endAtUtc: event.endAtUtc,
        city: event.city,
        address: event.address,
        timezone: event.timezone,
        capacity: event.capacity,
        ticketsSold: event.ticketsSold,
        saleStatus: event.saleStatus,
        createdAt: event.createdAt,
      },
      creator: {
        _id: creator._id,
        displayName: creator.displayName,
        avatar: creator.avatar,
        username: creator.username,
      },
      ticketTypes: ticketTypes.map((tt) => ({
        _id: tt._id,
        type: tt.type,
        price: tt.price,
        quantity: tt.quantity,
        quantitySold: tt.quantitySold,
        availableQuantity: tt.quantity - tt.quantitySold,
        saleStartsAtUtc: tt.saleStartsAtUtc,
        saleEndsAtUtc: tt.saleEndsAtUtc,
        description: tt.description,
      })),
      userContext,
    }
  },
})

// Q4: getUserTickets
export const getUserTickets = query({
  args: {
    upcomingOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<UserTicketWithEvent[]> => {
    const user = await getCurrentUser(ctx)

    const tickets = await ctx.db
      .query('userTickets')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect()

    const now = Date.now()

    const results = await Promise.all(
      tickets.map(async (ticket) => {
        if (ticket.status === 'cancelled') return null

        const event = await ctx.db.get(ticket.eventId)
        if (!event) return null

        if (args.upcomingOnly && event.endAtUtc <= now) return null

        return {
          _id: ticket._id,
          event: {
            _id: event._id,
            title: event.title,
            imageUrl: event.imageUrl,
            startAtUtc: event.startAtUtc,
            endAtUtc: event.endAtUtc,
            city: event.city,
          },
          ticketType: ticket.ticketType,
          quantity: ticket.quantity,
          ticketNumber: ticket.ticketNumber,
          confirmationCode: ticket.confirmationCode,
          status: ticket.status,
          purchasedAtUtc: ticket.purchasedAtUtc,
        }
      })
    )

    const filteredResults = results.filter((r): r is NonNullable<typeof r> => r !== null)

    // Sort by purchasedAtUtc descending
    filteredResults.sort((a, b) => b.purchasedAtUtc - a.purchasedAtUtc)

    return filteredResults
  },
})

// Q5: getQueueState
export const getQueueState = query({
  args: {
    eventId: v.id('events'),
  },
  handler: async (ctx, args): Promise<QueueStateResponse> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .first()
    if (!user) return null

    const queueEntry = await ctx.db
      .query('eventQueue')
      .withIndex('by_event_user', (q) => q.eq('eventId', args.eventId).eq('userId', user._id))
      .first()

    if (!queueEntry) return null

    let position = 0
    if (queueEntry.status === 'waiting') {
      const waitingEntries = await ctx.db
        .query('eventQueue')
        .withIndex('by_event_status_seq', (q) => q.eq('eventId', args.eventId).eq('status', 'waiting').lt('seq', queueEntry.seq))
        .collect()
      position = waitingEntries.length
    }

    const checkoutSession = await ctx.db
      .query('checkoutSessions')
      .withIndex('by_event_user', (q) => q.eq('eventId', args.eventId).eq('userId', user._id))
      .first()

    // Determine status: upgrade waiting to admitted if position is within limit
    let status = queueEntry.status
    if (status === 'waiting' && (position < CHECKOUT_LIMIT || !!checkoutSession)) {
        status = 'admitted'
    }

    return {
      status,
      seq: queueEntry.seq,
      position,
      expiresAtUtc: queueEntry.expiresAtUtc,
      joinedAtUtc: queueEntry.joinedAtUtc,
      estimatedWaitMinutes: position * 2,
      checkoutSessionExists: !!checkoutSession,
      cooldownUntilUtc: queueEntry.cooldownUntilUtc,
    }
  },
})

// ==================== MUTATIONS (M1-M6) WITH ERROR MITIGATION ====================

// M1: createEvent
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    thumbnailUrl: v.optional(v.string()),
    startAtUtc: v.number(),
    endAtUtc: v.number(),
    venueId: v.id('venues'),
    capacity: v.number(),
    saleStatus: v.union(
      v.literal('upcoming'),
      v.literal('on_sale'),
      v.literal('sold_out'),
      v.literal('cancelled')
    ),
    searchText: v.string(),
    dedupeKey: v.string(),
  },
  handler: async (ctx, args): Promise<Id<'events'>> => {
    const user = await getCurrentUser(ctx)
    
    // Data validation
    if (args.title.length < 1 || args.title.length > 200) {
      throw new ValidationError('Title must be between 1-200 characters', 'title')
    }
    if (args.startAtUtc >= args.endAtUtc) {
      throw new ValidationError('End time must be after start time', 'endAtUtc')
    }
    if (args.capacity <= 0) {
      throw new ValidationError('Capacity must be greater than 0', 'capacity')
    }
    
    // Check for duplicate events
    const existingEvent = await ctx.db
      .query('events')
      .withIndex('by_dedupe', (q) => q.eq('dedupeKey', args.dedupeKey))
      .first()
    
    if (existingEvent) {
      throw new ValidationError('Event already exists', 'dedupeKey')
    }

    // Get venue data for snapshot
    const venue = await ctx.db.get(args.venueId)
    if (!venue) {
      throw new ValidationError('Venue not found', 'venueId')
    }

    const now = Date.now()
    const eventId = await ctx.db.insert('events', {
      ...args,
      venueName: venue.name,
      city: venue.city,
      country: venue.country,
      address: venue.address,
      timezone: venue.timezone,
      ticketsSold: 0,
      nextQueueSeq: 0,
      artistId: user._id,
      createdAt: now,
      updatedAt: now,
    })

    return eventId
  },
})

// M2: createTicketType
export const createTicketType = mutation({
  args: {
    eventId: v.id('events'),
    type: v.union(
      v.literal('general'),
      v.literal('vip'),
      v.literal('early_bird')
    ),
    price: v.number(),
    quantity: v.number(),
    description: v.optional(v.string()),
    saleStartsAtUtc: v.number(),
    saleEndsAtUtc: v.number(),
  },
  handler: async (ctx, args): Promise<Id<'eventTickets'>> => {
    const user = await getCurrentUser(ctx)
    const event = await ctx.db.get(args.eventId)
    
    if (!event) {
      throw new ValidationError('Event not found', 'eventId')
    }

    // Check if user can create tickets for this event
    if (event.artistId.toString() !== user._id.toString() && !(await isModerator(ctx))) {
      throw new ValidationError('Not authorized to create tickets for this event', 'eventId')
    }

    // Data validation
    if (args.price < 0) {
      throw new ValidationError('Price cannot be negative', 'price')
    }
    if (args.quantity < 1) {
      throw new ValidationError('Quantity must be at least 1', 'quantity')
    }
    if (args.saleEndsAtUtc > event.startAtUtc) {
      throw new ValidationError('Sale cannot end after event starts', 'saleEndsAtUtc')
    }

    const ticketTypeId = await ctx.db.insert('eventTickets', {
      eventId: args.eventId,
      type: args.type,
      price: args.price,
      quantity: args.quantity,
      quantitySold: 0,
      description: args.description,
      saleStartsAtUtc: args.saleStartsAtUtc,
      saleEndsAtUtc: args.saleEndsAtUtc,
      createdAt: Date.now(),
    })

    return ticketTypeId
  },
})

// M3: joinQueue
export const joinQueue = mutation({
  args: {
    eventId: v.id('events'),
  },
  handler: async (ctx, args): Promise<{ seq: number; position: number; expiresAtUtc: number }> => {
    const user = await getCurrentUser(ctx)
    const event = await ctx.db.get(args.eventId)
    
    if (!event) {
      throw new ValidationError('Event not found', 'eventId')
    }

    // Check cooldown
    const existingQueueEntry = await ctx.db
      .query('eventQueue')
      .withIndex('by_event_user', (q) => q.eq('eventId', args.eventId).eq('userId', user._id))
      .first()

    if (existingQueueEntry) {
      if (existingQueueEntry.status === 'waiting') {
        throw new QueueError('You are already in the queue for this event', 'ALREADY_IN_QUEUE')
      }
      if (existingQueueEntry.cooldownUntilUtc && existingQueueEntry.cooldownUntilUtc > Date.now()) {
        const minutesRemaining = Math.ceil((existingQueueEntry.cooldownUntilUtc - Date.now()) / (60 * 1000))
        throw new QueueError(`You can rejoin in ${minutesRemaining} minutes`, 'COOLDOWN_ACTIVE')
      }
    }

    const now = Date.now()
    
    // Atomic sequence allocation using patch
    await ctx.db.patch(args.eventId, {
      nextQueueSeq: event.nextQueueSeq + 1,
    })
    
    const seq = event.nextQueueSeq + 1
    
    await ctx.db.insert('eventQueue', {
      eventId: args.eventId,
      userId: user._id,
      seq: seq,
      status: 'waiting',
      joinedAtUtc: now,
      expiresAtUtc: now + QUEUE_EXPIRY_MS,
      cooldownUntilUtc: undefined,
      createdAt: now,
    })

    // Calculate position
    const waitingEntries = await ctx.db
      .query('eventQueue')
      .withIndex('by_event_status_seq', (q) => 
        q.eq('eventId', args.eventId).eq('status', 'waiting').lt('seq', seq)
      )
      .collect()
    
    const position = waitingEntries.length

    return {
      seq,
      position,
      expiresAtUtc: now + QUEUE_EXPIRY_MS,
    }
  },
})

// M4: leaveQueue
export const leaveQueue = mutation({
  args: {
    eventId: v.id('events'),
  },
  handler: async (ctx, args): Promise<void> => {
    const user = await getCurrentUser(ctx)
    
    const queueEntry = await ctx.db
      .query('eventQueue')
      .withIndex('by_event_user', (q) => q.eq('eventId', args.eventId).eq('userId', user._id))
      .first()

    if (!queueEntry) {
      throw new QueueError('You are not in the queue for this event', 'NOT_IN_QUEUE')
    }

    if (queueEntry.status !== 'waiting') {
      throw new QueueError('Cannot leave queue - already processed', 'INVALID_STATUS')
    }

    const now = Date.now()
    
    // Update status and set cooldown
    await ctx.db.patch(queueEntry._id, {
      status: 'left',
      cooldownUntilUtc: now + QUEUE_COOLDOWN_MS,
    })

    // Cancel any active checkout session
    const checkoutSession = await ctx.db
      .query('checkoutSessions')
      .withIndex('by_event_user', (q) => q.eq('eventId', args.eventId).eq('userId', user._id))
      .first()

    if (checkoutSession) {
      await ctx.db.delete(checkoutSession._id)
    }
  },
})

// M5: startCheckout
export const startCheckout = mutation({
  args: {
    eventId: v.id('events'),
    ticketTypeId: v.id('eventTickets'),
    quantity: v.number(),
  },
  handler: async (ctx, args): Promise<{ checkoutSessionId: Id<'checkoutSessions'>; expiresAtUtc: number }> => {
    const user = await getCurrentUser(ctx)
    
    // Frontend validation replicated on server
    if (args.quantity < 1 || args.quantity > MAX_TICKETS_PER_PURCHASE) {
      throw new ValidationError(`Quantity must be between 1-${MAX_TICKETS_PER_PURCHASE}`, 'quantity')
    }

    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new ValidationError('Event not found', 'eventId')
    }

    const ticketType = await ctx.db.get(args.ticketTypeId)
    if (!ticketType || ticketType.eventId.toString() !== args.eventId.toString()) {
      throw new ValidationError('Invalid ticket type', 'ticketTypeId')
    }

    // Check queue status - user must be admitted to checkout
    const queueEntry = await ctx.db
      .query('eventQueue')
      .withIndex('by_event_user', (q) => q.eq('eventId', args.eventId).eq('userId', user._id))
      .first()

    if (!queueEntry) {
      throw new QueueError('Join the queue first', 'NOT_IN_QUEUE')
    }

    // Check if already has checkout session
    const existingCheckout = await ctx.db
      .query('checkoutSessions')
      .withIndex('by_event_user', (q) => q.eq('eventId', args.eventId).eq('userId', user._id))
      .first()

    if (existingCheckout) {
      throw new QueueError('You are already checking out this event. Finish or cancel first.', 'ALREADY_IN_CHECKOUT')
    }

    // Check concurrent checkout limit
    const activeSessions = await ctx.db
      .query('checkoutSessions')
      .withIndex('by_event', (q) => q.eq('eventId', args.eventId))
      .collect()

    if (activeSessions.length >= CHECKOUT_LIMIT) {
      throw new QueueError('Too many users checking out. Please wait.', 'CHECKOUT_LIMIT_REACHED')
    }

    const now = Date.now()
    const checkoutSessionId = await ctx.db.insert('checkoutSessions', {
      eventId: args.eventId,
      userId: user._id,
      createdAtUtc: now,
      expiresAtUtc: now + CHECKOUT_EXPIRY_MS,
    })

    return {
      checkoutSessionId,
      expiresAtUtc: now + CHECKOUT_EXPIRY_MS,
    }
  },
})

// M6: purchaseTicket (Atomic transaction with oversell prevention)
export const purchaseTicket = mutation({
  args: {
    eventId: v.id('events'),
    ticketTypeId: v.id('eventTickets'),
    quantity: v.number(),
    checkoutSessionId: v.id('checkoutSessions'),
  },
  handler: async (ctx, args): Promise<{ ticketId: Id<'userTickets'>; confirmationCode: string }> => {
    const user = await getCurrentUser(ctx)
    
    // Validation
    if (args.quantity < 1 || args.quantity > MAX_TICKETS_PER_PURCHASE) {
      throw new ValidationError(`Quantity must be between 1-${MAX_TICKETS_PER_PURCHASE}`, 'quantity')
    }

    // Server-side recheck: Get fresh event and ticket data
    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new ValidationError('Event not found', 'eventId')
    }

    const ticketType = await ctx.db.get(args.ticketTypeId)
    if (!ticketType || ticketType.eventId.toString() !== args.eventId.toString()) {
      throw new ValidationError('Invalid ticket type', 'ticketTypeId')
    }

    // Verify checkout session
    const checkoutSession = await ctx.db.get(args.checkoutSessionId)
    if (!checkoutSession || checkoutSession.userId.toString() !== user._id.toString()) {
      throw new ValidationError('Invalid checkout session', 'checkoutSessionId')
    }

    // Idempotency check: prevent duplicate purchases
    const existingTickets = await ctx.db
      .query('userTickets')
      .withIndex('by_event_user', (q) => q.eq('eventId', args.eventId).eq('userId', user._id))
      .collect()

    const duplicateTicket = existingTickets.find(t => 
      t.ticketType === ticketType.type && 
      t.quantity === args.quantity &&
      t.status === 'valid'
    )

    if (duplicateTicket) {
      console.warn('[Events] Duplicate purchase attempt detected for user:', user._id)
      // Return existing ticket instead of creating duplicate
      return {
        ticketId: duplicateTicket._id,
        confirmationCode: duplicateTicket.confirmationCode,
      }
    }

    // Critical oversell prevention: Recheck inventory before atomic write
    const currentTicketType = await ctx.db.get(args.ticketTypeId)
    if (!currentTicketType) {
      throw new OversellError('Ticket type no longer available', 5)
    }

    const availableQuantity = currentTicketType.quantity - currentTicketType.quantitySold
    if (availableQuantity < args.quantity) {
      throw new OversellError('Insufficient inventory. Try again soon or check another event.', 30)
    }

    // Atomic transaction: Purchase + inventory deduct + queue removal + session cleanup
    const now = Date.now()
    
    // 1. Create ticket record
    const ticketId = await ctx.db.insert('userTickets', {
      userId: user._id,
      eventId: args.eventId,
      ticketType: ticketType.type,
      quantity: args.quantity,
      ticketNumber: `${args.eventId.toString().slice(-6)}-${Date.now().toString().slice(-6)}`,
      confirmationCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
      purchasedAtUtc: now,
      status: 'valid',
      createdAt: now,
    })

    // 2. Atomic inventory deduction
    await ctx.db.patch(args.ticketTypeId, {
      quantitySold: currentTicketType.quantitySold + args.quantity,
    })

    // 3. Remove from queue (if still waiting)
    const queueEntry = await ctx.db
      .query('eventQueue')
      .withIndex('by_event_user', (q) => q.eq('eventId', args.eventId).eq('userId', user._id))
      .first()

    if (queueEntry && queueEntry.status === 'waiting') {
      await ctx.db.delete(queueEntry._id)
    }

    // 4. Clean up checkout session
    await ctx.db.delete(args.checkoutSessionId)

    // 5. Update event sold count and potentially sale status
    await ctx.db.patch(args.eventId, {
      ticketsSold: event.ticketsSold + args.quantity,
      updatedAt: now,
      // Update sale status if sold out
      saleStatus: event.ticketsSold + args.quantity >= event.capacity ? 'sold_out' : event.saleStatus,
    })

    return {
      ticketId,
      confirmationCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
    }
  },
})

// ==================== CRON JOBS & CLEANUP ====================

// Cron: Cleanup expired queue entries and checkout sessions
export const cleanupExpiredEntries = mutation({
  args: {},
  handler: async (ctx): Promise<{ 
    queueEntriesCleaned: number
    checkoutSessionsCleaned: number
    archivedEvents: number
  }> => {
    const now = Date.now()
    let queueEntriesCleaned = 0
    let checkoutSessionsCleaned = 0
    let archivedEvents = 0

    // Clean expired queue entries
    const expiredQueueEntries = await ctx.db
      .query('eventQueue')
      .withIndex('by_expires', (q) => q.lt('expiresAtUtc', now))
      .collect()

    for (const entry of expiredQueueEntries) {
      if (entry.status === 'waiting') {
        await ctx.db.patch(entry._id, {
          status: 'expired',
        })
      }
      queueEntriesCleaned++
    }

    // Clean expired checkout sessions
    const expiredCheckoutSessions = await ctx.db
      .query('checkoutSessions')
      .withIndex('by_expires', (q) => q.lt('expiresAtUtc', now))
      .collect()

    for (const session of expiredCheckoutSessions) {
      await ctx.db.delete(session._id)
      checkoutSessionsCleaned++
    }

    // Archive old events (7 days after end)
    const archiveThreshold = now - (7 * 24 * 60 * 60 * 1000)
    const oldEvents = await ctx.db
      .query('events')
      .filter((q) => q.lt(q.field('endAtUtc'), archiveThreshold))
      .collect()

    for (const event of oldEvents) {
      // Only archive if they're not cancelled or already archived
      if (event.saleStatus !== 'cancelled') {
        await ctx.db.patch(event._id, {
          saleStatus: 'cancelled', // Mark as cancelled/archived
          updatedAt: now,
        })
        archivedEvents++
      }
    }

    return {
      queueEntriesCleaned,
      checkoutSessionsCleaned,
      archivedEvents,
    }
  },
})
