import { mutation, query } from './_generated/server'
import { v, ConvexError } from 'convex/values'
import type { Doc } from './_generated/dataModel'

/**
 * Create a new venue
 */
export const createVenue = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    city: v.string(),
    country: v.optional(v.string()),
    timezone: v.string(),
    capacity: v.optional(v.number()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Validation
    if (!args.name || args.name.trim().length === 0) {
      throw new ConvexError('Venue name is required')
    }
    if (args.name.length > 100) {
      throw new ConvexError('Venue name must be 100 characters or less')
    }

    if (!args.city || args.city.trim().length === 0) {
      throw new ConvexError('City is required')
    }
    if (args.city.length > 50) {
      throw new ConvexError('City must be 50 characters or less')
    }

    if (!args.address || args.address.trim().length < 5) {
      throw new ConvexError('Address must be at least 5 characters')
    }
    if (args.address.length > 500) {
      throw new ConvexError('Address must be 500 characters or less')
    }

    if (!args.timezone) {
      throw new ConvexError('Timezone is required')
    }

    if (args.capacity !== undefined && args.capacity < 1) {
      throw new ConvexError('Capacity must be at least 1')
    }

    if (args.latitude !== undefined && (args.latitude < -90 || args.latitude > 90)) {
      throw new ConvexError('Latitude must be between -90 and 90')
    }

    if (args.longitude !== undefined && (args.longitude < -180 || args.longitude > 180)) {
      throw new ConvexError('Longitude must be between -180 and 180')
    }

    // Check for duplicate venue (same name + city)
    const existingVenue = await ctx.db
      .query('venues')
      .filter((q) => 
        q.and(
          q.eq(q.field('name'), args.name),
          q.eq(q.field('city'), args.city)
        )
      )
      .first()

    if (existingVenue) {
      // Return existing venue instead of creating duplicate
      return existingVenue
    }

    // Create venue
    const venueId = await ctx.db.insert('venues', {
      name: args.name.trim(),
      city: args.city.trim(),
      country: args.country?.trim() || 'US',
      address: args.address.trim(),
      timezone: args.timezone,
      capacity: args.capacity,
      latitude: args.latitude,
      longitude: args.longitude,
      createdAt: Date.now(),
    })

    const venue = await ctx.db.get(venueId)
    return venue
  },
})

/**
 * Get venue by ID
 */
export const getVenue = query({
  args: { venueId: v.id('venues') },
  handler: async (ctx, args) => {
    const venue = await ctx.db.get(args.venueId)
    if (!venue) {
      throw new ConvexError('Venue not found')
    }
    return venue
  },
})

/**
 * Search venues by city
 */
export const searchVenuesByCity = query({
  args: {
    city: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20

    const venues = await ctx.db
      .query('venues')
      .withIndex('by_city', (q) => q.eq('city', args.city))
      .order('desc')
      .take(limit)

    return venues
  },
})

/**
 * Get all venues with pagination
 */
export const getVenues = query({
  args: {
    page: v.number(),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const pageSize = Math.min(args.pageSize || 20, 50)
    const skip = args.page * pageSize

    const allVenues = await ctx.db
      .query('venues')
      .order('desc')
      .collect()

    const venues = allVenues.slice(skip, skip + pageSize + 1)
    const hasMore = venues.length > pageSize
    
    if (hasMore) {
      venues.pop()
    }

    return {
      venues: venues as Doc<'venues'>[],
      hasMore,
      totalCount: allVenues.length,
    }
  },
})
