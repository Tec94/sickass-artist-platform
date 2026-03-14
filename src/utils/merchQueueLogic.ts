export type QueueTargetState = 'active' | 'upcoming' | 'none'
export type QueueEntryStatus = 'waiting' | 'admitted' | 'expired' | 'left'

export interface QueueDropLike {
  startsAt: number
  endsAt: number
  priority: number
  queueEnabled?: boolean
}

export interface QueueStateLike {
  status: QueueEntryStatus
  expiresAtUtc: number
  slotExpiresAtUtc?: number | null
}

export function isQueueEnabled(queueEnabled?: boolean) {
  return queueEnabled ?? true
}

export function selectQueueTargetDrop<T extends QueueDropLike>(drops: T[], now: number): { state: QueueTargetState; drop: T | null } {
  const active = drops
    .filter((drop) => isQueueEnabled(drop.queueEnabled) && drop.startsAt <= now && drop.endsAt > now)
    .sort((a, b) => a.priority - b.priority || a.startsAt - b.startsAt)

  if (active.length > 0) {
    return { state: 'active', drop: active[0] }
  }

  const upcoming = drops
    .filter((drop) => isQueueEnabled(drop.queueEnabled) && drop.startsAt > now)
    .sort((a, b) => a.startsAt - b.startsAt || a.priority - b.priority)

  if (upcoming.length > 0) {
    return { state: 'upcoming', drop: upcoming[0] }
  }

  return { state: 'none', drop: null }
}

export function resolveQueueEntryStatus(state: QueueStateLike, now: number): QueueEntryStatus {
  if (state.status === 'left' || state.status === 'expired') {
    return state.status
  }

  if (state.expiresAtUtc <= now) {
    return 'expired'
  }

  if (state.status === 'admitted' && (!state.slotExpiresAtUtc || state.slotExpiresAtUtc <= now)) {
    return 'waiting'
  }

  return state.status
}
