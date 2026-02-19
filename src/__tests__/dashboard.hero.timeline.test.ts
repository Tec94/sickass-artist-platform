import { describe, expect, it } from 'vitest'
import {
  heroTimelineBaseline,
  heroTimelineHardened,
  type HeroTimeline,
} from '../components/Dashboard/heroTimeline'

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

const getBeatOpacities = (timeline: HeroTimeline, progress: number) => ({
  beat2: interpolate(progress, timeline.beat2Opacity, [0, 1, 1, 0]),
  beat3: interpolate(progress, timeline.beat3Opacity, [0, 1, 1, 0]),
  beat4: interpolate(progress, timeline.beat4Opacity, [0, 1, 1]),
})

describe('dashboard hero timeline', () => {
  it('keeps baseline and hardened timelines distinct', () => {
    expect(heroTimelineBaseline.beat2Opacity).not.toEqual(heroTimelineHardened.beat2Opacity)
    expect(heroTimelineBaseline.beat3Opacity).not.toEqual(heroTimelineHardened.beat3Opacity)
    expect(heroTimelineBaseline.beat4Opacity).not.toEqual(heroTimelineHardened.beat4Opacity)
  })

  it('avoids dead-zones in hardened timeline before final beat settles', () => {
    for (let i = 6; i <= 100; i += 1) {
      const p = i / 100
      const { beat2, beat3, beat4 } = getBeatOpacities(heroTimelineHardened, p)
      const active = Math.max(beat2, beat3, beat4)
      expect(active, `all beats are hidden at progress=${p.toFixed(2)}`).toBeGreaterThan(0.02)
    }
  })

  it('matches required hardened choreography anchors', () => {
    expect(heroTimelineHardened.beat1Opacity).toEqual([0, 0, 0])
    expect(heroTimelineHardened.beat2Opacity).toEqual([0.05, 0.16, 0.52, 0.6])
    expect(heroTimelineHardened.beat3Opacity).toEqual([0.54, 0.64, 0.86, 0.92])
    expect(heroTimelineHardened.beat4Opacity).toEqual([0.88, 0.95, 1])
    expect(heroTimelineHardened.handoffOpacity).toEqual([0.95, 1])
  })

  it('holds act beats long enough for readability', () => {
    const hardenedAct1Hold = heroTimelineHardened.beat2Opacity[2] - heroTimelineHardened.beat2Opacity[1]
    const hardenedAct2Hold = heroTimelineHardened.beat3Opacity[2] - heroTimelineHardened.beat3Opacity[1]
    const baselineAct1Hold = heroTimelineBaseline.beat2Opacity[2] - heroTimelineBaseline.beat2Opacity[1]
    const baselineAct2Hold = heroTimelineBaseline.beat3Opacity[2] - heroTimelineBaseline.beat3Opacity[1]

    expect(hardenedAct1Hold).toBeGreaterThanOrEqual(0.3)
    expect(hardenedAct2Hold).toBeGreaterThan(0.21)
    expect(baselineAct1Hold).toBeGreaterThan(0.29)
    expect(baselineAct2Hold).toBeGreaterThan(0.21)
  })
})
