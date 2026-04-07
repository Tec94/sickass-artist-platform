import { useSkeletonMode, shouldEnableSkeletonDebug } from './SkeletonModeContext'
import { isBoneyardBuildMode } from './skeletonBuildMode'

export const SkeletonModeToggle = () => {
  const { isAvailable, isSkeletonMode, toggleSkeletonMode } = useSkeletonMode()

  if (!isAvailable) {
    return null
  }

  return (
    <button
      type="button"
      aria-pressed={isSkeletonMode}
      aria-label={isSkeletonMode ? 'Disable skeleton preview mode' : 'Enable skeleton preview mode'}
      data-testid="skeleton-mode-toggle"
      onClick={toggleSkeletonMode}
      className="fixed bottom-4 left-4 z-[120] flex min-h-[56px] items-center gap-3 border border-[#1C1B1A] bg-[#FCFBF9]/96 px-4 py-3 text-left text-[#1C1B1A] shadow-[0_18px_38px_rgba(28,27,26,0.18)] backdrop-blur"
    >
      <span
        aria-hidden="true"
        className={`h-2.5 w-2.5 rounded-full ${
          isSkeletonMode ? 'bg-[#C36B42]' : 'bg-[#8E7D72]'
        }`}
      />
      <span className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8E7D72]">
          Skeleton mode
        </span>
        <span className="font-serif text-lg leading-none">
          {isSkeletonMode ? 'On' : 'Off'}
        </span>
      </span>
    </button>
  )
}

export const DevSkeletonModeToggle = () =>
  shouldEnableSkeletonDebug({ isBuildMode: isBoneyardBuildMode() }) ? (
    <SkeletonModeToggle />
  ) : null
