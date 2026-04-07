type WindowWithBoneyardBuild = Window & {
  __BONEYARD_BUILD?: boolean
}

export const isBoneyardBuildMode = () =>
  typeof window !== 'undefined' &&
  Boolean((window as WindowWithBoneyardBuild).__BONEYARD_BUILD)
