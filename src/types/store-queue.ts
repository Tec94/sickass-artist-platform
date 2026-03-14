import type { Id } from '../../convex/_generated/dataModel'

export type StoreQueueTargetState = 'active' | 'upcoming' | 'none'
export type StoreQueueEntryStatus = 'waiting' | 'admitted' | 'expired' | 'left'

export interface StoreQueueTargetDropViewModel {
  _id: Id<'merchDrops'>
  name: string
  startsAt: number
  endsAt: number
  products: Id<'merchProducts'>[]
  priority: number
  queueEnabled?: boolean
}

export interface StoreQueueTargetViewModel {
  now: number
  state: StoreQueueTargetState
  drop: StoreQueueTargetDropViewModel | null
  constants: {
    queueExpiryMs: number
    slotExpiryMs: number
    cooldownMs: number
    maxActiveSlots: number
  }
}

export interface StoreQueueStateViewModel {
  status: StoreQueueEntryStatus
  seq: number
  position: number
  estimatedWaitMinutes: number
  joinedAtUtc: number
  expiresAtUtc: number
  cooldownUntilUtc?: number
  slotExpiresAtUtc?: number | null
  canClaimSlot: boolean
}
