import { ConvexError, v } from 'convex/values'
import { internalMutation, mutation, query, type MutationCtx, type QueryCtx } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import { getCurrentUserOrNull, getOrCreateCurrentUser } from './helpers'

const QUEUE_EXPIRY_MS = 60 * 60 * 1000
const SLOT_EXPIRY_MS = 15 * 60 * 1000
const COOLDOWN_MS = 30 * 60 * 1000
const MAX_ACTIVE_SLOTS = 10

type QueueTargetState = 'active' | 'upcoming' | 'none'

const isQueueEnabled = (drop: Doc<'merchDrops'>) => drop.queueEnabled ?? true

function selectQueueTargetDrop(drops: Doc<'merchDrops'>[], now: number): { state: QueueTargetState; drop: Doc<'merchDrops'> | null } {
  const active = drops
    .filter((drop) => isQueueEnabled(drop) && drop.startsAt <= now && drop.endsAt > now)
    .sort((a, b) => a.priority - b.priority || a.startsAt - b.startsAt)

  if (active.length > 0) {
    return { state: 'active', drop: active[0] }
  }

  const upcoming = drops
    .filter((drop) => isQueueEnabled(drop) && drop.startsAt > now)
    .sort((a, b) => a.startsAt - b.startsAt || a.priority - b.priority)

  if (upcoming.length > 0) {
    return { state: 'upcoming', drop: upcoming[0] }
  }

  return { state: 'none', drop: null }
}

async function countUsersAhead(ctx: QueryCtx | MutationCtx, dropId: Id<'merchDrops'>, seq: number) {
  const [waitingAhead, admittedAhead] = await Promise.all([
    ctx.db
      .query('merchDropQueueEntries')
      .withIndex('by_drop_status_seq', (q) => q.eq('dropId', dropId).eq('status', 'waiting').lt('seq', seq))
      .collect(),
    ctx.db
      .query('merchDropQueueEntries')
      .withIndex('by_drop_status_seq', (q) => q.eq('dropId', dropId).eq('status', 'admitted').lt('seq', seq))
      .collect(),
  ])

  return waitingAhead.length + admittedAhead.length
}

async function getActiveSlot(ctx: QueryCtx | MutationCtx, dropId: Id<'merchDrops'>, userId: Id<'users'>) {
  const now = Date.now()
  const slots = await ctx.db
    .query('merchDropQueueSlots')
    .withIndex('by_drop_user', (q) => q.eq('dropId', dropId).eq('userId', userId))
    .collect()

  return slots.find((slot) => slot.expiresAtUtc > now) ?? null
}

export const getQueueTargetDrop = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const drops = await ctx.db.query('merchDrops').collect()
    const target = selectQueueTargetDrop(drops, now)

    return {
      now,
      state: target.state,
      drop: target.drop,
      constants: {
        queueExpiryMs: QUEUE_EXPIRY_MS,
        slotExpiryMs: SLOT_EXPIRY_MS,
        cooldownMs: COOLDOWN_MS,
        maxActiveSlots: MAX_ACTIVE_SLOTS,
      },
    }
  },
})

export const getMyQueueState = query({
  args: {
    dropId: v.id('merchDrops'),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrNull(ctx)
    if (!user) return null

    const now = Date.now()
    const entry = await ctx.db
      .query('merchDropQueueEntries')
      .withIndex('by_drop_user', (q) => q.eq('dropId', args.dropId).eq('userId', user._id))
      .first()

    if (!entry) return null

    const activeSlot = await getActiveSlot(ctx, args.dropId, user._id)
    const usersAhead = await countUsersAhead(ctx, args.dropId, entry.seq)

    let status = entry.status
    if (status === 'admitted' && !activeSlot) {
      status = entry.expiresAtUtc <= now ? 'expired' : 'waiting'
    }
    if ((status === 'waiting' || status === 'admitted') && entry.expiresAtUtc <= now) {
      status = 'expired'
    }

    const canClaimSlot =
      status === 'waiting' &&
      !activeSlot &&
      usersAhead < MAX_ACTIVE_SLOTS &&
      entry.expiresAtUtc > now

    return {
      status,
      seq: entry.seq,
      position: usersAhead,
      estimatedWaitMinutes: usersAhead * 2,
      joinedAtUtc: entry.joinedAtUtc,
      expiresAtUtc: entry.expiresAtUtc,
      cooldownUntilUtc: entry.cooldownUntilUtc,
      slotExpiresAtUtc: activeSlot?.expiresAtUtc ?? null,
      canClaimSlot,
    }
  },
})

export const joinQueue = mutation({
  args: {
    dropId: v.id('merchDrops'),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx)
    const drop = await ctx.db.get(args.dropId)
    if (!drop) throw new ConvexError('Drop not found')
    if (!isQueueEnabled(drop)) throw new ConvexError('Queue is disabled for this drop')

    const now = Date.now()
    const existing = await ctx.db
      .query('merchDropQueueEntries')
      .withIndex('by_drop_user', (q) => q.eq('dropId', args.dropId).eq('userId', user._id))
      .first()

    if (existing) {
      const activeStatus = existing.status === 'waiting' || existing.status === 'admitted'
      if (activeStatus && existing.expiresAtUtc > now) {
        throw new ConvexError('You are already in this drop queue')
      }
      if (existing.cooldownUntilUtc && existing.cooldownUntilUtc > now) {
        const minutes = Math.ceil((existing.cooldownUntilUtc - now) / (60 * 1000))
        throw new ConvexError(`You can rejoin in ${minutes} minutes`)
      }
    }

    const nextQueueSeq = drop.nextQueueSeq ?? 0
    const seq = nextQueueSeq + 1
    await ctx.db.patch(drop._id, {
      nextQueueSeq: seq,
      updatedAt: now,
    })

    const payload = {
      seq,
      status: 'waiting' as const,
      joinedAtUtc: now,
      expiresAtUtc: now + QUEUE_EXPIRY_MS,
      cooldownUntilUtc: undefined,
      updatedAtUtc: now,
    }

    if (existing) {
      await ctx.db.patch(existing._id, payload)
    } else {
      await ctx.db.insert('merchDropQueueEntries', {
        dropId: args.dropId,
        userId: user._id,
        createdAt: now,
        ...payload,
      })
    }

    const position = await countUsersAhead(ctx, args.dropId, seq)

    return {
      seq,
      position,
      expiresAtUtc: now + QUEUE_EXPIRY_MS,
    }
  },
})

export const leaveQueue = mutation({
  args: {
    dropId: v.id('merchDrops'),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx)
    const entry = await ctx.db
      .query('merchDropQueueEntries')
      .withIndex('by_drop_user', (q) => q.eq('dropId', args.dropId).eq('userId', user._id))
      .first()

    if (!entry) {
      throw new ConvexError('You are not in this drop queue')
    }

    const now = Date.now()
    await ctx.db.patch(entry._id, {
      status: 'left',
      cooldownUntilUtc: now + COOLDOWN_MS,
      updatedAtUtc: now,
    })

    const userSlots = await ctx.db
      .query('merchDropQueueSlots')
      .withIndex('by_drop_user', (q) => q.eq('dropId', args.dropId).eq('userId', user._id))
      .collect()

    await Promise.all(userSlots.map((slot) => ctx.db.delete(slot._id)))
    return { success: true }
  },
})

export const claimSlot = mutation({
  args: {
    dropId: v.id('merchDrops'),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx)
    const now = Date.now()

    const drop = await ctx.db.get(args.dropId)
    if (!drop) throw new ConvexError('Drop not found')
    if (!isQueueEnabled(drop)) throw new ConvexError('Queue is disabled for this drop')
    if (drop.startsAt > now || drop.endsAt <= now) {
      throw new ConvexError('Queue slots are available only during the active drop window')
    }

    const entry = await ctx.db
      .query('merchDropQueueEntries')
      .withIndex('by_drop_user', (q) => q.eq('dropId', args.dropId).eq('userId', user._id))
      .first()

    if (!entry) throw new ConvexError('Join the queue first')
    if (entry.expiresAtUtc <= now) throw new ConvexError('Queue entry expired. Rejoin queue.')
    if (entry.status === 'left') throw new ConvexError('You left this queue. Rejoin to continue.')
    if (entry.status === 'expired') throw new ConvexError('Queue entry expired. Rejoin queue.')

    const activeSlot = await getActiveSlot(ctx, args.dropId, user._id)
    if (activeSlot) {
      return {
        admitted: true,
        slotExpiresAtUtc: activeSlot.expiresAtUtc,
      }
    }

    const activeSlots = await ctx.db
      .query('merchDropQueueSlots')
      .withIndex('by_drop_expires', (q) => q.eq('dropId', args.dropId).gt('expiresAtUtc', now))
      .collect()
    if (activeSlots.length >= MAX_ACTIVE_SLOTS) {
      throw new ConvexError('No slot available yet. Stay in queue.')
    }

    const usersAhead = await countUsersAhead(ctx, args.dropId, entry.seq)
    if (usersAhead >= MAX_ACTIVE_SLOTS) {
      throw new ConvexError('Your position is not admitted yet')
    }

    const slotExpiresAtUtc = now + SLOT_EXPIRY_MS
    const queueEntryId = entry._id as Id<'merchDropQueueEntries'>
    await ctx.db.insert('merchDropQueueSlots', {
      dropId: args.dropId,
      userId: user._id,
      queueEntryId,
      grantedAtUtc: now,
      expiresAtUtc: slotExpiresAtUtc,
      createdAt: now,
    })

    await ctx.db.patch(entry._id, {
      status: 'admitted',
      updatedAtUtc: now,
    })

    return {
      admitted: true,
      slotExpiresAtUtc,
    }
  },
})

export const cleanupExpiredQueueAndSlots = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    let slotsExpired = 0
    let entriesExpired = 0
    let admissionsReverted = 0

    const expiredSlots = await ctx.db
      .query('merchDropQueueSlots')
      .withIndex('by_expires', (q) => q.lt('expiresAtUtc', now))
      .collect()

    for (const slot of expiredSlots) {
      const entry = await ctx.db.get(slot.queueEntryId)
      if (entry && entry.status === 'admitted') {
        const nextStatus = entry.expiresAtUtc <= now ? 'expired' : 'waiting'
        await ctx.db.patch(entry._id, {
          status: nextStatus,
          updatedAtUtc: now,
        })
        if (nextStatus === 'waiting') admissionsReverted += 1
      }
      await ctx.db.delete(slot._id)
      slotsExpired += 1
    }

    const expiredEntries = await ctx.db
      .query('merchDropQueueEntries')
      .withIndex('by_expires', (q) => q.lt('expiresAtUtc', now))
      .collect()

    for (const entry of expiredEntries) {
      if (entry.status === 'waiting' || entry.status === 'admitted') {
        await ctx.db.patch(entry._id, {
          status: 'expired',
          updatedAtUtc: now,
        })
        entriesExpired += 1
      }
    }

    return {
      slotsExpired,
      entriesExpired,
      admissionsReverted,
    }
  },
})
