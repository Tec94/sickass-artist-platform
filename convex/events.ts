import { query } from './_generated/server'
import { v, ConvexError } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'
import { getCurrentUser } from './helpers'

const CHECKOUT_LIMIT = 5 // max concurrent checkout sessions per event
const EVENT_WINDOW_DAYS = 90

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
