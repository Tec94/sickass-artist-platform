import { describe, expect, it } from 'vitest'
import { resolveQueueEntryStatus, selectQueueTargetDrop } from '../utils/merchQueueLogic'

describe('merch queue logic', () => {
  it('prefers highest-priority active drop, otherwise nearest upcoming', () => {
    const now = 1000
    const drops = [
      { id: 'upcoming-far', startsAt: 4000, endsAt: 8000, priority: 0, queueEnabled: true },
      { id: 'active-low-priority', startsAt: 500, endsAt: 5000, priority: 2, queueEnabled: true },
      { id: 'active-high-priority', startsAt: 200, endsAt: 4000, priority: 1, queueEnabled: true },
      { id: 'disabled-active', startsAt: 100, endsAt: 9000, priority: 0, queueEnabled: false },
    ]

    const target = selectQueueTargetDrop(drops, now)
    expect(target.state).toBe('active')
    expect(target.drop?.id).toBe('active-high-priority')

    const noActiveTarget = selectQueueTargetDrop(
      drops.map((drop) => ({ ...drop, startsAt: drop.startsAt + 10000, endsAt: drop.endsAt + 10000 })),
      now,
    )
    expect(noActiveTarget.state).toBe('upcoming')
    expect(noActiveTarget.drop?.id).toBe('active-high-priority')
  })

  it('resolves queue state transitions for admitted/expired entries', () => {
    const now = 1000
    expect(
      resolveQueueEntryStatus(
        { status: 'admitted', expiresAtUtc: 5000, slotExpiresAtUtc: 900 },
        now,
      ),
    ).toBe('waiting')

    expect(
      resolveQueueEntryStatus(
        { status: 'waiting', expiresAtUtc: 999, slotExpiresAtUtc: null },
        now,
      ),
    ).toBe('expired')

    expect(
      resolveQueueEntryStatus(
        { status: 'left', expiresAtUtc: 5000, slotExpiresAtUtc: null },
        now,
      ),
    ).toBe('left')
  })
})
