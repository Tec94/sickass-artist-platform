export type HeroMotionTriplet = [number, number, number]

export const heroMotionProfile = {
  backgroundY: [20, -42, -152] as HeroMotionTriplet,
  midgroundY: [86, -18, -202] as HeroMotionTriplet,
  foregroundY: [118, 4, -132] as HeroMotionTriplet,
  beamY: [18, -14, -72] as HeroMotionTriplet,
  beamYSafeguard: [12, -10, -56] as HeroMotionTriplet,
} as const

export const isMonotonicUpward = (values: readonly number[]): boolean =>
  values.every((value, index) => index === 0 || value <= values[index - 1])
