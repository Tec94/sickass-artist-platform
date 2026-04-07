import { type ReactNode } from 'react'
import { Skeleton } from 'boneyard-js/react'
import { useSkeletonMode } from './SkeletonModeContext'
import { type RouteSkeletonTarget } from './routeSkeletonTargets'

const RouteSkeletonFallback = ({ label }: { label: string }) => (
  <div className="flex h-full min-h-[100dvh] items-center justify-center bg-[var(--site-page-bg)] px-6 py-10 text-[var(--site-text)]">
    <div className="w-full max-w-xl border border-[#1C1B1A] bg-[#FAF7F2] p-8 text-center shadow-[0_24px_60px_rgba(28,27,26,0.08)]">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8E7D72]">
        Skeleton preview
      </p>
      <h2 className="mt-4 font-serif text-[clamp(2.25rem,6vw,3.5rem)] leading-none text-[#1C1B1A]">
        {label}
      </h2>
      <p className="mt-4 text-sm leading-7 text-[#3C2A21]/78">
        Boneyard is forcing the captured layout for this route. If you still see this fallback,
        regenerate the route bones.
      </p>
    </div>
  </div>
)

export const RouteSkeletonBoundary = ({
  target,
  children,
}: {
  target: RouteSkeletonTarget
  children: ReactNode
}) => {
  const { isSkeletonMode } = useSkeletonMode()

  return (
    <Skeleton
      name={target.skeletonName}
      loading={isSkeletonMode}
      fallback={<RouteSkeletonFallback label={target.label} />}
      className="block h-full w-full"
    >
      {children}
    </Skeleton>
  )
}
