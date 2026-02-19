const MOBILE_BREAKPOINT_PX = 768

export type HeroScrollPhases = {
  activeHeightVh: number
  tailHeightVh: number
  totalHeightVh: number
  narrativeProgressEnd: number
}

export const HERO_ACTIVE_HEIGHT_DESKTOP_VH = 295
export const HERO_ACTIVE_HEIGHT_MOBILE_VH = 255
export const HERO_TAIL_HEIGHT_DESKTOP_VH = 140
export const HERO_TAIL_HEIGHT_MOBILE_VH = 115

export const getNarrativeProgressEnd = (activeHeightVh: number, totalHeightVh: number): number => {
  if (!Number.isFinite(activeHeightVh) || !Number.isFinite(totalHeightVh) || totalHeightVh <= 0) {
    return 1
  }

  const ratio = activeHeightVh / totalHeightVh
  if (ratio < 0) return 0
  if (ratio > 1) return 1
  return ratio
}

export const getHeroScrollPhases = (viewportWidth: number): HeroScrollPhases => {
  const isMobile = viewportWidth < MOBILE_BREAKPOINT_PX
  const activeHeightVh = isMobile ? HERO_ACTIVE_HEIGHT_MOBILE_VH : HERO_ACTIVE_HEIGHT_DESKTOP_VH
  const tailHeightVh = isMobile ? HERO_TAIL_HEIGHT_MOBILE_VH : HERO_TAIL_HEIGHT_DESKTOP_VH
  const totalHeightVh = activeHeightVh + tailHeightVh

  return {
    activeHeightVh,
    tailHeightVh,
    totalHeightVh,
    narrativeProgressEnd: getNarrativeProgressEnd(activeHeightVh, totalHeightVh),
  }
}

export const mapToNarrativeProgress = (progress: number, narrativeProgressEnd: number): number => {
  if (!Number.isFinite(progress) || !Number.isFinite(narrativeProgressEnd) || narrativeProgressEnd <= 0) {
    return 0
  }

  const mapped = progress / narrativeProgressEnd
  if (mapped <= 0) return 0
  if (mapped >= 1) return 1
  return mapped
}
