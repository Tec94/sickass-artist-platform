import { describe, expect, it } from 'vitest'
import { heroMotionProfile, isMonotonicUpward } from '../components/Dashboard/heroMotionProfile'

describe('dashboard hero motion profile', () => {
  it('keeps all vertical cinematic layers moving upward as scroll progresses', () => {
    expect(isMonotonicUpward(heroMotionProfile.backgroundY)).toBe(true)
    expect(isMonotonicUpward(heroMotionProfile.midgroundY)).toBe(true)
    expect(isMonotonicUpward(heroMotionProfile.foregroundY)).toBe(true)
    expect(isMonotonicUpward(heroMotionProfile.beamY)).toBe(true)
    expect(isMonotonicUpward(heroMotionProfile.beamYSafeguard)).toBe(true)
  })
})
