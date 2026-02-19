import { describe, expect, it } from 'vitest'
import {
  getHeroScrollPhases,
  mapToNarrativeProgress,
  HERO_ACTIVE_HEIGHT_DESKTOP_VH,
  HERO_ACTIVE_HEIGHT_MOBILE_VH,
  HERO_TAIL_HEIGHT_DESKTOP_VH,
  HERO_TAIL_HEIGHT_MOBILE_VH,
} from '../components/Dashboard/heroScrollPhases'

describe('dashboard hero progress tail', () => {
  it('clamps narrative progress at 1 while raw scroll continues through tail', () => {
    const desktopPhases = getHeroScrollPhases(1440)

    expect(desktopPhases.activeHeightVh).toBe(HERO_ACTIVE_HEIGHT_DESKTOP_VH)
    expect(desktopPhases.tailHeightVh).toBe(HERO_TAIL_HEIGHT_DESKTOP_VH)
    expect(desktopPhases.totalHeightVh).toBe(HERO_ACTIVE_HEIGHT_DESKTOP_VH + HERO_TAIL_HEIGHT_DESKTOP_VH)
    expect(desktopPhases.narrativeProgressEnd).toBeCloseTo(
      HERO_ACTIVE_HEIGHT_DESKTOP_VH / (HERO_ACTIVE_HEIGHT_DESKTOP_VH + HERO_TAIL_HEIGHT_DESKTOP_VH),
      6,
    )

    const beforeTail = desktopPhases.narrativeProgressEnd - 0.05
    const inTail = desktopPhases.narrativeProgressEnd + 0.1

    expect(beforeTail).toBeGreaterThan(0)
    expect(inTail).toBeLessThan(1)
    expect(mapToNarrativeProgress(beforeTail, desktopPhases.narrativeProgressEnd)).toBeLessThan(1)
    expect(mapToNarrativeProgress(desktopPhases.narrativeProgressEnd, desktopPhases.narrativeProgressEnd)).toBe(1)
    expect(mapToNarrativeProgress(inTail, desktopPhases.narrativeProgressEnd)).toBe(1)
    expect(mapToNarrativeProgress(1, desktopPhases.narrativeProgressEnd)).toBe(1)
  })

  it('uses dedicated mobile active and tail phase values', () => {
    const mobilePhases = getHeroScrollPhases(390)

    expect(mobilePhases.activeHeightVh).toBe(HERO_ACTIVE_HEIGHT_MOBILE_VH)
    expect(mobilePhases.tailHeightVh).toBe(HERO_TAIL_HEIGHT_MOBILE_VH)
    expect(mobilePhases.totalHeightVh).toBe(HERO_ACTIVE_HEIGHT_MOBILE_VH + HERO_TAIL_HEIGHT_MOBILE_VH)
    expect(mobilePhases.narrativeProgressEnd).toBeCloseTo(
      HERO_ACTIVE_HEIGHT_MOBILE_VH / (HERO_ACTIVE_HEIGHT_MOBILE_VH + HERO_TAIL_HEIGHT_MOBILE_VH),
      6,
    )
  })
})
