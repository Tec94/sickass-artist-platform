import { describe, expect, it } from 'vitest'
import { applyBeatOverlapFade } from '../components/Dashboard/HeroCopyBeats'
import { heroTimelineHardened } from '../components/Dashboard/heroTimeline'

const interpolate = (input: number, times: number[], values: number[]) => {
  if (input <= times[0]) return values[0]
  if (input >= times[times.length - 1]) return values[values.length - 1]

  for (let i = 0; i < times.length - 1; i += 1) {
    const from = times[i]
    const to = times[i + 1]
    if (input < from || input > to) continue
    const progress = (input - from) / (to - from)
    return values[i] + (values[i + 1] - values[i]) * progress
  }

  return values[values.length - 1]
}

const getBeat3RawOpacity = (progress: number) =>
  interpolate(progress, heroTimelineHardened.beat3Opacity, [0, 1, 1, 0])

const getBeat4Opacity = (progress: number) =>
  interpolate(progress, heroTimelineHardened.beat4Opacity, [0, 1, 1])

describe('dashboard hero no overlap', () => {
  it('suppresses Act II when final beat is already visible', () => {
    const overlapWindow = [0.91, 0.92, 0.93, 0.95]

    overlapWindow.forEach((progress) => {
      const beat3Raw = getBeat3RawOpacity(progress)
      const beat4 = getBeat4Opacity(progress)
      const beat3Effective = applyBeatOverlapFade(beat3Raw, beat4)

      expect(beat4).toBeGreaterThan(0.35)
      expect(beat3Effective).toBeLessThan(0.12)
      expect(beat3Effective).toBeLessThanOrEqual(beat3Raw)
    })
  })
})
