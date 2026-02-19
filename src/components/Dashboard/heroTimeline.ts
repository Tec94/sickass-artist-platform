export type HeroTimeline = {
  beat1Opacity: [number, number, number]
  beat1Y: [number, number]
  beat2Opacity: [number, number, number, number]
  beat2X: [number, number]
  beat3Opacity: [number, number, number, number]
  beat3X: [number, number]
  beat4Opacity: [number, number, number]
  beat4Scale: [number, number]
  handoffOpacity: [number, number]
}

export const heroTimelineBaseline: HeroTimeline = {
  beat1Opacity: [0, 0, 0],
  beat1Y: [0, -24],
  beat2Opacity: [0.08, 0.2, 0.5, 0.58],
  beat2X: [-32, 0],
  beat3Opacity: [0.52, 0.62, 0.84, 0.9],
  beat3X: [32, 0],
  beat4Opacity: [0.86, 0.94, 1],
  beat4Scale: [0.96, 1],
  handoffOpacity: [0.95, 1],
}

export const heroTimelineHardened: HeroTimeline = {
  beat1Opacity: [0, 0, 0],
  beat1Y: [0, -24],
  beat2Opacity: [0.05, 0.16, 0.52, 0.6],
  beat2X: [-32, 0],
  beat3Opacity: [0.54, 0.64, 0.86, 0.92],
  beat3X: [32, 0],
  beat4Opacity: [0.88, 0.95, 1],
  beat4Scale: [0.96, 1],
  handoffOpacity: [0.95, 1],
}
